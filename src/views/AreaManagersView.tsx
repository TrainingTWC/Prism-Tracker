import React, { useMemo } from 'react';
import { useTrackerData } from '../lib/useTrackerData';
import { PageHeader, Panel, HealthPill } from '../components/shell/PageHeader';
import { LoadingPanel } from './DashboardView';
import { pct } from '../lib/health';

export const AreaManagersView: React.FC = () => {
  const { loading, stores, rollouts } = useTrackerData();
  if (loading) return <LoadingPanel />;

  const rows = useMemo(() => {
    const m: Record<string, { am: string; stores: any[]; cells: any[] }> = {};
    stores.forEach((s) => {
      const k = s.areaManager || 'Unassigned';
      if (!m[k]) m[k] = { am: k, stores: [], cells: [] };
      m[k].stores.push(s);
      m[k].cells.push(...rollouts.filter((r) => r.storeId === s._id && r.participating));
    });
    return Object.values(m).map((row) => {
      const g = row.cells.filter((c) => c.health === 'green').length;
      const r = row.cells.filter((c) => c.health === 'red').length;
      const overall: 'green' | 'amber' | 'red' = r > 0 ? 'red' : (g === row.cells.length && row.cells.length > 0 ? 'green' : 'amber');
      const avgDelay = r > 0 ? Math.round(row.cells.filter((c) => c.isDelayed && c.delayDays).reduce((s, c) => s + c.delayDays, 0) / r) : 0;
      return { ...row, g, r, overall, avgDelay, onTrackPct: pct(g, row.cells.length) };
    }).sort((a, b) => b.onTrackPct - a.onTrackPct);
  }, [stores, rollouts]);

  return (
    <>
      <PageHeader overline="Operations · People" title="Area Manager leaderboard" subtitle={`${rows.length} AMs · sorted by % on-track`} />
      <Panel padding={0}>
        <table className="prism-table">
          <thead>
            <tr>
              <th>#</th>
              <th>Area manager</th>
              <th>Stores</th>
              <th>Rollouts</th>
              <th>On-track %</th>
              <th>Open snags</th>
              <th>Avg delay</th>
              <th>Health</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r, idx) => (
              <tr key={r.am}>
                <td className="font-mono-value text-overline-muted">{idx + 1}</td>
                <td style={{ fontWeight: 700, color: 'var(--text-primary)' }}>{r.am}</td>
                <td className="font-mono-value">{r.stores.length}</td>
                <td className="font-mono-value">{r.cells.length}</td>
                <td className="font-mono-value" style={{ color: r.onTrackPct >= 70 ? '#22C55E' : r.onTrackPct >= 40 ? '#EAB308' : '#EF4444' }}>{r.onTrackPct}%</td>
                <td className="font-mono-value" style={{ color: r.r > 0 ? '#EF4444' : 'var(--text-tertiary)' }}>{r.r}</td>
                <td className="font-mono-value">{r.avgDelay > 0 ? `${r.avgDelay}d` : '—'}</td>
                <td>{r.cells.length > 0 && <HealthPill health={r.overall} />}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </Panel>
    </>
  );
};
