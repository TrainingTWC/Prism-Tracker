import React from 'react';
import { useTrackerData } from '../lib/useTrackerData';
import { PageHeader, KpiTile, Panel, HealthPill } from '../components/shell/PageHeader';
import { HEALTH_COLOR, DELAY_CATEGORY_COLOR, fmtRelative, pct } from '../lib/health';
import {
  Activity, TrendingUp, AlertTriangle, ShieldCheck, Clock, MapPin,
  Wrench, Coffee, Store as StoreIcon,
} from 'lucide-react';
import {
  ResponsiveContainer, PieChart, Pie, Cell, Tooltip,
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
} from 'recharts';

export const DashboardView: React.FC = () => {
  const { loading, rollouts, stores, initiatives, kpis } = useTrackerData();

  if (loading) return <LoadingPanel />;

  // Initiative health matrix
  const byInitiative = initiatives.map((i) => {
    const cells = rollouts.filter((r) => r.initiativeId === i._id && r.participating);
    const g = cells.filter((c) => c.health === 'green').length;
    const a = cells.filter((c) => c.health === 'amber').length;
    const r = cells.filter((c) => c.health === 'red').length;
    return { id: i._id, name: i.name, total: cells.length, g, a, r };
  }).filter((x) => x.total > 0).sort((x, y) => y.r / Math.max(1, y.total) - x.r / Math.max(1, x.total));

  // Region rollup
  const regions = Array.from(new Set(stores.map((s) => s.region).filter(Boolean)));
  const regionData = regions.map((region) => {
    const regionStoreIds = new Set(stores.filter((s) => s.region === region).map((s) => s._id));
    const cells = rollouts.filter((r) => r.participating && regionStoreIds.has(r.storeId));
    const g = cells.filter((c) => c.health === 'green').length;
    const a = cells.filter((c) => c.health === 'amber').length;
    const r = cells.filter((c) => c.health === 'red').length;
    return { region, total: cells.length, storeCount: regionStoreIds.size, g, a, r };
  }).sort((x, y) => y.total - x.total);

  // Delay categories donut
  const delayCells = rollouts.filter((r) => r.isDelayed && r.participating);
  const catMap: Record<string, number> = {};
  delayCells.forEach((c) => {
    const k = c.delayCategory || 'other';
    catMap[k] = (catMap[k] || 0) + 1;
  });
  const donutData = Object.entries(catMap).map(([name, value]) => ({
    name,
    value,
    color: DELAY_CATEGORY_COLOR[name] || '#7A7A88',
  })).sort((a, b) => b.value - a.value);

  // Equipment mix
  const machineMap: Record<string, number> = {};
  stores.forEach((s) => { const k = s.coffeeMachine || 'Unknown'; machineMap[k] = (machineMap[k] || 0) + 1; });
  const machineData = Object.entries(machineMap).map(([name, value]) => ({ name, value })).slice(0, 6);

  return (
    <>
      <PageHeader
        overline="Rollouts · Overview"
        title="Live initiatives"
        subtitle={`${kpis.totalStores} stores · ${kpis.totalInitiatives} initiatives · ${kpis.totalParticipating} active rollouts · updated ${fmtRelative(Date.now())}`}
      />

      {/* KPI strip */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 16, marginBottom: 24 }}>
        <KpiTile label="Active" value={kpis.totalParticipating} color="var(--signal-500)" hint={`${kpis.totalStores} stores`} />
        <KpiTile label="On track" value={kpis.onTrack} color="#22C55E" hint={`${pct(kpis.onTrack, kpis.totalParticipating)}% of estate`} />
        <KpiTile label="At risk" value={kpis.atRisk} color="#EAB308" hint={`${pct(kpis.atRisk, kpis.totalParticipating)}%`} />
        <KpiTile label="Delayed" value={kpis.delayed} color="#EF4444" hint={`${pct(kpis.delayed, kpis.totalParticipating)}%`} />
        <KpiTile label="Avg delay" value={`${kpis.avgDelayDays}d`} color="#F97316" />
        <KpiTile label="Coverage" value={`${kpis.coverage}%`} color="#A855F7" hint="stores with ≥1 rollout" />
      </div>

      {/* Initiative health matrix */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 16, marginBottom: 24 }}>
        <Panel
          title="Initiative health matrix"
          subtitle="Each row = one initiative, segmented by health status across participating stores"
        >
          {byInitiative.length === 0 ? (
            <p style={{ fontSize: 12, color: 'var(--text-tertiary)' }}>No initiatives with active rollouts yet.</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {byInitiative.map((row) => (
                <div key={row.id}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                    <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-primary)' }}>{row.name}</span>
                    <span style={{ fontSize: 10, color: 'var(--text-muted)', fontFamily: 'inherit' }}>
                      <span className="font-mono-value">{row.total}</span> stores
                    </span>
                  </div>
                  <div style={{ display: 'flex', height: 8, borderRadius: 4, overflow: 'hidden', background: 'rgba(255,255,255,0.03)' }}>
                    {row.g > 0 && <div style={{ width: `${(row.g / row.total) * 100}%`, background: '#22C55E' }} />}
                    {row.a > 0 && <div style={{ width: `${(row.a / row.total) * 100}%`, background: '#EAB308' }} />}
                    {row.r > 0 && <div style={{ width: `${(row.r / row.total) * 100}%`, background: '#EF4444' }} />}
                  </div>
                  <div style={{ display: 'flex', gap: 14, marginTop: 6, fontSize: 10, color: 'var(--text-tertiary)' }}>
                    <span className="font-mono-value"><span style={{ color: '#22C55E' }}>●</span> {row.g} on-track</span>
                    <span className="font-mono-value"><span style={{ color: '#EAB308' }}>●</span> {row.a} at-risk</span>
                    <span className="font-mono-value"><span style={{ color: '#EF4444' }}>●</span> {row.r} delayed</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Panel>

        <Panel title="Delay reasons" subtitle={`${delayCells.length} delayed rollouts`}>
          {donutData.length === 0 ? (
            <p style={{ fontSize: 12, color: 'var(--text-tertiary)' }}>No delays reported. Estate is clean.</p>
          ) : (
            <>
              <div style={{ height: 180 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={donutData} dataKey="value" nameKey="name" innerRadius={45} outerRadius={75} paddingAngle={2}>
                      {donutData.map((d, i) => <Cell key={i} fill={d.color} stroke="rgba(0,0,0,0.4)" />)}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginTop: 8 }}>
                {donutData.slice(0, 5).map((d) => (
                  <div key={d.name} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11 }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--text-secondary)' }}>
                      <span style={{ width: 8, height: 8, borderRadius: 2, background: d.color }} />
                      {d.name}
                    </span>
                    <span className="font-mono-value" style={{ color: 'var(--text-primary)', fontWeight: 700 }}>{d.value}</span>
                  </div>
                ))}
              </div>
            </>
          )}
        </Panel>
      </div>

      {/* Region rollup */}
      <Panel title="Region rollup" subtitle="Health distribution across regions">
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 16 }}>
          {regionData.map((r) => (
            <div key={r.region} style={{ padding: 16, border: '1px solid var(--border-subtle)', borderRadius: 14, background: 'var(--card-bg)' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
                <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)' }}>{r.region}</span>
                <span className="text-overline-muted">{r.storeCount} stores</span>
              </div>
              <div style={{ display: 'flex', height: 6, borderRadius: 3, overflow: 'hidden', background: 'rgba(255,255,255,0.03)' }}>
                {r.g > 0 && <div style={{ width: `${(r.g / r.total) * 100}%`, background: '#22C55E' }} />}
                {r.a > 0 && <div style={{ width: `${(r.a / r.total) * 100}%`, background: '#EAB308' }} />}
                {r.r > 0 && <div style={{ width: `${(r.r / r.total) * 100}%`, background: '#EF4444' }} />}
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 10, fontSize: 11, color: 'var(--text-tertiary)' }}>
                <span className="font-mono-value">{r.total} rollouts</span>
                <span className="font-mono-value" style={{ color: r.r > 0 ? '#EF4444' : '#22C55E' }}>
                  {pct(r.g, r.total)}% green
                </span>
              </div>
            </div>
          ))}
        </div>
      </Panel>

      {/* Equipment + activity */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginTop: 24 }}>
        <Panel title="Coffee machine mix" subtitle="Stores by equipment type">
          <div style={{ height: 220 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={machineData} layout="vertical" margin={{ left: 12, right: 12, top: 4, bottom: 4 }}>
                <CartesianGrid horizontal={false} />
                <XAxis type="number" hide />
                <YAxis type="category" dataKey="name" width={110} tick={{ fontSize: 10, fill: '#A1A1AE' }} axisLine={false} tickLine={false} />
                <Tooltip />
                <Bar dataKey="value" fill="#3B82F6" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Panel>

        <Panel title="Quick numbers" subtitle="Across the entire estate">
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <MiniStat icon={<StoreIcon size={14} />} label="Stores" value={kpis.totalStores} />
            <MiniStat icon={<Activity size={14} />} label="Initiatives" value={kpis.totalInitiatives} />
            <MiniStat icon={<MapPin size={14} />} label="Regions" value={regions.length} />
            <MiniStat icon={<Wrench size={14} />} label="Machine types" value={Object.keys(machineMap).length} />
            <MiniStat icon={<ShieldCheck size={14} />} label="On-track %" value={`${pct(kpis.onTrack, kpis.totalParticipating)}%`} />
            <MiniStat icon={<AlertTriangle size={14} />} label="Open snags" value={kpis.delayed} />
          </div>
        </Panel>
      </div>
    </>
  );
};

const MiniStat: React.FC<{ icon: React.ReactNode; label: string; value: React.ReactNode }> = ({ icon, label, value }) => (
  <div style={{ padding: 14, borderRadius: 12, background: 'var(--card-bg)', border: '1px solid var(--border-subtle)' }}>
    <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--text-muted)', marginBottom: 6 }}>
      {icon}
      <span className="text-overline-muted" style={{ color: 'var(--text-muted)' }}>{label}</span>
    </div>
    <p className="font-mono-value" style={{ fontSize: 22, fontWeight: 700, color: 'var(--obsidian-50)', margin: 0 }}>
      {value}
    </p>
  </div>
);

export const LoadingPanel: React.FC = () => (
  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 400, color: 'var(--text-tertiary)' }}>
    <div style={{ textAlign: 'center' }}>
      <div className="prism-icon-tile" style={{ margin: '0 auto 14px' }}>
        <Activity size={20} />
      </div>
      <p className="text-overline" style={{ margin: 0 }}>Loading estate data…</p>
    </div>
  </div>
);
