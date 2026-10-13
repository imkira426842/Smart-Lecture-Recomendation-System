import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { BookMarked, Eye, EyeOff, Mail, Lock, AlertCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { authAPI, apiConfig } from '../services/api';
import '../styles/global.css';

export default function SignIn() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '', remember: false });
  const [errors, setErrors] = useState({});
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState('');

  const set = (k, v) => { setForm(f => ({ ...f, [k]: v })); setErrors(e => ({ ...e, [k]: '' })); setApiError(''); };

  const validate = () => {
    const e = {};
    if (!form.email.match(/^[^@]+@[^@]+\.[^@]+$/)) e.email = 'Valid email is required';
    if (!form.password) e.password = 'Password is required';
    return e;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setLoading(true);
    setApiError('');

    try {
      if (!apiConfig.isConfigured) {
        await new Promise(r => setTimeout(r, 700));
        login({ name: 'Demo Student', email: form.email, id: 'demo-001' }, 'demo-token');
        navigate('/app/overview');
        return;
      }
      const res = await authAPI.login({ email: form.email, password: form.password });
      login({ name: res.name || res.full_name, email: form.email, id: res.id, degree: res.degree, branch: res.branch, year: res.year }, res.token || res.access_token);
      navigate('/app/overview');
    } catch (err) {
      if (err.message === 'BACKEND_NOT_CONFIGURED') {
        setApiError('Demo Mode: Backend not configured. Any email/password will work.');
      } else {
        setApiError(err.message || 'Invalid email or password.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-layout">
      <div className="auth-panel" style={{ maxWidth: 480 }}>
        <div style={{ width: '100%', maxWidth: 400 }}>
          <Link to="/" className="logo" style={{ marginBottom: 32, display: 'inline-flex' }}>
            <div className="logo-icon"><BookMarked size={18} /></div>
            <span className="logo-text">Learn<span>Pilot</span> AI</span>
          </Link>

          <h1 style={{ fontSize: 26, fontWeight: 700, marginBottom: 6 }}>Welcome back</h1>
          <p style={{ fontSize: 14, color: 'var(--color-text-secondary)', marginBottom: 28 }}>
            Sign in to continue to your dashboard.
          </p>

          {!apiConfig.isConfigured && (
            <div className="demo-banner" style={{ marginBottom: 20 }}>
              <AlertCircle size={16} style={{ flexShrink: 0 }} />
              <span><strong>Demo Mode:</strong> No backend connected. Any email/password will sign you in.</span>
            </div>
          )}

          {apiError && (
            <div className="alert-lp alert-error" style={{ marginBottom: 20 }}>
              <AlertCircle size={15} />
              <span>{apiError}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} noValidate>
            <div className="form-group">
              <label className="form-label" htmlFor="si-email">Email Address</label>
              <div className="input-icon-wrapper">
                <Mail size={15} className="input-icon" />
                <input id="si-email" type="email" className={`form-control-lp ${errors.email ? 'error' : ''}`}
                  placeholder="student@example.com" value={form.email}
                  onChange={e => set('email', e.target.value)} autoComplete="email" />
              </div>
              {errors.email && <div className="form-error"><AlertCircle size={12} />{errors.email}</div>}
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="si-pw">Password</label>
              <div className="input-icon-wrapper">
                <Lock size={15} className="input-icon" />
                <input id="si-pw" type={showPw ? 'text' : 'password'}
                  className={`form-control-lp ${errors.password ? 'error' : ''}`}
                  placeholder="Your password" value={form.password}
                  onChange={e => set('password', e.target.value)} autoComplete="current-password"
                  style={{ paddingRight: 40 }} />
                <button type="button" className="input-icon-action" onClick={() => setShowPw(v => !v)} aria-label={showPw ? 'Hide' : 'Show'}>
                  {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {errors.password && <div className="form-error"><AlertCircle size={12} />{errors.password}</div>}
            </div>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
              <label className="checkbox-lp">
                <input type="checkbox" checked={form.remember} onChange={e => set('remember', e.target.checked)} />
                <span className="checkbox-lp-label">Remember me</span>
              </label>
            </div>

            <button type="submit" className="btn-lp btn-primary btn-full" disabled={loading}>
              {loading ? 'Signing In...' : 'Sign In'}
            </button>
          </form>

          <p style={{ textAlign: 'center', marginTop: 24, fontSize: 14, color: 'var(--color-text-secondary)' }}>
            Don't have an account?{' '}
            <Link to="/signup" style={{ color: 'var(--color-primary)', fontWeight: 600 }}>Create one</Link>
          </p>
          <p style={{ textAlign: 'center', marginTop: 12, fontSize: 14 }}>
            <Link to="/" style={{ color: 'var(--color-text-muted)', fontSize: 13 }}>← Back to home</Link>
          </p>
        </div>
      </div>

      <div className="auth-hero">
        <div style={{ position: 'relative', zIndex: 1, textAlign: 'center', padding: 32 }}>
          <div style={{ fontSize: 56, marginBottom: 24 }}>🚀</div>
          <h2 style={{ fontSize: 28, fontWeight: 700, marginBottom: 16, color: 'white' }}>
            Ready to continue learning?
          </h2>
          <p style={{ fontSize: 16, color: 'rgba(255,255,255,0.8)', lineHeight: 1.7, maxWidth: 360 }}>
            Your progress, notes, and curriculum are waiting for you. Pick up right where you left off.
          </p>
        </div>
      </div>
    </div>
  );
}
