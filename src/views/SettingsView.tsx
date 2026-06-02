import React from 'react';
import { PageHeader, Panel } from '../components/shell/PageHeader';

export const SettingsView: React.FC<{ user: any; onSignOut: () => void }> = ({ user, onSignOut }) => (
  <>
    <PageHeader overline="Workspace · Settings" title="Your account" subtitle="Profile and session preferences" />
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
      <Panel title="Account">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <Row label="Email" value={user?.email || '—'} />
          <Row label="Name" value={user?.name || '—'} />
          <Row label="Workspace" value="Third Wave Coffee" />
        </div>
        <button className="btn-secondary" onClick={onSignOut} style={{ marginTop: 18 }}>Sign out</button>
      </Panel>
      <Panel title="About Prism Tracker">
        <p style={{ fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.6, margin: 0 }}>
          Prism Tracker is the rollout-coordination surface of Prism OS — the fourth app in the family alongside Prism Intelligence, Prism Escalations, and Prism Learning. It tracks every store × initiative cell across the Third Wave Coffee estate.
        </p>
        <p className="text-overline-muted" style={{ marginTop: 16 }}>v0.5 · Phase 5</p>
      </Panel>
    </div>
  </>
);

const Row: React.FC<{ label: string; value: string }> = ({ label, value }) => (
  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid var(--border-subtle)' }}>
    <span className="text-overline-muted">{label}</span>
    <span style={{ fontSize: 12, color: 'var(--text-primary)' }}>{value}</span>
  </div>
);
