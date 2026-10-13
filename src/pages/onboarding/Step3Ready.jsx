import React from 'react';
import { CheckCircle, AlertCircle, User, BookOpen, Globe, Calendar, FileText } from 'lucide-react';

export default function Step3Ready({ profile, syllabusStatus, onFinish, onEdit }) {
  const rows = [
    { icon: User, label: 'Name', value: profile.name },
    { icon: BookOpen, label: 'Degree & Branch', value: `${profile.degree} — ${profile.branch}` },
    { icon: Calendar, label: 'Academic Year', value: profile.year },
    { icon: Globe, label: 'Preferred Language', value: profile.language },
    { icon: FileText, label: 'Syllabus', value: syllabusStatus === 'uploaded' ? 'Uploaded & processed ✓' : 'Not uploaded (can add later)' },
  ];

  return (
    <div style={{ textAlign: 'center' }}>
      <div style={{ width: 64, height: 64, borderRadius: '50%', background: 'var(--color-success-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-success)', margin: '0 auto 20px' }}>
        <CheckCircle size={32} />
      </div>
      <h2 style={{ fontSize: 24, fontWeight: 700, marginBottom: 8 }}>You're all set, {profile.name?.split(' ')[0]}! 🎉</h2>
      <p style={{ fontSize: 14, color: 'var(--color-text-secondary)', marginBottom: 28, lineHeight: 1.6 }}>
        Your learning companion is ready. Here's a summary of your profile.
      </p>

      <div style={{ background: 'var(--color-bg)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--color-border)', padding: 20, textAlign: 'left', marginBottom: 20 }}>
        {rows.map(({ icon: Icon, label, value }) => (
          <div key={label} style={{ display: 'flex', alignItems: 'flex-start', gap: 12, padding: '10px 0', borderBottom: '1px solid var(--color-border-light)' }}>
            <Icon size={16} color="var(--color-text-muted)" style={{ marginTop: 2 }} />
            <div>
              <div style={{ fontSize: 12, color: 'var(--color-text-muted)', marginBottom: 2 }}>{label}</div>
              <div style={{ fontSize: 14, fontWeight: 500 }}>{value || '—'}</div>
            </div>
          </div>
        ))}
      </div>

      {syllabusStatus !== 'uploaded' && (
        <div className="alert-lp alert-info" style={{ textAlign: 'left', marginBottom: 20 }}>
          <AlertCircle size={15} style={{ flexShrink: 0 }} />
          <span>You skipped the syllabus upload. You can add it anytime from your curriculum page to unlock personalized recommendations.</span>
        </div>
      )}

      <div style={{ display: 'flex', gap: 12, flexDirection: 'column' }}>
        <button className="btn-lp btn-primary btn-full" onClick={onFinish}>Go to Dashboard →</button>
        <button className="btn-lp btn-ghost btn-full" onClick={onEdit}>← Edit Details</button>
      </div>
    </div>
  );
}
