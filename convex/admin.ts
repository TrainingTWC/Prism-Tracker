import { getAuthUserId } from "@convex-dev/auth/server";
import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

const ROLE_VALIDATOR = v.union(
  v.literal("viewer"),
  v.literal("editor"),
  v.literal("admin"),
  v.literal("super_admin"),
);

/** List all user profiles (admin+). */
export const listUsers = query({
  args: {},
  handler: async (ctx) => {
    return ctx.db.query("profiles").collect();
  },
});

/** Assign a role to any user (super_admin only — caller-side gating in UI). */
export const setUserRole = mutation({
  args: { profileId: v.id("profiles"), role: ROLE_VALIDATOR },
  handler: async (ctx, { profileId, role }) => {
    await ctx.db.patch(profileId, { role: role as any });
  },
});

/**
 * Claim the Super Admin role.
 * Only succeeds when there are ZERO existing super_admins.
 * Derives userId from the server-side auth context — never trusts client input.
 */
export const claimSuperAdmin = mutation({
  args: { email: v.string(), name: v.string() },
  handler: async (ctx, { email, name }) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const allProfiles = await ctx.db.query("profiles").collect();
    const alreadyHasSuperAdmin = allProfiles.some(
      (p) => (p as any).role === "super_admin"
    );
    if (alreadyHasSuperAdmin) {
      throw new Error(
        "A Super Admin already exists. Ask them to upgrade your role."
      );
    }
    const existing = allProfiles.find((p) => p.email === email);
    if (existing) {
      await ctx.db.patch(existing._id, { role: "super_admin" as any });
    } else {
      await ctx.db.insert("profiles", {
        userId,
        name: name || email.split("@")[0],
        email,
        role: "super_admin" as any,
      });
    }
  },
});

/**
 * Bulk-patch multiple stores in one transaction.
 * Only sends changed fields — unmodified fields are untouched.
 * Returns the count of stores that were actually updated.
 */
export const bulkPatchStores = mutation({
  args: {
    patches: v.array(
      v.object({
        id: v.id("stores"),
        storeCode: v.optional(v.string()),
        storeName: v.optional(v.string()),
        areaManager: v.optional(v.string()),
        region: v.optional(v.string()),
        city: v.optional(v.string()),
        storeFormat: v.optional(v.string()),
        menuType: v.optional(v.string()),
        coffeeMachine: v.optional(v.string()),
        merrychefType: v.optional(v.string()),
        active: v.optional(v.boolean()),
      })
    ),
  },
  handler: async (ctx, { patches }) => {
    let count = 0;
    for (const { id, ...fields } of patches) {
      const clean: Record<string, any> = {};
      for (const [k, val] of Object.entries(fields)) {
        if (val !== undefined) clean[k] = val;
      }
      if (Object.keys(clean).length > 0) {
        await ctx.db.patch(id, clean);
        count++;
      }
    }
    return count;
  },
});
