import React, { useState } from 'react';
import { AlertCircle } from 'lucide-react';

const DEGREES = ['B.Tech', 'B.E.', 'BCA', 'B.Sc.', 'M.Tech', 'MCA', 'Other'];
const BRANCHES = ['CSE', 'IT', 'ECE', 'EEE', 'Mechanical', 'Civil', 'Chemical', 'Other'];
const YEARS = ['1st Year', '2nd Year', '3rd Year', '4th Year', 'Other'];
const LANGUAGES = ['English', 'Hindi', 'Both'];

export default function Step1Profile({ data, onNext }) {
  const [form, setForm] = useState({ ...data });
  const [errors, setErrors] = useState({});

  const set = (k, v) => { setForm(f => ({ ...f, [k]: v })); setErrors(e => ({ ...e, [k]: '' })); };

  const validate = () => {
    const e = {};
    if (!form.name?.trim()) e.name = 'Name is required';
    if (!form.degree) e.degree = 'Please select your degree';
    if (!form.branch) e.branch = 'Please select your branch';
    if (!form.year) e.year = 'Please select your year';
    return e;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    onNext({ ...form, language: form.language || 'English' });
  };

  const SelectField = ({ id, label, value, onChange, options, error, required }) => (
    <div className="form-group">
      <label className="form-label" htmlFor={id}>{label}{required && <span style={{ color: 'var(--color-error)' }}>*</span>}</label>
      <select id={id} className={`form-control-lp form-select-lp ${error ? 'error' : ''}`}
        value={value} onChange={e => onChange(e.target.value)}>
        <option value="">Select...</option>
        {options.map(o => <option key={o} value={o}>{o}</option>)}
      </select>
      {error && <div className="form-error"><AlertCircle size={12} />{error}</div>}
    </div>
  );

  return (
    <form onSubmit={handleSubmit} noValidate>
      <h2 style={{ fontSize: 22, fontWeight: 700, marginBottom: 6 }}>Tell us about yourself</h2>
      <p style={{ fontSize: 14, color: 'var(--color-text-secondary)', marginBottom: 28 }}>
        This helps us personalize your learning experience.
      </p>

      <div className="form-group">
        <label className="form-label" htmlFor="ob-name">Your Name <span style={{ color: 'var(--color-error)' }}>*</span></label>
        <input id="ob-name" type="text" className={`form-control-lp ${errors.name ? 'error' : ''}`}
          placeholder="e.g. Arjun Sharma" value={form.name || ''}
          onChange={e => set('name', e.target.value)} autoComplete="name" />
        {errors.name && <div className="form-error"><AlertCircle size={12} />{errors.name}</div>}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        <SelectField id="ob-degree" label="Degree" value={form.degree || ''} onChange={v => set('degree', v)} options={DEGREES} error={errors.degree} required />
        <SelectField id="ob-branch" label="Branch / Specialization" value={form.branch || ''} onChange={v => set('branch', v)} options={BRANCHES} error={errors.branch} required />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        <SelectField id="ob-year" label="Academic Year" value={form.year || ''} onChange={v => set('year', v)} options={YEARS} error={errors.year} required />
        <div className="form-group">
          <label className="form-label" htmlFor="ob-lang">Preferred Language</label>
          <select id="ob-lang" className="form-control-lp form-select-lp" value={form.language || 'English'} onChange={e => set('language', e.target.value)}>
            {LANGUAGES.map(l => <option key={l} value={l}>{l}</option>)}
          </select>
        </div>
      </div>

      <button type="submit" className="btn-lp btn-primary btn-full" style={{ marginTop: 8 }}>
        Continue →
      </button>
    </form>
  );
}
