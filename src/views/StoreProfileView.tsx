import React from 'react';
import { useTrackerData } from '../lib/useTrackerData';
import { PageHeader, Panel, HealthPill, KpiTile, EmptyState } from '../components/shell/PageHeader';
import { LoadingPanel } from './DashboardView';
import { fmtDate, pct, STATUS_LABEL } from '../lib/health';
import { Store as StoreIcon, ArrowLeft } from 'lucide-react';
import type { ViewId } from '../App';

export const StoreProfileView: React.FC<{ storeId?: string; onNavigate: (v: ViewId, p?: any) => void }> = ({ storeId, onNavigate }) => {
  const { loading, stores, rollouts, initiatives } = useTrackerData();
  if (loading) return <LoadingPanel />;
  const store = stores.find((s) => s._id === storeId);
  if (!store) return <EmptyState icon={<StoreIcon size={20} />} title="Store not found" />;

  const myRollouts = rollouts.filter((r) => r.storeId === storeId);
  const active = myRollouts.filter((r) => r.participating);
  const g = active.filter((r) => r.health === 'green').length;
  const a = active.filter((r) => r.health === 'amber').length;
  const red = active.filter((r) => r.health === 'red').length;

  return (
    <>
      <button className="btn-ghost" onClick={() => onNavigate('stores')} style={{ marginBottom: 12 }}>
        <ArrowLeft size={14} /> All stores
      </button>
      <PageHeader
        overline={`Store · ${store.storeCode}`}
        title={store.storeName}
        subtitle={`${store.city} · ${store.region} · Area manager: ${store.areaManager || '—'}`}
      />

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 16, marginBottom: 24 }}>
        <KpiTile label="Active rollouts" value={active.length} color="var(--signal-500)" />
        <KpiTile label="On track" value={`${pct(g, active.length)}%`} color="#22C55E" hint={`${g} of ${active.length}`} />
        <KpiTile label="Open snags" value={red} color="#EF4444" />
        <KpiTile label="At risk" value={a} color="#EAB308" />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: 16, marginBottom: 24 }}>
        <Panel title="Equipment & format">
          <DetailRow label="Format" value={store.storeFormat} />
          <DetailRow label="Menu" value={store.menuType} />
          <DetailRow label="Coffee machine" value={store.coffeeMachine} />
          <DetailRow label="Merrychef" value={store.merrychefType} />
          <DetailRow label="Region" value={store.region} />
          <DetailRow label="City" value={store.city} />
        </Panel>

        <Panel title="Rollouts" subtitle={`${myRollouts.length} initiatives`}>
          <table className="prism-table">
            <thead>
              <tr>
                <th>Initiative</th>
                <th>Status</th>
                <th>Planned end</th>
                <th>Health</th>
              </tr>
            </thead>
            <tbody>
              {myRollouts.map((r) => {
                const init = initiatives.find((i) => i._id === r.initiativeId);
                return (
                  <tr key={r._id}>
                    <td style={{ fontWeight: 600 }}>{init?.name || '—'}</td>
                    <td style={{ color: 'var(--text-secondary)' }}>{STATUS_LABEL[r.status] || r.status}</td>
                    <td className="font-mono-value">{fmtDate(r.plannedEnd)}</td>
                    <td>{r.participating ? <HealthPill health={r.health} /> : <span className="text-overline-muted">N/A</span>}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </Panel>
      </div>
    </>
  );
};

const DetailRow: React.FC<{ label: string; value: string }> = ({ label, value }) => (
  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid var(--border-subtle)' }}>
    <span className="text-overline-muted">{label}</span>
    <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-primary)' }}>{value || '—'}</span>
  </div>
);
