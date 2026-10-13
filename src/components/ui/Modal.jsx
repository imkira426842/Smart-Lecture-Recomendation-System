import React, { useEffect, useRef } from 'react';
import { X } from 'lucide-react';

export default function Modal({
  isOpen,
  onClose,
  title,
  children,
  footer,
  size = 'md',
  closeOnBackdrop = true,
}) {
  const dialogRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  useEffect(() => {
    const handleKey = (e) => { if (e.key === 'Escape' && isOpen) onClose(); };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const maxWidths = { sm: 400, md: 560, lg: 720, xl: 900 };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(26, 31, 54, 0.5)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 'var(--z-modal)',
        padding: 16,
        backdropFilter: 'blur(4px)',
      }}
      onClick={closeOnBackdrop ? (e) => { if (e.target === e.currentTarget) onClose(); } : undefined}
    >
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
        style={{
          background: 'var(--color-surface)',
          borderRadius: 'var(--radius-xl)',
          boxShadow: 'var(--shadow-xl)',
          width: '100%',
          maxWidth: maxWidths[size],
          maxHeight: '90vh',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
        }}
      >
        {/* Header */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '20px 24px',
            borderBottom: '1px solid var(--color-border)',
            flexShrink: 0,
          }}
        >
          <h2 id="modal-title" style={{ fontSize: 18, fontWeight: 600, margin: 0 }}>{title}</h2>
          <button
            onClick={onClose}
            aria-label="Close dialog"
            style={{
              width: 32, height: 32, borderRadius: 8, border: 'none',
              background: 'var(--color-surface-2)', cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: 'var(--color-text-secondary)',
            }}
          >
            <X size={16} />
          </button>
        </div>

        {/* Body */}
        <div style={{ padding: '24px', overflowY: 'auto', flex: 1 }}>
          {children}
        </div>

        {/* Footer */}
        {footer && (
          <div
            style={{
              padding: '16px 24px',
              borderTop: '1px solid var(--color-border)',
              display: 'flex',
              gap: 12,
              justifyContent: 'flex-end',
              flexShrink: 0,
            }}
          >
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}

export function ConfirmModal({ isOpen, onClose, onConfirm, title, message, confirmLabel = 'Confirm', danger = false }) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} size="sm"
      footer={
        <>
          <button className="btn-lp btn-secondary" onClick={onClose}>Cancel</button>
          <button className={`btn-lp ${danger ? 'btn-danger' : 'btn-primary'}`} onClick={() => { onConfirm(); onClose(); }}>{confirmLabel}</button>
        </>
      }
    >
      <p style={{ color: 'var(--color-text-secondary)', fontSize: 14 }}>{message}</p>
    </Modal>
  );
}
