import { getAuthUserId } from "@convex-dev/auth/server";
import { query } from "./_generated/server";

/**
 * Get the current authenticated user with profile data.
 * Returns null if not authenticated.
 */
export const current = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return null;

    // Get the auth user record — this is the actual users table row
    const authUser = await ctx.db.get(userId);
    let email = (authUser as any)?.email ?? "";
    let name = (authUser as any)?.name ?? "";

    if (!name) name = email ? email.split("@")[0] : "User";

    // Look up profile for role — by_user index first (most reliable), fall back to by_email
    let role = "viewer";
    const profileByUser = await ctx.db
      .query("profiles")
      .withIndex("by_user", (q: any) => q.eq("userId", userId))
      .first();
    if (profileByUser) {
      role = (profileByUser as any).role;
    } else if (email) {
      const profileByEmail = await ctx.db
        .query("profiles")
        .withIndex("by_email", (q: any) => q.eq("email", email))
        .first();
      if (profileByEmail) role = (profileByEmail as any).role;
    }

    return { id: userId as string, email, name, role };
  },
});
