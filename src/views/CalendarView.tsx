import React, { useMemo, useState } from 'react';
import { useQuery } from 'convex/react';
import { useTrackerData } from '../lib/useTrackerData';
import { api } from '../../convex/_generated/api';
import { PageHeader, Panel } from '../components/shell/PageHeader';
import { LoadingPanel } from './DashboardView';
import { fmtDate } from '../lib/health';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export const CalendarView: React.FC = () => {
  const { loading, initiatives, rollouts } = useTrackerData();
  const intelligenceEvents = useQuery(api.calendarSync.listCachedEvents, {}) ?? [];
  const [cursor, setCursor] = useState(() => {
    const d = new Date(); d.setDate(1); return d;
  });

  const events = useMemo(() => {
    const map: Record<string, { starts: number; ends: number; delays: number; hrEvents: number; titles: string[] }> = {};
    const ensure = (k: string) => {
      if (!map[k]) map[k] = { starts: 0, ends: 0, delays: 0, hrEvents: 0, titles: [] };
    };
    const add = (ts: number | undefined, kind: 'starts' | 'ends' | 'delays', title: string) => {
      if (!ts) return;
      const d = new Date(ts);
      const k = `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
      ensure(k);
      map[k][kind]++;
      if (map[k].titles.length < 3) map[k].titles.push(title);
    };
    initiatives.forEach((i) => {
      add(i.plannedStart, 'starts', `${i.name} starts`);
      add(i.plannedEnd, 'ends', `${i.name} ends`);
    });
    rollouts.forEach((r) => {
      if (r.isDelayed) add(r._creationTime, 'delays', 'delay reported');
    });
    // Merge Intelligence HR/team calendar events
    intelligenceEvents.forEach((e: any) => {
      const d = new Date(e.date);
      const k = `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
      ensure(k);
      map[k].hrEvents++;
      if (map[k].titles.length < 3) map[k].titles.push(e.title);
    });
    return map;
  }, [initiatives, rollouts, intelligenceEvents]);

  if (loading) return <LoadingPanel />;

  // Month grid
  const y = cursor.getFullYear();
  const m = cursor.getMonth();
  const firstDay = new Date(y, m, 1);
  const startWeekday = firstDay.getDay();
  const daysInMonth = new Date(y, m + 1, 0).getDate();
  const cells: ({ day: number; key: string } | null)[] = [];
  for (let i = 0; i < startWeekday; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push({ day: d, key: `${y}-${m}-${d}` });

  const monthName = firstDay.toLocaleDateString('en-IN', { month: 'long', year: 'numeric' });

  return (
    <>
      <PageHeader overline="Rollouts · Calendar" title="Date view" subtitle="Planned starts, deadlines, and delays" />
      <Panel
        title={monthName}
        actions={
          <div style={{ display: 'flex', gap: 6 }}>
            <button className="btn-ghost" onClick={() => setCursor(new Date(y, m - 1, 1))}><ChevronLeft size={16} /></button>
            <button className="btn-secondary" onClick={() => { const d = new Date(); d.setDate(1); setCursor(d); }}>Today</button>
            <button className="btn-ghost" onClick={() => setCursor(new Date(y, m + 1, 1))}><ChevronRight size={16} /></button>
          </div>
        }
      >
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 6, marginBottom: 8 }}>
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((d) => (
            <div key={d} className="text-overline-muted" style={{ textAlign: 'center', padding: 6 }}>{d}</div>
          ))}
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 6 }}>
          {cells.map((c, i) => {
            if (!c) return <div key={i} style={{ minHeight: 84 }} />;
            const e = events[c.key];
            const today = new Date();
            const isToday = c.day === today.getDate() && m === today.getMonth() && y === today.getFullYear();
            return (
              <div
                key={i}
                style={{
                  minHeight: 84,
                  padding: 8,
                  border: '1px solid var(--border-subtle)',
                  borderRadius: 10,
                  background: isToday ? 'rgba(59,130,246,0.06)' : 'var(--card-bg)',
                  position: 'relative',
                }}
              >
                <div className="font-mono-value" style={{ fontSize: 11, fontWeight: 700, color: isToday ? 'var(--signal-500)' : 'var(--text-secondary)', marginBottom: 6 }}>
                  {c.day}
                </div>
                {e && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                    {e.starts > 0 && <Dot color="#3B82F6" label={`${e.starts} start`} />}
                    {e.ends > 0 && <Dot color="#EAB308" label={`${e.ends} end`} />}
                    {e.delays > 0 && <Dot color="#EF4444" label={`${e.delays} delay`} />}
                    {e.hrEvents > 0 && <Dot color="#A855F7" label={`${e.hrEvents} HR`} />}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </Panel>
    </>
  );
};

const Dot: React.FC<{ color: string; label: string }> = ({ color, label }) => (
  <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 9, color: 'var(--text-tertiary)' }}>
    <span style={{ width: 6, height: 6, borderRadius: '50%', background: color, boxShadow: `0 0 4px ${color}80` }} />
    {label}
  </div>
);
