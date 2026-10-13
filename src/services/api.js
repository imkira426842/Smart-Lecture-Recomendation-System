/* ─────────────────────────────────────────────
   LearnPilot AI — Centralized API Service
   Base URL: VITE_API_BASE_URL env variable
   ───────────────────────────────────────────── */

const BASE_URL = '/api';
const IS_CONFIGURED = true;

export const apiConfig = { isConfigured: IS_CONFIGURED, baseUrl: BASE_URL };

// ── Helpers ──────────────────────────────────

function getToken() {
  try {
    const stored = localStorage.getItem('learnpilot_auth');
    if (stored) return JSON.parse(stored).token;
  } catch { /* ignore */ }
  return null;
}

async function request(path, options = {}) {
  if (!IS_CONFIGURED) {
    throw new Error('BACKEND_NOT_CONFIGURED');
  }

  const token = getToken();
  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  };

  const res = await fetch(`${BASE_URL}${path}`, { ...options, headers });

  if (res.status === 401) {
    localStorage.removeItem('learnpilot_auth');
    window.location.href = '/signin';
    throw new Error('SESSION_EXPIRED');
  }

  if (!res.ok) {
    let message = `Request failed: ${res.status}`;
    try {
      const body = await res.json();
      message = Array.isArray(body.detail)
        ? body.detail.map(item => item.msg).join('; ')
        : body.detail || body.message || message;
    } catch { /* ignore */ }
    throw new Error(message);
  }

  if (res.status === 204) return null;
  const contentType = res.headers.get('content-type') || '';
  if (contentType.includes('application/json')) return res.json();
  return res.text();
}

async function uploadFile(path, formData) {
  if (!IS_CONFIGURED) throw new Error('BACKEND_NOT_CONFIGURED');

  const token = getToken();
  const headers = token ? { Authorization: `Bearer ${token}` } : {};

  const res = await fetch(`${BASE_URL}${path}`, {
    method: 'POST',
    headers,
    body: formData,
  });

  if (!res.ok) {
    let message = `Upload failed: ${res.status}`;
    try {
      const body = await res.json();
      message = body.detail || body.message || message;
    } catch { /* ignore */ }
    throw new Error(message);
  }

  return res.json();
}

// ── Auth ──────────────────────────────────────

export const authAPI = {
  register: (data) => request('/auth/register', { method: 'POST', body: JSON.stringify(data) }),
  login: (data) => request('/auth/login', { method: 'POST', body: JSON.stringify(data) }),
  logout: () => request('/auth/logout', { method: 'POST' }),
  me: () => request('/auth/me'),
};

// ── Profile ───────────────────────────────────

export const profileAPI = {
  get: () => request('/profile'),
  update: (data) => request('/profile', { method: 'PUT', body: JSON.stringify(data) }),
  delete: () => request('/profile', { method: 'DELETE' }),
};

// ── Syllabus ──────────────────────────────────

export const syllabusAPI = {
  upload: (file) => {
    const formData = new FormData();
    formData.append('file', file);
    return uploadFile('/syllabus/upload', formData);
  },
  getExtracted: () => request('/syllabus/extract'),
  confirmExtracted: (data) => request('/syllabus/confirm', { method: 'POST', body: JSON.stringify(data) }),
  delete: () => request('/syllabus', { method: 'DELETE' }),
};

// ── Curriculum ────────────────────────────────

export const curriculumAPI = {
  getAll: () => request('/curriculum'),
  updateTopic: (id, data) => request(`/curriculum/topics/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  addTopic: (data) => request('/curriculum/topics', { method: 'POST', body: JSON.stringify(data) }),
  deleteTopic: (id) => request(`/curriculum/topics/${id}`, { method: 'DELETE' }),
};

// ── Lecture Recommendations ───────────────────

export const lecturesAPI = {
  getRecommended: (params) => {
    const query = new URLSearchParams(params).toString();
    return request(`/lectures/recommend${query ? '?' + query : ''}`);
  },
  bookmark: (id) => request(`/lectures/${id}/bookmark`, { method: 'POST' }),
  markWatched: (id) => request(`/lectures/${id}/watched`, { method: 'POST' }),
  search: (q) => request(`/lectures/search?q=${encodeURIComponent(q)}`),
};

// ── AI Study Assistant ────────────────────────

export const aiAPI = {
  status: () => request('/ai/status'),
  chat: (messages, context) => request('/ai/chat', { method: 'POST', body: JSON.stringify({ messages, context }) }),
  summarize: (data) => request('/ai/summarize', { method: 'POST', body: JSON.stringify(data) }),
  generateNotes: (data) => request('/ai/notes/generate', { method: 'POST', body: JSON.stringify(data) }),
  generateFlashcards: (data) => request('/ai/flashcards/generate', { method: 'POST', body: JSON.stringify(data) }),
  generateQuiz: (data) => request('/ai/quiz/generate', { method: 'POST', body: JSON.stringify(data) }),
};

// ── Notes ─────────────────────────────────────

export const notesAPI = {
  getAll: () => request('/notes'),
  get: (id) => request(`/notes/${id}`),
  create: (data) => request('/notes', { method: 'POST', body: JSON.stringify(data) }),
  update: (id, data) => request(`/notes/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  delete: (id) => request(`/notes/${id}`, { method: 'DELETE' }),
};

// ── Flashcards ────────────────────────────────

export const flashcardsAPI = {
  getSets: () => request('/flashcards'),
  getSet: (id) => request(`/flashcards/${id}`),
  saveSet: (data) => request('/flashcards', { method: 'POST', body: JSON.stringify(data) }),
  deleteSet: (id) => request(`/flashcards/${id}`, { method: 'DELETE' }),
  updateCard: (setId, cardId, data) => request(`/flashcards/${setId}/cards/${cardId}`, { method: 'PUT', body: JSON.stringify(data) }),
};

// ── Quiz ──────────────────────────────────────

export const quizAPI = {
  submit: (quizId, answers) => request(`/quiz/${quizId}/submit`, { method: 'POST', body: JSON.stringify({ answers }) }),
  getResults: (quizId) => request(`/quiz/${quizId}/results`),
  getHistory: () => request('/quiz/history'),
};

// ── Mock Exams ────────────────────────────────

export const examAPI = {
  create: (data) => request('/exams', { method: 'POST', body: JSON.stringify(data) }),
  submit: (examId, data) => request(`/exams/${examId}/submit`, { method: 'POST', body: JSON.stringify(data) }),
  getResults: (examId) => request(`/exams/${examId}/results`),
  getHistory: () => request('/exams/history'),
};

// ── Study Planner ─────────────────────────────

export const plannerAPI = {
  generateCrashPlan: (data) => request('/planner/crash-plan', { method: 'POST', body: JSON.stringify(data) }),
  getTasks: (params) => {
    const q = new URLSearchParams(params).toString();
    return request(`/planner/tasks${q ? '?' + q : ''}`);
  },
  createTask: (data) => request('/planner/tasks', { method: 'POST', body: JSON.stringify(data) }),
  updateTask: (id, data) => request(`/planner/tasks/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteTask: (id) => request(`/planner/tasks/${id}`, { method: 'DELETE' }),
};

// ── Analytics ─────────────────────────────────

export const analyticsAPI = {
  getProgress: () => request('/analytics/progress'),
  getSubjectStats: () => request('/analytics/subjects'),
  getActivityLog: () => request('/analytics/activity'),
  getWeakTopics: () => request('/analytics/weak-topics'),
};

export const learningAPI = { get: () => request('/learning') };

export default {
  auth: authAPI,
  profile: profileAPI,
  syllabus: syllabusAPI,
  curriculum: curriculumAPI,
  lectures: lecturesAPI,
  ai: aiAPI,
  notes: notesAPI,
  flashcards: flashcardsAPI,
  quiz: quizAPI,
  exam: examAPI,
  planner: plannerAPI,
  analytics: analyticsAPI,
};
