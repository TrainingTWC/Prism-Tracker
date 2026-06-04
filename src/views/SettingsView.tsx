import React, { useState } from 'react';
import { useQuery, useAction } from 'convex/react';
import { api } from '../../convex/_generated/api';
import { PageHeader, Panel } from '../components/shell/PageHeader';
import { RefreshCw } from 'lucide-react';

export const SettingsView: React.FC<{ user: any; onSignOut: () => void }> = ({ user, onSignOut }) => {
  const empStatus = useQuery(api.employees.syncStatus, {});
  const calStatus = useQuery(api.calendarSync.syncStatus, {});
  const forceSyncEmployees = useAction(api.employees.forceSync);
  const forceSyncCalendar = useAction(api.calendarSync.forceSync);
  const [syncing, setSyncing] = useState<'employees' | 'calendar' | null>(null);

  const handleSync = async (kind: 'employees' | 'calendar') => {
    setSyncing(kind);
    try {
      if (kind === 'employees') await forceSyncEmployees({});
      else await forceSyncCalendar({});
    } finally {
      setSyncing(null);
    }
  };

  return (
    <>
      <PageHeader overline="Workspace · Settings" title="Your account" subtitle="Profile and session preferences" />
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
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
          <p className="text-overline-muted" style={{ marginTop: 16 }}>v0.6 · Phase 6</p>
        </Panel>
      </div>

      <Panel title="Prism Intelligence Integration">
        <p style={{ fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.6, margin: '0 0 18px' }}>
          Tracker syncs the employee master and calendar events from Prism Intelligence automatically every hour. Use the buttons below to force an immediate sync.
        </p>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          {/* Employees */}
          <div style={{ padding: 14, borderRadius: 10, border: '1px solid var(--border-subtle)', background: 'var(--card-bg)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
              <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-primary)' }}>Employees</span>
              <button
                className="btn-ghost"
                onClick={() => handleSync('employees')}
                disabled={syncing === 'employees'}
                style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 11 }}
              >
                <RefreshCw size={12} style={{ animation: syncing === 'employees' ? 'spin 1s linear infinite' : 'none' }} />
                {syncing === 'employees' ? 'Syncing…' : 'Sync now'}
              </button>
            </div>
            <Row label="Cached" value={empStatus ? `${empStatus.count} employees` : '…'} />
            <Row label="Last sync" value={empStatus?.lastSynced ? new Date(empStatus.lastSynced).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' }) : empStatus ? 'Never' : '…'} />
          </div>
          {/* Calendar */}
          <div style={{ padding: 14, borderRadius: 10, border: '1px solid var(--border-subtle)', background: 'var(--card-bg)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
              <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-primary)' }}>Calendar events</span>
              <button
                className="btn-ghost"
                onClick={() => handleSync('calendar')}
                disabled={syncing === 'calendar'}
                style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 11 }}
              >
                <RefreshCw size={12} style={{ animation: syncing === 'calendar' ? 'spin 1s linear infinite' : 'none' }} />
                {syncing === 'calendar' ? 'Syncing…' : 'Sync now'}
              </button>
            </div>
            <Row label="Cached" value={calStatus ? `${calStatus.count} events` : '…'} />
            <Row label="Last sync" value={calStatus?.lastSynced ? new Date(calStatus.lastSynced).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' }) : calStatus ? 'Never' : '…'} />
          </div>
        </div>
        <div style={{ marginTop: 14, padding: '10px 14px', borderRadius: 8, background: 'rgba(59,130,246,0.06)', border: '1px solid rgba(59,130,246,0.15)' }}>
          <p style={{ fontSize: 11, color: 'var(--text-secondary)', margin: 0, lineHeight: 1.6 }}>
            <strong style={{ color: 'var(--text-primary)' }}>Intelligence side setup:</strong> set env vars{' '}
            <code style={{ fontSize: 10, background: 'rgba(255,255,255,0.08)', padding: '1px 5px', borderRadius: 4 }}>INTEGRATION_API_KEY</code> and{' '}
            <code style={{ fontSize: 10, background: 'rgba(255,255,255,0.08)', padding: '1px 5px', borderRadius: 4 }}>INTELLIGENCE_APP_URL</code> in the Tracker Convex dashboard, then expose{' '}
            <code style={{ fontSize: 10, background: 'rgba(255,255,255,0.08)', padding: '1px 5px', borderRadius: 4 }}>GET /api/employees</code> and{' '}
            <code style={{ fontSize: 10, background: 'rgba(255,255,255,0.08)', padding: '1px 5px', borderRadius: 4 }}>GET /api/calendar</code> on Intelligence.
          </p>
        </div>
      </Panel>
    </>
  );
};

const Row: React.FC<{ label: string; value: string }> = ({ label, value }) => (
  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid var(--border-subtle)' }}>
    <span className="text-overline-muted">{label}</span>
    <span style={{ fontSize: 12, color: 'var(--text-primary)' }}>{value}</span>
  </div>
);

