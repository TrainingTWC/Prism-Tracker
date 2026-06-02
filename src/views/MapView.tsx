import React, { useMemo } from 'react';
import { useTrackerData } from '../lib/useTrackerData';
import { PageHeader, Panel } from '../components/shell/PageHeader';
import { LoadingPanel } from './DashboardView';
import { pct } from '../lib/health';

export const MapView: React.FC = () => {
  const { loading, stores, rollouts } = useTrackerData();

  const cityData = useMemo(() => {
    const map: Record<string, { city: string; count: number; g: number; total: number }> = {};
    stores.forEach((s) => {
      const c = s.city || 'Unknown';
      if (!map[c]) map[c] = { city: c, count: 0, g: 0, total: 0 };
      map[c].count++;
      const cells = rollouts.filter((r) => r.storeId === s._id && r.participating);
      map[c].total += cells.length;
      map[c].g += cells.filter((c) => c.health === 'green').length;
    });
    return Object.values(map).sort((a, b) => b.count - a.count);
  }, [stores, rollouts]);

  if (loading) return <LoadingPanel />;

  const maxCount = Math.max(1, ...cityData.map((c) => c.count));

  return (
    <>
      <PageHeader
        overline="Rollouts · Geography"
        title="City map"
        subtitle={`${cityData.length} cities · bubble size = store count · color = health`}
      />

      <Panel>
        <div style={{ position: 'relative', width: '100%', height: 480, background: 'var(--card-bg)', borderRadius: 14, overflow: 'hidden' }}>
          {/* Simple positional view — cities laid out left-to-right with bubbles */}
          <div
            style={{
              position: 'absolute', inset: 0,
              backgroundImage: 'radial-gradient(circle at 50% 40%, rgba(59,130,246,0.05), transparent 60%)',
            }}
          />
          <div style={{ position: 'relative', display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'center', gap: 36, padding: 40, height: '100%' }}>
            {cityData.map((c) => {
              const size = 36 + (c.count / maxCount) * 72;
              const healthPct = pct(c.g, c.total);
              const color = healthPct >= 70 ? '#22C55E' : healthPct >= 40 ? '#EAB308' : '#EF4444';
              return (
                <div key={c.city} style={{ textAlign: 'center' }}>
                  <div
                    title={`${c.city}: ${c.count} stores · ${healthPct}% green`}
                    style={{
                      width: size, height: size, borderRadius: '50%',
                      background: `radial-gradient(circle, ${color} 0%, ${color}88 60%, transparent 100%)`,
                      boxShadow: `0 0 32px ${color}66`,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      cursor: 'pointer',
                      transition: 'transform 200ms',
                    }}
                    onMouseEnter={(e) => { (e.currentTarget as HTMLDivElement).style.transform = 'scale(1.1)'; }}
                    onMouseLeave={(e) => { (e.currentTarget as HTMLDivElement).style.transform = 'scale(1)'; }}
                  >
                    <span className="font-mono-value" style={{ fontSize: 13, fontWeight: 700, color: '#0C0C0F' }}>{c.count}</span>
                  </div>
                  <p style={{ margin: '8px 0 0', fontSize: 11, fontWeight: 600, color: 'var(--text-primary)' }}>{c.city}</p>
                  <p className="text-overline-muted" style={{ margin: 0 }}>{healthPct}% green</p>
                </div>
              );
            })}
          </div>
        </div>
      </Panel>
    </>
  );
};
