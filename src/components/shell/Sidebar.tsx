import React from 'react';
import {
  LayoutDashboard, Grid3x3, GanttChartSquare, Calendar, Map,
  Store, User, Wrench,
  Sparkles, Truck,
  AlertTriangle, Clock, Bell, Users,
  Upload, Download, FileText, Settings,
  Home,
} from 'lucide-react';
import type { ViewId } from '../../App';

interface SidebarProps {
  active: ViewId;
  onNavigate: (v: ViewId) => void;
  user: { email?: string; name?: string } | null;
  estateHealthPct?: number;
}

const SECTIONS: { label: string; items: { id: ViewId; label: string; icon: any }[] }[] = [
  {
    label: 'Overview',
    items: [
      { id: 'home', label: 'Home', icon: Home },
    ],
  },
  {
    label: 'Rollouts',
    items: [
      { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
      { id: 'grid', label: 'Grid', icon: Grid3x3 },
      { id: 'timeline', label: 'Timeline', icon: GanttChartSquare },
      { id: 'calendar', label: 'Calendar', icon: Calendar },
      { id: 'map', label: 'Map', icon: Map },
    ],
  },
  {
    label: 'Stores',
    items: [
      { id: 'stores', label: 'All Stores', icon: Store },
      { id: 'equipment', label: 'Equipment', icon: Wrench },
    ],
  },
  {
    label: 'Initiatives',
    items: [
      { id: 'initiatives', label: 'All Initiatives', icon: Sparkles },
      { id: 'vendors', label: 'Vendors', icon: Truck },
    ],
  },
  {
    label: 'Operations',
    items: [
      { id: 'snags', label: 'Snag List', icon: AlertTriangle },
      { id: 'delays', label: 'Delays', icon: Clock },
      { id: 'alerts', label: 'Alerts', icon: Bell },
      { id: 'managers', label: 'Area Managers', icon: Users },
    ],
  },
  {
    label: 'Data',
    items: [
      { id: 'import', label: 'Import', icon: Upload },
      { id: 'export', label: 'Export', icon: Download },
      { id: 'audit', label: 'Audit Log', icon: FileText },
    ],
  },
  {
    label: 'Workspace',
    items: [
      { id: 'settings', label: 'Settings', icon: Settings },
    ],
  },
];

export const Sidebar: React.FC<SidebarProps> = ({ active, onNavigate, user, estateHealthPct = 0 }) => {
  return (
    <aside className="prism-sidebar">
      {/* Header */}
      <div style={{ borderBottom: '1px solid var(--sidebar-border)', padding: '20px 18px' }}>
        <div className="prism-sidebar-label" style={{ marginBottom: 14, display: 'flex', alignItems: 'center', gap: 10 }}>
          <span
            style={{
              width: 28, height: 28, borderRadius: 8,
              background: 'linear-gradient(135deg, #1D4ED8, #3B82F6, #60A5FA)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: '0 0 16px rgba(59,130,246,0.4)',
            }}
          >
            <span style={{ color: 'white', fontWeight: 800, fontSize: 12 }}>P</span>
          </span>
          <span>Prism · OS</span>
        </div>
        <p style={{ fontSize: 17, fontWeight: 700, color: 'var(--text-primary)', margin: '0 0 4px', letterSpacing: '-0.01em' }}>
          Prism <span className="text-gradient-signal">Tracker</span>
        </p>
        <p style={{ fontSize: 11, color: 'var(--text-tertiary)', margin: 0 }}>Third Wave Coffee</p>
        <span
          className="badge-pill"
          style={{
            marginTop: 12,
            background: 'rgba(59,130,246,0.10)',
            color: 'var(--signal-500)',
          }}
        >
          <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--signal-500)' }} />
          Operator
        </span>
      </div>

      {/* Nav */}
      <nav style={{ flex: 1, overflowY: 'auto', padding: '14px 12px' }}>
        {SECTIONS.map((sec) => (
          <div key={sec.label} style={{ marginBottom: 18 }}>
            <p className="prism-sidebar-label" style={{ padding: '4px 12px 6px' }}>{sec.label}</p>
            {sec.items.map((it) => {
              const Icon = it.icon;
              return (
                <button
                  key={it.id}
                  className="prism-nav-item"
                  data-active={active === it.id}
                  onClick={() => onNavigate(it.id)}
                >
                  <Icon size={15} />
                  <span>{it.label}</span>
                </button>
              );
            })}
          </div>
        ))}
      </nav>

      {/* Footer KPI */}
      <div style={{ borderTop: '1px solid var(--sidebar-border)', padding: 14 }}>
        <div
          style={{
            border: '1px solid var(--border-subtle)',
            background: 'var(--card-bg)',
            borderRadius: 14,
            padding: 14,
          }}
        >
          <p className="prism-sidebar-label" style={{ margin: 0 }}>Estate health</p>
          <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginTop: 8 }}>
            <span className="font-mono-value" style={{ fontSize: 24, fontWeight: 700, color: 'var(--obsidian-50)' }}>
              {estateHealthPct}%
            </span>
            <span
              className="badge-pill"
              style={{
                background: estateHealthPct >= 70 ? 'rgba(34,197,94,0.10)' : estateHealthPct >= 40 ? 'rgba(234,179,8,0.10)' : 'rgba(239,68,68,0.10)',
                color: estateHealthPct >= 70 ? '#22C55E' : estateHealthPct >= 40 ? '#EAB308' : '#EF4444',
              }}
            >
              {estateHealthPct >= 70 ? 'Green' : estateHealthPct >= 40 ? 'Amber' : 'Red'}
            </span>
          </div>
        </div>
      </div>
    </aside>
  );
};
