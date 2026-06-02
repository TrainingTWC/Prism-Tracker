import React, { useState, useMemo } from 'react';
import { useTrackerData } from '../lib/useTrackerData';
import { PageHeader, Panel, HealthPill } from '../components/shell/PageHeader';
import { LoadingPanel } from './DashboardView';
import { pct } from '../lib/health';
import { Store as StoreIcon } from 'lucide-react';
import type { ViewId } from '../App';

export const StoresView: React.FC<{ search?: string; onNavigate?: (v: ViewId, params?: any) => void }> = ({ search = '', onNavigate }) => {
  const { loading, stores, rollouts } = useTrackerData();
  const [regionFilter, setRegionFilter] = useState('all');
  const [formatFilter, setFormatFilter] = useState('all');

  const regions = useMemo(() => Array.from(new Set(stores.map((s) => s.region).filter(Boolean))).sort(), [stores]);
  const formats = useMemo(() => Array.from(new Set(stores.map((s) => s.storeFormat).filter(Boolean))).sort(), [stores]);

  const filtered = useMemo(() => stores.filter((s) => {
    if (regionFilter !== 'all' && s.region !== regionFilter) return false;
    if (formatFilter !== 'all' && s.storeFormat !== formatFilter) return false;
    if (search) {
      const q = search.toLowerCase();
      return ['storeCode', 'storeName', 'areaManager', 'city', 'region'].some((k) =>
        ((s as any)[k] || '').toLowerCase().includes(q),
      );
    }
    return true;
  }), [stores, regionFilter, formatFilter, search]);

  if (loading) return <LoadingPanel />;

  return (
    <>
      <PageHeader
        overline="Stores · Master Data"
        title="All stores"
        subtitle={`${filtered.length} of ${stores.length} stores · click a row to deep-dive`}
      />

      <div style={{ display: 'flex', gap: 10, marginBottom: 16, flexWrap: 'wrap' }}>
        <SelectInline label="Region" value={regionFilter} onChange={setRegionFilter} opts={[{ v: 'all', l: 'All' }, ...regions.map((r) => ({ v: r, l: r }))]} />
        <SelectInline label="Format" value={formatFilter} onChange={setFormatFilter} opts={[{ v: 'all', l: 'All' }, ...formats.map((f) => ({ v: f, l: f }))]} />
      </div>

      <Panel padding={0}>
        <div style={{ overflowX: 'auto', maxHeight: 'calc(100vh - 280px)' }}>
          <table className="prism-table">
            <thead>
              <tr>
                <th>Code</th>
                <th>Store</th>
                <th>Region</th>
                <th>City</th>
                <th>Area Manager</th>
                <th>Format</th>
                <th>Menu</th>
                <th>Coffee Machine</th>
                <th>Merrychef</th>
                <th>Active Rollouts</th>
                <th>Health</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((s) => {
                const cells = rollouts.filter((r) => r.storeId === s._id && r.participating);
                const g = cells.filter((c) => c.health === 'green').length;
                const r = cells.filter((c) => c.health === 'red').length;
                const overall = r > 0 ? 'red' : (cells.length > 0 && g === cells.length ? 'green' : 'amber');
                return (
                  <tr key={s._id} style={{ cursor: 'pointer' }} onClick={() => onNavigate && onNavigate('store-profile', { storeId: s._id })}>
                    <td style={{ fontWeight: 700, color: 'var(--signal-500)' }}>{s.storeCode}</td>
                    <td style={{ fontWeight: 600 }}>{s.storeName}</td>
                    <td>{s.region}</td>
                    <td>{s.city}</td>
                    <td style={{ color: 'var(--text-secondary)' }}>{s.areaManager || '—'}</td>
                    <td><span className="badge-pill" style={{ background: 'rgba(255,255,255,0.04)', color: 'var(--text-secondary)' }}>{s.storeFormat}</span></td>
                    <td style={{ color: 'var(--text-secondary)' }}>{s.menuType}</td>
                    <td style={{ color: 'var(--text-secondary)' }}>{s.coffeeMachine}</td>
                    <td style={{ color: 'var(--text-secondary)' }}>{s.merrychefType}</td>
                    <td className="font-mono-value" style={{ fontWeight: 700 }}>{cells.length}</td>
                    <td>{cells.length > 0 ? <HealthPill health={overall as any} /> : <span className="text-overline-muted">—</span>}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Panel>
    </>
  );
};

const SelectInline: React.FC<{ label: string; value: string; onChange: (v: string) => void; opts: { v: string; l: string }[] }> = ({ label, value, onChange, opts }) => (
  <label style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
    <span className="text-overline-muted">{label}</span>
    <select value={value} onChange={(e) => onChange(e.target.value)} className="prism-input" style={{ padding: '6px 12px', fontSize: 12, width: 'auto' }}>
      {opts.map((o) => <option key={o.v} value={o.v}>{o.l}</option>)}
    </select>
  </label>
);
