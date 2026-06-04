import {
  query,
  internalQuery,
  internalMutation,
  internalAction,
  action,
} from "./_generated/server";
import { v } from "convex/values";
import { internal } from "./_generated/api";

// ─── Queries ──────────────────────────────────────────────────────────────

/** All cached Intelligence calendar events — used by CalendarView to merge. */
export const listCachedEvents = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("cachedCalendarEvents").collect();
  },
});

/** Sync status for the settings panel. */
export const syncStatus = query({
  args: {},
  handler: async (ctx) => {
    const all = await ctx.db.query("cachedCalendarEvents").collect();
    const lastSynced =
      all.length > 0 ? Math.max(...all.map((e) => e.lastSyncedAt)) : null;
    return { count: all.length, lastSynced };
  },
});

// ─── Internal queries ─────────────────────────────────────────────────────

/**
 * Builds the Tracker event feed that Intelligence consumes via GET /api/calendar.
 * Returns initiative start/end dates and milestone due dates as standardised events.
 */
export const buildTrackerEvents = internalQuery({
  args: {},
  handler: async (ctx) => {
    const initiatives = await ctx.db.query("initiatives").collect();
    const milestones = await ctx.db.query("milestones").collect();
    const events: {
      id: string;
      title: string;
      date: number;
      endDate?: number;
      kind: string;
      color: string;
    }[] = [];

    for (const init of initiatives) {
      if (init.plannedStart)
        events.push({
          id: `init-start-${init._id}`,
          title: `${init.name} — starts`,
          date: init.plannedStart,
          kind: "initiative_start",
          color: "#3B82F6",
        });
      if (init.plannedEnd)
        events.push({
          id: `init-end-${init._id}`,
          title: `${init.name} — deadline`,
          date: init.plannedEnd,
          kind: "initiative_end",
          color: "#EAB308",
        });
    }
    for (const ms of milestones) {
      events.push({
        id: `ms-${ms._id}`,
        title: ms.title,
        date: ms.dueDate,
        kind: "milestone",
        color:
          ms.status === "done"
            ? "#22C55E"
            : ms.status === "missed"
            ? "#EF4444"
            : "#A855F7",
      });
    }
    return events;
  },
});

// ─── Internal mutations ───────────────────────────────────────────────────

/** Replace all cached Intelligence events atomically. */
export const replaceAll = internalMutation({
  args: {
    events: v.array(
      v.object({
        id: v.string(),
        title: v.string(),
        date: v.number(),
        endDate: v.optional(v.number()),
        kind: v.optional(v.string()),
        color: v.optional(v.string()),
      })
    ),
  },
  handler: async (ctx, { events }) => {
    // Wipe existing cache
    const existing = await ctx.db.query("cachedCalendarEvents").collect();
    for (const e of existing) await ctx.db.delete(e._id);
    // Insert fresh
    const now = Date.now();
    for (const e of events) {
      await ctx.db.insert("cachedCalendarEvents", {
        source: "intelligence",
        externalId: e.id,
        title: e.title,
        date: e.date,
        endDate: e.endDate,
        kind: e.kind ?? "event",
        color: e.color,
        lastSyncedAt: now,
      });
    }
  },
});

// ─── Sync action ──────────────────────────────────────────────────────────

/**
 * Pull calendar events from Prism Intelligence.
 * Requires env vars INTELLIGENCE_APP_URL and INTEGRATION_API_KEY.
 *
 * Intelligence must expose: GET {INTELLIGENCE_APP_URL}/api/calendar
 * Response: Array<{ id, title, date (ms), endDate?, kind?, color? }>
 */
export const syncFromIntelligence = internalAction({
  args: {},
  handler: async (ctx) => {
    const url = process.env.INTELLIGENCE_APP_URL;
    const apiKey = process.env.INTEGRATION_API_KEY;
    if (!url || !apiKey) {
      console.log("[calendarSync] env vars not set — skipping");
      return;
    }
    const res = await fetch(`${url}/api/calendar`, {
      headers: { Authorization: `Bearer ${apiKey}` },
    });
    if (!res.ok) {
      console.error(`[calendarSync] Intelligence returned HTTP ${res.status}`);
      return;
    }
    const data = await res.json();
    if (!Array.isArray(data)) {
      console.error("[calendarSync] Unexpected response shape — expected array");
      return;
    }
    await ctx.runMutation(internal.calendarSync.replaceAll, { events: data });
    console.log(`[calendarSync] Synced ${data.length} events from Intelligence`);
  },
});

/** Public action — allows an admin to trigger an immediate calendar sync from the UI. */
export const forceSync = action({
  args: {},
  handler: async (ctx) => {
    await ctx.runAction(internal.calendarSync.syncFromIntelligence, {});
  },
});
