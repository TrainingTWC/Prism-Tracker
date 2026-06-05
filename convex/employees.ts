import {
  query,
  internalMutation,
  internalAction,
  action,
} from "./_generated/server";
import { v } from "convex/values";
import { internal } from "./_generated/api";

// ─── Queries ──────────────────────────────────────────────────────────────

/** Active employees, optionally filtered by department code. */
export const list = query({
  args: { departmentCode: v.optional(v.string()) },
  handler: async (ctx, { departmentCode }) => {
    if (departmentCode) {
      return await ctx.db
        .query("employees")
        .withIndex("by_departmentCode", (q) =>
          q.eq("departmentCode", departmentCode)
        )
        .filter((q) => q.eq(q.field("active"), true))
        .collect();
    }
    return await ctx.db
      .query("employees")
      .withIndex("by_active", (q) => q.eq("active", true))
      .collect();
  },
});

/** All employees including inactive (admin use). */
export const listAll = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("employees").collect();
  },
});

/** Sync status for the settings panel. */
export const syncStatus = query({
  args: {},
  handler: async (ctx) => {
    const all = await ctx.db.query("employees").collect();
    const lastSynced =
      all.length > 0 ? Math.max(...all.map((e) => e.lastSyncedAt)) : null;
    return { count: all.length, lastSynced };
  },
});

// ─── Internal mutations ───────────────────────────────────────────────────

/** Upsert a batch of employees keyed on employeeId. */
export const upsertBatch = internalMutation({
  args: {
    employees: v.array(
      v.object({
        employeeId: v.string(),
        name: v.string(),
        designation: v.optional(v.string()),
        departmentCode: v.optional(v.string()),
        email: v.optional(v.string()),
        phone: v.optional(v.string()),
        active: v.optional(v.boolean()),
      })
    ),
  },
  handler: async (ctx, { employees }) => {
    const now = Date.now();
    for (const emp of employees) {
      const existing = await ctx.db
        .query("employees")
        .withIndex("by_employeeId", (q) => q.eq("employeeId", emp.employeeId))
        .unique();
      const row = {
        employeeId: emp.employeeId,
        name: emp.name,
        designation: emp.designation,
        departmentCode: emp.departmentCode,
        email: emp.email,
        phone: emp.phone,
        active: emp.active ?? true,
        lastSyncedAt: now,
      };
      if (existing) {
        await ctx.db.patch(existing._id, row);
      } else {
        await ctx.db.insert("employees", row);
      }
    }
  },
});

// ─── Sync action ──────────────────────────────────────────────────────────

/**
 * Pull employee master from Prism Intelligence.
 * Requires env vars INTELLIGENCE_APP_URL and INTEGRATION_API_KEY.
 * Called by cron every hour; can also be triggered manually via forceSync.
 *
 * Intelligence must expose: GET {INTELLIGENCE_APP_URL}/api/employees
 * Response: Array<{ employeeId, name, designation?, departmentCode?, email?, phone?, active? }>
 */
export const syncFromIntelligence = internalAction({
  args: {},
  handler: async (ctx) => {
    const url = process.env.INTELLIGENCE_APP_URL;
    const apiKey = process.env.INTEGRATION_API_KEY;
    if (!url || !apiKey) {
      console.log(
        "[employees] INTELLIGENCE_APP_URL or INTEGRATION_API_KEY not set — skipping sync"
      );
      return;
    }
    const res = await fetch(`${url}/api/employees`, {
      headers: { Authorization: `Bearer ${apiKey}` },
    });
    if (!res.ok) {
      console.error(`[employees] Intelligence returned HTTP ${res.status}`);
      return;
    }
    const data = await res.json();
    if (!Array.isArray(data)) {
      console.error("[employees] Unexpected response shape — expected array");
      return;
    }
    // Process in batches of 100 to stay within Convex document-write limits
    const BATCH = 100;
    for (let i = 0; i < data.length; i += BATCH) {
      await ctx.runMutation(internal.employees.upsertBatch, {
        employees: data.slice(i, i + BATCH),
      });
    }
    console.log(`[employees] Synced ${data.length} employees from Intelligence`);
  },
});

/** Public action — allows an admin to trigger an immediate sync from the UI. */
export const forceSync = action({
  args: {},
  handler: async (ctx) => {
    await ctx.runAction(internal.employees.syncFromIntelligence, {});
  },
});
