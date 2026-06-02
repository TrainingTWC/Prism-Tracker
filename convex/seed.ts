import { mutation } from "./_generated/server";

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
