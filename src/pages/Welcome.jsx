import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  BookMarked, Sparkles, Brain, FileText, HelpCircle,
  ArrowRight, GraduationCap, Zap, BookOpen, Users
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import '../styles/global.css';

const features = [
  { icon: BookOpen, title: 'Curriculum-Aware', desc: 'Upload your syllabus and get personalized lecture recommendations mapped to your exact topics.' },
  { icon: Brain, title: 'AI Study Assistant', desc: 'Ask questions, get explanations, and generate notes powered by AI — in English or Hindi.' },
  { icon: HelpCircle, title: 'Smart Quizzes', desc: 'Auto-generated quizzes and mock exams to test your understanding and track weak areas.' },
  { icon: Zap, title: 'Crash Mode', desc: 'Preparing last minute? Get a time-blocked plan for the topics that matter most.' },
];

export default function Welcome() {
  const { enterAsGuest } = useAuth();
  const navigate = useNavigate();
  const [guestLoading, setGuestLoading] = useState(false);

  const handleGuest = () => {
    setGuestLoading(true);
    enterAsGuest({ name: 'Guest Student' });
    setTimeout(() => navigate('/onboarding'), 300);
  };

  return (
    <div style={{ minHeight: '100vh', background: 'var(--color-bg)', display: 'flex', flexDirection: 'column' }}>
      {/* Nav */}
      <nav style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '16px 40px', background: 'var(--color-surface)',
        borderBottom: '1px solid var(--color-border)', position: 'sticky', top: 0,
        zIndex: 100, boxShadow: 'var(--shadow-xs)',
      }}>
        <div className="logo">
          <div className="logo-icon"><BookMarked size={18} /></div>
          <span className="logo-text">Learn<span>Pilot</span> AI</span>
        </div>
        <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
          <Link to="/signin" className="btn-lp btn-ghost btn-sm">Sign In</Link>
          <Link to="/signup" className="btn-lp btn-primary btn-sm">Get Started</Link>
        </div>
      </nav>

      {/* Hero */}
      <section style={{
        flex: 1,
        background: 'linear-gradient(160deg, #f5f3ff 0%, #ede9ff 40%, #e0f7f7 100%)',
        display: 'flex', flexDirection: 'column', alignItems: 'center',
        justifyContent: 'center', padding: '80px 24px 60px',
        textAlign: 'center', position: 'relative', overflow: 'hidden',
      }}>
        {/* Background decoration */}
        <div style={{
          position: 'absolute', width: 600, height: 600, borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(91,78,248,0.08) 0%, transparent 70%)',
          top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
          pointerEvents: 'none',
        }} />

        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: 8,
          background: 'var(--color-primary-light)', border: '1px solid var(--color-primary-border)',
          borderRadius: 'var(--radius-full)', padding: '6px 14px',
          fontSize: 13, fontWeight: 600, color: 'var(--color-primary)',
          marginBottom: 28,
        }}>
          <Sparkles size={14} />
          AI-Powered Learning Companion for College Students
        </div>

        <h1 style={{
          fontSize: 'clamp(2rem, 5vw, 3.5rem)', fontWeight: 800,
          color: 'var(--color-text-primary)', lineHeight: 1.15,
          maxWidth: 780, marginBottom: 24,
        }}>
          Your syllabus. Your goals.{' '}
          <span style={{
            background: 'linear-gradient(135deg, var(--color-primary), var(--color-teal))',
            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
          }}>
            Your personalized AI<br />learning companion.
          </span>
        </h1>

        <p style={{
          fontSize: 18, color: 'var(--color-text-secondary)', maxWidth: 560,
          lineHeight: 1.7, marginBottom: 40,
        }}>
          Upload your syllabus, discover curated lectures, generate notes, practice
          with AI-powered quizzes, and prepare for exams — all in one place.
        </p>

        <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', justifyContent: 'center', marginBottom: 16 }}>
          <Link to="/signup" className="btn-lp btn-primary btn-xl">
            Get Started Free <ArrowRight size={18} />
          </Link>
          <Link to="/signin" className="btn-lp btn-secondary btn-xl">
            Sign In
          </Link>
        </div>

        <button
          onClick={handleGuest}
          disabled={guestLoading}
          style={{
            background: 'none', border: 'none', cursor: 'pointer',
            fontSize: 14, color: 'var(--color-text-muted)',
            textDecoration: 'underline', padding: '8px 0',
          }}
        >
          {guestLoading ? 'Entering...' : 'Continue as Guest (no sign-up required)'}
        </button>
      </section>

      {/* Features */}
      <section style={{ padding: '72px 40px', background: 'var(--color-surface)' }}>
        <div style={{ maxWidth: 1080, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 52 }}>
            <h2 style={{ fontSize: 32, fontWeight: 700, marginBottom: 12 }}>
              Everything you need to learn smarter
            </h2>
            <p style={{ fontSize: 16, color: 'var(--color-text-secondary)', maxWidth: 480, margin: '0 auto' }}>
              Built for Indian engineering and science students. Works with your syllabus.
            </p>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
            gap: 24,
          }}>
            {features.map(({ icon: Icon, title, desc }) => (
              <div key={title} style={{
                background: 'var(--color-bg)',
                border: '1px solid var(--color-border)',
                borderRadius: 'var(--radius-lg)',
                padding: 28,
                transition: 'box-shadow 200ms, transform 200ms',
                cursor: 'default',
              }}
                onMouseEnter={e => { e.currentTarget.style.boxShadow = 'var(--shadow-md)'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
                onMouseLeave={e => { e.currentTarget.style.boxShadow = ''; e.currentTarget.style.transform = ''; }}
              >
                <div style={{
                  width: 44, height: 44, borderRadius: 'var(--radius-md)',
                  background: 'var(--color-primary-light)', display: 'flex',
                  alignItems: 'center', justifyContent: 'center',
                  color: 'var(--color-primary)', marginBottom: 16,
                }}>
                  <Icon size={22} />
                </div>
                <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 8 }}>{title}</h3>
                <p style={{ fontSize: 14, color: 'var(--color-text-secondary)', lineHeight: 1.6 }}>{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section style={{
        background: 'linear-gradient(135deg, #3b2dc0 0%, #5b4ef8 60%, #0ea5a5 100%)',
        padding: '64px 24px', textAlign: 'center', color: 'white',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12, marginBottom: 20 }}>
          <GraduationCap size={32} />
          <Users size={28} />
        </div>
        <h2 style={{ fontSize: 28, fontWeight: 700, marginBottom: 12 }}>
          Ready to take control of your learning?
        </h2>
        <p style={{ fontSize: 16, opacity: 0.85, marginBottom: 32, maxWidth: 420, margin: '0 auto 32px' }}>
          Join students who are studying smarter with AI-powered tools built around their curriculum.
        </p>
        <Link to="/signup" style={{
          display: 'inline-flex', alignItems: 'center', gap: 8,
          background: 'white', color: 'var(--color-primary)',
          padding: '14px 32px', borderRadius: 'var(--radius-lg)',
          fontSize: 16, fontWeight: 700, textDecoration: 'none',
          boxShadow: '0 4px 20px rgba(0,0,0,0.2)',
          transition: 'transform 200ms, box-shadow 200ms',
        }}>
          Create Free Account <ArrowRight size={18} />
        </Link>
      </section>

      {/* Footer */}
      <footer style={{
        background: 'var(--color-surface)', borderTop: '1px solid var(--color-border)',
        padding: '20px 40px', display: 'flex', alignItems: 'center',
        justifyContent: 'space-between', flexWrap: 'wrap', gap: 8,
      }}>
        <div style={{ fontSize: 13, color: 'var(--color-text-muted)' }}>
          © 2024 LearnPilot AI — College Project Demo
        </div>
        <div style={{ display: 'flex', gap: 20 }}>
          {['Privacy', 'Terms', 'Help'].map(l => (
            <span key={l} style={{ fontSize: 13, color: 'var(--color-text-muted)', cursor: 'default' }}>{l}</span>
          ))}
        </div>
      </footer>
    </div>
  );
}
