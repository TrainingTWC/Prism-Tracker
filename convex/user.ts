import { query } from "./_generated/server";
import { v } from "convex/values";
import { isAuthenticated } from "./auth";

/**
 * Get the current authenticated user.
 * Returns null if not authenticated.
 */
export const current = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return null;
    return {
      id: identity.subject,
      email: identity.email,
      name: identity.givenName || identity.email?.split('@')[0],
    };
  },
});
