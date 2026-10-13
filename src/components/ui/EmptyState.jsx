import React from 'react';

export default function EmptyState({
  icon,
  title,
  description,
  action,
  actionLabel,
  secondaryAction,
  secondaryLabel,
  size = 'md',
}) {
  const sizes = {
    sm: { padding: 32, iconSize: 40, title: 16, desc: 13 },
    md: { padding: 48, iconSize: 52, title: 18, desc: 14 },
    lg: { padding: 64, iconSize: 64, title: 22, desc: 16 },
  };
  const s = sizes[size];

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: s.padding,
        textAlign: 'center',
      }}
    >
      {icon && (
        <div
          style={{
            width: s.iconSize,
            height: s.iconSize,
            borderRadius: 16,
            background: 'var(--color-primary-lighter)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'var(--color-primary)',
            marginBottom: 20,
            flexShrink: 0,
          }}
        >
          {icon}
        </div>
      )}
      {title && (
        <h3
          style={{
            fontSize: s.title,
            fontWeight: 600,
            color: 'var(--color-text-primary)',
            marginBottom: 8,
          }}
        >
          {title}
        </h3>
      )}
      {description && (
        <p
          style={{
            fontSize: s.desc,
            color: 'var(--color-text-secondary)',
            maxWidth: 360,
            lineHeight: 1.6,
            marginBottom: action ? 24 : 0,
          }}
        >
          {description}
        </p>
      )}
      {(action || secondaryAction) && (
        <div style={{ display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap', justifyContent: 'center' }}>
          {action && (
            <button className="btn-lp btn-primary" onClick={action}>
              {actionLabel || 'Get Started'}
            </button>
          )}
          {secondaryAction && (
            <button className="btn-lp btn-secondary" onClick={secondaryAction}>
              {secondaryLabel || 'Learn More'}
            </button>
          )}
        </div>
      )}
    </div>
  );
}
