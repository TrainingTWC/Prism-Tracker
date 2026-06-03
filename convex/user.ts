import { query } from "./_generated/server";

/**
 * Get the current authenticated user with profile data.
 * Returns null if not authenticated.
 */
export const current = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return null;

    // With @convex-dev/auth the subject is the users table _id
    const userId = identity.subject;
    let email = identity.email ?? "";
    let name = identity.name ?? identity.givenName ?? "";

    // Try to look up the auth user record for definitive email
    try {
      const authUser = await ctx.db.get(userId as any);
      if (authUser && (authUser as any).email) {
        email = (authUser as any).email;
        name = name || (authUser as any).name || email.split("@")[0];
      }
    } catch {
      // subject may not be a valid users table ID — fall back to identity fields
    }

    if (!name) name = email ? email.split("@")[0] : "User";

    // Look up profile for role
    let role = "viewer";
    if (email) {
      const profile = await ctx.db
        .query("profiles")
        .withIndex("by_email", (q: any) => q.eq("email", email))
        .first();
      if (profile) role = (profile as any).role;
    }

    return { id: userId, email, name, role };
  },
});
