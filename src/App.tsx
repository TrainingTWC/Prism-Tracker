/**
 * Prism Tracker — Phase 5
 * Full Prism OS shell + 18 dashboard surfaces.
 */
import React, { useState } from 'react';
import { useAuthActions } from '@convex-dev/auth/react';
import { useQuery } from 'convex/react';
import { api } from '../convex/_generated/api';
import { Activity } from 'lucide-react';

import { AuthGate } from './components/AuthGate';
import { AppShell } from './components/shell/AppShell';
import { Sidebar } from './components/shell/Sidebar';
import { Topbar } from './components/shell/Topbar';
import { useTrackerData } from './lib/useTrackerData';

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

export type ViewId =
  | 'dashboard' | 'grid' | 'timeline' | 'calendar' | 'map'
  | 'stores' | 'store-profile' | 'equipment'
  | 'initiatives' | 'initiative-page' | 'vendors'
  | 'snags' | 'delays' | 'alerts' | 'managers'
  | 'import' | 'export' | 'audit'
  | 'settings';

interface ViewParams {
  storeId?: string;
  initiativeId?: string;
}

const MainApp: React.FC = () => {
  const { signOut } = useAuthActions();
  const user = useQuery(api.user.current);
  const { kpis } = useTrackerData();

  const [view, setView] = useState<ViewId>('dashboard');
  const [params, setParams] = useState<ViewParams>({});
  const [search, setSearch] = useState('');

  const navigate = (v: ViewId, p: ViewParams = {}) => {
    setView(v);
    setParams(p);
  };

  if (user === undefined) {
    return (
      <div
        style={{
          minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
          background: '#09090B', color: '#A1A1AE', fontFamily: 'JetBrains Mono, monospace',
        }}
      >
        <div style={{ textAlign: 'center' }}>
          <Activity size={28} color="#3B82F6" className="animate-spin" />
          <p style={{ fontSize: 11, letterSpacing: '0.16em', textTransform: 'uppercase', marginTop: 14, opacity: 0.6 }}>
            Booting Prism Tracker…
          </p>
        </div>
      </div>
    );
  }

  if (!user) return <AuthGate />;

  const handleSignOut = () => { void signOut(); };

  const renderView = () => {
    switch (view) {
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
      default: return <DashboardView />;
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
        />
      }
    >
      {renderView()}
    </AppShell>
  );
};

export default MainApp;
