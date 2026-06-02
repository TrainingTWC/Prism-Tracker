import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

/** List all active stores, ordered by store code. */
export const list = query({
  args: {},
  handler: async (ctx) => {
    const stores = await ctx.db.query("stores").collect();
    return stores
      .filter((s) => s.active)
      .sort((a, b) => a.storeCode.localeCompare(b.storeCode));
  },
});

export const getByCode = query({
  args: { storeCode: v.string() },
  handler: async (ctx, { storeCode }) => {
    return await ctx.db
      .query("stores")
      .withIndex("by_storeCode", (q) => q.eq("storeCode", storeCode))
      .unique();
  },
});

/**
 * Idempotent upsert keyed on `storeCode`. Re-importing the same store
 * updates it in place instead of creating a duplicate.
 */
export const upsert = mutation({
  args: {
    storeCode: v.string(),
    storeName: v.string(),
    areaManager: v.string(),
    region: v.string(),
    city: v.string(),
    storeFormat: v.string(),
    menuType: v.string(),
    coffeeMachine: v.string(),
    merrychefType: v.string(),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("stores")
      .withIndex("by_storeCode", (q) => q.eq("storeCode", args.storeCode))
      .unique();

    if (existing) {
      await ctx.db.patch(existing._id, { ...args, active: true });
      return existing._id;
    }
    return await ctx.db.insert("stores", { ...args, active: true });
  },
});
