import { mutation } from "./_generated/server";
import { v } from "convex/values";

/**
 * Seed the controlled delay-category vocabulary (see docs/FEATURES.md).
 * Idempotent: skips any category whose key already exists.
 * Run once after `convex dev`:  npx convex run seed:delayCategories
 */
const CATEGORIES: { key: string; label: string; color: string }[] = [
  { key: "equipment", label: "Equipment not installed", color: "#3B82F6" },
  { key: "supply", label: "Supply / ingredient shortage", color: "#6366F1" },
  { key: "vendor", label: "Vendor / supplier delay", color: "#8B5CF6" },
  { key: "staffing", label: "Staffing / training gap", color: "#0EA5E9" },
  { key: "store_ops", label: "Store operations issue", color: "#14B8A6" },
  { key: "approval", label: "Pending approval / sign-off", color: "#F59E0B" },
  { key: "logistics", label: "Logistics / delivery", color: "#EF4444" },
  { key: "recipe", label: "Recipe / quality rework", color: "#EC4899" },
  { key: "other", label: "Other", color: "#64748B" },
];

export const delayCategories = mutation({
  args: {},
  handler: async (ctx) => {
    let inserted = 0;
    for (const cat of CATEGORIES) {
      const existing = await ctx.db
        .query("delayCategories")
        .withIndex("by_key", (q) => q.eq("key", cat.key))
        .unique();
      if (!existing) {
        await ctx.db.insert("delayCategories", cat);
        inserted++;
      }
    }
    return { inserted, total: CATEGORIES.length };
  },
});

/**
 * Seed known Third Wave Coffee initiatives.
 * Idempotent — skips initiatives whose name already exists.
 * Run: npx convex run seed:sampleInitiatives
 *      npx convex run --prod seed:sampleInitiatives
 */
const SAMPLE_INITIATIVES: {
  name: string; type: string; status: string;
  vendor?: string; productCategory?: string;
  plannedStart: number; plannedEnd?: number;
  regions: string[]; notes?: string;
}[] = [
  {
    name: "Masala Chai Powder",
    type: "trial", status: "active",
    vendor: "Olam", productCategory: "Beverages",
    plannedStart: new Date("2025-07-01").getTime(),
    plannedEnd: new Date("2025-09-30").getTime(),
    regions: ["North", "NCR", "South"],
    notes: "RTD chai base trial across high-traffic outlets",
  },
  {
    name: "Dilicia Milk",
    type: "launch", status: "active",
    vendor: "Dilicia", productCategory: "Dairy",
    plannedStart: new Date("2025-06-01").getTime(),
    plannedEnd: new Date("2025-12-31").getTime(),
    regions: ["All"],
    notes: "Nationwide oat-milk alternative launch",
  },
  {
    name: "Yoga Bar Oat Milk",
    type: "pilot", status: "planned",
    vendor: "ITC / Yoga Bar", productCategory: "Dairy",
    plannedStart: new Date("2025-09-01").getTime(),
    plannedEnd: new Date("2025-11-30").getTime(),
    regions: ["Bangalore", "Mumbai"],
    notes: "Premium oat milk pilot in metro flagship stores",
  },
  {
    name: "Napoli Margherita Pizza",
    type: "launch", status: "active",
    productCategory: "Food",
    plannedStart: new Date("2025-05-15").getTime(),
    regions: ["North", "NCR"],
    notes: "Wood-fired pizza launch via Merrychef oven",
  },
  {
    name: "Vanilla Frappe",
    type: "trial", status: "active",
    productCategory: "Beverages",
    plannedStart: new Date("2025-07-15").getTime(),
    plannedEnd: new Date("2025-10-15").getTime(),
    regions: ["South", "Bangalore", "Mumbai"],
    notes: "Summer seasonal frappe; requires blender kit",
  },
  {
    name: "Pasta Pilot",
    type: "pilot", status: "planned",
    productCategory: "Food",
    plannedStart: new Date("2025-08-01").getTime(),
    plannedEnd: new Date("2025-09-30").getTime(),
    regions: ["Bangalore"],
    notes: "Merrychef pasta pilot — 10 stores only",
  },
];

export const sampleInitiatives = mutation({
  args: {},
  handler: async (ctx) => {
    let inserted = 0;
    for (const ini of SAMPLE_INITIATIVES) {
      const existing = await ctx.db
        .query("initiatives")
        .filter((q) => q.eq(q.field("name"), ini.name))
        .unique();
      if (!existing) {
        await ctx.db.insert("initiatives", {
          name: ini.name,
          type: ini.type as any,
          status: ini.status as any,
          vendor: ini.vendor,
          productCategory: ini.productCategory,
          variants: [],
          regions: ini.regions,
          cities: [],
          plannedStart: ini.plannedStart,
          plannedEnd: ini.plannedEnd,
          notes: ini.notes,
        });
        inserted++;
      }
    }
    return { inserted, total: SAMPLE_INITIATIVES.length };
  },
});
