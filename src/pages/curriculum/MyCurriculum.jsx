import React, { useState, useEffect, useCallback } from 'react';
import { BookOpen, ChevronDown, ChevronRight, Upload, Search, CheckCircle, Circle, Clock, AlertCircle, X } from 'lucide-react';
import { Link } from 'react-router-dom';
import { demoSubjects, DEMO_MODE } from '../../utils/demoData';
import { curriculumAPI } from '../../services/api';

const STATUS_CONFIG = {
  completed: { label: 'Completed', Icon: CheckCircle, color: 'var(--color-success)', bg: 'var(--color-success-light)' },
  'in-progress': { label: 'In Progress', Icon: Clock, color: 'var(--color-warning)', bg: 'var(--color-warning-light)' },
  'not-started': { label: 'Not Started', Icon: Circle, color: 'var(--color-text-muted)', bg: 'var(--color-surface-2)' },
};

function TopicRow({ topic, onStatusChange }) {
  const cfg = STATUS_CONFIG[topic.status];
  const { Icon } = cfg;
  const nextStatus = { 'not-started': 'in-progress', 'in-progress': 'completed', completed: 'not-started' };
  return (
    <div
      style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '8px 16px', borderBottom: '1px solid var(--color-border-light)', transition: 'background 150ms' }}
      onMouseEnter={e => e.currentTarget.style.background = 'var(--color-bg)'}
      onMouseLeave={e => e.currentTarget.style.background = ''}
    >
      <button
        onClick={() => onStatusChange(topic.id, nextStatus[topic.status])}
        style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 2, color: cfg.color, display: 'flex', flexShrink: 0 }}
        aria-label={`Mark ${topic.name} as ${nextStatus[topic.status]}`}
        title={`Click to mark as: ${nextStatus[topic.status]}`}
      >
        <Icon size={18} />
      </button>
      <span style={{
        flex: 1, fontSize: 14,
        color: topic.status === 'completed' ? 'var(--color-text-muted)' : 'var(--color-text-primary)',
        textDecoration: topic.status === 'completed' ? 'line-through' : 'none',
      }}>
        {topic.name}
      </span>
      <span className={`badge-lp badge-${{ completed: 'success', 'in-progress': 'warning', 'not-started': 'muted' }[topic.status]}`} style={{ fontSize: 11 }}>
        {cfg.label}
      </span>
    </div>
  );
}

function UnitAccordion({ unit, onStatusChange, searchQuery }) {
  const [open, setOpen] = useState(true);
  const filteredTopics = searchQuery
    ? unit.topics.filter(t => t.name.toLowerCase().includes(searchQuery.toLowerCase()))
    : unit.topics;
  if (filteredTopics.length === 0) return null;
  const done = unit.topics.filter(t => t.status === 'completed').length;
  return (
    <div style={{ marginBottom: 8 }}>
      <button
        onClick={() => setOpen(v => !v)}
        style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 10, padding: '10px 16px', background: 'var(--color-surface-2)', border: 'none', borderRadius: open ? '8px 8px 0 0' : 8, cursor: 'pointer', textAlign: 'left' }}
      >
        {open ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
        <span style={{ flex: 1, fontSize: 14, fontWeight: 600 }}>{unit.name}</span>
        <span style={{ fontSize: 12, color: 'var(--color-text-muted)' }}>{done}/{unit.topics.length}</span>
      </button>
      {open && (
        <div style={{ border: '1px solid var(--color-border)', borderTop: 'none', borderRadius: '0 0 8px 8px', overflow: 'hidden' }}>
          {filteredTopics.map(topic => <TopicRow key={topic.id} topic={topic} onStatusChange={onStatusChange} />)}
        </div>
      )}
    </div>
  );
}

export default function MyCurriculum() {
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeSubject, setActiveSubject] = useState(null);

  useEffect(() => {
    if (DEMO_MODE) {
      setTimeout(() => {
        setSubjects(demoSubjects);
        setActiveSubject(demoSubjects[0]?.id || null);
        setLoading(false);
      }, 600);
      return;
    }

    curriculumAPI.getAll()
      .then(data => {
        const subs = data.subjects || [];
        setSubjects(subs);
        setActiveSubject(subs[0]?.id || null);
      })
      .catch(() => {
        setSubjects(demoSubjects);
        setActiveSubject(demoSubjects[0]?.id || null);
      })
      .finally(() => setLoading(false));
  }, []);

  const handleStatusChange = useCallback(async (topicId, newStatus) => {
    // Optimistic update
    setSubjects(prev => prev.map(s => ({
      ...s,
      units: s.units.map(u => ({
        ...u,
        topics: u.topics.map(t => t.id === topicId ? { ...t, status: newStatus } : t),
      })),
    })));

    if (!DEMO_MODE) {
      try {
        await curriculumAPI.updateTopic(topicId, { status: newStatus });
      } catch {
        // Silently ignore — optimistic update stays
      }
    }
  }, []);

  const currentSubject = subjects.find(s => s.id === activeSubject);
  const allTopics = subjects.flatMap(s => s.units.flatMap(u => u.topics));
  const completedCount = allTopics.filter(t => t.status === 'completed').length;
  const totalCount = allTopics.length;
  const pct = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  if (loading) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {[1, 2, 3].map(i => <div key={i} className="skeleton" style={{ height: 60, borderRadius: 10 }} />)}
      </div>
    );
  }

  return (
    <div>
      {DEMO_MODE && (
        <div className="demo-banner">
          <AlertCircle size={16} style={{ flexShrink: 0 }} />
          <span><strong>Demo Data</strong> — Showing a sample curriculum. Upload your syllabus PDF to see your actual subjects and topics.</span>
        </div>
      )}

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24, flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h1 className="page-title">My Curriculum</h1>
          <p className="page-subtitle">{completedCount} of {totalCount} topics completed · {pct}% overall</p>
        </div>
        <Link to="#" className="btn-lp btn-primary btn-sm"><Upload size={15} /> Upload Syllabus</Link>
      </div>

      {/* Overall progress */}
      <div className="card-lp" style={{ marginBottom: 20 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
          <span style={{ fontSize: 14, fontWeight: 600 }}>Overall Progress</span>
          <span style={{ fontSize: 14, fontWeight: 700, color: 'var(--color-primary)' }}>{pct}%</span>
        </div>
        <div className="progress-lp" style={{ height: 10 }}><div className="progress-lp-bar" style={{ width: `${pct}%` }} /></div>
        <div style={{ display: 'flex', gap: 20, marginTop: 12, flexWrap: 'wrap' }}>
          {Object.entries(STATUS_CONFIG).map(([key, cfg]) => {
            const count = allTopics.filter(t => t.status === key).length;
            const { Icon } = cfg;
            return (
              <div key={key} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13 }}>
                <Icon size={14} color={cfg.color} />
                <span style={{ color: 'var(--color-text-secondary)' }}>{count} {cfg.label}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Subject list + topics */}
      <div style={{ display: 'grid', gridTemplateColumns: '260px 1fr', gap: 20, alignItems: 'start' }}>
        {/* Subjects sidebar */}
        <div className="card-lp" style={{ padding: 8 }}>
          <div style={{ padding: '8px 8px 12px', borderBottom: '1px solid var(--color-border)', marginBottom: 8 }}>
            <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--color-text-secondary)', paddingLeft: 4 }}>Subjects</span>
          </div>
          {subjects.map(s => {
            const total = s.units.flatMap(u => u.topics).length;
            const done = s.units.flatMap(u => u.topics).filter(t => t.status === 'completed').length;
            const isActive = activeSubject === s.id;
            return (
              <button
                key={s.id}
                onClick={() => setActiveSubject(s.id)}
                style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px', borderRadius: 8, border: 'none', background: isActive ? 'var(--color-primary-lighter)' : 'transparent', cursor: 'pointer', textAlign: 'left', transition: 'background 150ms' }}
              >
                <BookOpen size={16} color={isActive ? 'var(--color-primary)' : 'var(--color-text-muted)'} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 13, fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', color: isActive ? 'var(--color-primary)' : 'var(--color-text-primary)' }}>
                    {s.name}
                  </div>
                  <div style={{ fontSize: 11, color: 'var(--color-text-muted)' }}>{done}/{total} topics</div>
                </div>
              </button>
            );
          })}
        </div>

        {/* Topic detail */}
        <div>
          {currentSubject && (
            <div className="card-lp">
              <div style={{ marginBottom: 16 }}>
                <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 4 }}>{currentSubject.name}</h3>
                <div style={{ fontSize: 13, color: 'var(--color-text-muted)' }}>{currentSubject.code}</div>
              </div>
              {/* Search */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, background: 'var(--color-bg)', border: '1px solid var(--color-border)', borderRadius: 8, padding: '8px 12px', marginBottom: 16 }}>
                <Search size={15} color="var(--color-text-muted)" />
                <input
                  type="search"
                  placeholder="Search topics..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  style={{ border: 'none', background: 'transparent', flex: 1, fontSize: 14, fontFamily: 'var(--font-family)', color: 'var(--color-text-primary)' }}
                  aria-label="Search topics"
                />
                {searchQuery && (
                  <button onClick={() => setSearchQuery('')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-text-muted)', padding: 0 }}>
                    <X size={15} />
                  </button>
                )}
              </div>
              {currentSubject.units.map(unit => (
                <UnitAccordion key={unit.id} unit={unit} onStatusChange={handleStatusChange} searchQuery={searchQuery} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
