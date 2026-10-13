import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Menu, Search, Bell, Settings, User, LogOut } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import '../../styles/sidebar.css';

export default function Header({ title, breadcrumbs, collapsed, onMobileOpen }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchVal, setSearchVal] = useState('');

  const initials = user?.name
    ? user.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()
    : 'U';

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <header className={`app-header ${collapsed ? 'sidebar-collapsed' : ''}`}>
      {/* Mobile menu button */}
      <button
        className="header-btn"
        onClick={onMobileOpen}
        aria-label="Open sidebar"
        style={{ display: 'none' }}
        id="mobile-menu-btn"
      >
        <Menu size={20} />
      </button>

      {/* Title / Breadcrumbs */}
      <div className="header-left">
        <h1 className="header-title">{title}</h1>
        {breadcrumbs && breadcrumbs.length > 0 && (
          <nav className="header-breadcrumbs" aria-label="Breadcrumb">
            {breadcrumbs.map((crumb, i) => (
              <React.Fragment key={crumb.label}>
                {i > 0 && <span className="header-breadcrumb-sep">/</span>}
                {crumb.path ? (
                  <a href={crumb.path} className={`header-breadcrumb ${i === breadcrumbs.length - 1 ? 'active' : ''}`}>
                    {crumb.label}
                  </a>
                ) : (
                  <span className={`header-breadcrumb ${i === breadcrumbs.length - 1 ? 'active' : ''}`}>
                    {crumb.label}
                  </span>
                )}
              </React.Fragment>
            ))}
          </nav>
        )}
      </div>

      {/* Search */}
      <div className="header-search">
        <Search size={15} color="var(--color-text-muted)" />
        <input
          type="search"
          placeholder="Search topics, lectures..."
          value={searchVal}
          onChange={e => setSearchVal(e.target.value)}
          aria-label="Search"
        />
      </div>

      {/* Actions */}
      <div className="header-actions">
        <button className="header-btn" aria-label="Notifications">
          <Bell size={18} />
        </button>

        {/* Profile menu */}
        <div style={{ position: 'relative' }}>
          <div
            className="header-avatar"
            onClick={() => setMenuOpen(v => !v)}
            role="button"
            tabIndex={0}
            aria-label="Profile menu"
            aria-expanded={menuOpen}
            onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') setMenuOpen(v => !v); }}
          >
            {initials}
          </div>

          {menuOpen && (
            <>
              <div
                style={{ position: 'fixed', inset: 0, zIndex: 99 }}
                onClick={() => setMenuOpen(false)}
              />
              <div
                style={{
                  position: 'absolute', right: 0, top: '100%', marginTop: 8,
                  background: 'var(--color-surface)',
                  border: '1px solid var(--color-border)',
                  borderRadius: 'var(--radius-lg)',
                  boxShadow: 'var(--shadow-lg)',
                  width: 220, zIndex: 100, overflow: 'hidden',
                  padding: '8px 0',
                }}
              >
                <div style={{ padding: '12px 16px', borderBottom: '1px solid var(--color-border)' }}>
                  <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--color-text-primary)' }}>{user?.name}</div>
                  <div style={{ fontSize: 12, color: 'var(--color-text-muted)', marginTop: 2 }}>
                    {user?.isGuest ? '⚠ Guest Mode — data stored locally' : user?.email}
                  </div>
                </div>
                {[
                  { icon: User, label: 'View Profile', action: () => navigate('/app/settings') },
                  { icon: Settings, label: 'Settings', action: () => navigate('/app/settings') },
                ].map(({ icon: Icon, label, action }) => (
                  <button
                    key={label}
                    onClick={() => { action(); setMenuOpen(false); }}
                    style={{
                      width: '100%', display: 'flex', alignItems: 'center', gap: 10,
                      padding: '10px 16px', background: 'none', border: 'none',
                      cursor: 'pointer', fontSize: 14, color: 'var(--color-text-primary)',
                      transition: 'background 150ms',
                    }}
                    onMouseEnter={e => e.currentTarget.style.background = 'var(--color-surface-2)'}
                    onMouseLeave={e => e.currentTarget.style.background = 'none'}
                  >
                    <Icon size={15} color="var(--color-text-secondary)" />
                    {label}
                  </button>
                ))}
                <div style={{ borderTop: '1px solid var(--color-border)', marginTop: 4 }} />
                <button
                  onClick={() => { handleLogout(); setMenuOpen(false); }}
                  style={{
                    width: '100%', display: 'flex', alignItems: 'center', gap: 10,
                    padding: '10px 16px', background: 'none', border: 'none',
                    cursor: 'pointer', fontSize: 14, color: 'var(--color-error)',
                  }}
                >
                  <LogOut size={15} />
                  Sign Out
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
