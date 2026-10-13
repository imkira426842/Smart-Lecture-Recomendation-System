import React, { useState, useEffect } from 'react';
import { Search, Bookmark, BookmarkCheck, ExternalLink, PlayCircle, Clock, AlertCircle, X, ChevronDown } from 'lucide-react';
import { demoLectures, DEMO_MODE } from '../../utils/demoData';
import { lecturesAPI } from '../../services/api';

const LANGUAGE_OPTIONS = ['All', 'English', 'Hindi'];
const DIFFICULTY_OPTIONS = ['All', 'Beginner', 'Intermediate', 'Advanced'];

const diffBadge = { Beginner: 'badge-success', Intermediate: 'badge-warning', Advanced: 'badge-error' };

function LectureCard({ lecture, onBookmark }) {
  return (
    <div className="card-lp" style={{ padding: 20 }}>
      <div style={{ display: 'flex', gap: 16, alignItems: 'flex-start' }}>
        <div style={{ width: 80, height: 60, borderRadius: 8, flexShrink: 0, background: 'linear-gradient(135deg, var(--color-primary-light), var(--color-teal-light))', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <PlayCircle size={28} color="var(--color-primary)" />
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 8, marginBottom: 6 }}>
            <h3 style={{ fontSize: 15, fontWeight: 600, lineHeight: 1.4, margin: 0 }}>{lecture.title}</h3>
            <button
              onClick={() => onBookmark(lecture.id)}
              style={{ background: 'none', border: 'none', cursor: 'pointer', color: lecture.isBookmarked ? 'var(--color-warning)' : 'var(--color-text-muted)', flexShrink: 0, padding: 2 }}
              aria-label={lecture.isBookmarked ? 'Remove bookmark' : 'Bookmark lecture'}
            >
              {lecture.isBookmarked ? <BookmarkCheck size={20} /> : <Bookmark size={20} />}
            </button>
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, alignItems: 'center', marginBottom: 10 }}>
            <span style={{ fontSize: 13, fontWeight: 500, color: 'var(--color-text-secondary)' }}>{lecture.channel}</span>
            <span style={{ fontSize: 12, color: 'var(--color-text-muted)' }}>·</span>
            <span style={{ fontSize: 13, color: 'var(--color-text-muted)', display: 'flex', alignItems: 'center', gap: 4 }}>
              <Clock size={13} /> {lecture.duration}
            </span>
            <span className="badge-lp badge-muted">{lecture.language}</span>
            <span className={`badge-lp ${diffBadge[lecture.difficulty] || 'badge-muted'}`}>{lecture.difficulty}</span>
            {DEMO_MODE && <span className="badge-lp badge-demo">Demo</span>}
          </div>
          {lecture.reason && (
            <div style={{ fontSize: 12, color: 'var(--color-primary)', background: 'var(--color-primary-lighter)', borderRadius: 6, padding: '4px 8px', display: 'inline-flex', alignItems: 'center', gap: 4, marginBottom: 12 }}>
              <AlertCircle size={11} /> {lecture.reason}
            </div>
          )}
          <a href={lecture.url} target="_blank" rel="noopener noreferrer" className="btn-lp btn-primary btn-sm">
            <ExternalLink size={13} /> Watch Lecture
          </a>
        </div>
      </div>
    </div>
  );
}

export default function RecommendedLectures() {
  const [lectures, setLectures] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [langFilter, setLangFilter] = useState('All');
  const [diffFilter, setDiffFilter] = useState('All');

  useEffect(() => {
    if (DEMO_MODE) {
      setTimeout(() => { setLectures(demoLectures); setLoading(false); }, 700);
      return;
    }

    lecturesAPI.getRecommended({})
      .then(data => setLectures(data.lectures || []))
      .catch(() => setLectures(demoLectures))
      .finally(() => setLoading(false));
  }, []);

  const handleBookmark = async (id) => {
    // Optimistic toggle
    setLectures(prev => prev.map(l => l.id === id ? { ...l, isBookmarked: !l.isBookmarked } : l));
    if (!DEMO_MODE) {
      try {
        await lecturesAPI.bookmark(id);
      } catch {
        // Revert on error
        setLectures(prev => prev.map(l => l.id === id ? { ...l, isBookmarked: !l.isBookmarked } : l));
      }
    }
  };

  const filtered = lectures.filter(l => {
    const q = search.toLowerCase();
    if (q && !l.title.toLowerCase().includes(q) && !(l.topic || '').toLowerCase().includes(q)) return false;
    if (langFilter !== 'All' && l.language !== langFilter) return false;
    if (diffFilter !== 'All' && l.difficulty !== diffFilter) return false;
    return true;
  });

  const hasFilters = search || langFilter !== 'All' || diffFilter !== 'All';

  return (
    <div>
      {DEMO_MODE && (
        <div className="demo-banner">
          <AlertCircle size={16} style={{ flexShrink: 0 }} />
          <span><strong>Demo Data</strong> — Upload your syllabus to get personalized lecture recommendations from the backend.</span>
        </div>
      )}

      <div className="page-header">
        <h1 className="page-title">Recommended Lectures</h1>
        <p className="page-subtitle">Curated lectures matched to your curriculum topics</p>
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 20, flexWrap: 'wrap' }}>
        <div style={{ flex: 1, minWidth: 200, display: 'flex', alignItems: 'center', gap: 10, background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: 10, padding: '9px 14px' }}>
          <Search size={16} color="var(--color-text-muted)" />
          <input
            type="search"
            placeholder="Search by topic, subject, or title..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{ border: 'none', background: 'transparent', flex: 1, fontSize: 14, fontFamily: 'var(--font-family)', color: 'var(--color-text-primary)' }}
            aria-label="Search lectures"
          />
          {search && <button onClick={() => setSearch('')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-text-muted)', padding: 0 }}><X size={15} /></button>}
        </div>

        {[
          { label: 'Language', value: langFilter, options: LANGUAGE_OPTIONS, setter: setLangFilter },
          { label: 'Difficulty', value: diffFilter, options: DIFFICULTY_OPTIONS, setter: setDiffFilter },
        ].map(({ label, value, options, setter }) => (
          <div key={label} style={{ position: 'relative' }}>
            <select
              value={value}
              onChange={e => setter(e.target.value)}
              style={{ padding: '9px 32px 9px 12px', border: '1px solid var(--color-border)', borderRadius: 10, fontSize: 14, fontFamily: 'var(--font-family)', background: 'var(--color-surface)', cursor: 'pointer', color: value !== 'All' ? 'var(--color-primary)' : 'var(--color-text-primary)', appearance: 'none' }}
              aria-label={`Filter by ${label}`}
            >
              {options.map(o => <option key={o} value={o}>{label}: {o}</option>)}
            </select>
            <ChevronDown size={14} style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', color: 'var(--color-text-muted)' }} />
          </div>
        ))}
      </div>

      <div style={{ fontSize: 13, color: 'var(--color-text-muted)', marginBottom: 16 }}>
        {loading ? 'Loading…' : `${filtered.length} lecture${filtered.length !== 1 ? 's' : ''} found`}
        {hasFilters && (
          <button onClick={() => { setSearch(''); setLangFilter('All'); setDiffFilter('All'); }} style={{ marginLeft: 12, color: 'var(--color-primary)', background: 'none', border: 'none', cursor: 'pointer', fontSize: 13 }}>
            Clear filters
          </button>
        )}
      </div>

      {loading ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {[1, 2, 3].map(i => <div key={i} className="skeleton" style={{ height: 130, borderRadius: 14 }} />)}
        </div>
      ) : filtered.length === 0 ? (
        <div style={{ textAlign: 'center', padding: 48, color: 'var(--color-text-muted)' }}>
          <PlayCircle size={40} style={{ marginBottom: 16, opacity: 0.3 }} />
          <div style={{ fontSize: 16, fontWeight: 600, marginBottom: 8, color: 'var(--color-text-primary)' }}>No lectures found</div>
          <div style={{ fontSize: 14 }}>{search ? `No results for "${search}".` : 'No lectures match the current filters.'}</div>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {filtered.map(l => <LectureCard key={l.id} lecture={l} onBookmark={handleBookmark} />)}
        </div>
      )}
    </div>
  );
}
