import React, { useState } from 'react';
import { useTrackerData } from '../lib/useTrackerData';
import { PageHeader, Panel, HealthPill, KpiTile } from '../components/shell/PageHeader';
import { LoadingPanel } from './DashboardView';
import { INITIATIVE_TYPE_COLOR, fmtDate, pct } from '../lib/health';
import { Sparkles, Plus } from 'lucide-react';
import type { ViewId } from '../App';
import { CreateInitiativeModal } from '../components/CreateInitiativeModal';

export const InitiativesView: React.FC<{ onNavigate: (v: ViewId, p?: any) => void }> = ({ onNavigate }) => {
  const { loading, initiatives, rollouts } = useTrackerData();
  const [showCreate, setShowCreate] = useState(false);
  if (loading) return <LoadingPanel />;

  const enriched = initiatives.map((i) => {
    const cells = rollouts.filter((r) => r.initiativeId === i._id && r.participating);
    const g = cells.filter((c) => c.health === 'green').length;
    const a = cells.filter((c) => c.health === 'amber').length;
    const r = cells.filter((c) => c.health === 'red').length;
    return { ...i, _cells: cells.length, _g: g, _a: a, _r: r };
  });

  return (
    <>
      <PageHeader
        overline="Initiatives · Catalog"
        title="All initiatives"
        subtitle={`${initiatives.length} initiatives · ${rollouts.length} rollouts`}
        actions={
          <button className="btn-primary" onClick={() => setShowCreate(true)}>
            <Plus size={14} /> New initiative
          </button>
        }
      />

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 16 }}>
        {enriched.map((i) => {
          const typeColor = INITIATIVE_TYPE_COLOR[i.type] || '#7A7A88';
          const overall: 'green' | 'amber' | 'red' = i._r > 0 ? 'red' : (i._cells > 0 && i._g === i._cells ? 'green' : 'amber');
          return (
            <button
              key={i._id}
              className="widget"
              onClick={() => onNavigate('initiative-page', { initiativeId: i._id })}
              style={{ padding: 22, textAlign: 'left', cursor: 'pointer', border: '1px solid var(--widget-border)', background: 'linear-gradient(135deg, rgba(20,20,24,0.9), rgba(16,16,20,0.85))', color: 'inherit', font: 'inherit' }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12, gap: 8 }}>
                <span className="badge-pill" style={{ background: `${typeColor}18`, color: typeColor }}>{i.type}</span>
                <span className="badge-pill" style={{ background: 'rgba(255,255,255,0.04)', color: 'var(--text-secondary)' }}>{i.status}</span>
              </div>
              <h3 style={{ fontSize: 16, fontWeight: 700, color: 'var(--obsidian-50)', margin: '0 0 6px' }}>{i.name}</h3>
              {i.vendor && <p style={{ fontSize: 11, color: 'var(--text-tertiary)', margin: '0 0 12px' }}>Vendor: {i.vendor}</p>}
              <div style={{ fontSize: 11, color: 'var(--text-muted)', margin: '0 0 12px' }}>
                <span className="font-mono-value">{fmtDate(i.plannedStart)} → {fmtDate(i.plannedEnd)}</span>
              </div>
              <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 8 }}>
                <span className="font-mono-value" style={{ fontSize: 18, fontWeight: 700, color: 'var(--obsidian-50)' }}>{i._cells}</span>
                <span className="text-overline-muted">stores</span>
                <span style={{ marginLeft: 'auto' }}>{i._cells > 0 && <HealthPill health={overall} />}</span>
              </div>
              {i._cells > 0 && (
                <div style={{ display: 'flex', height: 4, borderRadius: 2, overflow: 'hidden', background: 'rgba(255,255,255,0.03)' }}>
                  {i._g > 0 && <div style={{ width: `${(i._g / i._cells) * 100}%`, background: '#22C55E' }} />}
                  {i._a > 0 && <div style={{ width: `${(i._a / i._cells) * 100}%`, background: '#EAB308' }} />}
                  {i._r > 0 && <div style={{ width: `${(i._r / i._cells) * 100}%`, background: '#EF4444' }} />}
                </div>
              )}
              {Array.isArray(i.variants) && i.variants.length > 0 && (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, marginTop: 12 }}>
                  {i.variants.slice(0, 4).map((v: string, idx: number) => (
                    <span key={idx} className="badge-pill" style={{ background: 'rgba(255,255,255,0.03)', color: 'var(--text-tertiary)', fontSize: 9 }}>{v}</span>
                  ))}
                </div>
              )}
            </button>
          );
        })}
      </div>

      {initiatives.length === 0 && (
        <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--text-muted)' }}>
          <Sparkles size={32} style={{ marginBottom: 12, opacity: 0.3 }} />
          <p style={{ fontSize: 13, marginBottom: 8 }}>No initiatives yet</p>
          <p style={{ fontSize: 11 }}>Click "New initiative" to create the first one, or import from the Data → Import view.</p>
        </div>
      )}

      {showCreate && (
        <CreateInitiativeModal
          onClose={() => setShowCreate(false)}
          onCreated={() => setShowCreate(false)}
        />
      )}
    </>
  );
};
