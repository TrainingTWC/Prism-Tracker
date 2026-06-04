/**
 * RolloutEditModal — Admin modal to fully edit a rollout record.
 * Calls api.rollouts.adminPatch which patches all fields and recomputes health.
 */
import React, { useState } from 'react';
import { useMutation } from 'convex/react';
import { api } from '../../convex/_generated/api';
import { X, GitMerge } from 'lucide-react';
import type { Id } from '../../convex/_generated/dataModel';

export interface RolloutRecord {
  _id: Id<'rollouts'>;
  participating: boolean;
  status: string;
  plannedStart?: number;
  plannedEnd?: number;
  actualStart?: number;
  actualEnd?: number;
  isDelayed: boolean;
  delayCategory?: string;
  delayReason?: string;
  delayDays?: number;
  assignedTo?: string;
}

interface Props {
  rollout: RolloutRecord;
  initiativeName: string;
  storeName: string;
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

const toDateStr = (ts?: number) =>
  ts ? new Date(ts).toISOString().slice(0, 10) : '';

type Status =
  | 'not_started'
  | 'in_progress'
  | 'live'
  | 'completed'
  | 'delayed'
  | 'dropped';

export const RolloutEditModal: React.FC<Props> = ({
  rollout,
  initiativeName,
  storeName,
  onClose,
  onSaved,
}) => {
  const adminPatch = useMutation(api.rollouts.adminPatch);

  const [form, setForm] = useState({
    participating: rollout.participating,
    status: rollout.status as Status,
    plannedStart: toDateStr(rollout.plannedStart),
    plannedEnd: toDateStr(rollout.plannedEnd),
    actualStart: toDateStr(rollout.actualStart),
    actualEnd: toDateStr(rollout.actualEnd),
    isDelayed: rollout.isDelayed,
    delayCategory: rollout.delayCategory ?? '',
    delayReason: rollout.delayReason ?? '',
    delayDays: rollout.delayDays ?? 0,
    assignedTo: rollout.assignedTo ?? '',
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const field =
    <K extends keyof typeof form>(k: K) =>
    (
      e: React.ChangeEvent<
        HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
      >,
    ) =>
      setForm((prev) => ({ ...prev, [k]: e.target.value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      await adminPatch({
        id: rollout._id,
        participating: form.participating,
        status: form.status,
        plannedStart: form.plannedStart
          ? new Date(form.plannedStart).getTime()
          : undefined,
        plannedEnd: form.plannedEnd
          ? new Date(form.plannedEnd).getTime()
          : undefined,
        actualStart: form.actualStart
          ? new Date(form.actualStart).getTime()
          : undefined,
        actualEnd: form.actualEnd
          ? new Date(form.actualEnd).getTime()
          : undefined,
        isDelayed: form.isDelayed,
        delayCategory: form.delayCategory || undefined,
        delayReason: form.delayReason || undefined,
        delayDays: form.delayDays > 0 ? form.delayDays : undefined,
        assignedTo: form.assignedTo || undefined,
      });
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
          width: 560,
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
                background: 'linear-gradient(135deg,#7C3AED,#A855F7)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <GitMerge size={16} color="#fff" />
            </div>
            <div>
              <p className="text-overline" style={{ margin: 0 }}>
                Rollout · Edit
              </p>
              <h2
                style={{
                  fontSize: 17,
                  fontWeight: 700,
                  color: 'var(--obsidian-50)',
                  margin: 0,
                }}
              >
                {initiativeName}
              </h2>
              <p
                style={{
                  fontSize: 11,
                  color: 'var(--text-tertiary)',
                  margin: 0,
                }}
              >
                {storeName}
              </p>
            </div>
          </div>
          <button className="btn-ghost" onClick={onClose}>
            <X size={16} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          {/* Participating + Status */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: 14,
              marginBottom: 14,
            }}
          >
            <label
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                cursor: 'pointer',
                padding: '9px 12px',
                background: 'var(--input-bg)',
                border: '1px solid var(--border-subtle)',
                borderRadius: 10,
              }}
            >
              <input
                type="checkbox"
                checked={form.participating}
                onChange={(e) =>
                  setForm((prev) => ({
                    ...prev,
                    participating: e.target.checked,
                  }))
                }
              />
              <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>
                Participating
              </span>
            </label>
            <label style={{ display: 'block' }}>
              <span
                className="text-overline-muted"
                style={{ display: 'block', marginBottom: 6 }}
              >
                Status
              </span>
              <select value={form.status} onChange={field('status')} style={INPUT}>
                <option value="not_started">Not Started</option>
                <option value="in_progress">In Progress</option>
                <option value="live">Live</option>
                <option value="completed">Completed</option>
                <option value="delayed">Delayed</option>
                <option value="dropped">Dropped</option>
              </select>
            </label>
          </div>

          {/* Planned dates */}
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
                Planned Start
              </span>
              <input
                type="date"
                value={form.plannedStart}
                onChange={field('plannedStart')}
                style={INPUT}
              />
            </label>
            <label style={{ display: 'block' }}>
              <span
                className="text-overline-muted"
                style={{ display: 'block', marginBottom: 6 }}
              >
                Planned End
              </span>
              <input
                type="date"
                value={form.plannedEnd}
                onChange={field('plannedEnd')}
                style={INPUT}
              />
            </label>
          </div>

          {/* Actual dates */}
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
                Actual Start
              </span>
              <input
                type="date"
                value={form.actualStart}
                onChange={field('actualStart')}
                style={INPUT}
              />
            </label>
            <label style={{ display: 'block' }}>
              <span
                className="text-overline-muted"
                style={{ display: 'block', marginBottom: 6 }}
              >
                Actual End
              </span>
              <input
                type="date"
                value={form.actualEnd}
                onChange={field('actualEnd')}
                style={INPUT}
              />
            </label>
          </div>

          {/* Delay section */}
          <div
            style={{
              padding: '14px 16px',
              background: 'rgba(255,255,255,0.02)',
              borderRadius: 10,
              marginBottom: 14,
              border: '1px solid var(--border-subtle)',
            }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: form.isDelayed ? 12 : 0,
              }}
            >
              <span
                style={{
                  fontSize: 12,
                  fontWeight: 600,
                  color: 'var(--text-secondary)',
                }}
              >
                Delay tracking
              </span>
              <label
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  cursor: 'pointer',
                }}
              >
                <input
                  type="checkbox"
                  checked={form.isDelayed}
                  onChange={(e) =>
                    setForm((prev) => ({
                      ...prev,
                      isDelayed: e.target.checked,
                    }))
                  }
                />
                <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
                  Mark as delayed
                </span>
              </label>
            </div>
            {form.isDelayed && (
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr',
                  gap: 14,
                }}
              >
                <label style={{ display: 'block' }}>
                  <span
                    className="text-overline-muted"
                    style={{ display: 'block', marginBottom: 6 }}
                  >
                    Delay Category
                  </span>
                  <input
                    type="text"
                    value={form.delayCategory}
                    onChange={field('delayCategory')}
                    placeholder="e.g. Supply chain"
                    style={INPUT}
                  />
                </label>
                <label style={{ display: 'block' }}>
                  <span
                    className="text-overline-muted"
                    style={{ display: 'block', marginBottom: 6 }}
                  >
                    Days delayed
                  </span>
                  <input
                    type="number"
                    value={form.delayDays}
                    onChange={(e) =>
                      setForm((prev) => ({
                        ...prev,
                        delayDays: Number(e.target.value),
                      }))
                    }
                    min={0}
                    style={INPUT}
                  />
                </label>
                <label style={{ display: 'block', gridColumn: '1 / -1' }}>
                  <span
                    className="text-overline-muted"
                    style={{ display: 'block', marginBottom: 6 }}
                  >
                    Delay Reason
                  </span>
                  <textarea
                    value={form.delayReason}
                    onChange={field('delayReason')}
                    rows={2}
                    placeholder="Describe the delay reason…"
                    style={{ ...INPUT, resize: 'vertical' }}
                  />
                </label>
              </div>
            )}
          </div>

          {/* Assigned To */}
          <label style={{ display: 'block', marginBottom: 16 }}>
            <span
              className="text-overline-muted"
              style={{ display: 'block', marginBottom: 6 }}
            >
              Assigned To (email)
            </span>
            <input
              type="text"
              value={form.assignedTo}
              onChange={field('assignedTo')}
              placeholder="person@company.com"
              style={INPUT}
            />
          </label>

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
              {saving ? 'Saving…' : 'Save changes'}
            </button>
          </div>
        </form>
      </div>
    </>
  );
};
