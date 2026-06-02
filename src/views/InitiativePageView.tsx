import React from 'react';
import { useTrackerData } from '../lib/useTrackerData';
import { PageHeader, Panel, HealthPill, KpiTile, EmptyState } from '../components/shell/PageHeader';
import { LoadingPanel } from './DashboardView';
import { fmtDate, pct, STATUS_LABEL } from '../lib/health';
import { Sparkles, ArrowLeft } from 'lucide-react';
import type { ViewId } from '../App';

export const InitiativePageView: React.FC<{ initiativeId?: string; onNavigate: (v: ViewId, p?: any) => void }> = ({ initiativeId, onNavigate }) => {
  const { loading, initiatives, rollouts, stores } = useTrackerData();
  if (loading) return <LoadingPanel />;
  const init = initiatives.find((i) => i._id === initiativeId);
  if (!init) return <EmptyState icon={<Sparkles size={20} />} title="Initiative not found" />;

  const cells = rollouts.filter((r) => r.initiativeId === initiativeId && r.participating);
  const g = cells.filter((c) => c.health === 'green').length;
  const a = cells.filter((c) => c.health === 'amber').length;
  const r = cells.filter((c) => c.health === 'red').length;

  return (
    <>
      <button className="btn-ghost" onClick={() => onNavigate('initiatives')} style={{ marginBottom: 12 }}>
        <ArrowLeft size={14} /> All initiatives
      </button>
      <PageHeader
        overline={`Initiative · ${init.type}`}
        title={init.name}
        subtitle={`${init.vendor ? `Vendor: ${init.vendor} · ` : ''}${fmtDate(init.plannedStart)} → ${fmtDate(init.plannedEnd)}`}
      />

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 16, marginBottom: 24 }}>
        <KpiTile label="Participating" value={cells.length} color="var(--signal-500)" />
        <KpiTile label="On track" value={`${pct(g, cells.length)}%`} color="#22C55E" />
        <KpiTile label="At risk" value={a} color="#EAB308" />
        <KpiTile label="Delayed" value={r} color="#EF4444" />
      </div>

      <Panel title="Participation matrix" subtitle="Stores currently working this initiative">
        <table className="prism-table">
          <thead>
            <tr>
              <th>Code</th>
              <th>Store</th>
              <th>Region</th>
              <th>Area manager</th>
              <th>Status</th>
              <th>Planned end</th>
              <th>Health</th>
            </tr>
          </thead>
          <tbody>
            {cells.map((c) => {
              const s = stores.find((x) => x._id === c.storeId);
              return (
                <tr key={c._id} style={{ cursor: 'pointer' }} onClick={() => onNavigate('store-profile', { storeId: c.storeId })}>
                  <td style={{ fontWeight: 700, color: 'var(--signal-500)' }}>{s?.storeCode}</td>
                  <td style={{ fontWeight: 600 }}>{s?.storeName}</td>
                  <td>{s?.region}</td>
                  <td style={{ color: 'var(--text-secondary)' }}>{s?.areaManager || '—'}</td>
                  <td style={{ color: 'var(--text-secondary)' }}>{STATUS_LABEL[c.status] || c.status}</td>
                  <td className="font-mono-value">{fmtDate(c.plannedEnd)}</td>
                  <td><HealthPill health={c.health} /></td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </Panel>
    </>
  );
};
