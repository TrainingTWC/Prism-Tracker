import React, { useState, useMemo } from 'react';
import { useMutation } from 'convex/react';
import { api } from '../../convex/_generated/api';
import { useTrackerData } from '../lib/useTrackerData';
import { PageHeader, Panel, HealthPill } from '../components/shell/PageHeader';
import { LoadingPanel } from './DashboardView';
import { pct } from '../lib/health';
import { Store as StoreIcon, Plus, Pencil, Trash2 } from 'lucide-react';
import type { ViewId } from '../App';
import { StoreEditModal } from '../components/StoreEditModal';
import type { StoreRecord } from '../components/StoreEditModal';

export const StoresView: React.FC<{ search?: string; onNavigate?: (v: ViewId, params?: any) => void }> = ({ search = '', onNavigate }) => {
  const { loading, stores, rollouts } = useTrackerData();
  const removeStore = useMutation(api.stores.remove);
  const [regionFilter, setRegionFilter] = useState('all');
  const [formatFilter, setFormatFilter] = useState('all');
  const [editStore, setEditStore] = useState<StoreRecord | null | undefined>(undefined); // undefined = closed, null = create
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);

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

  const handleDelete = async (id: string) => {
    await removeStore({ id: id as any });
    setConfirmDelete(null);
  };

  return (
    <>
      <PageHeader
        overline="Stores · Master Data"
        title="All stores"
        subtitle={`${filtered.length} of ${stores.length} stores · click a row to deep-dive`}
        actions={
          <button className="btn-primary" onClick={() => setEditStore(null)}>
            <Plus size={14} /> Add store
          </button>
        }
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
                <th style={{ width: 80 }}></th>
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
                    <td onClick={(e) => e.stopPropagation()} style={{ whiteSpace: 'nowrap' }}>
                      <button
                        className="btn-ghost"
                        title="Edit store"
                        style={{ padding: '4px 6px', marginRight: 2 }}
                        onClick={() => setEditStore(s as StoreRecord)}
                      >
                        <Pencil size={12} />
                      </button>
                      {confirmDelete === s._id ? (
                        <>
                          <button
                            style={{ padding: '4px 8px', fontSize: 11, background: '#EF4444', color: '#fff', border: 'none', borderRadius: 6, cursor: 'pointer', marginRight: 2 }}
                            onClick={() => handleDelete(s._id)}
                          >
                            Confirm
                          </button>
                          <button className="btn-ghost" style={{ padding: '4px 6px', fontSize: 11 }} onClick={() => setConfirmDelete(null)}>✕</button>
                        </>
                      ) : (
                        <button
                          className="btn-ghost"
                          title="Deactivate store"
                          style={{ padding: '4px 6px', color: 'var(--text-muted)' }}
                          onClick={() => setConfirmDelete(s._id)}
                        >
                          <Trash2 size={12} />
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Panel>

      {/* Edit / create modal */}
      {editStore !== undefined && (
        <StoreEditModal
          store={editStore}
          onClose={() => setEditStore(undefined)}
          onSaved={() => setEditStore(undefined)}
        />
      )}
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
