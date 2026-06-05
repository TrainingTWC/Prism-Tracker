import React, { useState, useMemo } from 'react';
import { useTrackerData } from '../lib/useTrackerData';
import { PageHeader, Panel, HealthPill, KpiTile, EmptyState } from '../components/shell/PageHeader';
import { LoadingPanel } from './DashboardView';
import { fmtDate, pct, STATUS_LABEL } from '../lib/health';
import { Sparkles, ArrowLeft, Settings2, X, Search, Plus, Minus, ChevronDown } from 'lucide-react';
import type { ViewId } from '../App';
import { useMutation, useQuery } from 'convex/react';
import { api } from '../../convex/_generated/api';

// ─── Manage Stores Drawer ──────────────────────────────────────────────────────
const ManageStoresDrawer: React.FC<{
  initiativeId: string;
  assignedStoreIds: Set<string>;
  onClose: () => void;
}> = ({ initiativeId, assignedStoreIds, onClose }) => {
  const { stores } = useTrackerData();
  const upsert = useMutation(api.rollouts.upsert);
  const [search, setSearch] = useState('');
  const [pending, setPending] = useState<Record<string, boolean>>({});

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return q
      ? stores.filter(s =>
          s.storeName.toLowerCase().includes(q) ||
          s.storeCode.toLowerCase().includes(q) ||
          (s.region || '').toLowerCase().includes(q) ||
          (s.city || '').toLowerCase().includes(q)
        )
      : stores;
  }, [stores, search]);

  const toggle = async (storeId: string, participating: boolean) => {
    setPending(p => ({ ...p, [storeId]: true }));
    try {
      await upsert({ storeId: storeId as any, initiativeId: initiativeId as any, participating });
    } finally {
      setPending(p => { const n = { ...p }; delete n[storeId]; return n; });
    }
  };

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 200,
      display: 'flex', alignItems: 'flex-end', justifyContent: 'flex-end',
    }}>
      <div style={{ position: 'absolute', inset: 0, background: 'rgba(9,9,11,0.7)' }} onClick={onClose} />
      <div style={{
        position: 'relative', width: 440, height: '100vh',
        background: '#111115', borderLeft: '1px solid #27272F',
        display: 'flex', flexDirection: 'column', overflowY: 'hidden',
      }}>
        {/* Header */}
        <div style={{ padding: '20px 20px 12px', borderBottom: '1px solid #1C1C21', flexShrink: 0 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <span style={{ fontSize: 13, fontWeight: 700, color: '#F4F4F5' }}>Manage stores</span>
            <button onClick={onClose} style={{ background: 'none', border: 'none', color: '#71717A', cursor: 'pointer', padding: 4 }}>
              <X size={16} />
            </button>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: '#1C1C21', border: '1px solid #27272F', borderRadius: 8, padding: '6px 10px' }}>
            <Search size={13} style={{ color: '#71717A', flexShrink: 0 }} />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search stores…"
              style={{ background: 'none', border: 'none', outline: 'none', color: '#F4F4F5', fontSize: 12, width: '100%' }}
            />
          </div>
          <div style={{ marginTop: 10, fontSize: 11, color: '#71717A' }}>
            {assignedStoreIds.size} of {stores.length} stores assigned · {filtered.length} shown
          </div>
        </div>

        {/* Store list */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '8px 12px' }}>
          {filtered.map(s => {
            const isAssigned = assignedStoreIds.has(s._id);
            const isLoading = pending[s._id];
            return (
              <div key={s._id} style={{
                display: 'flex', alignItems: 'center', gap: 10,
                padding: '8px 8px', borderRadius: 8, marginBottom: 2,
                background: isAssigned ? 'rgba(59,130,246,0.06)' : 'transparent',
                border: `1px solid ${isAssigned ? 'rgba(59,130,246,0.18)' : 'transparent'}`,
                transition: 'background 0.15s',
              }}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 12, fontWeight: 600, color: '#E4E4E7', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    <span style={{ color: '#3B82F6', marginRight: 6 }}>{s.storeCode}</span>{s.storeName}
                  </div>
                  <div style={{ fontSize: 10, color: '#71717A', marginTop: 2 }}>{s.region} · {s.city}</div>
                </div>
                <button
                  disabled={isLoading}
                  onClick={() => toggle(s._id, !isAssigned)}
                  style={{
                    flexShrink: 0, width: 28, height: 28, borderRadius: 6,
                    background: isAssigned ? 'rgba(239,68,68,0.1)' : 'rgba(59,130,246,0.1)',
                    border: `1px solid ${isAssigned ? 'rgba(239,68,68,0.3)' : 'rgba(59,130,246,0.3)'}`,
                    color: isAssigned ? '#EF4444' : '#3B82F6',
                    cursor: isLoading ? 'wait' : 'pointer',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    opacity: isLoading ? 0.5 : 1,
                    transition: 'all 0.15s',
                  }}
                >
                  {isAssigned ? <Minus size={12} /> : <Plus size={12} />}
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

// ─── Edit Initiative Drawer ────────────────────────────────────────────────────
const EditInitiativeDrawer: React.FC<{
  initiative: any;
  onClose: () => void;
}> = ({ initiative, onClose }) => {
  const upsert = useMutation(api.initiatives.upsert);
  const [form, setForm] = useState({
    name: initiative.name || '',
    vendor: initiative.vendor || '',
    status: initiative.status || 'active',
    notes: initiative.notes || '',
  });
  const [saving, setSaving] = useState(false);

  const save = async () => {
    setSaving(true);
    try {
      await upsert({
        name: form.name,
        type: initiative.type,
        status: form.status as any,
        vendor: form.vendor || undefined,
        plannedStart: initiative.plannedStart,
        plannedEnd: initiative.plannedEnd,
        regions: initiative.regions ?? [],
        cities: initiative.cities ?? [],
        variants: initiative.variants ?? [],
        notes: form.notes || undefined,
      });
      onClose();
    } catch (e) {
      console.error(e);
    } finally {
      setSaving(false);
    }
  };

  const field = (label: string, key: keyof typeof form, opts?: { type?: string; options?: string[] }) => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
      <label style={{ fontSize: 10, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#71717A' }}>{label}</label>
      {opts?.options ? (
        <select
          value={form[key]}
          onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))}
          style={{ background: '#1C1C21', border: '1px solid #27272F', borderRadius: 8, padding: '8px 10px', color: '#E4E4E7', fontSize: 12, outline: 'none' }}
        >
          {opts.options.map(o => <option key={o} value={o}>{o}</option>)}
        </select>
      ) : (
        <input
          type={opts?.type || 'text'}
          value={form[key]}
          onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))}
          style={{ background: '#1C1C21', border: '1px solid #27272F', borderRadius: 8, padding: '8px 10px', color: '#E4E4E7', fontSize: 12, outline: 'none' }}
        />
      )}
    </div>
  );

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 200, display: 'flex', alignItems: 'flex-end', justifyContent: 'flex-end' }}>
      <div style={{ position: 'absolute', inset: 0, background: 'rgba(9,9,11,0.7)' }} onClick={onClose} />
      <div style={{
        position: 'relative', width: 420, height: '100vh',
        background: '#111115', borderLeft: '1px solid #27272F',
        display: 'flex', flexDirection: 'column',
      }}>
        <div style={{ padding: '20px 20px 12px', borderBottom: '1px solid #1C1C21', flexShrink: 0 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: 13, fontWeight: 700, color: '#F4F4F5' }}>Edit initiative</span>
            <button onClick={onClose} style={{ background: 'none', border: 'none', color: '#71717A', cursor: 'pointer', padding: 4 }}>
              <X size={16} />
            </button>
          </div>
        </div>
        <div style={{ flex: 1, overflowY: 'auto', padding: 20, display: 'flex', flexDirection: 'column', gap: 16 }}>
          {field('Name', 'name')}
          {field('Vendor', 'vendor')}
          {field('Status', 'status', { options: ['planned', 'active', 'completed', 'paused', 'cancelled'] })}
          {field('Notes', 'notes')}
        </div>
        <div style={{ padding: 16, borderTop: '1px solid #1C1C21', display: 'flex', gap: 10 }}>
          <button onClick={onClose} style={{ flex: 1, padding: '9px 0', borderRadius: 8, background: 'none', border: '1px solid #27272F', color: '#A1A1AE', cursor: 'pointer', fontSize: 12 }}>
            Cancel
          </button>
          <button onClick={save} disabled={saving} style={{ flex: 2, padding: '9px 0', borderRadius: 8, background: '#3B82F6', border: 'none', color: '#fff', cursor: saving ? 'wait' : 'pointer', fontWeight: 700, fontSize: 12, opacity: saving ? 0.7 : 1 }}>
            {saving ? 'Saving…' : 'Save changes'}
          </button>
        </div>
      </div>
    </div>
  );
};

// ─── Main view ─────────────────────────────────────────────────────────────────
export const InitiativePageView: React.FC<{ initiativeId?: string; onNavigate: (v: ViewId, p?: any) => void }> = ({ initiativeId, onNavigate }) => {
  const { loading, initiatives, rollouts, stores } = useTrackerData();
  const user = useQuery(api.user.current);
  const [showManage, setShowManage] = useState(false);
  const [showEdit, setShowEdit] = useState(false);

  if (loading) return <LoadingPanel />;
  const init = initiatives.find((i) => i._id === initiativeId);
  if (!init) return <EmptyState icon={<Sparkles size={20} />} title="Initiative not found" />;

  const cells = rollouts.filter((r) => r.initiativeId === initiativeId && r.participating);
  const g = cells.filter((c) => c.health === 'green').length;
  const a = cells.filter((c) => c.health === 'amber').length;
  const r = cells.filter((c) => c.health === 'red').length;
  const assignedStoreIds = new Set(cells.map(c => c.storeId));

  const canEdit = user && ((user as any).role === 'admin' || (user as any).role === 'editor');

  return (
    <>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
        <button className="btn-ghost" onClick={() => onNavigate('initiatives')}>
          <ArrowLeft size={14} /> All initiatives
        </button>
        {canEdit && (
          <div style={{ display: 'flex', gap: 8 }}>
            <button className="btn-secondary" onClick={() => setShowEdit(true)} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <Settings2 size={13} /> Edit
            </button>
            <button className="btn-primary" onClick={() => setShowManage(true)} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <Plus size={13} /> Manage stores
            </button>
          </div>
        )}
      </div>
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

      <Panel
        title="Participation matrix"
        subtitle={cells.length === 0 ? 'No stores assigned yet' : `${cells.length} stores working this initiative`}
      >
        {cells.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '32px 0', color: 'var(--text-muted)' }}>
            <p style={{ fontSize: 13, marginBottom: 8 }}>No stores assigned yet</p>
            {canEdit && (
              <button className="btn-primary" onClick={() => setShowManage(true)} style={{ display: 'inline-flex', alignItems: 'center', gap: 6, marginTop: 8 }}>
                <Plus size={13} /> Add stores
              </button>
            )}
          </div>
        ) : (
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
        )}
      </Panel>

      {showManage && (
        <ManageStoresDrawer
          initiativeId={initiativeId!}
          assignedStoreIds={assignedStoreIds}
          onClose={() => setShowManage(false)}
        />
      )}
      {showEdit && (
        <EditInitiativeDrawer
          initiative={init}
          onClose={() => setShowEdit(false)}
        />
      )}
    </>
  );
};
