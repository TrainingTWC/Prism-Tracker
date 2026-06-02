import React, { useMemo, useState } from 'react';
import { useTrackerData } from '../lib/useTrackerData';
import { PageHeader, Panel, HealthPill, EmptyState } from '../components/shell/PageHeader';
import { LoadingPanel } from './DashboardView';
import { HEALTH_COLOR, STATUS_LABEL, fmtDate } from '../lib/health';
import { Grid3x3, X, Calendar, User as UserIcon, AlertTriangle } from 'lucide-react';

export const GridView: React.FC<{ search?: string }> = ({ search = '' }) => {
  const { loading, rollouts, stores, initiatives } = useTrackerData();
  const [regionFilter, setRegionFilter] = useState('all');
  const [healthFilter, setHealthFilter] = useState('all');
  const [selectedCell, setSelectedCell] = useState<any>(null);

  const regions = useMemo(() => Array.from(new Set(stores.map((s) => s.region).filter(Boolean))).sort(), [stores]);
  const filteredStores = useMemo(() => {
    return stores.filter((s) => {
      if (regionFilter !== 'all' && s.region !== regionFilter) return false;
      if (search) {
        const q = search.toLowerCase();
        return (s.storeCode || '').toLowerCase().includes(q)
          || (s.storeName || '').toLowerCase().includes(q)
          || (s.areaManager || '').toLowerCase().includes(q)
          || (s.city || '').toLowerCase().includes(q);
      }
      return true;
    });
  }, [stores, regionFilter, search]);

  const rolloutMap = useMemo(() => {
    const m: Record<string, any> = {};
    rollouts.forEach((r) => { m[`${r.storeId}::${r.initiativeId}`] = r; });
    return m;
  }, [rollouts]);

  if (loading) return <LoadingPanel />;
  if (stores.length === 0) {
    return (
      <>
        <PageHeader overline="Rollouts · Grid" title="Store × initiative" />
        <Panel>
          <EmptyState icon={<Grid3x3 size={20} />} title="No stores yet" hint="Import the store mapping sheet from the Data → Import view." />
        </Panel>
      </>
    );
  }

  return (
    <>
      <PageHeader
        overline="Rollouts · Grid"
        title="Store × initiative"
        subtitle={`${filteredStores.length} stores · ${initiatives.length} initiatives · click any cell to inspect`}
      />

      {/* Filters */}
      <div style={{ display: 'flex', gap: 10, marginBottom: 16, flexWrap: 'wrap', alignItems: 'center' }}>
        <Select label="Region" value={regionFilter} onChange={setRegionFilter} options={[{ value: 'all', label: 'All regions' }, ...regions.map((r) => ({ value: r, label: r }))]} />
        <Select label="Health" value={healthFilter} onChange={setHealthFilter} options={[
          { value: 'all', label: 'All health' },
          { value: 'green', label: 'On track' },
          { value: 'amber', label: 'At risk' },
          { value: 'red', label: 'Delayed' },
        ]} />
        <span className="text-overline-muted" style={{ marginLeft: 'auto' }}>
          Showing {filteredStores.length} stores
        </span>
      </div>

      {/* Grid */}
      <Panel padding={0}>
        <div style={{ overflow: 'auto', maxHeight: 'calc(100vh - 320px)' }}>
          <table style={{ width: '100%', borderCollapse: 'separate', borderSpacing: 0, fontSize: 11 }}>
            <thead>
              <tr>
                <th style={{ ...HEAD, position: 'sticky', left: 0, zIndex: 4, minWidth: 88 }}>Code</th>
                <th style={{ ...HEAD, position: 'sticky', left: 88, zIndex: 4, minWidth: 220 }}>Store</th>
                <th style={{ ...HEAD, minWidth: 100 }}>Region</th>
                <th style={{ ...HEAD, minWidth: 130 }}>Area manager</th>
                {initiatives.map((i) => (
                  <th key={i._id} style={{ ...HEAD, minWidth: 130, textAlign: 'center' }}>{i.name}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filteredStores.map((s) => {
                const rowMatchesHealth = healthFilter === 'all' || initiatives.some((i) => {
                  const c = rolloutMap[`${s._id}::${i._id}`];
                  return c && c.participating && c.health === healthFilter;
                });
                if (!rowMatchesHealth) return null;
                return (
                  <tr key={s._id} style={{ background: 'transparent' }}>
                    <td style={{ ...CELL, position: 'sticky', left: 0, background: 'var(--bg-secondary)', zIndex: 2, fontFamily: 'inherit', fontWeight: 700, color: 'var(--signal-500)' }}>
                      {s.storeCode}
                    </td>
                    <td style={{ ...CELL, position: 'sticky', left: 88, background: 'var(--bg-secondary)', zIndex: 2 }}>
                      <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{s.storeName}</div>
                      <div style={{ fontSize: 10, color: 'var(--text-muted)' }}>{s.city}</div>
                    </td>
                    <td style={{ ...CELL, color: 'var(--text-secondary)' }}>{s.region}</td>
                    <td style={{ ...CELL, color: 'var(--text-secondary)' }}>{s.areaManager || '—'}</td>
                    {initiatives.map((i) => {
                      const c = rolloutMap[`${s._id}::${i._id}`];
                      if (!c || !c.participating) {
                        return (
                          <td key={i._id} style={{ ...CELL, textAlign: 'center', opacity: 0.25 }}>
                            <span style={{ fontSize: 10, color: 'var(--text-muted)' }}>—</span>
                          </td>
                        );
                      }
                      const color = HEALTH_COLOR[c.health];
                      return (
                        <td key={i._id} style={{ ...CELL, textAlign: 'center', padding: 4 }}>
                          <button
                            onClick={() => setSelectedCell({ ...c, store: s, initiative: i })}
                            style={{
                              background: 'transparent',
                              border: '1px solid transparent',
                              padding: '6px 8px',
                              borderRadius: 8,
                              cursor: 'pointer',
                              width: '100%',
                              transition: 'all 120ms',
                            }}
                            onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--card-bg-hover)'; }}
                            onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}
                          >
                            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3 }}>
                              <span style={{ width: 8, height: 8, borderRadius: '50%', background: color, boxShadow: `0 0 6px ${color}80` }} />
                              <span style={{ fontSize: 9, fontWeight: 700, color, letterSpacing: '0.06em', textTransform: 'uppercase' }}>
                                {STATUS_LABEL[c.status] || c.status}
                              </span>
                            </div>
                          </button>
                        </td>
                      );
                    })}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Panel>

      {/* Drawer */}
      {selectedCell && (
        <Drawer cell={selectedCell} onClose={() => setSelectedCell(null)} />
      )}
    </>
  );
};

const HEAD: React.CSSProperties = {
  fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.10em',
  color: 'var(--text-muted)', padding: '12px 14px', textAlign: 'left',
  borderBottom: '1px solid var(--border-subtle)',
  background: 'var(--bg-secondary)',
  position: 'sticky', top: 0, zIndex: 3,
};
const CELL: React.CSSProperties = {
  padding: '10px 14px',
  borderBottom: '1px solid var(--border-subtle)',
  fontSize: 11,
};

const Select: React.FC<{ label: string; value: string; onChange: (v: string) => void; options: { value: string; label: string }[] }> = ({ label, value, onChange, options }) => (
  <label style={{ display: 'inline-flex', alignItems: 'center', gap: 8, fontSize: 11 }}>
    <span className="text-overline-muted">{label}</span>
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="prism-input"
      style={{ padding: '6px 28px 6px 12px', fontSize: 12, width: 'auto', appearance: 'none' }}
    >
      {options.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
    </select>
  </label>
);

const Drawer: React.FC<{ cell: any; onClose: () => void }> = ({ cell, onClose }) => (
  <div
    style={{
      position: 'fixed', top: 0, right: 0, bottom: 0, width: 420, zIndex: 50,
      background: 'var(--glass-bg)',
      backdropFilter: 'blur(20px) saturate(1.3)',
      borderLeft: '1px solid var(--glass-border)',
      boxShadow: '-12px 0 48px rgba(0,0,0,0.6)',
      padding: 28,
      overflowY: 'auto',
    }}
  >
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 18 }}>
      <div>
        <p className="text-overline" style={{ margin: '0 0 4px' }}>Rollout · Detail</p>
        <h2 style={{ fontSize: 18, fontWeight: 700, color: 'var(--obsidian-50)', margin: 0 }}>
          {cell.store.storeCode} <span style={{ color: 'var(--text-muted)' }}>×</span> {cell.initiative.name}
        </h2>
        <p style={{ fontSize: 11, color: 'var(--text-tertiary)', margin: '4px 0 0' }}>
          {cell.store.storeName} · {cell.store.city}
        </p>
      </div>
      <button className="btn-ghost" onClick={onClose}><X size={16} /></button>
    </div>

    <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
      <HealthPill health={cell.health} />
      <span className="badge-pill" style={{ background: 'rgba(255,255,255,0.04)', color: 'var(--text-secondary)' }}>
        {STATUS_LABEL[cell.status] || cell.status}
      </span>
    </div>

    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 20 }}>
      <DateBlock label="Planned start" value={fmtDate(cell.plannedStart)} />
      <DateBlock label="Planned end" value={fmtDate(cell.plannedEnd)} />
      <DateBlock label="Actual start" value={fmtDate(cell.actualStart)} />
      <DateBlock label="Actual end" value={fmtDate(cell.actualEnd)} />
    </div>

    {cell.isDelayed && (
      <div style={{ padding: 14, borderRadius: 12, background: 'rgba(239,68,68,0.06)', border: '1px solid rgba(239,68,68,0.20)', marginBottom: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
          <AlertTriangle size={14} color="#EF4444" />
          <span className="text-overline" style={{ color: '#FCA5A5' }}>Delay</span>
        </div>
        <p style={{ fontSize: 12, color: 'var(--text-primary)', margin: '0 0 6px' }}>
          {cell.delayDays}d overdue · {cell.delayCategory || 'other'}
        </p>
        {cell.delayReason && (
          <p style={{ fontSize: 11, color: 'var(--text-tertiary)', margin: 0 }}>{cell.delayReason}</p>
        )}
      </div>
    )}

    <div style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: 16, marginTop: 16 }}>
      <p className="text-overline-muted" style={{ margin: '0 0 8px' }}>Assignment</p>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'var(--text-secondary)', fontSize: 12 }}>
        <UserIcon size={13} />
        {cell.assignedTo || cell.store.areaManager || 'Unassigned'}
      </div>
    </div>
  </div>
);

const DateBlock: React.FC<{ label: string; value: string }> = ({ label, value }) => (
  <div style={{ padding: 12, borderRadius: 10, background: 'var(--card-bg)', border: '1px solid var(--border-subtle)' }}>
    <p className="text-overline-muted" style={{ margin: '0 0 6px' }}>{label}</p>
    <p className="font-mono-value" style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)', margin: 0 }}>{value}</p>
  </div>
);
