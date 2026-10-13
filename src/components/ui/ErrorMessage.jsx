import React from 'react';
import { AlertCircle, RefreshCw, WifiOff } from 'lucide-react';

export default function ErrorMessage({ error, onRetry, compact = false }) {
  const isNetworkError = error?.message === 'BACKEND_NOT_CONFIGURED' || error?.message?.includes('fetch');
  const isBackendNotConfigured = error?.message === 'BACKEND_NOT_CONFIGURED';

  if (compact) {
    return (
      <div className="alert-lp alert-error" style={{ marginBottom: 0 }}>
        <AlertCircle size={16} style={{ flexShrink: 0, marginTop: 1 }} />
        <span>{isBackendNotConfigured ? 'Backend not configured.' : (error?.message || 'An error occurred.')}</span>
        {onRetry && !isBackendNotConfigured && (
          <button
            onClick={onRetry}
            style={{ marginLeft: 'auto', background: 'none', border: 'none', cursor: 'pointer', color: 'inherit', display: 'flex', alignItems: 'center', gap: 4, fontSize: 13, fontWeight: 500 }}
          >
            <RefreshCw size={14} /> Retry
          </button>
        )}
      </div>
    );
  }

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 48,
        textAlign: 'center',
      }}
    >
      <div
        style={{
          width: 52,
          height: 52,
          borderRadius: 12,
          background: 'var(--color-error-light)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'var(--color-error)',
          marginBottom: 20,
        }}
      >
        {isNetworkError ? <WifiOff size={24} /> : <AlertCircle size={24} />}
      </div>
      <h3 style={{ fontSize: 18, fontWeight: 600, marginBottom: 8 }}>
        {isBackendNotConfigured ? 'Backend Not Configured' : 'Something went wrong'}
      </h3>
      <p style={{ fontSize: 14, color: 'var(--color-text-secondary)', maxWidth: 360, lineHeight: 1.6, marginBottom: onRetry ? 24 : 0 }}>
        {isBackendNotConfigured
          ? 'Set VITE_API_BASE_URL in your .env file to connect to the FastAPI backend.'
          : (error?.message || 'An unexpected error occurred. Please try again.')}
      </p>
      {onRetry && !isBackendNotConfigured && (
        <button className="btn-lp btn-secondary" onClick={onRetry}>
          <RefreshCw size={16} /> Try Again
        </button>
      )}
    </div>
  );
}
