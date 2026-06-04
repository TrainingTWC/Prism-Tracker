import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { Doc, Id } from "./_generated/dataModel";

const DAY = 24 * 60 * 60 * 1000;

/**
 * Health scoring (see docs/FEATURES.md#health-scoring):
 *  - red   : delayed, or past planned end without going live
 *  - amber : within 7 days of planned end and not yet live, or delayed flag set
 *  - green : on track / live / completed
 */
function computeHealth(r: {
  status: string;
  isDelayed: boolean;
  plannedEnd?: number;
  actualEnd?: number;
}): "green" | "amber" | "red" {
  const now = Date.now();
  if (r.status === "completed" || r.status === "live") return "green";
  if (r.status === "dropped") return "red";
  if (r.isDelayed) return "red";
  if (r.plannedEnd && !r.actualEnd) {
    if (now > r.plannedEnd) return "red";
    if (r.plannedEnd - now <= 7 * DAY) return "amber";
  }
  return "green";
}

/** All rollouts joined with their store + initiative for dashboard rendering. */
export const listDetailed = query({
  args: {},
  handler: async (ctx) => {
    const rollouts = await ctx.db.query("rollouts").collect();
    const result = [];
    for (const r of rollouts) {
      const store = await ctx.db.get(r.storeId);
      const initiative = await ctx.db.get(r.initiativeId);
      result.push({ ...r, store, initiative });
    }
    return result;
  },
});

export const byInitiative = query({
  args: { initiativeId: v.id("initiatives") },
  handler: async (ctx, { initiativeId }) => {
    const rollouts = await ctx.db
      .query("rollouts")
      .withIndex("by_initiative", (q) => q.eq("initiativeId", initiativeId))
      .collect();
    const result = [];
    for (const r of rollouts) {
      const store = await ctx.db.get(r.storeId);
      result.push({ ...r, store });
    }
    return result;
  },
});

/**
 * Idempotent upsert keyed on (storeId, initiativeId) via the
 * `by_store_initiative` index — the import idempotency key.
 */
export const upsert = mutation({
  args: {
    storeId: v.id("stores"),
    initiativeId: v.id("initiatives"),
    participating: v.boolean(),
    plannedStart: v.optional(v.number()),
    plannedEnd: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("rollouts")
      .withIndex("by_store_initiative", (q) =>
        q.eq("storeId", args.storeId).eq("initiativeId", args.initiativeId),
      )
      .unique();

    if (existing) {
      await ctx.db.patch(existing._id, {
        participating: args.participating,
        plannedStart: args.plannedStart ?? existing.plannedStart,
        plannedEnd: args.plannedEnd ?? existing.plannedEnd,
      });
      const updated = (await ctx.db.get(existing._id)) as Doc<"rollouts">;
      await ctx.db.patch(existing._id, { health: computeHealth(updated) });
      return existing._id;
    }

    const id = await ctx.db.insert("rollouts", {
      storeId: args.storeId,
      initiativeId: args.initiativeId,
      participating: args.participating,
      status: "not_started",
      plannedStart: args.plannedStart,
      plannedEnd: args.plannedEnd,
      health: "green",
      isDelayed: false,
    });
    const created = (await ctx.db.get(id)) as Doc<"rollouts">;
    await ctx.db.patch(id, { health: computeHealth(created) });
    return id;
  },
});

export const setStatus = mutation({
  args: {
    id: v.id("rollouts"),
    status: v.union(
      v.literal("not_started"),
      v.literal("in_progress"),
      v.literal("live"),
      v.literal("completed"),
      v.literal("delayed"),
      v.literal("dropped"),
    ),
    actualStart: v.optional(v.number()),
    actualEnd: v.optional(v.number()),
    authorEmail: v.optional(v.string()),
  },
  handler: async (ctx, { id, status, actualStart, actualEnd, authorEmail }) => {
    const current = await ctx.db.get(id);
    if (!current) throw new Error("Rollout not found");

    const patch: Partial<Doc<"rollouts">> = { status };
    if (actualStart !== undefined) patch.actualStart = actualStart;
    if (actualEnd !== undefined) patch.actualEnd = actualEnd;
    if (status === "live" && !current.actualStart)
      patch.actualStart = Date.now();
    if (status === "completed" && !current.actualEnd)
      patch.actualEnd = Date.now();

    await ctx.db.patch(id, patch);
    const updated = (await ctx.db.get(id)) as Doc<"rollouts">;
    await ctx.db.patch(id, { health: computeHealth(updated) });

    await ctx.db.insert("updates", {
      rolloutId: id,
      text: `Status changed to ${status}`,
      kind: "status_change",
      authorEmail: authorEmail ?? "system",
      meta: { from: current.status, to: status },
    });
  },
});

/** The "delayed due to…" engine. */
export const reportDelay = mutation({
  args: {
    id: v.id("rollouts"),
    delayCategory: v.string(),
    delayReason: v.string(),
    newPlannedEnd: v.optional(v.number()),
    authorEmail: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const current = await ctx.db.get(args.id);
    if (!current) throw new Error("Rollout not found");

    let delayDays = current.delayDays;
    if (args.newPlannedEnd && current.plannedEnd) {
      delayDays = Math.max(
        0,
        Math.round((args.newPlannedEnd - current.plannedEnd) / DAY),
      );
    }

    await ctx.db.patch(args.id, {
      status: "delayed",
      isDelayed: true,
      delayCategory: args.delayCategory,
      delayReason: args.delayReason,
      delayDays,
      plannedEnd: args.newPlannedEnd ?? current.plannedEnd,
    });
    const updated = (await ctx.db.get(args.id)) as Doc<"rollouts">;
    await ctx.db.patch(args.id, { health: computeHealth(updated) });

    await ctx.db.insert("updates", {
      rolloutId: args.id,
      text: `Delayed due to ${args.delayReason}`,
      kind: "delay",
      authorEmail: args.authorEmail ?? "system",
      meta: { category: args.delayCategory, delayDays },
    });

    await ctx.db.insert("alerts", {
      type: "slip",
      severity: "warning",
      message: `${current.assignedTo ?? "A store"} rollout delayed: ${args.delayReason}`,
      rolloutId: args.id,
      initiativeId: current.initiativeId,
      forEmail: current.assignedTo,
      read: false,
    });
  },
});

export const updatesForRollout = query({
  args: { rolloutId: v.id("rollouts") },
  handler: async (ctx, { rolloutId }) => {
    return await ctx.db
      .query("updates")
      .withIndex("by_rollout", (q) => q.eq("rolloutId", rolloutId))
      .order("desc")
      .collect();
  },
});

/** Full admin patch — update any rollout field then recompute health. */
export const adminPatch = mutation({
  args: {
    id: v.id("rollouts"),
    participating: v.optional(v.boolean()),
    status: v.optional(
      v.union(
        v.literal("not_started"),
        v.literal("in_progress"),
        v.literal("live"),
        v.literal("completed"),
        v.literal("delayed"),
        v.literal("dropped"),
      ),
    ),
    plannedStart: v.optional(v.number()),
    plannedEnd: v.optional(v.number()),
    actualStart: v.optional(v.number()),
    actualEnd: v.optional(v.number()),
    isDelayed: v.optional(v.boolean()),
    delayCategory: v.optional(v.string()),
    delayReason: v.optional(v.string()),
    delayDays: v.optional(v.number()),
    assignedTo: v.optional(v.string()),
  },
  handler: async (ctx, { id, ...fields }) => {
    await ctx.db.patch(id, fields);
    const updated = (await ctx.db.get(id)) as Doc<"rollouts">;
    if (updated) await ctx.db.patch(id, { health: computeHealth(updated) });
  },
});

/** Hard-delete a rollout record. */
export const remove = mutation({
  args: { id: v.id("rollouts") },
  handler: async (ctx, { id }) => {
    await ctx.db.delete(id);
  },
});
