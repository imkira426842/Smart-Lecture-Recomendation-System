import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { BookMarked } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { profileAPI, apiConfig } from '../../services/api';
import Step1Profile from './Step1Profile';
import Step2Syllabus from './Step2Syllabus';
import Step3Ready from './Step3Ready';
import '../../styles/global.css';

const STEPS = [
  { num: 1, label: 'About You' },
  { num: 2, label: 'Upload Syllabus' },
  { num: 3, label: 'Ready to Learn' },
];

export default function OnboardingWrapper() {
  const { user, updateUser, completeOnboarding } = useAuth();
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [profileData, setProfileData] = useState({
    name: user?.name || '',
    degree: user?.degree || '',
    branch: user?.branch || '',
    year: user?.year || '',
    language: user?.language || 'English',
  });
  const [syllabusStatus, setSyllabusStatus] = useState(null); // null | 'uploaded' | 'skipped'

  const handleProfileDone = async (data) => {
    setProfileData(data);
    updateUser(data);
    // Sync to backend if configured
    if (apiConfig.isConfigured) {
      try {
        await profileAPI.update({ name: data.name, degree: data.degree, branch: data.branch, year: data.year, language: data.language });
      } catch { /* ignore — local state already updated */ }
    }
    setStep(2);
  };

  const handleSyllabusDone = (status) => {
    setSyllabusStatus(status);
    setStep(3);
  };

  const handleFinish = async () => {
    // Mark onboarded on backend
    if (apiConfig.isConfigured) {
      try {
        await profileAPI.update({ onboarded: true });
      } catch { /* ignore */ }
    }
    completeOnboarding();
    navigate('/app/overview');
  };

  const handleEditProfile = () => setStep(1);

  return (
    <div style={{
      minHeight: '100vh', background: 'linear-gradient(160deg, #f5f3ff 0%, #ede9ff 40%, #e0f7f7 100%)',
      display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '32px 16px',
    }}>
      {/* Logo */}
      <Link to="/" className="logo" style={{ marginBottom: 40 }}>
        <div className="logo-icon"><BookMarked size={18} /></div>
        <span className="logo-text">Learn<span>Pilot</span> AI</span>
      </Link>

      {/* Step Indicator */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 0, marginBottom: 40, position: 'relative' }}>
        {STEPS.map((s, i) => (
          <React.Fragment key={s.num}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, minWidth: 100 }}>
              <div style={{
                width: 36, height: 36, borderRadius: '50%', display: 'flex',
                alignItems: 'center', justifyContent: 'center', fontSize: 14, fontWeight: 700,
                background: step > s.num ? 'var(--color-success)' : step === s.num ? 'var(--color-primary)' : 'white',
                color: step >= s.num ? 'white' : 'var(--color-text-muted)',
                border: `2px solid ${step > s.num ? 'var(--color-success)' : step === s.num ? 'var(--color-primary)' : 'var(--color-border)'}`,
                transition: 'all 300ms',
              }}>
                {step > s.num ? '✓' : s.num}
              </div>
              <span style={{ fontSize: 12, fontWeight: 500, color: step >= s.num ? 'var(--color-text-primary)' : 'var(--color-text-muted)', whiteSpace: 'nowrap' }}>
                {s.label}
              </span>
            </div>
            {i < STEPS.length - 1 && (
              <div style={{
                height: 2, flex: 1, minWidth: 60, marginBottom: 28,
                background: step > s.num ? 'var(--color-success)' : 'var(--color-border)',
                transition: 'background 300ms',
              }} />
            )}
          </React.Fragment>
        ))}
      </div>

      {/* Step Card */}
      <div style={{
        background: 'white', borderRadius: 'var(--radius-2xl)', boxShadow: 'var(--shadow-xl)',
        width: '100%', maxWidth: 560, overflow: 'hidden',
      }}>
        <div style={{ padding: '8px 24px 0', borderBottom: '1px solid var(--color-border)' }}>
          <div style={{ padding: '16px 0' }}>
            <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 4 }}>
              Step {step} of 3
            </div>
          </div>
        </div>
        <div style={{ padding: 32 }}>
          {step === 1 && <Step1Profile data={profileData} onNext={handleProfileDone} />}
          {step === 2 && <Step2Syllabus onNext={handleSyllabusDone} onBack={() => setStep(1)} />}
          {step === 3 && <Step3Ready profile={profileData} syllabusStatus={syllabusStatus} onFinish={handleFinish} onEdit={handleEditProfile} />}
        </div>
      </div>
    </div>
  );
}
