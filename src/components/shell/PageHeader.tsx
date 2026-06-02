import React from 'react';

export const PageHeader: React.FC<{
  overline: string;
  title: React.ReactNode;
  subtitle?: React.ReactNode;
  actions?: React.ReactNode;
}> = ({ overline, title, subtitle, actions }) => (
  <div style={{ marginBottom: 28, paddingBottom: 20, borderBottom: '1px solid var(--border-subtle)' }}>
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', gap: 16, flexWrap: 'wrap' }}>
      <div>
        <p className="text-overline" style={{ margin: '0 0 6px' }}>{overline}</p>
        <h1 style={{ fontSize: 28, fontWeight: 800, color: 'var(--obsidian-50)', margin: '0 0 6px', letterSpacing: '-0.02em' }}>
          {title}
        </h1>
        {subtitle && (
          <p style={{ fontSize: 12, color: 'var(--text-tertiary)', margin: 0 }}>{subtitle}</p>
        )}
      </div>
      {actions && <div style={{ display: 'flex', gap: 10 }}>{actions}</div>}
    </div>
  </div>
);

export const KpiTile: React.FC<{
  label: string;
  value: React.ReactNode;
  hint?: React.ReactNode;
  color?: string;
  trend?: React.ReactNode;
}> = ({ label, value, hint, color = 'var(--signal-500)', trend }) => (
  <div className="widget" style={{ padding: 22 }}>
    <p className="text-overline" style={{ color, margin: '0 0 10px' }}>{label}</p>
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', gap: 8 }}>
      <span className="font-mono-value" style={{ fontSize: 32, fontWeight: 700, color: 'var(--obsidian-50)', letterSpacing: '-0.02em', lineHeight: 1 }}>
        {value}
      </span>
      {trend}
    </div>
    {hint && (
      <p style={{ fontSize: 11, color: 'var(--text-tertiary)', margin: '8px 0 0' }}>{hint}</p>
    )}
  </div>
);

export const Panel: React.FC<{
  title?: React.ReactNode;
  subtitle?: React.ReactNode;
  actions?: React.ReactNode;
  children: React.ReactNode;
  padding?: number;
}> = ({ title, subtitle, actions, children, padding = 22 }) => (
  <div className="glass" style={{ padding }}>
    {(title || actions) && (
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <div>
          {title && <h3 style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>{title}</h3>}
          {subtitle && <p style={{ fontSize: 11, color: 'var(--text-tertiary)', margin: '4px 0 0' }}>{subtitle}</p>}
        </div>
        {actions}
      </div>
    )}
    {children}
  </div>
);

export const HealthPill: React.FC<{ health: 'green' | 'amber' | 'red'; label?: string }> = ({ health, label }) => {
  const color = health === 'green' ? '#22C55E' : health === 'amber' ? '#EAB308' : '#EF4444';
  const bg = health === 'green' ? 'rgba(34,197,94,0.10)' : health === 'amber' ? 'rgba(234,179,8,0.10)' : 'rgba(239,68,68,0.10)';
  const txt = label || (health === 'green' ? 'ON TRACK' : health === 'amber' ? 'AT RISK' : 'DELAYED');
  return (
    <span className="badge-pill" style={{ background: bg, color }}>
      <span style={{ width: 6, height: 6, borderRadius: '50%', background: color, boxShadow: `0 0 6px ${color}80` }} />
      {txt}
    </span>
  );
};

export const EmptyState: React.FC<{ icon: React.ReactNode; title: string; hint?: string }> = ({ icon, title, hint }) => (
  <div style={{ padding: 60, textAlign: 'center' }}>
    <div className="prism-icon-tile" style={{ margin: '0 auto 16px' }}>{icon}</div>
    <p style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)', margin: '0 0 6px' }}>{title}</p>
    {hint && <p style={{ fontSize: 12, color: 'var(--text-tertiary)', margin: 0 }}>{hint}</p>}
  </div>
);
