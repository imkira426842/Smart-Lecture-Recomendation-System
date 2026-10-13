import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  BookOpen, CheckCircle, TrendingUp, Bookmark,
  Upload, ChevronRight, PlayCircle, Brain,
  HelpCircle, Zap, FileText, CreditCard, AlertCircle,
  ArrowRight, ClipboardList, StickyNote
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { demoStats, demoSubjects, demoLectures, DEMO_MODE } from '../../utils/demoData';
import { curriculumAPI, lecturesAPI } from '../../services/api';
import { StatCardSkeleton } from '../../components/ui/LoadingSkeleton';

const QUICK_TOOLS = [
  { icon: Brain, label: 'AI Assistant', path: '/app/assistant', color: 'var(--color-primary-light)', iconColor: 'var(--color-primary)' },
  { icon: HelpCircle, label: 'Quiz Generator', path: '/app/quiz', color: 'var(--color-teal-light)', iconColor: 'var(--color-teal)' },
  { icon: CreditCard, label: 'Flashcards', path: '/app/flashcards', color: 'var(--color-success-light)', iconColor: 'var(--color-success)' },
  { icon: Zap, label: 'Crash Mode', path: '/app/crash', color: 'var(--color-warning-light)', iconColor: 'var(--color-warning)' },
  { icon: StickyNote, label: 'AI Notes', path: '/app/notes', color: '#e0e7ff', iconColor: '#4338ca' },
  { icon: ClipboardList, label: 'Mock Exams', path: '/app/exams', color: '#fce7f3', iconColor: '#be185d' },
];

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 17) return 'Good afternoon';
  return 'Good evening';
}

function StatCard({ icon: Icon, label, value, sub, color, iconBg }) {
  return (
    <div className="stat-card">
      <div className="stat-icon" style={{ background: iconBg || 'var(--color-primary-light)' }}>
        <Icon size={20} color={color || 'var(--color-primary)'} />
      </div>
      <div className="stat-info">
        <div className="stat-value">{value}</div>
        <div className="stat-label">{label}</div>
        {sub && <div className="stat-change" style={{ color: 'var(--color-text-muted)' }}>{sub}</div>}
      </div>
    </div>
  );
}

function ProgressBar({ value, max }) {
  const pct = max > 0 ? Math.round((value / max) * 100) : 0;
  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
        <span style={{ fontSize: 12, color: 'var(--color-text-muted)' }}>{value} / {max} topics</span>
        <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--color-primary)' }}>{pct}%</span>
      </div>
      <div className="progress-lp">
        <div className="progress-lp-bar" style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

export default function Overview() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(null);
  const [subjects, setSubjects] = useState([]);
  const [lectures, setLectures] = useState([]);
  const hasSyllabus = user?.syllabusUploaded;

  useEffect(() => {
    if (DEMO_MODE) {
      // No backend: use demo data
      setTimeout(() => {
        setStats(demoStats);
        setSubjects(demoSubjects);
        setLectures(demoLectures);
        setLoading(false);
      }, 600);
      return;
    }

    // Live backend
    setLoading(true);
    Promise.all([
      curriculumAPI.getAll(),
      lecturesAPI.getRecommended({}),
    ])
      .then(([currData, lecData]) => {
        const allTopics = (currData.subjects || []).flatMap(s =>
          s.units.flatMap(u => u.topics)
        );
        setStats({
          subjects: currData.stats?.subjects ?? (currData.subjects || []).length,
          topicsCompleted: currData.stats?.completed ?? allTopics.filter(t => t.status === 'completed').length,
          totalTopics: currData.stats?.total_topics ?? allTopics.length,
          progress: currData.stats?.total_topics
            ? Math.round((currData.stats.completed / currData.stats.total_topics) * 100)
            : 0,
          savedLectures: (lecData.lectures || []).filter(l => l.isBookmarked).length,
        });
        setSubjects(currData.subjects || []);
        setLectures(lecData.lectures || []);
      })
      .catch(() => {
        // Backend error: fall back to demo
        setStats(demoStats);
        setSubjects(demoSubjects);
        setLectures(demoLectures);
      })
      .finally(() => setLoading(false));
  }, []);

  const firstName = user?.name?.split(' ')[0] || 'Student';
  const displaySubjects = subjects.length ? subjects : demoSubjects;
  const displayLectures = lectures.length ? lectures : demoLectures;


  return (
    <div>
      {/* Demo Banner */}
      {DEMO_MODE && (
        <div className="demo-banner">
          <AlertCircle size={16} style={{ flexShrink: 0 }} />
          <span>
            <strong>Demo Mode</strong> — Showing sample data. Connect a FastAPI backend by setting <code>VITE_API_BASE_URL</code> in your <code>.env</code> file.
          </span>
        </div>
      )}

      {/* Greeting */}
      <div style={{
        background: 'linear-gradient(135deg, var(--color-primary-lighter) 0%, var(--color-teal-light) 100%)',
        border: '1px solid var(--color-primary-border)',
        borderRadius: 'var(--radius-lg)',
        padding: '24px 28px',
        marginBottom: 24,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: 16,
      }}>
        <div>
          <h2 style={{ fontSize: 22, fontWeight: 700, marginBottom: 4 }}>
            {getGreeting()}, {firstName}! 👋
          </h2>
          <p style={{ fontSize: 14, color: 'var(--color-text-secondary)' }}>
            Ready to make progress toward your learning goals?
          </p>
        </div>
        <Link to="/app/curriculum" className="btn-lp btn-primary btn-sm">
          <Upload size={15} /> Upload Syllabus
        </Link>
      </div>

      {/* Stats Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16, marginBottom: 28 }}>
        {loading ? (
          Array.from({ length: 4 }).map((_, i) => <StatCardSkeleton key={i} />)
        ) : (
          <>
            <StatCard icon={BookOpen} label="Subjects" value={stats.subjects} sub="In curriculum" iconBg="var(--color-primary-light)" color="var(--color-primary)" />
            <StatCard icon={CheckCircle} label="Topics Completed" value={stats.topicsCompleted} sub={`of ${stats.totalTopics} total`} iconBg="var(--color-success-light)" color="var(--color-success)" />
            <StatCard icon={TrendingUp} label="Progress" value={`${stats.progress}%`} sub="Overall curriculum" iconBg="var(--color-teal-light)" color="var(--color-teal)" />
            <StatCard icon={Bookmark} label="Saved Lectures" value={stats.savedLectures} sub="Bookmarked" iconBg="var(--color-warning-light)" color="var(--color-warning)" />
          </>
        )}
      </div>

      {/* Main grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: 24, alignItems: 'start' }}>
        {/* Left column */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>

          {/* No Syllabus State */}
          {!hasSyllabus && (
            <div className="card-lp" style={{
              background: 'linear-gradient(135deg, #1a1f36 0%, #2d2870 100%)',
              border: 'none', color: 'white',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 20, flexWrap: 'wrap' }}>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: 'rgba(255,255,255,0.6)', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                    📚 Start with your syllabus
                  </div>
                  <h3 style={{ fontSize: 18, fontWeight: 700, color: 'white', marginBottom: 8 }}>
                    Upload your curriculum to unlock personalized learning
                  </h3>
                  <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.7)', lineHeight: 1.6, marginBottom: 16 }}>
                    Once uploaded, we'll organize your subjects, discover relevant lectures, and build a personalized study plan.
                  </p>
                  <Link to="/app/curriculum" className="btn-lp" style={{ background: 'white', color: 'var(--color-primary)', fontWeight: 700 }}>
                    <Upload size={15} /> Upload Syllabus
                  </Link>
                </div>
              </div>
            </div>
          )}

          {/* Continue Learning */}
          <div className="card-lp">
            <div className="card-lp-header">
              <span className="card-lp-title">Continue Learning</span>
              <Link to="/app/curriculum" style={{ fontSize: 13, color: 'var(--color-primary)', display: 'flex', alignItems: 'center', gap: 4 }}>
                View all <ChevronRight size={14} />
              </Link>
            </div>
            {displaySubjects.slice(0, 2).map(subject => {
              const total = subject.units.flatMap(u => u.topics).length;
              const done = subject.units.flatMap(u => u.topics).filter(t => t.status === 'completed').length;
              return (
                <div key={subject.id} style={{ marginBottom: 16, paddingBottom: 16, borderBottom: '1px solid var(--color-border-light)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                    <div>
                      <div style={{ fontSize: 14, fontWeight: 600 }}>{subject.name}</div>
                      <div style={{ fontSize: 12, color: 'var(--color-text-muted)', marginTop: 2 }}>{subject.code}</div>
                    </div>
                    {DEMO_MODE && <span className="badge-lp badge-demo">Demo</span>}
                  </div>
                  <ProgressBar value={done} max={total} />
                </div>
              );
            })}
            <Link to="/app/curriculum" className="btn-lp btn-ghost btn-sm" style={{ marginTop: 4 }}>
              View full curriculum <ArrowRight size={14} />
            </Link>
          </div>

          {/* Recommended Lectures */}
          <div className="card-lp">
            <div className="card-lp-header">
              <span className="card-lp-title">Recommended Lectures</span>
              <Link to="/app/lectures" style={{ fontSize: 13, color: 'var(--color-primary)', display: 'flex', alignItems: 'center', gap: 4 }}>
                See all <ChevronRight size={14} />
              </Link>
            </div>
            {displayLectures.slice(0, 3).map(lec => (
              <div key={lec.id} style={{
                display: 'flex', alignItems: 'flex-start', gap: 14,
                padding: '12px 0', borderBottom: '1px solid var(--color-border-light)',
              }}>
                <div style={{ width: 40, height: 40, borderRadius: 10, background: 'var(--color-primary-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <PlayCircle size={18} color="var(--color-primary)" />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 14, fontWeight: 500, marginBottom: 4, overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
                    {lec.title}
                  </div>
                  <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
                    <span style={{ fontSize: 12, color: 'var(--color-text-muted)' }}>{lec.channel}</span>
                    <span style={{ fontSize: 12, color: 'var(--color-text-muted)' }}>·</span>
                    <span style={{ fontSize: 12, color: 'var(--color-text-muted)' }}>{lec.duration}</span>
                    <span className="badge-lp badge-muted" style={{ fontSize: 11 }}>{lec.language}</span>
                  </div>
                </div>
              </div>
            ))}
            <Link to="/app/lectures" className="btn-lp btn-ghost btn-sm" style={{ marginTop: 4 }}>
              Discover more lectures <ArrowRight size={14} />
            </Link>
          </div>
        </div>

        {/* Right column */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          {/* Quick Access */}
          <div className="card-lp">
            <div className="card-lp-header">
              <span className="card-lp-title">Quick Access</span>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              {QUICK_TOOLS.map(({ icon: Icon, label, path, color, iconColor }) => (
                <Link
                  key={path}
                  to={path}
                  style={{
                    display: 'flex', flexDirection: 'column', alignItems: 'center',
                    justifyContent: 'center', gap: 8, padding: '16px 8px',
                    background: color, borderRadius: 'var(--radius-md)',
                    textDecoration: 'none', color: 'var(--color-text-primary)',
                    transition: 'transform 200ms, box-shadow 200ms',
                  }}
                  onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = 'var(--shadow-sm)'; }}
                  onMouseLeave={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = ''; }}
                >
                  <Icon size={20} color={iconColor} />
                  <span style={{ fontSize: 12, fontWeight: 500, textAlign: 'center', color: iconColor }}>{label}</span>
                </Link>
              ))}
            </div>
          </div>

          {/* Subject Progress */}
          <div className="card-lp">
            <div className="card-lp-header">
              <span className="card-lp-title">Subject Progress</span>
              {DEMO_MODE && <span className="badge-lp badge-demo">Demo</span>}
            </div>
            {displaySubjects.map(subject => {
              const total = subject.units.flatMap(u => u.topics).length;
              const done = subject.units.flatMap(u => u.topics).filter(t => t.status === 'completed').length;
              const pct = Math.round((done / total) * 100);
              return (
                <div key={subject.id} style={{ marginBottom: 14 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                    <span style={{ fontSize: 13, fontWeight: 500, color: 'var(--color-text-primary)' }}>{subject.name.split(' ')[0]}</span>
                    <span style={{ fontSize: 12, color: 'var(--color-text-muted)' }}>{pct}%</span>
                  </div>
                  <div className="progress-lp">
                    <div className="progress-lp-bar" style={{ width: `${pct}%` }} />
                  </div>
                </div>
              );
            })}
            <Link to="/app/analytics" className="btn-lp btn-ghost btn-sm" style={{ marginTop: 8, width: '100%', justifyContent: 'center' }}>
              View analytics <ArrowRight size={14} />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
