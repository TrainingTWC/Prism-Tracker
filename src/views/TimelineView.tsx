import React from 'react';
import { useTrackerData } from '../lib/useTrackerData';
import { PageHeader, Panel, EmptyState } from '../components/shell/PageHeader';
import { LoadingPanel } from './DashboardView';
import { HEALTH_COLOR, fmtDate } from '../lib/health';
import { GanttChartSquare } from 'lucide-react';

export const TimelineView: React.FC = () => {
  const { loading, initiatives, rollouts } = useTrackerData();
  if (loading) return <LoadingPanel />;

  const initWithDates = initiatives.filter((i) => i.plannedStart && i.plannedEnd);
  if (initWithDates.length === 0) {
    return (
      <>
        <PageHeader overline="Rollouts · Timeline" title="Gantt by initiative" />
        <Panel><EmptyState icon={<GanttChartSquare size={20} />} title="No dated initiatives" hint="Import a sheet with date headers to populate the timeline." /></Panel>
      </>
    );
  }

  // Time axis: min start → max end
  const minTs = Math.min(...initWithDates.map((i) => i.plannedStart));
  const maxTs = Math.max(...initWithDates.map((i) => i.plannedEnd || i.plannedStart));
  const span = maxTs - minTs || 1;
  const now = Date.now();
  const nowPct = Math.max(0, Math.min(100, ((now - minTs) / span) * 100));

  // Month gridlines
  const monthMs = 30 * 24 * 60 * 60 * 1000;
  const monthCount = Math.ceil(span / monthMs);

  return (
    <>
      <PageHeader
        overline="Rollouts · Timeline"
        title="Gantt by initiative"
        subtitle={`${initWithDates.length} initiatives · ${fmtDate(minTs)} → ${fmtDate(maxTs)}`}
      />

      <Panel>
        <div style={{ position: 'relative', paddingTop: 24 }}>
          {/* Month axis */}
          <div style={{ position: 'relative', height: 18, marginBottom: 12, borderBottom: '1px solid var(--border-subtle)' }}>
            {Array.from({ length: monthCount + 1 }).map((_, i) => {
              const ts = minTs + i * monthMs;
              const left = ((ts - minTs) / span) * 100;
              return (
                <div key={i} style={{ position: 'absolute', left: `${left}%`, top: 0, transform: 'translateX(-50%)' }}>
                  <span className="text-overline-muted" style={{ fontSize: 9 }}>{fmtDate(ts)}</span>
                </div>
              );
            })}
          </div>

          {/* Today line */}
          <div
            style={{
              position: 'absolute', top: 0, bottom: 0, left: `${nowPct}%`,
              width: 1, background: 'var(--signal-500)', boxShadow: '0 0 8px rgba(59,130,246,0.6)',
              zIndex: 2, pointerEvents: 'none',
            }}
          />

          {/* Rows */}
          {initWithDates.map((i) => {
            const cells = rollouts.filter((r) => r.initiativeId === i._id && r.participating);
            const g = cells.filter((c) => c.health === 'green').length;
            const r = cells.filter((c) => c.health === 'red').length;
            const overall = r > 0 ? 'red' : (g === cells.length && cells.length > 0 ? 'green' : 'amber');
            const left = ((i.plannedStart - minTs) / span) * 100;
            const width = (((i.plannedEnd || i.plannedStart) - i.plannedStart) / span) * 100;
            return (
              <div key={i._id} style={{ display: 'grid', gridTemplateColumns: '220px 1fr', alignItems: 'center', height: 44, gap: 12 }}>
                <div style={{ overflow: 'hidden' }}>
                  <p style={{ margin: 0, fontSize: 12, fontWeight: 600, color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{i.name}</p>
                  <p className="font-mono-value text-overline-muted" style={{ margin: '2px 0 0' }}>{cells.length} stores</p>
                </div>
                <div style={{ position: 'relative', height: 30 }}>
                  <div
                    style={{
                      position: 'absolute',
                      left: `${left}%`, width: `${Math.max(2, width)}%`,
                      top: 10, height: 10,
                      borderRadius: 999,
                      background: HEALTH_COLOR[overall],
                      boxShadow: `0 0 10px ${HEALTH_COLOR[overall]}40`,
                    }}
                    title={`${i.name}: ${fmtDate(i.plannedStart)} → ${fmtDate(i.plannedEnd)}`}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </Panel>
    </>
  );
};
