import React, { useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Sidebar from '../components/layout/Sidebar';
import Header from '../components/layout/Header';
import '../styles/global.css';

const PAGE_META = {
  '/app/overview': { title: 'Overview', breadcrumbs: [{ label: 'Dashboard' }] },
  '/app/curriculum': { title: 'My Curriculum', breadcrumbs: [{ label: 'Workspace' }, { label: 'My Curriculum' }] },
  '/app/lectures': { title: 'Recommended Lectures', breadcrumbs: [{ label: 'Workspace' }, { label: 'Recommended Lectures' }] },
  '/app/learning': { title: 'My Learning', breadcrumbs: [{ label: 'Workspace' }, { label: 'My Learning' }] },
  '/app/assistant': { title: 'AI Study Assistant', breadcrumbs: [{ label: 'AI Study Tools' }, { label: 'AI Study Assistant' }] },
  '/app/summarizer': { title: 'Lecture Summarizer', breadcrumbs: [{ label: 'AI Study Tools' }, { label: 'Lecture Summarizer' }] },
  '/app/notes': { title: 'AI Notes', breadcrumbs: [{ label: 'AI Study Tools' }, { label: 'AI Notes' }] },
  '/app/flashcards': { title: 'Flashcards', breadcrumbs: [{ label: 'AI Study Tools' }, { label: 'Flashcards' }] },
  '/app/quiz': { title: 'Quiz Generator', breadcrumbs: [{ label: 'AI Study Tools' }, { label: 'Quiz Generator' }] },
  '/app/exams': { title: 'Mock Exams', breadcrumbs: [{ label: 'AI Study Tools' }, { label: 'Mock Exams' }] },
  '/app/planner': { title: 'Study Planner', breadcrumbs: [{ label: 'Planning' }, { label: 'Study Planner' }] },
  '/app/crash': { title: 'One-Day Crash Mode', breadcrumbs: [{ label: 'Planning' }, { label: 'One-Day Crash Mode' }] },
  '/app/analytics': { title: 'Progress & Analytics', breadcrumbs: [{ label: 'Analytics' }, { label: 'Progress & Analytics' }] },
  '/app/settings': { title: 'Settings', breadcrumbs: [{ label: 'Settings' }] },
};

export default function AppLayout() {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();

  const meta = PAGE_META[location.pathname] || { title: 'LearnPilot AI', breadcrumbs: [] };

  return (
    <div className="app-shell">
      <Sidebar
        collapsed={collapsed}
        onToggle={() => setCollapsed(v => !v)}
        mobileOpen={mobileOpen}
        onMobileClose={() => setMobileOpen(false)}
      />

      <div className={`app-content ${collapsed ? 'sidebar-collapsed' : ''}`}>
        <Header
          title={meta.title}
          breadcrumbs={meta.breadcrumbs}
          collapsed={collapsed}
          onMobileOpen={() => setMobileOpen(true)}
        />

        <main className="main-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
