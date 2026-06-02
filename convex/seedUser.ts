import { action } from "./_generated/server";
import { v } from "convex/values";

/**
 * One-time seed: create the first admin user by POSTing to the Convex Auth
 * HTTP endpoint (same path the browser takes on sign-up).
 *
 * Run from Convex dashboard → Functions → seedUser → createFirstUser → Run
 * Args: { "email": "Amritanshu@thirdwavecoffee.in", "password": "TrainingTWC@2026" }
 */
export const createFirstUser = action({
  args: {
    email: v.string(),
    password: v.string(),
    siteUrl: v.string(), // e.g. "https://veracious-dragon-590.convex.site"
  },
  handler: async (_ctx, { email, password, siteUrl }): Promise<string> => {
    const url = `${siteUrl.replace(/\/$/, "")}/api/auth/signin/password`;
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password, flow: "signUp" }),
    });
    const text = await res.text();
    if (res.ok) return `✓ User ${email} created. Response: ${text}`;
    // If already exists the sign-in flow returns 400 with "already exists"
    return `HTTP ${res.status}: ${text}`;
  },
});
