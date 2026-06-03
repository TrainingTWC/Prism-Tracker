import React from 'react';
import {
  LayoutDashboard, Store, Sparkles, Grid3x3, CalendarRange,
  Calendar, Map, Wrench, Truck, Users, AlertTriangle, Clock,
  Bell, Upload, Download, ClipboardList, Settings,
} from 'lucide-react';
import type { ViewId } from '../App';

interface CardDef { icon: React.ReactNode; title: string; desc: string; view: ViewId }
interface SectionDef { label: string; cards: CardDef[] }

const SECTIONS: SectionDef[] = [
  {
    label: 'ROLLOUT VIEWS',
    cards: [
      { icon: <LayoutDashboard size={24} />, title: 'DASHBOARD', desc: 'Live KPIs, initiative health matrix, delay analysis, and region rollup.', view: 'dashboard' },
      { icon: <Grid3x3 size={24} />, title: 'GRID VIEW', desc: 'Kanban-style card layout for all active rollout tasks across stores.', view: 'grid' },
      { icon: <CalendarRange size={24} />, title: 'TIMELINE', desc: 'Gantt-style view of initiative milestones, phases, and critical path.', view: 'timeline' },
      { icon: <Calendar size={24} />, title: 'CALENDAR', desc: 'Calendar scheduling for rollout tasks, store visits, and key dates.', view: 'calendar' },
      { icon: <Map size={24} />, title: 'MAP VIEW', desc: 'Geographic map of store rollout coverage with regional status overlays.', view: 'map' },
    ],
  },
  {
    label: 'OPERATIONS',
    cards: [
      { icon: <Store size={24} />, title: 'STORES', desc: 'Browse all 202 stores — rollout participation, profiles, and site details.', view: 'stores' },
      { icon: <Sparkles size={24} />, title: 'INITIATIVES', desc: 'Create and coordinate rollout initiatives — status, health, timelines.', view: 'initiatives' },
      { icon: <Wrench size={24} />, title: 'EQUIPMENT', desc: 'Equipment commissioning, maintenance schedules, and asset status per store.', view: 'equipment' },
      { icon: <Truck size={24} />, title: 'VENDORS', desc: 'Vendor coordination, purchase orders, delivery timelines, and performance.', view: 'vendors' },
      { icon: <Users size={24} />, title: 'AREA MANAGERS', desc: 'Area manager directory, territory assignments, and escalation chains.', view: 'managers' },
    ],
  },
  {
    label: 'MONITORING',
    cards: [
      { icon: <AlertTriangle size={24} />, title: 'SNAGS', desc: 'Issue log — capture, triage, assign, and resolve snags across all sites.', view: 'snags' },
      { icon: <Clock size={24} />, title: 'DELAYS', desc: 'Delay tracking with root-cause analysis and recovery timelines.', view: 'delays' },
      { icon: <Bell size={24} />, title: 'ALERTS', desc: 'Real-time alerts for critical blockers, SLA breaches, and overdue tasks.', view: 'alerts' },
    ],
  },
  {
    label: 'DATA & ADMIN',
    cards: [
      { icon: <Upload size={24} />, title: 'IMPORT', desc: 'Bulk-import stores, tasks, and rollout data via structured CSV templates.', view: 'import' },
      { icon: <Download size={24} />, title: 'EXPORT', desc: 'Export rollout reports and analytics snapshots to CSV or PDF.', view: 'export' },
      { icon: <ClipboardList size={24} />, title: 'AUDIT LOG', desc: 'Full audit trail — all changes, user activity, and state transitions.', view: 'audit' },
      { icon: <Settings size={24} />, title: 'SETTINGS', desc: 'Workspace config, notification preferences, and access control.', view: 'settings' },
    ],
  },
];

const Card: React.FC<{ card: CardDef; onNavigate: (v: ViewId) => void }> = ({ card, onNavigate }) => (
  <button
    onClick={() => onNavigate(card.view)}
    style={{
      textAlign: 'left', cursor: 'pointer', padding: '22px 24px',
      background: '#111116', border: '1px solid #1C1C21',
      borderRadius: 16, transition: 'border-color 0.15s, background 0.15s',
      display: 'flex', flexDirection: 'column', gap: 0,
    }}
    onMouseEnter={e => {
      e.currentTarget.style.borderColor = '#3B82F6';
      e.currentTarget.style.background = '#14141A';
    }}
    onMouseLeave={e => {
      e.currentTarget.style.borderColor = '#1C1C21';
      e.currentTarget.style.background = '#111116';
    }}
  >
    <div style={{
      width: 44, height: 44, borderRadius: 12, marginBottom: 16,
      background: 'rgba(59,130,246,0.12)', border: '1px solid rgba(59,130,246,0.20)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      color: '#3B82F6', flexShrink: 0,
    }}>
      {card.icon}
    </div>
    <p style={{
      fontSize: 11, fontWeight: 700, letterSpacing: '0.14em',
      textTransform: 'uppercase', color: '#F4F4F5',
      fontFamily: 'JetBrains Mono, monospace', margin: '0 0 8px',
    }}>{card.title}</p>
    <p style={{
      fontSize: 12, color: '#52525C', lineHeight: 1.6,
      margin: '0 0 16px', flexGrow: 1,
    }}>{card.desc}</p>
    <span style={{
      fontSize: 10, fontWeight: 700, letterSpacing: '0.12em',
      textTransform: 'uppercase', color: '#3B82F6',
      fontFamily: 'JetBrains Mono, monospace',
    }}>OPEN ›</span>
  </button>
);

export const HomeView: React.FC<{ onNavigate: (view: ViewId) => void }> = ({ onNavigate }) => (
  <div style={{ maxWidth: 1100, margin: '0 auto', padding: '48px 0 80px' }}>
    {/* Overline */}
    <p style={{
      fontSize: 10, letterSpacing: '0.22em', textTransform: 'uppercase',
      color: '#3B82F6', fontFamily: 'JetBrains Mono, monospace',
      margin: '0 0 16px', fontWeight: 600,
    }}>
      ROLLOUT OS
    </p>

    {/* Title */}
    <h1 style={{
      fontFamily: 'JetBrains Mono, monospace',
      fontSize: 'clamp(40px, 5.5vw, 72px)',
      fontWeight: 800,
      letterSpacing: '-0.01em',
      whiteSpace: 'nowrap',
      margin: '0 0 18px',
      lineHeight: 1,
    }}>
      <span style={{ color: '#F4F4F5' }}>PRISM </span>
      <span style={{ color: '#3B82F6' }}>TRACKER</span>
    </h1>

    <p style={{
      fontSize: 15, color: '#71717A', maxWidth: 520,
      lineHeight: 1.65, margin: '0 0 56px',
    }}>
      Track store rollouts, manage initiatives, surface delays, and coordinate the estate from one command centre.
    </p>

    {/* Grouped sections */}
    <div style={{ display: 'flex', flexDirection: 'column', gap: 44 }}>
      {SECTIONS.map((section) => (
        <div key={section.label}>
          <p style={{
            fontSize: 10, fontWeight: 700, letterSpacing: '0.20em',
            textTransform: 'uppercase', color: '#3F3F46',
            fontFamily: 'JetBrains Mono, monospace',
            margin: '0 0 14px',
          }}>{section.label}</p>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
            gap: 14,
          }}>
            {section.cards.map((card) => (
              <Card key={card.view} card={card} onNavigate={onNavigate} />
            ))}
          </div>
        </div>
      ))}
    </div>
  </div>
);
