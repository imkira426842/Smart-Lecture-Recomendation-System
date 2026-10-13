import React from 'react';

export function Skeleton({ width, height, className = '', style = {} }) {
  return (
    <div
      className={`skeleton ${className}`}
      style={{ width, height: height || 18, borderRadius: 8, ...style }}
    />
  );
}

export function CardSkeleton() {
  return (
    <div className="card-lp" style={{ gap: 16, display: 'flex', flexDirection: 'column' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <Skeleton width={44} height={44} style={{ borderRadius: 10 }} />
        <div style={{ flex: 1 }}>
          <Skeleton width="60%" style={{ marginBottom: 8 }} />
          <Skeleton width="40%" height={14} />
        </div>
      </div>
      <Skeleton height={14} />
      <Skeleton height={14} width="80%" />
      <Skeleton height={14} width="60%" />
    </div>
  );
}

export function TableRowSkeleton({ cols = 4 }) {
  return (
    <tr>
      {Array.from({ length: cols }).map((_, i) => (
        <td key={i} style={{ padding: '14px 16px' }}>
          <Skeleton width={i === 0 ? '70%' : '50%'} />
        </td>
      ))}
    </tr>
  );
}

export function StatCardSkeleton() {
  return (
    <div className="stat-card">
      <Skeleton width={44} height={44} style={{ borderRadius: 10 }} />
      <div style={{ flex: 1 }}>
        <Skeleton width={60} height={28} style={{ marginBottom: 8 }} />
        <Skeleton width={90} height={14} />
      </div>
    </div>
  );
}

export default Skeleton;
