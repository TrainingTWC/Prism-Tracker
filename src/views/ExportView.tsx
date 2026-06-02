import React from 'react';
import { useTrackerData } from '../lib/useTrackerData';
import { PageHeader, Panel } from '../components/shell/PageHeader';
import { LoadingPanel } from './DashboardView';
import { Download } from 'lucide-react';
import { fmtDate, STATUS_LABEL } from '../lib/health';

export const ExportView: React.FC = () => {
  const { loading, rollouts, stores, initiatives } = useTrackerData();
  if (loading) return <LoadingPanel />;

  const exportMatrix = () => {
    const initiativeCols = initiatives.map((i) => i.name);
    const header = ['Store Code', 'Store Name', 'Region', 'City', 'Area Manager', 'Format', 'Coffee Machine', 'Merrychef', ...initiativeCols];
    const rows = stores.map((s) => {
      const base = [s.storeCode, s.storeName, s.region, s.city, s.areaManager, s.storeFormat, s.coffeeMachine, s.merrychefType];
      const cells = initiatives.map((i) => {
        const r = rollouts.find((x) => x.storeId === s._id && x.initiativeId === i._id);
        if (!r || !r.participating) return '';
        return STATUS_LABEL[r.status] || r.status;
      });
      return [...base, ...cells].map((v) => `"${(v ?? '').toString().replace(/"/g, '""')}"`).join(',');
    });
    const csv = [header.map((h) => `"${h}"`).join(','), ...rows].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = `prism-tracker-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click(); URL.revokeObjectURL(url);
  };

  const exportRollouts = () => {
    const header = ['storeCode', 'storeName', 'region', 'city', 'areaManager', 'initiative', 'status', 'health', 'plannedStart', 'plannedEnd', 'actualStart', 'actualEnd', 'isDelayed', 'delayCategory', 'delayReason', 'delayDays'];
    const rows = rollouts.filter((r) => r.participating).map((r) => {
      const s = stores.find((x) => x._id === r.storeId);
      const i = initiatives.find((x) => x._id === r.initiativeId);
      return [
        s?.storeCode, s?.storeName, s?.region, s?.city, s?.areaManager,
        i?.name, r.status, r.health,
        fmtDate(r.plannedStart), fmtDate(r.plannedEnd), fmtDate(r.actualStart), fmtDate(r.actualEnd),
        r.isDelayed, r.delayCategory || '', r.delayReason || '', r.delayDays || '',
      ].map((v) => `"${(v ?? '').toString().replace(/"/g, '""')}"`).join(',');
    });
    const csv = [header.map((h) => `"${h}"`).join(','), ...rows].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = `rollouts-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click(); URL.revokeObjectURL(url);
  };

  return (
    <>
      <PageHeader overline="Data · Export" title="Round-trip the data out" subtitle="Re-build the matrix exactly as the source sheet, or get a flat rollouts table" />
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        <Panel title="Matrix export" subtitle="Stores as rows, initiatives as columns (mirrors source sheet)">
          <p style={{ fontSize: 12, color: 'var(--text-tertiary)', margin: '0 0 16px' }}>
            {stores.length} stores × {initiatives.length} initiatives = {stores.length * initiatives.length} cells
          </p>
          <button className="btn-primary" onClick={exportMatrix}><Download size={14} /> Download CSV</button>
        </Panel>
        <Panel title="Flat rollouts export" subtitle="One row per participating rollout, all fields">
          <p style={{ fontSize: 12, color: 'var(--text-tertiary)', margin: '0 0 16px' }}>
            {rollouts.filter((r) => r.participating).length} rollout rows
          </p>
          <button className="btn-primary" onClick={exportRollouts}><Download size={14} /> Download CSV</button>
        </Panel>
      </div>
    </>
  );
};
