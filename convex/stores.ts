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

/** Update every field of an existing store by its Convex ID. */
export const update = mutation({
  args: {
    id: v.id("stores"),
    storeCode: v.string(),
    storeName: v.string(),
    areaManager: v.string(),
    region: v.string(),
    city: v.string(),
    storeFormat: v.string(),
    menuType: v.string(),
    coffeeMachine: v.string(),
    merrychefType: v.string(),
    active: v.boolean(),
  },
  handler: async (ctx, { id, ...fields }) => {
    await ctx.db.patch(id, fields);
  },
});

/** Soft-delete a store (sets active = false). */
export const remove = mutation({
  args: { id: v.id("stores") },
  handler: async (ctx, { id }) => {
    await ctx.db.patch(id, { active: false });
  },
});

/** List ALL stores including inactive — used by admin views. */
export const listAll = query({
  args: {},
  handler: async (ctx) => {
    return (await ctx.db.query("stores").collect()).sort((a, b) =>
      a.storeCode.localeCompare(b.storeCode),
    );
  },
});
