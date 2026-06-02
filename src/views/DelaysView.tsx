import React, { useMemo } from 'react';
import { useTrackerData } from '../lib/useTrackerData';
import { PageHeader, Panel, KpiTile } from '../components/shell/PageHeader';
import { LoadingPanel } from './DashboardView';
import { DELAY_CATEGORY_COLOR } from '../lib/health';
import {
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Cell,
} from 'recharts';

export const DelaysView: React.FC = () => {
  const { loading, rollouts, stores } = useTrackerData();
  if (loading) return <LoadingPanel />;

  const delayed = rollouts.filter((r) => r.participating && r.isDelayed);

  const byCategory = useMemo(() => {
    const m: Record<string, { name: string; count: number; sumDays: number }> = {};
    delayed.forEach((c) => {
      const k = c.delayCategory || 'other';
      if (!m[k]) m[k] = { name: k, count: 0, sumDays: 0 };
      m[k].count++;
      m[k].sumDays += c.delayDays || 0;
    });
    return Object.values(m).map((x) => ({ ...x, avgDays: x.count ? Math.round(x.sumDays / x.count) : 0 })).sort((a, b) => b.count - a.count);
  }, [delayed]);

  const byRegion = useMemo(() => {
    const m: Record<string, number> = {};
    delayed.forEach((c) => {
      const s = stores.find((x) => x._id === c.storeId);
      const k = s?.region || 'Unknown';
      m[k] = (m[k] || 0) + 1;
    });
    return Object.entries(m).map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value);
  }, [delayed, stores]);

  const totalDelays = delayed.length;
  const avgDays = totalDelays > 0 ? Math.round(delayed.reduce((s, c) => s + (c.delayDays || 0), 0) / totalDelays) : 0;
  const maxDays = totalDelays > 0 ? Math.max(...delayed.map((c) => c.delayDays || 0)) : 0;

  return (
    <>
      <PageHeader overline="Operations · Delays" title="Delay analytics" subtitle={`${totalDelays} delayed rollouts`} />

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 16, marginBottom: 24 }}>
        <KpiTile label="Total delays" value={totalDelays} color="#EF4444" />
        <KpiTile label="Avg days overdue" value={`${avgDays}d`} color="#F97316" />
        <KpiTile label="Worst case" value={`${maxDays}d`} color="#A855F7" />
        <KpiTile label="Categories" value={byCategory.length} color="var(--signal-500)" />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        <Panel title="By category" subtitle="count & avg days overdue">
          <div style={{ height: 280 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={byCategory} layout="vertical" margin={{ left: 4, right: 16, top: 4, bottom: 4 }}>
                <CartesianGrid horizontal={false} />
                <XAxis type="number" hide />
                <YAxis type="category" dataKey="name" width={100} tick={{ fontSize: 10, fill: '#A1A1AE' }} axisLine={false} tickLine={false} />
                <Tooltip />
                <Bar dataKey="count" radius={[0, 4, 4, 0]}>
                  {byCategory.map((c, i) => (
                    <Cell key={i} fill={DELAY_CATEGORY_COLOR[c.name] || '#7A7A88'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4, marginTop: 12, fontSize: 11 }}>
            {byCategory.map((c) => (
              <div key={c.name} style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-tertiary)' }}>
                <span style={{ color: 'var(--text-secondary)' }}>{c.name}</span>
                <span className="font-mono-value">{c.count} · avg {c.avgDays}d</span>
              </div>
            ))}
          </div>
        </Panel>

        <Panel title="By region" subtitle="count of delayed rollouts">
          <div style={{ height: 280 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={byRegion} margin={{ left: 0, right: 16, top: 4, bottom: 4 }}>
                <CartesianGrid vertical={false} />
                <XAxis dataKey="name" tick={{ fontSize: 10, fill: '#A1A1AE' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 10, fill: '#A1A1AE' }} axisLine={false} tickLine={false} />
                <Tooltip />
                <Bar dataKey="value" fill="#EF4444" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Panel>
      </div>
    </>
  );
};
