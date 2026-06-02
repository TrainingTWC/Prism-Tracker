import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

export const list = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("initiatives").order("desc").collect();
  },
});

export const get = query({
  args: { id: v.id("initiatives") },
  handler: async (ctx, { id }) => ctx.db.get(id),
});

/** Find an initiative by its (unique) name — used by the importer. */
export const getByName = query({
  args: { name: v.string() },
  handler: async (ctx, { name }) => {
    const all = await ctx.db.query("initiatives").collect();
    return all.find((i) => i.name === name) ?? null;
  },
});

const initiativeFields = {
  name: v.string(),
  type: v.union(
    v.literal("trial"),
    v.literal("launch"),
    v.literal("pilot"),
    v.literal("transition"),
  ),
  status: v.union(
    v.literal("planned"),
    v.literal("active"),
    v.literal("completed"),
    v.literal("paused"),
    v.literal("cancelled"),
  ),
  productCategory: v.optional(v.string()),
  variants: v.array(v.string()),
  regions: v.array(v.string()),
  cities: v.array(v.string()),
  vendor: v.optional(v.string()),
  plannedStart: v.number(),
  plannedEnd: v.optional(v.number()),
  ownerEmail: v.optional(v.string()),
  notes: v.optional(v.string()),
};

/** Idempotent upsert keyed on initiative `name`. */
export const upsert = mutation({
  args: initiativeFields,
  handler: async (ctx, args) => {
    const all = await ctx.db.query("initiatives").collect();
    const existing = all.find((i) => i.name === args.name);
    if (existing) {
      await ctx.db.patch(existing._id, args);
      return existing._id;
    }
    return await ctx.db.insert("initiatives", args);
  },
});

export const update = mutation({
  args: { id: v.id("initiatives"), patch: v.object(initiativeFields) },
  handler: async (ctx, { id, patch }) => {
    await ctx.db.patch(id, patch);
  },
});
