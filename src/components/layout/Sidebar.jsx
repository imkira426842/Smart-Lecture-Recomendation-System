import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, BookOpen, PlayCircle, GraduationCap,
  MessageSquare, FileText, StickyNote, CreditCard, HelpCircle,
  ClipboardList, Calendar, Zap, BarChart2, Settings, LogOut,
  ChevronLeft, ChevronRight, BookMarked, Layers
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import '../../styles/sidebar.css';

const navConfig = [
  {
    label: 'Workspace',
    items: [
      { icon: LayoutDashboard, label: 'Overview', path: '/app/overview' },
      { icon: BookOpen, label: 'My Curriculum', path: '/app/curriculum' },
      { icon: PlayCircle, label: 'Recommended Lectures', path: '/app/lectures' },
      { icon: GraduationCap, label: 'My Learning', path: '/app/learning' },
    ],
  },
  {
    label: 'AI Study Tools',
    items: [
      { icon: MessageSquare, label: 'AI Study Assistant', path: '/app/assistant' },
      { icon: Layers, label: 'Lecture Summarizer', path: '/app/summarizer' },
      { icon: StickyNote, label: 'AI Notes', path: '/app/notes' },
      { icon: CreditCard, label: 'Flashcards', path: '/app/flashcards' },
      { icon: HelpCircle, label: 'Quiz Generator', path: '/app/quiz' },
      { icon: ClipboardList, label: 'Mock Exams', path: '/app/exams' },
    ],
  },
  {
    label: 'Planning & Analytics',
    items: [
      { icon: Calendar, label: 'Study Planner', path: '/app/planner' },
      { icon: Zap, label: 'One-Day Crash Mode', path: '/app/crash' },
      { icon: BarChart2, label: 'Progress & Analytics', path: '/app/analytics' },
    ],
  },
];

export default function Sidebar({ collapsed, onToggle, mobileOpen, onMobileClose }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const initials = user?.name
    ? user.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()
    : 'U';

  return (
    <>
      {/* Mobile overlay */}
      <div
        className={`mobile-overlay ${mobileOpen ? 'visible' : ''}`}
        onClick={onMobileClose}
      />

      <aside className={`sidebar ${collapsed ? 'collapsed' : ''} ${mobileOpen ? 'mobile-open' : ''}`}>
        {/* Header */}
        <div className="sidebar-header">
          <NavLink to="/app/overview" className="sidebar-logo" title="LearnPilot AI">
            <div className="sidebar-logo-icon">
              <BookMarked size={16} />
            </div>
            <span className="sidebar-logo-text">LearnPilot AI</span>
          </NavLink>
          <button
            className="sidebar-toggle"
            onClick={onToggle}
            aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
          </button>
        </div>

        {/* Nav */}
        <nav className="sidebar-body">
          {navConfig.map((section) => (
            <div className="sidebar-section" key={section.label}>
              <div className="sidebar-section-label">{section.label}</div>
              {section.items.map(({ icon: Icon, label, path }) => (
                <NavLink
                  key={path}
                  to={path}
                  className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
                  title={collapsed ? label : undefined}
                  onClick={onMobileClose}
                >
                  <span className="nav-item-icon"><Icon size={18} /></span>
                  <span className="nav-item-text">{label}</span>
                </NavLink>
              ))}
            </div>
          ))}

          {/* Bottom links */}
          <div className="sidebar-section" style={{ marginTop: 8 }}>
            <NavLink
              to="/app/settings"
              className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
              title={collapsed ? 'Settings' : undefined}
              onClick={onMobileClose}
            >
              <span className="nav-item-icon"><Settings size={18} /></span>
              <span className="nav-item-text">Settings</span>
            </NavLink>
            <button
              className="nav-item"
              onClick={handleLogout}
              title={collapsed ? 'Sign Out' : undefined}
              style={{ width: '100%', textAlign: 'left', background: 'none', border: 'none', cursor: 'pointer' }}
            >
              <span className="nav-item-icon"><LogOut size={18} /></span>
              <span className="nav-item-text">Sign Out</span>
            </button>
          </div>
        </nav>

        {/* Footer */}
        <div className="sidebar-footer">
          <NavLink to="/app/settings" className="sidebar-user" title={user?.name} onClick={onMobileClose}>
            <div className="sidebar-avatar">{initials}</div>
            <div className="sidebar-user-info">
              <div className="sidebar-user-name">{user?.name || 'Student'}</div>
              <div className="sidebar-user-role">
                {user?.isGuest ? 'Guest Mode' : (user?.degree ? `${user.degree} · ${user.branch || 'Student'}` : 'Student')}
              </div>
            </div>
          </NavLink>
        </div>
      </aside>
    </>
  );
}
