import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

const PROJECT_STATUS = v.union(
  v.literal("planned"),
  v.literal("active"),
  v.literal("on_hold"),
  v.literal("completed"),
  v.literal("cancelled"),
);

const PRIORITY = v.union(
  v.literal("low"),
  v.literal("medium"),
  v.literal("high"),
  v.literal("critical"),
);

const TASK_STATUS = v.union(
  v.literal("todo"),
  v.literal("in_progress"),
  v.literal("review"),
  v.literal("done"),
);

// ─── Projects ──────────────────────────────────────────────────────────────

export const list = query({
  args: { departmentId: v.optional(v.id("departments")) },
  handler: async (ctx, { departmentId }) => {
    const all = departmentId
      ? await ctx.db
          .query("projects")
          .withIndex("by_department", (q) => q.eq("departmentId", departmentId))
          .collect()
      : await ctx.db.query("projects").collect();
    return all.sort((a, b) => a.title.localeCompare(b.title));
  },
});

export const get = query({
  args: { id: v.id("projects") },
  handler: async (ctx, { id }) => {
    const project = await ctx.db.get(id);
    if (!project) return null;
    const department = await ctx.db.get(project.departmentId);
    const tasks = await ctx.db
      .query("tasks")
      .withIndex("by_project", (q) => q.eq("projectId", id))
      .collect();
    return { ...project, department, tasks };
  },
});

export const create = mutation({
  args: {
    departmentId: v.id("departments"),
    title: v.string(),
    description: v.optional(v.string()),
    status: PROJECT_STATUS,
    priority: PRIORITY,
    ownerEmail: v.optional(v.string()),
    startDate: v.optional(v.number()),
    endDate: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    return ctx.db.insert("projects", args);
  },
});

export const update = mutation({
  args: {
    id: v.id("projects"),
    departmentId: v.id("departments"),
    title: v.string(),
    description: v.optional(v.string()),
    status: PROJECT_STATUS,
    priority: PRIORITY,
    ownerEmail: v.optional(v.string()),
    startDate: v.optional(v.number()),
    endDate: v.optional(v.number()),
  },
  handler: async (ctx, { id, ...fields }) => {
    await ctx.db.patch(id, fields);
  },
});

export const remove = mutation({
  args: { id: v.id("projects") },
  handler: async (ctx, { id }) => {
    // Remove all tasks first
    const tasks = await ctx.db
      .query("tasks")
      .withIndex("by_project", (q) => q.eq("projectId", id))
      .collect();
    for (const t of tasks) await ctx.db.delete(t._id);
    await ctx.db.delete(id);
  },
});

// ─── Tasks ─────────────────────────────────────────────────────────────────

export const listTasks = query({
  args: { projectId: v.id("projects") },
  handler: async (ctx, { projectId }) => {
    return ctx.db
      .query("tasks")
      .withIndex("by_project", (q) => q.eq("projectId", projectId))
      .collect();
  },
});

export const createTask = mutation({
  args: {
    projectId: v.id("projects"),
    title: v.string(),
    description: v.optional(v.string()),
    status: TASK_STATUS,
    priority: PRIORITY,
    assignedTo: v.optional(v.string()),
    dueDate: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    return ctx.db.insert("tasks", args);
  },
});

export const updateTask = mutation({
  args: {
    id: v.id("tasks"),
    title: v.optional(v.string()),
    description: v.optional(v.string()),
    status: v.optional(TASK_STATUS),
    priority: v.optional(PRIORITY),
    assignedTo: v.optional(v.string()),
    dueDate: v.optional(v.number()),
    completedAt: v.optional(v.number()),
  },
  handler: async (ctx, { id, ...fields }) => {
    // Filter out undefined values
    const patch: Record<string, any> = {};
    for (const [k, val] of Object.entries(fields)) {
      if (val !== undefined) patch[k] = val;
    }
    await ctx.db.patch(id, patch);
  },
});

export const removeTask = mutation({
  args: { id: v.id("tasks") },
  handler: async (ctx, { id }) => {
    await ctx.db.delete(id);
  },
});
