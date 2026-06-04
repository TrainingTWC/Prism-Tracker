import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const list = query({
  args: {},
  handler: async (ctx) => {
    return ctx.db
      .query("departments")
      .filter((q) => q.eq(q.field("active"), true))
      .collect()
      .then((rows) => rows.sort((a, b) => a.name.localeCompare(b.name)));
  },
});

export const listAll = query({
  args: {},
  handler: async (ctx) => {
    return ctx.db
      .query("departments")
      .collect()
      .then((rows) => rows.sort((a, b) => a.name.localeCompare(b.name)));
  },
});

export const create = mutation({
  args: {
    code: v.string(),
    name: v.string(),
    head: v.optional(v.string()),
    description: v.optional(v.string()),
    color: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    return ctx.db.insert("departments", { ...args, active: true });
  },
});

export const update = mutation({
  args: {
    id: v.id("departments"),
    code: v.string(),
    name: v.string(),
    head: v.optional(v.string()),
    description: v.optional(v.string()),
    color: v.optional(v.string()),
    active: v.boolean(),
  },
  handler: async (ctx, { id, ...fields }) => {
    await ctx.db.patch(id, fields);
  },
});

export const remove = mutation({
  args: { id: v.id("departments") },
  handler: async (ctx, { id }) => {
    // Soft-delete: mark inactive
    await ctx.db.patch(id, { active: false });
  },
});
