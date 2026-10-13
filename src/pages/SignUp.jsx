import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { BookMarked, Eye, EyeOff, User, Mail, Lock, AlertCircle, CheckCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { authAPI, apiConfig } from '../services/api';
import '../styles/global.css';

function PasswordStrength({ password }) {
  const checks = [
    { label: 'At least 8 characters', ok: password.length >= 8 },
    { label: 'Contains uppercase letter', ok: /[A-Z]/.test(password) },
    { label: 'Contains number', ok: /\d/.test(password) },
  ];
  const passed = checks.filter(c => c.ok).length;
  const colors = ['var(--color-error)', 'var(--color-warning)', 'var(--color-success)'];

  if (!password) return null;
  return (
    <div style={{ marginTop: 8 }}>
      <div style={{ display: 'flex', gap: 4, marginBottom: 6 }}>
        {[0,1,2].map(i => (
          <div key={i} style={{
            height: 4, flex: 1, borderRadius: 4,
            background: i < passed ? colors[passed - 1] : 'var(--color-border)',
            transition: 'background 300ms',
          }} />
        ))}
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
        {checks.map(c => (
          <div key={c.label} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: c.ok ? 'var(--color-success)' : 'var(--color-text-muted)' }}>
            <CheckCircle size={12} />
            {c.label}
          </div>
        ))}
      </div>
    </div>
  );
}

export default function SignUp() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', password: '', confirm: '', agreed: false });
  const [errors, setErrors] = useState({});
  const [showPw, setShowPw] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState('');

  const set = (k, v) => { setForm(f => ({ ...f, [k]: v })); setErrors(e => ({ ...e, [k]: '' })); setApiError(''); };

  const validate = () => {
    const e = {};
    if (!form.name.trim()) e.name = 'Full name is required';
    if (!form.email.match(/^[^@]+@[^@]+\.[^@]+$/)) e.email = 'Valid email is required';
    if (form.password.length < 8) e.password = 'Password must be at least 8 characters';
    if (form.password !== form.confirm) e.confirm = 'Passwords do not match';
    if (!form.agreed) e.agreed = 'You must accept the terms to continue';
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
        // Demo mode: simulate registration
        await new Promise(r => setTimeout(r, 800));
        login({ name: form.name, email: form.email, id: Date.now().toString() }, 'demo-token');
        navigate('/onboarding');
        return;
      }
      const res = await authAPI.register({ name: form.name, email: form.email, password: form.password });
      login({ name: form.name, email: form.email, id: res.id }, res.token || res.access_token);
      navigate('/onboarding');
    } catch (err) {
      setApiError(
        err.message === 'BACKEND_NOT_CONFIGURED'
          ? 'Running in demo mode — no backend connected.'
          : (err.message || 'Registration failed. Please try again.')
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-layout">
      {/* Left Panel */}
      <div className="auth-panel" style={{ maxWidth: 480 }}>
        <div style={{ width: '100%', maxWidth: 400 }}>
          {/* Logo */}
          <Link to="/" className="logo" style={{ marginBottom: 32, display: 'inline-flex' }}>
            <div className="logo-icon"><BookMarked size={18} /></div>
            <span className="logo-text">Learn<span>Pilot</span> AI</span>
          </Link>

          <h1 style={{ fontSize: 26, fontWeight: 700, marginBottom: 6 }}>Create your account</h1>
          <p style={{ fontSize: 14, color: 'var(--color-text-secondary)', marginBottom: 28 }}>
            Start your AI-powered learning journey today.
          </p>

          {!apiConfig.isConfigured && (
            <div className="demo-banner" style={{ marginBottom: 20 }}>
              <AlertCircle size={16} style={{ flexShrink: 0 }} />
              <span><strong>Demo Mode:</strong> Backend not configured. Account data will be stored locally only.</span>
            </div>
          )}

          {apiError && (
            <div className="alert-lp alert-error" style={{ marginBottom: 20 }}>
              <AlertCircle size={15} />
              <span>{apiError}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} noValidate>
            {/* Name */}
            <div className="form-group">
              <label className="form-label" htmlFor="su-name">Full Name</label>
              <div className="input-icon-wrapper">
                <User size={15} className="input-icon" />
                <input id="su-name" type="text" className={`form-control-lp ${errors.name ? 'error' : ''}`}
                  placeholder="e.g. Arjun Sharma" value={form.name}
                  onChange={e => set('name', e.target.value)} autoComplete="name" />
              </div>
              {errors.name && <div className="form-error"><AlertCircle size={12} />{errors.name}</div>}
            </div>

            {/* Email */}
            <div className="form-group">
              <label className="form-label" htmlFor="su-email">Email Address</label>
              <div className="input-icon-wrapper">
                <Mail size={15} className="input-icon" />
                <input id="su-email" type="email" className={`form-control-lp ${errors.email ? 'error' : ''}`}
                  placeholder="student@example.com" value={form.email}
                  onChange={e => set('email', e.target.value)} autoComplete="email" />
              </div>
              {errors.email && <div className="form-error"><AlertCircle size={12} />{errors.email}</div>}
            </div>

            {/* Password */}
            <div className="form-group">
              <label className="form-label" htmlFor="su-pw">Password</label>
              <div className="input-icon-wrapper">
                <Lock size={15} className="input-icon" />
                <input id="su-pw" type={showPw ? 'text' : 'password'}
                  className={`form-control-lp ${errors.password ? 'error' : ''}`}
                  placeholder="At least 8 characters" value={form.password}
                  onChange={e => set('password', e.target.value)} autoComplete="new-password" style={{ paddingRight: 40 }} />
                <button type="button" className="input-icon-action" onClick={() => setShowPw(v => !v)} aria-label={showPw ? 'Hide password' : 'Show password'}>
                  {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {errors.password && <div className="form-error"><AlertCircle size={12} />{errors.password}</div>}
              <PasswordStrength password={form.password} />
            </div>

            {/* Confirm */}
            <div className="form-group">
              <label className="form-label" htmlFor="su-confirm">Confirm Password</label>
              <div className="input-icon-wrapper">
                <Lock size={15} className="input-icon" />
                <input id="su-confirm" type={showConfirm ? 'text' : 'password'}
                  className={`form-control-lp ${errors.confirm ? 'error' : ''}`}
                  placeholder="Repeat your password" value={form.confirm}
                  onChange={e => set('confirm', e.target.value)} autoComplete="new-password" style={{ paddingRight: 40 }} />
                <button type="button" className="input-icon-action" onClick={() => setShowConfirm(v => !v)} aria-label={showConfirm ? 'Hide' : 'Show'}>
                  {showConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {errors.confirm && <div className="form-error"><AlertCircle size={12} />{errors.confirm}</div>}
            </div>

            {/* Terms */}
            <div className="form-group">
              <label className="checkbox-lp">
                <input type="checkbox" checked={form.agreed} onChange={e => set('agreed', e.target.checked)} />
                <span className="checkbox-lp-label">
                  I agree to the <span style={{ color: 'var(--color-primary)', cursor: 'default' }}>Terms of Service</span> and <span style={{ color: 'var(--color-primary)', cursor: 'default' }}>Privacy Policy</span>
                </span>
              </label>
              {errors.agreed && <div className="form-error" style={{ marginTop: 4 }}><AlertCircle size={12} />{errors.agreed}</div>}
            </div>

            <button type="submit" className="btn-lp btn-primary btn-full" disabled={loading}>
              {loading ? 'Creating Account...' : 'Create Account'}
            </button>
          </form>

          <p style={{ textAlign: 'center', marginTop: 24, fontSize: 14, color: 'var(--color-text-secondary)' }}>
            Already have an account?{' '}
            <Link to="/signin" style={{ color: 'var(--color-primary)', fontWeight: 600 }}>Sign In</Link>
          </p>
        </div>
      </div>

      {/* Right Hero */}
      <div className="auth-hero">
        <div style={{ position: 'relative', zIndex: 1, textAlign: 'center', padding: 32 }}>
          <div style={{ fontSize: 56, marginBottom: 24 }}>🎓</div>
          <h2 style={{ fontSize: 28, fontWeight: 700, marginBottom: 16, color: 'white' }}>
            Your learning, personalized
          </h2>
          <p style={{ fontSize: 16, color: 'rgba(255,255,255,0.8)', lineHeight: 1.7, maxWidth: 380 }}>
            Upload your syllabus once and get lecture recommendations, AI notes, practice quizzes,
            and a smart study planner — all tailored to your curriculum.
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16, marginTop: 40, textAlign: 'left' }}>
            {[
              { emoji: '📚', text: 'Curriculum-aware lecture discovery' },
              { emoji: '🤖', text: 'AI explanations in English or Hindi' },
              { emoji: '⚡', text: 'Smart quizzes and exam prep' },
            ].map(({ emoji, text }) => (
              <div key={text} style={{ display: 'flex', alignItems: 'center', gap: 14, background: 'rgba(255,255,255,0.1)', borderRadius: 12, padding: '12px 16px' }}>
                <span style={{ fontSize: 22 }}>{emoji}</span>
                <span style={{ color: 'rgba(255,255,255,0.9)', fontSize: 14, fontWeight: 500 }}>{text}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
