import { mutation } from "./_generated/server";

/**
 * One-off cleanup: deletes ALL rollouts and updates.
 * Use this after re-importing the stores master, because old rollouts
 * still reference deleted store IDs.
 */
export const purgeRollouts = mutation({
  args: {},
  handler: async (ctx) => {
    const rollouts = await ctx.db.query("rollouts").collect();
    for (const r of rollouts) await ctx.db.delete(r._id);
    const updates = await ctx.db.query("updates").collect();
    for (const u of updates) await ctx.db.delete(u._id);
    return `Deleted ${rollouts.length} rollouts and ${updates.length} updates.`;
  },
});
