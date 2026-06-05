/**
 * Prism Tracker — Phase 5
 * Full Prism OS shell + 18 dashboard surfaces.
 */
import React, { useState, useEffect, useCallback } from 'react';
import { useAuthActions } from '@convex-dev/auth/react';
import { useQuery } from 'convex/react';
import { api } from '../convex/_generated/api';


import { AuthGate } from './components/AuthGate';
import { AppShell } from './components/shell/AppShell';
import { Sidebar } from './components/shell/Sidebar';
import { Topbar } from './components/shell/Topbar';
import { useTrackerData } from './lib/useTrackerData';

import { HomeView } from './views/HomeView';
import { DashboardView } from './views/DashboardView';
import { GridView } from './views/GridView';
import { TimelineView } from './views/TimelineView';
import { CalendarView } from './views/CalendarView';
import { MapView } from './views/MapView';
import { StoresView } from './views/StoresView';
import { StoreProfileView } from './views/StoreProfileView';
import { EquipmentView } from './views/EquipmentView';
import { InitiativesView } from './views/InitiativesView';
import { InitiativePageView } from './views/InitiativePageView';
import { VendorsView } from './views/VendorsView';
import { SnagsView } from './views/SnagsView';
import { DelaysView } from './views/DelaysView';
import { AlertsView } from './views/AlertsView';
import { AreaManagersView } from './views/AreaManagersView';
import { ImportView } from './views/ImportView';
import { ExportView } from './views/ExportView';
import { AuditView } from './views/AuditView';
import { SettingsView } from './views/SettingsView';
import { AdminView } from './views/AdminView';
import { DepartmentsView } from './views/DepartmentsView';
import { ProjectsView } from './views/ProjectsView';
import { ProjectDetailView } from './views/ProjectDetailView';

export type ViewId =
  | 'home' | 'dashboard' | 'grid' | 'timeline' | 'calendar' | 'map'
  | 'stores' | 'store-profile' | 'equipment'
  | 'initiatives' | 'initiative-page' | 'vendors'
  | 'snags' | 'delays' | 'alerts' | 'managers'
  | 'import' | 'export' | 'audit'
  | 'settings' | 'admin'
  | 'departments' | 'projects' | 'project-detail';

interface ViewParams {
  storeId?: string;
  initiativeId?: string;
  projectId?: string;
}

const ROUTE_MAP: Record<string, ViewId> = {
  '/': 'home', '/dashboard': 'dashboard', '/grid': 'grid', '/timeline': 'timeline',
  '/calendar': 'calendar', '/map': 'map', '/stores': 'stores',
  '/equipment': 'equipment', '/initiatives': 'initiatives',
  '/vendors': 'vendors', '/snags': 'snags', '/delays': 'delays',
  '/alerts': 'alerts', '/managers': 'managers', '/import': 'import',
  '/export': 'export', '/audit': 'audit', '/settings': 'settings', '/admin': 'admin',
  '/departments': 'departments', '/projects': 'projects',
};
const VIEW_PATH: Record<ViewId, string> = {
  home: '/', dashboard: '/dashboard', grid: '/grid', timeline: '/timeline', calendar: '/calendar',
  map: '/map', stores: '/stores', 'store-profile': '/stores', equipment: '/equipment',
  initiatives: '/initiatives', 'initiative-page': '/initiatives', vendors: '/vendors',
  snags: '/snags', delays: '/delays', alerts: '/alerts', managers: '/managers',
  import: '/import', export: '/export', audit: '/audit', settings: '/settings', admin: '/admin',
  departments: '/departments', projects: '/projects', 'project-detail': '/projects',
};

function parseLocation(): { view: ViewId; params: ViewParams } {
  const path = window.location.pathname.replace(/\/$/, '') || '/';
  // /initiative/:id
  const initMatch = path.match(/^\/initiative\/(.+)$/);
  if (initMatch) return { view: 'initiative-page', params: { initiativeId: initMatch[1] } };
  // /store/:id
  const storeMatch = path.match(/^\/store\/(.+)$/);
  if (storeMatch) return { view: 'store-profile', params: { storeId: storeMatch[1] } };
  // /project/:id
  const projectMatch = path.match(/^\/project\/(.+)$/);
  if (projectMatch) return { view: 'project-detail', params: { projectId: projectMatch[1] } };
  const view = ROUTE_MAP[path] ?? 'home';
  return { view, params: {} };
}

const MainApp: React.FC = () => {
  const { signOut } = useAuthActions();
  const user = useQuery(api.user.current);
  const { kpis } = useTrackerData();

  const [{ view, params }, setLocation] = useState(parseLocation);
  const [search, setSearch] = useState('');

  // ── Theme ────────────────────────────────────────────────────────────────
  const [theme, setTheme] = useState<'dark' | 'light'>(() => {
    return (localStorage.getItem('prism-theme') as 'dark' | 'light') || 'dark';
  });
  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    localStorage.setItem('prism-theme', theme);
  }, [theme]);
  const toggleTheme = useCallback(() => setTheme(t => t === 'dark' ? 'light' : 'dark'), []);

  // Listen to browser back/forward
  useEffect(() => {
    const handler = () => setLocation(parseLocation());
    window.addEventListener('popstate', handler);
    return () => window.removeEventListener('popstate', handler);
  }, []);

  const navigate = useCallback((v: ViewId, p: ViewParams = {}) => {
    let path: string;
    if (v === 'initiative-page' && p.initiativeId) path = `/initiative/${p.initiativeId}`;
    else if (v === 'store-profile' && p.storeId) path = `/store/${p.storeId}`;
    else if (v === 'project-detail' && p.projectId) path = `/project/${p.projectId}`;
    else path = VIEW_PATH[v] ?? '/';
    window.history.pushState({ v, p }, '', path);
    setLocation({ view: v, params: p });
  }, []);

  if (user === undefined) {
    return (
      <div style={{
        minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: '#09090B', flexDirection: 'column', gap: 0,
      }}>
        {/* Ambient glow */}
        <div style={{
          position: 'fixed', top: '30%', left: '50%', transform: 'translate(-50%,-50%)',
          width: 500, height: 500, borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(59,130,246,0.08) 0%, transparent 70%)',
          pointerEvents: 'none',
        }} />
        <div style={{ textAlign: 'center', position: 'relative', zIndex: 1 }}>
          {/* Logo tile */}
          <div style={{
            width: 56, height: 56, borderRadius: 14, margin: '0 auto 20px',
            background: 'linear-gradient(135deg,#1D4ED8,#3B82F6,#60A5FA)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 0 40px rgba(59,130,246,0.35)',
            fontSize: 24, fontWeight: 800, color: '#fff',
            fontFamily: 'JetBrains Mono, monospace',
          }}>P</div>
          {/* Spinner bar */}
          <div style={{ width: 160, height: 2, background: '#1C1C21', borderRadius: 2, margin: '0 auto 16px', overflow: 'hidden' }}>
            <div style={{
              height: '100%', width: '40%', background: 'linear-gradient(90deg,transparent,#3B82F6,transparent)',
              borderRadius: 2, animation: 'prism-scan 1.4s ease-in-out infinite',
            }} />
          </div>
          <p style={{
            fontSize: 10, letterSpacing: '0.18em', textTransform: 'uppercase',
            color: '#52525C', fontFamily: 'JetBrains Mono, monospace', margin: 0,
          }}>Connecting to Prism OS</p>
        </div>
        <style>{`@keyframes prism-scan{0%{transform:translateX(-200%)}100%{transform:translateX(500%)}}`}</style>
      </div>
    );
  }

  if (!user) return <AuthGate />;

  const handleSignOut = () => { void signOut(); };

  const renderView = () => {
    switch (view) {
      case 'home': return <HomeView onNavigate={navigate} />;
      case 'dashboard': return <DashboardView />;
      case 'grid': return <GridView search={search} />;
      case 'timeline': return <TimelineView />;
      case 'calendar': return <CalendarView />;
      case 'map': return <MapView />;
      case 'stores': return <StoresView search={search} onNavigate={navigate} />;
      case 'store-profile': return <StoreProfileView storeId={params.storeId} onNavigate={navigate} />;
      case 'equipment': return <EquipmentView />;
      case 'initiatives': return <InitiativesView onNavigate={navigate} />;
      case 'initiative-page': return <InitiativePageView initiativeId={params.initiativeId} onNavigate={navigate} />;
      case 'vendors': return <VendorsView />;
      case 'snags': return <SnagsView onNavigate={navigate} />;
      case 'delays': return <DelaysView />;
      case 'alerts': return <AlertsView />;
      case 'managers': return <AreaManagersView />;
      case 'import': return <ImportView />;
      case 'export': return <ExportView />;
      case 'audit': return <AuditView />;
      case 'settings': return <SettingsView user={user} onSignOut={handleSignOut} />;
      case 'admin': return <AdminView user={user} onNavigate={navigate} />;
      case 'departments': return <DepartmentsView />;
      case 'projects': return <ProjectsView onNavigate={navigate} />;
      case 'project-detail': return <ProjectDetailView projectId={params.projectId} onNavigate={navigate} />;
      default: return <HomeView onNavigate={navigate} />;
    }
  };

  return (
    <AppShell
      sidebar={
        <Sidebar
          active={view}
          onNavigate={(v) => navigate(v)}
          user={user as any}
          estateHealthPct={kpis.estateHealthPct}
        />
      }
      topbar={
        <Topbar
          user={user as any}
          onSignOut={handleSignOut}
          search={search}
          onSearch={setSearch}
          theme={theme}
          onToggleTheme={toggleTheme}
        />
      }
    >
      {renderView()}
    </AppShell>
  );
};

export default MainApp;
