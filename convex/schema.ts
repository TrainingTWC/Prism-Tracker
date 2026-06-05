import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";
import { authTables } from "@convex-dev/auth/server";

/**
 * Prism Tracker — Convex schema.
 *
 * `authTables` provides the Convex Auth tables (users, authAccounts,
 * authSessions, authVerifiers, etc.). We layer the domain model on top:
 * stores × initiatives → rollouts (the join table that powers the
 * "delayed due to…" engine).
 */
export default defineSchema({
  ...authTables,

  // Per-user app profile (role / region / avatar) keyed to the auth user.
  profiles: defineTable({
    userId: v.id("users"),
    name: v.string(),
    email: v.string(),
    role: v.union(v.literal("admin"), v.literal("editor"), v.literal("viewer"), v.literal("super_admin")),
    region: v.optional(v.string()),
    color: v.optional(v.string()),
  })
    .index("by_user", ["userId"])
    .index("by_email", ["email"]),

  // Master data — one row per outlet.
  stores: defineTable({
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
  })
    .index("by_storeCode", ["storeCode"])
    .index("by_region", ["region"])
    .index("by_areaManager", ["areaManager"]),

  initiatives: defineTable({
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
    imageUrl: v.optional(v.string()),
    variants: v.array(v.string()),
    regions: v.array(v.string()),
    cities: v.array(v.string()),
    vendor: v.optional(v.string()),
    plannedStart: v.optional(v.number()),
    plannedEnd: v.optional(v.number()),
    ownerEmail: v.optional(v.string()),
    notes: v.optional(v.string()),
  })
    .index("by_status", ["status"])
    .index("by_type", ["type"]),

  // The heart of the model: one store × one initiative.
  rollouts: defineTable({
    storeId: v.id("stores"),
    initiativeId: v.id("initiatives"),
    participating: v.boolean(),
    status: v.union(
      v.literal("not_started"),
      v.literal("in_progress"),
      v.literal("live"),
      v.literal("completed"),
      v.literal("delayed"),
      v.literal("dropped"),
    ),
    plannedStart: v.optional(v.number()),
    plannedEnd: v.optional(v.number()),
    actualStart: v.optional(v.number()),
    actualEnd: v.optional(v.number()),
    health: v.union(v.literal("green"), v.literal("amber"), v.literal("red")),
    isDelayed: v.boolean(),
    delayCategory: v.optional(v.string()),
    delayReason: v.optional(v.string()),
    delayDays: v.optional(v.number()),
    assignedTo: v.optional(v.string()),
    lastUpdatedBy: v.optional(v.string()),
  })
    .index("by_store", ["storeId"])
    .index("by_initiative", ["initiativeId"])
    .index("by_store_initiative", ["storeId", "initiativeId"])
    .index("by_status", ["status"])
    .index("by_health", ["health"])
    .index("by_delayed", ["isDelayed"]),

  milestones: defineTable({
    initiativeId: v.id("initiatives"),
    title: v.string(),
    dueDate: v.number(),
    status: v.union(v.literal("pending"), v.literal("done"), v.literal("missed")),
    scope: v.union(v.literal("all_stores"), v.literal("store")),
    storeId: v.optional(v.id("stores")),
  }).index("by_initiative", ["initiativeId"]),

  delayCategories: defineTable({
    key: v.string(),
    label: v.string(),
    color: v.string(),
  }).index("by_key", ["key"]),

  updates: defineTable({
    rolloutId: v.id("rollouts"),
    text: v.string(),
    kind: v.union(
      v.literal("note"),
      v.literal("status_change"),
      v.literal("delay"),
      v.literal("system"),
    ),
    authorEmail: v.string(),
    meta: v.optional(v.any()),
  }).index("by_rollout", ["rolloutId"]),

  alerts: defineTable({
    type: v.union(
      v.literal("slip"),
      v.literal("milestone_due"),
      v.literal("blocker"),
      v.literal("digest"),
    ),
    severity: v.union(
      v.literal("info"),
      v.literal("warning"),
      v.literal("critical"),
    ),
    message: v.string(),
    rolloutId: v.optional(v.id("rollouts")),
    initiativeId: v.optional(v.id("initiatives")),
    forEmail: v.optional(v.string()),
    read: v.boolean(),
  }).index("by_recipient", ["forEmail", "read"]),

  imports: defineTable({
    fileName: v.string(),
    importedBy: v.string(),
    rowsParsed: v.number(),
    storesUpserted: v.number(),
    initiativesUpserted: v.number(),
    rolloutsUpserted: v.number(),
    warnings: v.array(v.string()),
    status: v.union(
      v.literal("preview"),
      v.literal("committed"),
      v.literal("failed"),
    ),
  }),

  // ─── Project Tracking ───────────────────────────────────────────────────

  departments: defineTable({
    code: v.string(),           // e.g. "MKT", "OPS", "TECH"
    name: v.string(),           // e.g. "Marketing", "Operations"
    head: v.optional(v.string()),
    description: v.optional(v.string()),
    color: v.optional(v.string()),
    active: v.boolean(),
  })
    .index("by_code", ["code"])
    .index("by_active", ["active"]),

  projects: defineTable({
    departmentId: v.id("departments"),
    title: v.string(),
    description: v.optional(v.string()),
    status: v.union(
      v.literal("planned"),
      v.literal("active"),
      v.literal("on_hold"),
      v.literal("completed"),
      v.literal("cancelled"),
    ),
    priority: v.union(
      v.literal("low"),
      v.literal("medium"),
      v.literal("high"),
      v.literal("critical"),
    ),
    ownerEmail: v.optional(v.string()),
    startDate: v.optional(v.number()),
    endDate: v.optional(v.number()),
  })
    .index("by_department", ["departmentId"])
    .index("by_status", ["status"])
    .index("by_priority", ["priority"]),

  tasks: defineTable({
    projectId: v.id("projects"),
    title: v.string(),
    description: v.optional(v.string()),
    status: v.union(
      v.literal("todo"),
      v.literal("in_progress"),
      v.literal("review"),
      v.literal("done"),
    ),
    priority: v.union(
      v.literal("low"),
      v.literal("medium"),
      v.literal("high"),
      v.literal("critical"),
    ),
    assignedTo: v.optional(v.string()),
    dueDate: v.optional(v.number()),
    completedAt: v.optional(v.number()),
  })
    .index("by_project", ["projectId"])
    .index("by_status", ["status"]),

  // ─── Intelligence Integration Cache ─────────────────────────────────────

  /** Employee master synced from Prism Intelligence (hourly). */
  employees: defineTable({
    employeeId: v.string(),           // primary key from Intelligence
    name: v.string(),
    designation: v.optional(v.string()),
    departmentCode: v.optional(v.string()), // matches departments.code
    email: v.optional(v.string()),
    phone: v.optional(v.string()),
    active: v.boolean(),
    lastSyncedAt: v.number(),
  })
    .index("by_employeeId", ["employeeId"])
    .index("by_departmentCode", ["departmentCode"])
    .index("by_active", ["active"]),

  /** Calendar events cached from Prism Intelligence (hourly). */
  cachedCalendarEvents: defineTable({
    source: v.literal("intelligence"),
    externalId: v.string(),
    title: v.string(),
    date: v.number(),
    endDate: v.optional(v.number()),
    kind: v.string(),
    color: v.optional(v.string()),
    lastSyncedAt: v.number(),
  })
    .index("by_source", ["source"])
    .index("by_date", ["date"]),
});
