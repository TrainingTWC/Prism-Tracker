import React, { useMemo } from 'react';
import { useTrackerData } from '../lib/useTrackerData';
import { PageHeader, Panel } from '../components/shell/PageHeader';
import { LoadingPanel } from './DashboardView';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';

export const EquipmentView: React.FC = () => {
  const { loading, stores } = useTrackerData();
  if (loading) return <LoadingPanel />;

  const machineData = countBy(stores, 'coffeeMachine');
  const merrychefData = countBy(stores, 'merrychefType');
  const formatData = countBy(stores, 'storeFormat');
  const menuData = countBy(stores, 'menuType');

  // Cross-tab: coffeeMachine × merrychefType
  const machines = Array.from(new Set(stores.map((s) => s.coffeeMachine || 'Unknown'))).sort();
  const merrychefs = Array.from(new Set(stores.map((s) => s.merrychefType || 'Unknown'))).sort();

  return (
    <>
      <PageHeader overline="Stores · Equipment" title="Equipment inventory" subtitle={`${stores.length} stores`} />

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
                {merrychefs.map((m) => <th key={m}>{m}</th>)}
              </tr>
            </thead>
            <tbody>
              {machines.map((mach) => (
                <tr key={mach}>
                  <td style={{ fontWeight: 700, color: 'var(--text-primary)' }}>{mach}</td>
                  {merrychefs.map((m) => {
                    const count = stores.filter((s) => (s.coffeeMachine || 'Unknown') === mach && (s.merrychefType || 'Unknown') === m).length;
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
