/**
 * Single source-of-truth React hook for all dashboard data.
 * Pulls listDetailed once (rollouts joined with store + initiative)
 * and derives every aggregate downstream views need.
 */
import { useQuery } from 'convex/react';
import { useMemo } from 'react';
import { api } from '../../convex/_generated/api';

export interface DetailedRollout {
  _id: string;
  storeId: string;
  initiativeId: string;
  participating: boolean;
  status: string;
  plannedStart?: number;
  plannedEnd?: number;
  actualStart?: number;
  actualEnd?: number;
  health: 'green' | 'amber' | 'red';
  isDelayed: boolean;
  delayCategory?: string;
  delayReason?: string;
  delayDays?: number;
  assignedTo?: string;
  lastUpdatedBy?: string;
  store: any;
  initiative: any;
}

export function useTrackerData() {
  const rollouts = useQuery(api.rollouts.listDetailed) as DetailedRollout[] | undefined;
  const stores = useQuery(api.stores.list) as any[] | undefined;
  const initiatives = useQuery(api.initiatives.list) as any[] | undefined;
  const delayCategories = useQuery(api.delayCategories.list) as any[] | undefined;

  return useMemo(() => {
    const loading =
      rollouts === undefined || stores === undefined || initiatives === undefined;
    const safe = rollouts || [];
    const participating = safe.filter((r) => r.participating);
    const onTrack = participating.filter((r) => r.health === 'green').length;
    const atRisk = participating.filter((r) => r.health === 'amber').length;
    const delayed = participating.filter((r) => r.health === 'red').length;
    const totalParticipating = participating.length;
    const estateHealthPct =
      totalParticipating > 0 ? Math.round((onTrack / totalParticipating) * 100) : 0;
    return {
      loading,
      rollouts: safe,
      stores: stores || [],
      initiatives: initiatives || [],
      delayCategories: delayCategories || [],
      kpis: {
        totalParticipating,
        onTrack,
        atRisk,
        delayed,
        estateHealthPct,
        totalStores: stores?.length || 0,
        totalInitiatives: initiatives?.length || 0,
        coverage:
          stores && stores.length > 0
            ? Math.round(
                (new Set(participating.map((r) => r.storeId)).size / stores.length) * 100,
              )
            : 0,
        avgDelayDays:
          delayed > 0
            ? Math.round(
                participating
                  .filter((r) => r.isDelayed && r.delayDays)
                  .reduce((s, r) => s + (r.delayDays || 0), 0) / delayed,
              )
            : 0,
      },
    };
  }, [rollouts, stores, initiatives, delayCategories]);
}
