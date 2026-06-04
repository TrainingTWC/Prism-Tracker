import React, { useMemo, useState } from 'react';
import { useTrackerData } from '../lib/useTrackerData';
import { PageHeader, Panel } from '../components/shell/PageHeader';
import { LoadingPanel } from './DashboardView';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';
import { Pencil, AlertCircle } from 'lucide-react';
import { StoreEditModal } from '../components/StoreEditModal';
import type { StoreRecord } from '../components/StoreEditModal';

export const EquipmentView: React.FC = () => {
  const { loading, stores } = useTrackerData();
  const [editStore, setEditStore] = useState<StoreRecord | undefined>(undefined);
  const [filterMissing, setFilterMissing] = useState(false);
  if (loading) return <LoadingPanel />;

  const machineData = countBy(stores, 'coffeeMachine');
  const merrychefData = countBy(stores, 'merrychefType');
  const formatData = countBy(stores, 'storeFormat');
  const menuData = countBy(stores, 'menuType');

  const missingCount = stores.filter((s) => !s.coffeeMachine || !s.merrychefType || !s.storeFormat || !s.menuType).length;

  // Cross-tab: coffeeMachine × merrychefType — treat blank as "Not set"
  const label = (v: string | undefined) => v?.trim() || 'Not set';
  const machines = Array.from(new Set(stores.map((s) => label(s.coffeeMachine)))).sort();
  const merrychefs = Array.from(new Set(stores.map((s) => label(s.merrychefType)))).sort();

  const displayedStores = filterMissing
    ? stores.filter((s) => !s.coffeeMachine || !s.merrychefType || !s.storeFormat || !s.menuType)
    : stores;

  return (
    <>
      <PageHeader overline="Stores · Equipment" title="Equipment inventory" subtitle={`${stores.length} stores`} />

      {missingCount > 0 && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 16px', background: 'rgba(234,179,8,0.08)', border: '1px solid rgba(234,179,8,0.25)', borderRadius: 12, marginBottom: 16 }}>
          <AlertCircle size={15} color="#EAB308" />
          <span style={{ fontSize: 12, color: '#EAB308', flex: 1 }}>
            <strong>{missingCount} stores</strong> have incomplete equipment data (showing as "Not set" in charts).
            Use the edit buttons below to fill them in.
          </span>
          <button
            className="btn-ghost"
            style={{ fontSize: 11, padding: '4px 10px' }}
            onClick={() => setFilterMissing((f) => !f)}
          >
            {filterMissing ? 'Show all' : 'Show incomplete only'}
          </button>
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 16, marginBottom: 16 }}>
        <ChartPanel title="Coffee machines" data={machineData} color="#3B82F6" />
        <ChartPanel title="Merrychef types" data={merrychefData} color="#A855F7" />
        <ChartPanel title="Store formats" data={formatData} color="#22C55E" />
        <ChartPanel title="Menu types" data={menuData} color="#EAB308" />
      </div>

      <Panel title="Cross-tab: Coffee machine × Merrychef">
        <div style={{ overflowX: 'auto' }}>
          <table className="prism-table">
            <thead>
              <tr>
                <th>Coffee machine →</th>
                {merrychefs.map((m) => (
                  <th key={m} style={{ color: m === 'Not set' ? '#EAB308' : undefined }}>{m}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {machines.map((mach) => (
                <tr key={mach}>
                  <td style={{ fontWeight: 700, color: mach === 'Not set' ? '#EAB308' : 'var(--text-primary)' }}>{mach}</td>
                  {merrychefs.map((m) => {
                    const count = stores.filter((s) => label(s.coffeeMachine) === mach && label(s.merrychefType) === m).length;
                    return (
                      <td key={m} className="font-mono-value" style={{ color: count > 0 ? 'var(--signal-500)' : 'var(--text-muted)', fontWeight: count > 0 ? 700 : 400 }}>
                        {count || '—'}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Panel>

      {/* ── Editable store equipment table ── */}
      <Panel
        title={filterMissing ? `Stores with incomplete data (${displayedStores.length})` : `All stores — equipment details (${stores.length})`}
        subtitle="Click ✏️ to edit a store's equipment fields"
        style={{ marginTop: 16 }}
      >
        <div style={{ overflowX: 'auto' }}>
          <table className="prism-table">
            <thead>
              <tr>
                <th>Code</th>
                <th>Store</th>
                <th>Format</th>
                <th>Menu type</th>
                <th>Coffee machine</th>
                <th>Merrychef</th>
                <th style={{ width: 44 }}></th>
              </tr>
            </thead>
            <tbody>
              {displayedStores.map((s) => {
                const incomplete = !s.coffeeMachine || !s.merrychefType || !s.storeFormat || !s.menuType;
                return (
                  <tr key={s._id} style={{ background: incomplete ? 'rgba(234,179,8,0.04)' : undefined }}>
                    <td style={{ fontWeight: 700, color: 'var(--signal-500)' }}>{s.storeCode}</td>
                    <td style={{ fontWeight: 600 }}>{s.storeName}</td>
                    <td>
                      {s.storeFormat
                        ? <span className="badge-pill" style={{ background: 'rgba(255,255,255,0.04)', color: 'var(--text-secondary)' }}>{s.storeFormat}</span>
                        : <span style={{ color: '#EAB308', fontSize: 11 }}>Not set</span>}
                    </td>
                    <td style={{ color: s.menuType ? 'var(--text-secondary)' : '#EAB308', fontSize: s.menuType ? undefined : 11 }}>
                      {s.menuType || 'Not set'}
                    </td>
                    <td style={{ color: s.coffeeMachine ? 'var(--text-secondary)' : '#EAB308', fontSize: s.coffeeMachine ? undefined : 11 }}>
                      {s.coffeeMachine || 'Not set'}
                    </td>
                    <td style={{ color: s.merrychefType ? 'var(--text-secondary)' : '#EAB308', fontSize: s.merrychefType ? undefined : 11 }}>
                      {s.merrychefType || 'Not set'}
                    </td>
                    <td>
                      <button
                        className="btn-ghost"
                        title="Edit equipment"
                        style={{ padding: '4px 6px' }}
                        onClick={() => setEditStore(s as StoreRecord)}
                      >
                        <Pencil size={12} />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Panel>

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

const ChartPanel: React.FC<{ title: string; data: { name: string; value: number }[]; color: string }> = ({ title, data, color }) => (
  <Panel title={title} subtitle={`${data.length} categories`}>
    <div style={{ height: 240 }}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} layout="vertical" margin={{ left: 4, right: 12, top: 4, bottom: 4 }}>
          <CartesianGrid horizontal={false} />
          <XAxis type="number" hide />
          <YAxis type="category" dataKey="name" width={140} tick={{ fontSize: 10, fill: '#A1A1AE' }} axisLine={false} tickLine={false} />
          <Tooltip />
          <Bar dataKey="value" fill={color} radius={[0, 4, 4, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  </Panel>
);

function countBy(arr: any[], key: string): { name: string; value: number }[] {
  const m: Record<string, number> = {};
  arr.forEach((x) => { const k = x[key] || 'Unknown'; m[k] = (m[k] || 0) + 1; });
  return Object.entries(m).map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value);
}
