/**
 * CreateInitiativeModal — Prism OS dark modal for adding a new initiative.
 * Calls api.initiatives.upsert on submit.
 */
import React, { useState } from 'react';
import { useMutation } from 'convex/react';
import { api } from '../../convex/_generated/api';
import { X, Sparkles } from 'lucide-react';
import type { Id } from '../../convex/_generated/dataModel';

export interface ExistingInitiative {
  _id: Id<'initiatives'>;
  name: string;
  type: 'trial' | 'launch' | 'pilot' | 'transition';
  status: 'planned' | 'active' | 'completed' | 'paused' | 'cancelled';
  vendor?: string;
  productCategory?: string;
  plannedStart: number;
  plannedEnd?: number;
  regions: string[];
  notes?: string;
  variants: string[];
  cities: string[];
}

interface Props {
  onClose: () => void;
  onCreated?: () => void;
  /** Pass an existing initiative to switch to edit mode. */
  existing?: ExistingInitiative | null;
}

const REGIONS = [
  'North', 'South', 'East', 'West',
  'Central', 'NCR', 'Mumbai', 'Bangalore',
];

const INPUT: React.CSSProperties = {
  width: '100%', padding: '9px 12px', fontSize: 13, fontFamily: 'inherit',
  background: 'var(--input-bg)', border: '1px solid var(--border-subtle)',
  borderRadius: 10, color: 'var(--text-primary)', outline: 'none',
  boxSizing: 'border-box',
};

const toDateStr = (ts?: number) =>
  ts ? new Date(ts).toISOString().slice(0, 10) : '';

export const CreateInitiativeModal: React.FC<Props> = ({ onClose, onCreated, existing }) => {
  const upsert = useMutation(api.initiatives.upsert);
  const update = useMutation(api.initiatives.update);

  const isEdit = !!existing;

  const [name, setName] = useState(existing?.name ?? '');
  const [type, setType] = useState<'trial' | 'launch' | 'pilot' | 'transition'>(existing?.type ?? 'trial');
  const [status, setStatus] = useState<'planned' | 'active' | 'completed' | 'paused' | 'cancelled'>(existing?.status ?? 'planned');
  const [vendor, setVendor] = useState(existing?.vendor ?? '');
  const [productCategory, setProductCategory] = useState(existing?.productCategory ?? '');
  const [plannedStart, setPlannedStart] = useState(toDateStr(existing?.plannedStart));
  const [plannedEnd, setPlannedEnd] = useState(toDateStr(existing?.plannedEnd));
  const [selectedRegions, setSelectedRegions] = useState<string[]>(existing?.regions ?? []);
  const [notes, setNotes] = useState(existing?.notes ?? '');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const toggleRegion = (r: string) => {
    setSelectedRegions((prev) =>
      prev.includes(r) ? prev.filter((x) => x !== r) : [...prev, r],
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) { setError('Initiative name is required'); return; }
    setSaving(true);
    setError('');
    try {
      const startTs = plannedStart ? new Date(plannedStart).getTime() : Date.now();
      const endTs = plannedEnd ? new Date(plannedEnd).getTime() : undefined;
      const payload = {
        name: name.trim(),
        type,
        status,
        vendor: vendor.trim() || undefined,
        productCategory: productCategory.trim() || undefined,
        variants: existing?.variants ?? [],
        regions: selectedRegions,
        cities: existing?.cities ?? [],
        plannedStart: startTs,
        plannedEnd: endTs,
        notes: notes.trim() || undefined,
      };
      if (isEdit) {
        await update({ id: existing!._id, patch: payload });
      } else {
        await upsert(payload);
      }
      onCreated?.();
      onClose();
    } catch (err: unknown) {
      setError(String((err as { message?: string })?.message ?? err));
    } finally {
      setSaving(false);
    }
  };

  const TYPE_COLORS: Record<string, string> = {
    trial: '#3B82F6',
    launch: '#22C55E',
    pilot: '#EAB308',
    transition: '#A855F7',
  };

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={onClose}
        style={{
          position: 'fixed', inset: 0, zIndex: 60,
          background: 'rgba(0,0,0,0.65)',
          backdropFilter: 'blur(4px)',
        }}
      />

      {/* Modal */}
      <div
        style={{
          position: 'fixed', top: '50%', left: '50%',
          transform: 'translate(-50%, -50%)',
          zIndex: 61, width: 540, maxHeight: '90vh',
          background: 'var(--glass-bg)',
          backdropFilter: 'blur(24px) saturate(1.4)',
          border: '1px solid var(--glass-border)',
          borderRadius: 20,
          boxShadow: '0 32px 80px rgba(0,0,0,0.7)',
          overflowY: 'auto',
          padding: '28px 32px',
        }}
      >
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{
              width: 36, height: 36, borderRadius: 10,
              background: 'linear-gradient(135deg,#1D4ED8,#3B82F6)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <Sparkles size={16} color="#fff" />
            </div>
            <div>
              <p className="text-overline" style={{ margin: 0 }}>Initiatives · {isEdit ? 'Edit' : 'New'}</p>
              <h2 style={{ fontSize: 17, fontWeight: 700, color: 'var(--obsidian-50)', margin: 0 }}>
                {isEdit ? existing!.name : 'Create initiative'}
              </h2>
            </div>
          </div>
          <button className="btn-ghost" onClick={onClose}><X size={16} /></button>
        </div>

        <form onSubmit={handleSubmit}>
          {/* Name */}
          <label style={{ display: 'block', marginBottom: 16 }}>
            <span className="text-overline-muted" style={{ display: 'block', marginBottom: 6 }}>Name *</span>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Masala Chai Powder Trial"
              autoFocus
              style={INPUT}
            />
          </label>

          {/* Type row */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 14, marginBottom: 16 }}>
            <label style={{ display: 'block' }}>
              <span className="text-overline-muted" style={{ display: 'block', marginBottom: 6 }}>Type</span>
              <select
                value={type}
                onChange={(e) => setType(e.target.value as any)}
                style={{ ...INPUT, color: TYPE_COLORS[type] }}
              >
                <option value="trial">Trial</option>
                <option value="launch">Launch</option>
                <option value="pilot">Pilot</option>
                <option value="transition">Transition</option>
              </select>
            </label>

            <label style={{ display: 'block' }}>
              <span className="text-overline-muted" style={{ display: 'block', marginBottom: 6 }}>Status</span>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as any)}
                style={INPUT}
              >
                <option value="planned">Planned</option>
                <option value="active">Active</option>
                <option value="paused">Paused</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </label>

            <label style={{ display: 'block' }}>
              <span className="text-overline-muted" style={{ display: 'block', marginBottom: 6 }}>Vendor / supplier</span>
              <input
                type="text"
                value={vendor}
                onChange={(e) => setVendor(e.target.value)}
                placeholder="e.g. Olam, Nutaste…"
                style={INPUT}
              />
            </label>
          </div>

          {/* Dates row */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 16 }}>
            <label style={{ display: 'block' }}>
              <span className="text-overline-muted" style={{ display: 'block', marginBottom: 6 }}>Planned start</span>
              <input type="date" value={plannedStart} onChange={(e) => setPlannedStart(e.target.value)} style={INPUT} />
            </label>
            <label style={{ display: 'block' }}>
              <span className="text-overline-muted" style={{ display: 'block', marginBottom: 6 }}>Planned end</span>
              <input type="date" value={plannedEnd} onChange={(e) => setPlannedEnd(e.target.value)} style={INPUT} />
            </label>
          </div>

          {/* Product category */}
          <label style={{ display: 'block', marginBottom: 16 }}>
            <span className="text-overline-muted" style={{ display: 'block', marginBottom: 6 }}>Product category</span>
            <input
              type="text"
              value={productCategory}
              onChange={(e) => setProductCategory(e.target.value)}
              placeholder="e.g. Beverages, Food, Equipment…"
              style={INPUT}
            />
          </label>

          {/* Regions */}
          <div style={{ marginBottom: 16 }}>
            <span className="text-overline-muted" style={{ display: 'block', marginBottom: 8 }}>Scope — regions</span>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {REGIONS.map((r) => {
                const active = selectedRegions.includes(r);
                return (
                  <button
                    type="button"
                    key={r}
                    onClick={() => toggleRegion(r)}
                    style={{
                      padding: '5px 14px', fontSize: 11, fontWeight: 700,
                      fontFamily: 'inherit', borderRadius: 20, cursor: 'pointer',
                      border: `1px solid ${active ? '#3B82F6' : 'var(--border-subtle)'}`,
                      background: active ? 'rgba(59,130,246,0.14)' : 'var(--card-bg)',
                      color: active ? '#60A5FA' : 'var(--text-secondary)',
                      transition: 'all 100ms',
                    }}
                  >
                    {r}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Notes */}
          <label style={{ display: 'block', marginBottom: 20 }}>
            <span className="text-overline-muted" style={{ display: 'block', marginBottom: 6 }}>Notes</span>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Context, goals, blockers…"
              rows={2}
              style={{ ...INPUT, resize: 'vertical' }}
            />
          </label>

          {error && (
            <p style={{ color: '#FCA5A5', fontSize: 12, margin: '0 0 14px', padding: '8px 12px', background: 'rgba(239,68,68,0.08)', borderRadius: 8 }}>
              {error}
            </p>
          )}

          {/* Actions */}
          <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
            <button type="button" className="btn-ghost" onClick={onClose}>Cancel</button>
            <button
              type="submit"
              disabled={saving || !name.trim()}
              style={{
                padding: '9px 24px', fontSize: 13, fontWeight: 700, fontFamily: 'inherit',
                background: saving || !name.trim() ? 'rgba(59,130,246,0.10)' : 'linear-gradient(135deg,#1D4ED8,#3B82F6)',
                border: '1px solid rgba(59,130,246,0.40)',
                borderRadius: 10, color: '#fff', cursor: saving || !name.trim() ? 'not-allowed' : 'pointer',
              }}
            >
              {saving ? 'Saving…' : isEdit ? 'Save changes' : 'Create initiative'}
            </button>
          </div>
        </form>
      </div>
    </>
  );
};
