/**
 * Stub pages for routes not yet fully implemented.
 * Each page exports a clean "coming soon" UI so the router works
 * and navigation links don't 404. Replace each stub with a real
 * implementation when ready.
 */
import React from 'react';
import { Link } from 'react-router-dom';

function ComingSoon({ icon, title, description, items = [] }) {
  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">{title}</h1>
        <p className="page-subtitle">{description}</p>
      </div>
      <div className="card-lp" style={{ maxWidth: 640 }}>
        <div style={{
          width: 60, height: 60, borderRadius: 16,
          background: 'var(--color-primary-light)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 28, marginBottom: 20,
        }}>
          {icon}
        </div>
        <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 8 }}>{title}</h2>
        <p style={{ fontSize: 14, color: 'var(--color-text-secondary)', lineHeight: 1.7, marginBottom: items.length ? 24 : 0 }}>
          {description} This page is currently under construction and will be available soon.
        </p>
        {items.length > 0 && (
          <ul style={{ display: 'flex', flexDirection: 'column', gap: 8, paddingLeft: 0, listStyle: 'none' }}>
            {items.map(item => (
              <li key={item} style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 14, color: 'var(--color-text-secondary)' }}>
                <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--color-primary)', flexShrink: 0 }} />
                {item}
              </li>
            ))}
          </ul>
        )}
        <div style={{ marginTop: 28, paddingTop: 20, borderTop: '1px solid var(--color-border)' }}>
          <Link to="/app/overview" className="btn-lp btn-secondary btn-sm">← Back to Dashboard</Link>
        </div>
      </div>
    </div>
  );
}

export function MyLearning() {
  return <ComingSoon icon="🎓" title="My Learning" description="Track your watched lectures, completed topics, and saved resources all in one place." items={['Watch history', 'Completed topics tracker', 'Saved resources library', 'Learning streaks']} />;
}

export function AIAssistant() {
  return <ComingSoon icon="🤖" title="AI Study Assistant" description="Ask questions, get explanations in English or Hindi, and generate notes powered by AI." items={['Chat interface with message history', 'Context selector (subject/topic)', 'Markdown + code formatting', 'Suggested starter prompts']} />;
}

export function LectureSummarizer() {
  return <ComingSoon icon="📝" title="Lecture Summarizer" description="Paste a YouTube URL or transcript to get key concepts, definitions, and revision points." items={['YouTube URL input', 'Key concept extraction', 'Revision bullet points', 'Copy & download summary']} />;
}

export function AINotes() {
  return <ComingSoon icon="🗒️" title="AI Notes" description="Generate, edit, and organize notes by subject and topic with AI assistance." items={['Generate notes from topic/document', 'Edit and format notes', 'Subject/topic organization', 'Search and filter']} />;
}

export function Flashcards() {
  return <ComingSoon icon="🃏" title="Flashcards" description="Create and study topic-based flashcards with spaced repetition." items={['Auto-generate from topic or notes', 'Flip cards with reveal animation', 'Study sessions with progress tracking', 'Import/export decks']} />;
}

export function QuizGenerator() {
  return <ComingSoon icon="❓" title="Quiz Generator" description="Auto-generate MCQ quizzes from any topic in your curriculum." items={['Select topic or subject', 'Multiple choice questions with explanations', 'Score tracking and review', 'Difficulty settings']} />;
}

export function MockExams() {
  return <ComingSoon icon="📋" title="Mock Exams" description="Full timed mock exams with mixed topics to simulate real exam conditions." items={['Timed full-length exams', 'Mixed topic question sets', 'Detailed score analysis', 'Performance comparison']} />;
}

export function StudyPlanner() {
  return <ComingSoon icon="📅" title="Study Planner" description="Create a structured study schedule based on your curriculum and available time." items={['Weekly study schedule', 'Topic-to-date assignment', 'Deadline reminders', 'Progress vs. plan tracking']} />;
}

export function CrashMode() {
  return <ComingSoon icon="⚡" title="One-Day Crash Mode" description="Last-minute exam prep: get a prioritized time-blocked study plan for the most important topics." items={['Select exam date and subjects', 'Auto-generated time-blocked schedule', 'Priority-ordered topic list', 'Quick revision resources']} />;
}

export function ProgressAnalytics() {
  return <ComingSoon icon="📊" title="Progress & Analytics" description="Visualize your learning progress, quiz scores, and weekly study activity." items={['Subject-wise progress bars', 'Weekly activity chart', 'Quiz score history', 'Topic completion heatmap']} />;
}

export function Settings() {
  return <ComingSoon icon="⚙️" title="Settings" description="Manage your profile, preferences, and account settings." items={['Edit profile (name, degree, branch, year)', 'Preferred explanation language', 'Notification preferences', 'Account and data management']} />;
}

// Default exports for individual file imports
export default MyLearning;
