/**
 * Health, status, and color helpers shared across all views.
 */

export const HEALTH_COLOR = {
  green: '#22C55E',
  amber: '#EAB308',
  red: '#EF4444',
} as const;

export const HEALTH_LABEL = {
  green: 'ON TRACK',
  amber: 'AT RISK',
  red: 'DELAYED',
} as const;

export const STATUS_LABEL: Record<string, string> = {
  not_started: 'Not started',
  in_progress: 'Active',
  live: 'Live',
  completed: 'Done',
  delayed: 'Delayed',
  dropped: 'Dropped',
};

export const STATUS_COLOR: Record<string, string> = {
  not_started: '#7A7A88',
  in_progress: '#3B82F6',
  live: '#22C55E',
  completed: '#22C55E',
  delayed: '#EF4444',
  dropped: '#EF4444',
};

export const INITIATIVE_TYPE_COLOR: Record<string, string> = {
  trial: '#3B82F6',
  launch: '#22C55E',
  pilot: '#EAB308',
  transition: '#A855F7',
};

export const DELAY_CATEGORY_COLOR: Record<string, string> = {
  equipment: '#EF4444',
  supply: '#F59E0B',
  vendor: '#EAB308',
  staffing: '#A855F7',
  store_ops: '#06B6D4',
  approval: '#3B82F6',
  logistics: '#F97316',
  recipe: '#EC4899',
  other: '#7A7A88',
};

export function fmtDate(ts?: number): string {
  if (!ts) return '—';
  const d = new Date(ts);
  return d.toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: '2-digit',
  });
}

export function fmtRelative(ts?: number): string {
  if (!ts) return '—';
  const diff = Date.now() - ts;
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}d ago`;
  return fmtDate(ts);
}

export function pct(num: number, denom: number): number {
  if (denom === 0) return 0;
  return Math.round((num / denom) * 100);
}
