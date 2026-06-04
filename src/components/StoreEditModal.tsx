/**
 * StoreEditModal — Prism OS dark modal for creating / editing a store record.
 * Create mode: calls api.stores.upsert (idempotent by storeCode)
 * Edit mode:   calls api.stores.update (patch all fields by ID)
 */
import React, { useState } from 'react';
import { useMutation } from 'convex/react';
import { api } from '../../convex/_generated/api';
import { X, Store } from 'lucide-react';
import type { Id } from '../../convex/_generated/dataModel';

export interface StoreRecord {
  _id: Id<'stores'>;
  storeCode: string;
  storeName: string;
  areaManager: string;
  region: string;
  city: string;
  storeFormat: string;
  menuType: string;
  coffeeMachine: string;
  merrychefType: string;
  active: boolean;
}

interface Props {
  /** Pass an existing store to enter edit mode; omit / null for create mode. */
  store?: StoreRecord | null;
  onClose: () => void;
  onSaved?: () => void;
}

const INPUT: React.CSSProperties = {
  width: '100%',
  padding: '9px 12px',
  fontSize: 13,
  fontFamily: 'inherit',
  background: 'var(--input-bg)',
  border: '1px solid var(--border-subtle)',
  borderRadius: 10,
  color: 'var(--text-primary)',
  outline: 'none',
  boxSizing: 'border-box',
};

export const StoreEditModal: React.FC<Props> = ({ store, onClose, onSaved }) => {
  const upsert = useMutation(api.stores.upsert);
  const update = useMutation(api.stores.update);

  const [form, setForm] = useState({
    storeCode: store?.storeCode ?? '',
    storeName: store?.storeName ?? '',
    areaManager: store?.areaManager ?? '',
    region: store?.region ?? '',
    city: store?.city ?? '',
    storeFormat: store?.storeFormat ?? '',
    menuType: store?.menuType ?? '',
    coffeeMachine: store?.coffeeMachine ?? '',
    merrychefType: store?.merrychefType ?? '',
    active: store?.active ?? true,
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const isEdit = !!store?._id;

  const field =
    <K extends keyof typeof form>(k: K) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
      setForm((prev) => ({ ...prev, [k]: e.target.value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.storeCode.trim() || !form.storeName.trim()) {
      setError('Store Code and Store Name are required');
      return;
    }
    setSaving(true);
    setError('');
    try {
      if (isEdit) {
        await update({ id: store!._id, ...form });
      } else {
        // upsert doesn't take `active` — it always sets true
        const { active: _a, ...upsertData } = form;
        await upsert(upsertData);
      }
      onSaved?.();
      onClose();
    } catch (err: unknown) {
      setError(String((err as { message?: string })?.message ?? err));
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={onClose}
        style={{
          position: 'fixed',
          inset: 0,
          zIndex: 60,
          background: 'rgba(0,0,0,0.65)',
          backdropFilter: 'blur(4px)',
        }}
      />

      {/* Modal */}
      <div
        style={{
          position: 'fixed',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%,-50%)',
          zIndex: 61,
          width: 600,
          maxWidth: 'calc(100vw - 32px)',
          maxHeight: '90vh',
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
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            marginBottom: 24,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div
              style={{
                width: 36,
                height: 36,
                borderRadius: 10,
                background: 'linear-gradient(135deg,#1D4ED8,#3B82F6)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Store size={16} color="#fff" />
            </div>
            <div>
              <p className="text-overline" style={{ margin: 0 }}>
                Stores · {isEdit ? 'Edit' : 'New'}
              </p>
              <h2
                style={{
                  fontSize: 17,
                  fontWeight: 700,
                  color: 'var(--obsidian-50)',
                  margin: 0,
                }}
              >
                {isEdit ? store!.storeName : 'Add store'}
              </h2>
            </div>
          </div>
          <button className="btn-ghost" onClick={onClose}>
            <X size={16} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          {/* Code + Name */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr 2fr',
              gap: 14,
              marginBottom: 14,
            }}
          >
            <label style={{ display: 'block' }}>
              <span
                className="text-overline-muted"
                style={{ display: 'block', marginBottom: 6 }}
              >
                Store Code *
              </span>
              <input
                type="text"
                value={form.storeCode}
                onChange={field('storeCode')}
                placeholder="S001"
                autoFocus={!isEdit}
                style={INPUT}
              />
            </label>
            <label style={{ display: 'block' }}>
              <span
                className="text-overline-muted"
                style={{ display: 'block', marginBottom: 6 }}
              >
                Store Name *
              </span>
              <input
                type="text"
                value={form.storeName}
                onChange={field('storeName')}
                placeholder="TWC-Koramangala"
                autoFocus={isEdit}
                style={INPUT}
              />
            </label>
          </div>

          {/* Area Manager + Region */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: 14,
              marginBottom: 14,
            }}
          >
            <label style={{ display: 'block' }}>
              <span
                className="text-overline-muted"
                style={{ display: 'block', marginBottom: 6 }}
              >
                Area Manager
              </span>
              <input
                type="text"
                value={form.areaManager}
                onChange={field('areaManager')}
                placeholder="Ajay H"
                style={INPUT}
              />
            </label>
            <label style={{ display: 'block' }}>
              <span
                className="text-overline-muted"
                style={{ display: 'block', marginBottom: 6 }}
              >
                Region
              </span>
              <input
                type="text"
                value={form.region}
                onChange={field('region')}
                placeholder="South-1"
                style={INPUT}
              />
            </label>
          </div>

          {/* City + Format */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: 14,
              marginBottom: 14,
            }}
          >
            <label style={{ display: 'block' }}>
              <span
                className="text-overline-muted"
                style={{ display: 'block', marginBottom: 6 }}
              >
                City
              </span>
              <input
                type="text"
                value={form.city}
                onChange={field('city')}
                placeholder="Bengaluru"
                style={INPUT}
              />
            </label>
            <label style={{ display: 'block' }}>
              <span
                className="text-overline-muted"
                style={{ display: 'block', marginBottom: 6 }}
              >
                Store Format
              </span>
              <input
                type="text"
                value={form.storeFormat}
                onChange={field('storeFormat')}
                placeholder="Highstreet"
                style={INPUT}
              />
            </label>
          </div>

          {/* Menu + Coffee + Merrychef */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr 1fr',
              gap: 14,
              marginBottom: 14,
            }}
          >
            <label style={{ display: 'block' }}>
              <span
                className="text-overline-muted"
                style={{ display: 'block', marginBottom: 6 }}
              >
                Menu Type
              </span>
              <input
                type="text"
                value={form.menuType}
                onChange={field('menuType')}
                placeholder="Dine-In"
                style={INPUT}
              />
            </label>
            <label style={{ display: 'block' }}>
              <span
                className="text-overline-muted"
                style={{ display: 'block', marginBottom: 6 }}
              >
                Coffee Machine
              </span>
              <input
                type="text"
                value={form.coffeeMachine}
                onChange={field('coffeeMachine')}
                placeholder="La Marzocco"
                style={INPUT}
              />
            </label>
            <label style={{ display: 'block' }}>
              <span
                className="text-overline-muted"
                style={{ display: 'block', marginBottom: 6 }}
              >
                Merrychef
              </span>
              <input
                type="text"
                value={form.merrychefType}
                onChange={field('merrychefType')}
                placeholder="E2S"
                style={INPUT}
              />
            </label>
          </div>

          {/* Active toggle (edit mode only) */}
          {isEdit && (
            <label
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                marginBottom: 16,
                cursor: 'pointer',
              }}
            >
              <input
                type="checkbox"
                checked={form.active}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, active: e.target.checked }))
                }
              />
              <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>
                Active store (uncheck to deactivate)
              </span>
            </label>
          )}

          {error && (
            <p style={{ color: '#EF4444', fontSize: 12, marginBottom: 12 }}>
              {error}
            </p>
          )}

          <div
            style={{
              display: 'flex',
              justifyContent: 'flex-end',
              gap: 10,
              marginTop: 8,
            }}
          >
            <button type="button" className="btn-ghost" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn-primary" disabled={saving}>
              {saving ? 'Saving…' : isEdit ? 'Save changes' : 'Add store'}
            </button>
          </div>
        </form>
      </div>
    </>
  );
};
