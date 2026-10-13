// Demo data for when backend is not configured
// All demo data is clearly labeled to prevent confusion with real data

export const DEMO_MODE = false;

export const demoUser = {
  id: 'demo-001',
  name: 'Arjun Sharma',
  email: 'arjun@example.com',
  degree: 'B.Tech',
  branch: 'CSE',
  year: '3rd Year',
  language: 'English',
  syllabusUploaded: false,
  isDemo: true,
};

export const demoStats = {
  subjects: 6,
  topicsCompleted: 18,
  totalTopics: 54,
  progress: 33,
  savedLectures: 12,
  notesCount: 8,
  quizzesTaken: 5,
};

export const demoSubjects = [
  {
    id: 's1',
    name: 'Data Structures & Algorithms',
    code: 'CS301',
    units: [
      {
        id: 'u1',
        name: 'Unit 1: Arrays & Linked Lists',
        topics: [
          { id: 't1', name: 'Introduction to Arrays', status: 'completed' },
          { id: 't2', name: 'Dynamic Arrays', status: 'completed' },
          { id: 't3', name: 'Linked Lists', status: 'in-progress' },
          { id: 't4', name: 'Circular Linked Lists', status: 'not-started' },
        ],
      },
      {
        id: 'u2',
        name: 'Unit 2: Stacks & Queues',
        topics: [
          { id: 't5', name: 'Stack Operations', status: 'completed' },
          { id: 't6', name: 'Queue Implementations', status: 'not-started' },
          { id: 't7', name: 'Priority Queues', status: 'not-started' },
        ],
      },
    ],
  },
  {
    id: 's2',
    name: 'Operating Systems',
    code: 'CS302',
    units: [
      {
        id: 'u3',
        name: 'Unit 1: Process Management',
        topics: [
          { id: 't8', name: 'Process States & Transitions', status: 'completed' },
          { id: 't9', name: 'CPU Scheduling Algorithms', status: 'in-progress' },
          { id: 't10', name: 'Deadlocks', status: 'not-started' },
        ],
      },
    ],
  },
  {
    id: 's3',
    name: 'Database Management Systems',
    code: 'CS303',
    units: [
      {
        id: 'u4',
        name: 'Unit 1: Relational Model',
        topics: [
          { id: 't11', name: 'ER Diagrams', status: 'completed' },
          { id: 't12', name: 'Normalization', status: 'not-started' },
          { id: 't13', name: 'SQL Queries', status: 'not-started' },
        ],
      },
    ],
  },
];

export const demoLectures = [
  {
    id: 'l1',
    title: 'Data Structures - Full Course for Beginners',
    channel: 'freeCodeCamp.org',
    duration: '5h 22m',
    language: 'English',
    difficulty: 'Beginner',
    topic: 'Data Structures',
    subject: 'Data Structures & Algorithms',
    reason: 'Matches your CS301 curriculum — Unit 1',
    thumbnail: null,
    url: 'https://www.youtube.com/watch?v=RBSGKlAvoiM',
    isBookmarked: false,
    isWatched: false,
    type: 'video',
  },
  {
    id: 'l2',
    title: 'Linked Lists for Beginners — Complete Tutorial',
    channel: 'CS Dojo',
    duration: '38m',
    language: 'English',
    difficulty: 'Beginner',
    topic: 'Linked Lists',
    subject: 'Data Structures & Algorithms',
    reason: 'You marked Linked Lists as in-progress',
    thumbnail: null,
    url: 'https://www.youtube.com/results?search_query=linked+lists+tutorial',
    isBookmarked: true,
    isWatched: false,
    type: 'video',
  },
  {
    id: 'l3',
    title: 'CPU Scheduling Algorithms Explained',
    channel: 'Gate Smashers',
    duration: '1h 10m',
    language: 'Hindi',
    difficulty: 'Intermediate',
    topic: 'CPU Scheduling',
    subject: 'Operating Systems',
    reason: 'Matches your OS curriculum — CPU Scheduling',
    thumbnail: null,
    url: 'https://www.youtube.com/results?search_query=cpu+scheduling+algorithms',
    isBookmarked: false,
    isWatched: false,
    type: 'video',
  },
];

export const demoQuizSample = {
  id: 'q-demo',
  title: 'Data Structures — Arrays & Linked Lists',
  questions: [
    {
      id: 1,
      text: 'What is the time complexity of accessing an element by index in an array?',
      options: ['O(1)', 'O(n)', 'O(log n)', 'O(n²)'],
      correct: 0,
      explanation: 'Array elements can be accessed directly using their index, which is a constant-time O(1) operation.',
    },
    {
      id: 2,
      text: 'In a singly linked list, what does the last node\'s "next" pointer point to?',
      options: ['The first node', 'NULL / None', 'Itself', 'The second-to-last node'],
      correct: 1,
      explanation: 'The last node in a singly linked list has its "next" pointer set to NULL (or None in Python), indicating the end of the list.',
    },
    {
      id: 3,
      text: 'Which data structure uses LIFO (Last In, First Out) order?',
      options: ['Queue', 'Stack', 'Linked List', 'Tree'],
      correct: 1,
      explanation: 'A Stack follows LIFO (Last In, First Out) — the last element pushed is the first one popped.',
    },
    {
      id: 4,
      text: 'What is the space complexity of a linked list with n nodes?',
      options: ['O(1)', 'O(log n)', 'O(n)', 'O(n²)'],
      correct: 2,
      explanation: 'A linked list requires O(n) space to store n nodes, each containing data and a pointer.',
    },
    {
      id: 5,
      text: 'Which operation is more efficient in a linked list compared to an array?',
      options: ['Random access', 'Insertion at beginning', 'Binary search', 'Sorting'],
      correct: 1,
      explanation: 'Inserting at the beginning of a linked list is O(1) — just update the head pointer. In an array, this requires shifting all elements: O(n).',
    },
  ],
};

export const demoAnalytics = {
  overallProgress: 33,
  subjectProgress: [
    { subject: 'DSA', completed: 45, total: 100 },
    { subject: 'OS', completed: 30, total: 100 },
    { subject: 'DBMS', completed: 20, total: 100 },
    { subject: 'CN', completed: 15, total: 100 },
    { subject: 'TOC', completed: 10, total: 100 },
  ],
  weeklyActivity: [
    { day: 'Mon', minutes: 45 },
    { day: 'Tue', minutes: 90 },
    { day: 'Wed', minutes: 30 },
    { day: 'Thu', minutes: 120 },
    { day: 'Fri', minutes: 60 },
    { day: 'Sat', minutes: 150 },
    { day: 'Sun', minutes: 75 },
  ],
  quizScores: [
    { quiz: 'Arrays', score: 80 },
    { quiz: 'Linked Lists', score: 60 },
    { quiz: 'Stacks', score: 100 },
    { quiz: 'Process Mgmt', score: 75 },
    { quiz: 'ER Diagrams', score: 85 },
  ],
};
