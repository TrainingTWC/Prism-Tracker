"use node";

import { action } from "./_generated/server";
import { v } from "convex/values";
import { internal } from "./_generated/api";
import bcrypt from "bcryptjs";

/**
 * One-time seed: create the first admin user directly in the DB.
 * Run from Convex dashboard → Functions → seedUser → createFirstUser → Run
 * Args: { "email": "Amritanshu@thirdwavecoffee.in", "password": "TrainingTWC@2026" }
 */
export const createFirstUser = action({
  args: {
    email: v.string(),
    password: v.string(),
  },
  handler: async (ctx, { email, password }): Promise<string> => {
    // Check if account already exists
    const existing = await ctx.runQuery(internal.seedUserHelpers.findAccount, { email });
    if (existing) return `User ${email} already exists — sign in normally.`;

    // Hash password (same cost factor as @convex-dev/auth Password provider)
    const hash = await bcrypt.hash(password, 10);

    // Insert user + authAccount
    await ctx.runMutation(internal.seedUserHelpers.insertUser, { email, hash });
    return `✓ User ${email} created successfully. Sign in at tracker.prismintelligence.in`;
  },
});
