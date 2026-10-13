import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';

// Layouts
import AppLayout from './layouts/AppLayout';

// Public pages
import Welcome from './pages/Welcome';
import SignIn from './pages/SignIn';
import SignUp from './pages/SignUp';

// Onboarding
import OnboardingWrapper from './pages/onboarding/OnboardingWrapper';

// Dashboard
import Overview from './pages/dashboard/Overview';

// Stub pages (implemented below / in separate files)
import MyCurriculum from './pages/curriculum/MyCurriculum';
import RecommendedLectures from './pages/lectures/RecommendedLectures';
import MyLearning from './pages/stubs/MyLearning';
import AIAssistant from './pages/stubs/AIAssistant';
import LectureSummarizer from './pages/stubs/LectureSummarizer';
import AINotes from './pages/stubs/AINotes';
import Flashcards from './pages/stubs/Flashcards';
import QuizGenerator from './pages/stubs/QuizGenerator';
import MockExams from './pages/stubs/MockExams';
import StudyPlanner from './pages/stubs/StudyPlanner';
import CrashMode from './pages/stubs/CrashMode';
import ProgressAnalytics from './pages/stubs/ProgressAnalytics';
import Settings from './pages/stubs/Settings';

/** Route guard: redirect unauthenticated users to Welcome */
function RequireAuth({ children }) {
  const { isLoggedIn, loading } = useAuth();
  if (loading) return <div className="app-loading"><div className="app-loading-spinner" /></div>;
  if (!isLoggedIn) return <Navigate to="/" replace />;
  return children;
}

/** Route guard: redirect authenticated + onboarded users straight to dashboard */
function RequireOnboarding({ children }) {
  const { isLoggedIn, onboarded, loading } = useAuth();
  if (loading) return <div className="app-loading"><div className="app-loading-spinner" /></div>;
  if (!isLoggedIn) return <Navigate to="/" replace />;
  if (onboarded) return <Navigate to="/app/overview" replace />;
  return children;
}

/** Redirect logged-in users away from public pages */
function PublicOnly({ children }) {
  const { isLoggedIn, onboarded, loading } = useAuth();
  if (loading) return null;
  if (isLoggedIn && onboarded) return <Navigate to="/app/overview" replace />;
  if (isLoggedIn && !onboarded) return <Navigate to="/onboarding" replace />;
  return children;
}

function AppRoutes() {
  return (
    <Routes>
      {/* ── Public ── */}
      <Route path="/" element={<PublicOnly><Welcome /></PublicOnly>} />
      <Route path="/signin" element={<PublicOnly><SignIn /></PublicOnly>} />
      <Route path="/signup" element={<PublicOnly><SignUp /></PublicOnly>} />

      {/* ── Onboarding ── */}
      <Route
        path="/onboarding"
        element={
          <RequireOnboarding>
            <OnboardingWrapper />
          </RequireOnboarding>
        }
      />

      {/* ── App (authenticated) ── */}
      <Route
        path="/app"
        element={
          <RequireAuth>
            <AppLayout />
          </RequireAuth>
        }
      >
        <Route index element={<Navigate to="overview" replace />} />
        <Route path="overview" element={<Overview />} />
        <Route path="curriculum" element={<MyCurriculum />} />
        <Route path="lectures" element={<RecommendedLectures />} />
        <Route path="learning" element={<MyLearning />} />
        <Route path="assistant" element={<AIAssistant />} />
        <Route path="summarizer" element={<LectureSummarizer />} />
        <Route path="notes" element={<AINotes />} />
        <Route path="flashcards" element={<Flashcards />} />
        <Route path="quiz" element={<QuizGenerator />} />
        <Route path="exams" element={<MockExams />} />
        <Route path="planner" element={<StudyPlanner />} />
        <Route path="crash" element={<CrashMode />} />
        <Route path="analytics" element={<ProgressAnalytics />} />
        <Route path="settings" element={<Settings />} />
      </Route>

      {/* ── Fallback ── */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  );
}
