import React from 'react';
import { useTrackerData } from '../lib/useTrackerData';
import { PageHeader, Panel, HealthPill, EmptyState } from '../components/shell/PageHeader';
import { LoadingPanel } from './DashboardView';
import { fmtDate, DELAY_CATEGORY_COLOR } from '../lib/health';
import { ShieldCheck, AlertTriangle } from 'lucide-react';
import type { ViewId } from '../App';

export const SnagsView: React.FC<{ onNavigate: (v: ViewId, p?: any) => void }> = ({ onNavigate }) => {
  const { loading, rollouts, stores, initiatives } = useTrackerData();
  if (loading) return <LoadingPanel />;

  const snags = rollouts
    .filter((r) => r.participating && (r.health === 'red' || r.isDelayed))
    .sort((a, b) => (b.delayDays || 0) - (a.delayDays || 0));

  if (snags.length === 0) {
    return (
      <>
        <PageHeader overline="Operations · Snag List" title="Open snags" />
        <Panel>
          <EmptyState icon={<ShieldCheck size={20} />} title="Clear skies" hint="No red rollouts. Estate is healthy." />
        </Panel>
      </>
    );
  }

  return (
    <>
      <PageHeader
        overline="Operations · Snag List"
        title="Open snags"
        subtitle={`${snags.length} delayed or at-risk rollouts · sorted by days overdue`}
      />
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))', gap: 14 }}>
        {snags.map((s) => {
          const store = stores.find((x) => x._id === s.storeId);
          const init = initiatives.find((x) => x._id === s.initiativeId);
          const catColor = DELAY_CATEGORY_COLOR[s.delayCategory || 'other'] || '#7A7A88';
          return (
            <div key={s._id} className="glass" style={{ padding: 18, cursor: 'pointer' }} onClick={() => onNavigate('store-profile', { storeId: s.storeId })}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10 }}>
                <HealthPill health={s.health} />
                {s.delayDays != null && (
                  <span className="badge-pill font-mono-value" style={{ background: 'rgba(239,68,68,0.08)', color: '#FCA5A5' }}>
                    {s.delayDays}d
                  </span>
                )}
              </div>
              <p style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)', margin: '0 0 4px' }}>
                <span style={{ color: 'var(--signal-500)' }}>{store?.storeCode}</span> · {init?.name}
              </p>
              <p style={{ fontSize: 11, color: 'var(--text-tertiary)', margin: '0 0 12px' }}>
                {store?.storeName} · {store?.city} · {store?.areaManager || '—'}
              </p>
              {s.delayCategory && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 }}>
                  <span style={{ width: 8, height: 8, borderRadius: 2, background: catColor }} />
                  <span className="text-overline-muted" style={{ color: catColor }}>{s.delayCategory}</span>
                </div>
              )}
              {s.delayReason && (
                <p style={{ fontSize: 11, color: 'var(--text-secondary)', margin: '0 0 8px', lineHeight: 1.5 }}>{s.delayReason}</p>
              )}
              <p className="font-mono-value text-overline-muted" style={{ margin: 0 }}>
                Planned end: {fmtDate(s.plannedEnd)}
              </p>
            </div>
          );
        })}
      </div>
    </>
  );
};
