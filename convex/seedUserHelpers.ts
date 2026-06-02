import { internalQuery, internalMutation } from "./_generated/server";
import { v } from "convex/values";

export const findAccount = internalQuery({
  args: { email: v.string() },
  handler: async (ctx, { email }) => {
    return ctx.db
      .query("authAccounts")
      .filter((q) => q.eq(q.field("providerAccountId"), email))
      .first();
  },
});

export const insertUser = internalMutation({
  args: { email: v.string(), hash: v.string() },
  handler: async (ctx, { email, hash }) => {
    const userId = await ctx.db.insert("users", {
      email,
      emailVerificationTime: Date.now(),
    });
    await ctx.db.insert("authAccounts", {
      userId,
      provider: "password",
      providerAccountId: email,
      secret: hash,
    });
  },
});
