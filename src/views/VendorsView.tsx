import React from 'react';
import { useTrackerData } from '../lib/useTrackerData';
import { PageHeader, Panel, HealthPill, EmptyState } from '../components/shell/PageHeader';
import { LoadingPanel } from './DashboardView';
import { fmtDate, pct } from '../lib/health';
import { Truck } from 'lucide-react';

export const VendorsView: React.FC = () => {
  const { loading, initiatives, rollouts } = useTrackerData();
  if (loading) return <LoadingPanel />;

  const vendors: Record<string, { vendor: string; initiatives: any[]; cells: any[] }> = {};
  initiatives.forEach((i) => {
    if (!i.vendor) return;
    if (!vendors[i.vendor]) vendors[i.vendor] = { vendor: i.vendor, initiatives: [], cells: [] };
    vendors[i.vendor].initiatives.push(i);
    vendors[i.vendor].cells.push(...rollouts.filter((r) => r.initiativeId === i._id && r.participating));
  });

  const rows = Object.values(vendors).map((v) => {
    const g = v.cells.filter((c) => c.health === 'green').length;
    const r = v.cells.filter((c) => c.health === 'red').length;
    const overall: 'green' | 'amber' | 'red' = r > 0 ? 'red' : (g === v.cells.length && v.cells.length > 0 ? 'green' : 'amber');
    const minStart = Math.min(...v.initiatives.map((i) => i.plannedStart || Infinity));
    const maxEnd = Math.max(...v.initiatives.map((i) => i.plannedEnd || 0));
    const avgDelay = v.cells.filter((c) => c.isDelayed && c.delayDays).reduce((s, c) => s + c.delayDays, 0) / Math.max(1, r);
    return { ...v, g, r, overall, minStart, maxEnd, avgDelay: Math.round(avgDelay), onTrackPct: pct(g, v.cells.length) };
  });

  if (rows.length === 0) return (
    <>
      <PageHeader overline="Initiatives · Vendors" title="Vendor scorecard" />
      <Panel><EmptyState icon={<Truck size={20} />} title="No vendor data" hint="Add vendor on each initiative to populate this view." /></Panel>
    </>
  );

  return (
    <>
      <PageHeader overline="Initiatives · Vendors" title="Vendor scorecard" subtitle={`${rows.length} vendors`} />
      <Panel padding={0}>
        <table className="prism-table">
          <thead>
            <tr>
              <th>Vendor</th>
              <th># Initiatives</th>
              <th># Rollouts</th>
              <th>On track</th>
              <th>Avg delay</th>
              <th>Window</th>
              <th>Health</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((v) => (
              <tr key={v.vendor}>
                <td style={{ fontWeight: 700 }}>{v.vendor}</td>
                <td className="font-mono-value">{v.initiatives.length}</td>
                <td className="font-mono-value">{v.cells.length}</td>
                <td className="font-mono-value" style={{ color: v.onTrackPct >= 70 ? '#22C55E' : v.onTrackPct >= 40 ? '#EAB308' : '#EF4444' }}>{v.onTrackPct}%</td>
                <td className="font-mono-value">{v.avgDelay > 0 ? `${v.avgDelay}d` : '—'}</td>
                <td className="font-mono-value" style={{ color: 'var(--text-tertiary)' }}>
                  {isFinite(v.minStart) ? fmtDate(v.minStart) : '—'} → {v.maxEnd > 0 ? fmtDate(v.maxEnd) : '—'}
                </td>
                <td>{v.cells.length > 0 && <HealthPill health={v.overall} />}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </Panel>
    </>
  );
};
