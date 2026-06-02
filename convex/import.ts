import { mutation } from "./_generated/server";
import { v } from "convex/values";
import { Id } from "./_generated/dataModel";

/**
 * Bulk import parsed data from CSV.
 * Idempotent: re-importing the same file updates in place.
 * Returns import record ID + summary stats.
 */
export const bulkImport = mutation({
  args: {
    fileName: v.string(),
    importedBy: v.string(),
    stores: v.array(
      v.object({
        storeCode: v.string(),
        storeName: v.string(),
        areaManager: v.string(),
        region: v.string(),
        city: v.string(),
        storeFormat: v.string(),
        menuType: v.string(),
        coffeeMachine: v.string(),
        merrychefType: v.string(),
      }),
    ),
    initiatives: v.array(
      v.object({
        name: v.string(),
        type: v.union(
          v.literal("trial"),
          v.literal("launch"),
          v.literal("pilot"),
          v.literal("transition"),
        ),
        plannedStart: v.optional(v.number()),
        plannedEnd: v.optional(v.number()),
        variants: v.array(v.string()),
        regions: v.array(v.string()),
        cities: v.optional(v.array(v.string())),
        productCategory: v.optional(v.string()),
        vendor: v.optional(v.string()),
        ownerEmail: v.optional(v.string()),
        notes: v.optional(v.string()),
      }),
    ),
    rollouts: v.array(
      v.object({
        storeCode: v.string(),
        initiativeName: v.string(),
        participating: v.boolean(),
      }),
    ),
  },
  handler: async (ctx, args) => {
    let storesUpserted = 0;
    let initiativesUpserted = 0;
    let rolloutsUpserted = 0;
    const warnings: string[] = [];

    // Upsert stores
    const storeIdMap: Record<string, Id<"stores">> = {};
    for (const store of args.stores) {
      const existing = await ctx.db
        .query("stores")
        .withIndex("by_storeCode", (q) => q.eq("storeCode", store.storeCode))
        .unique();

      if (existing) {
        await ctx.db.patch(existing._id, store);
        storeIdMap[store.storeCode] = existing._id;
      } else {
        const id = await ctx.db.insert("stores", { ...store, active: true });
        storeIdMap[store.storeCode] = id;
        storesUpserted++;
      }
      storesUpserted++;
    }

    // Upsert initiatives
    const initiativeIdMap: Record<string, Id<"initiatives">> = {};
    for (const init of args.initiatives) {
      const existing = await ctx.db
        .query("initiatives")
        .collect()
        .then((all) => all.find((i) => i.name === init.name));

      if (existing) {
        await ctx.db.patch(existing._id, init);
        initiativeIdMap[init.name] = existing._id;
      } else {
        const id = await ctx.db.insert("initiatives", {
          name: init.name,
          type: init.type,
          plannedStart: init.plannedStart,
          plannedEnd: init.plannedEnd,
          variants: init.variants,
          regions: init.regions,
          cities: init.cities ?? [],
          status: "active",
        });
        initiativeIdMap[init.name] = id;
        initiativesUpserted++;
      }
      initiativesUpserted++;
    }

    // Upsert rollouts
    for (const rollout of args.rollouts) {
      const storeId = storeIdMap[rollout.storeCode];
      const initiativeId = initiativeIdMap[rollout.initiativeName];

      if (!storeId) {
        warnings.push(
          `Store ${rollout.storeCode} not found for ${rollout.initiativeName}`,
        );
        continue;
      }
      if (!initiativeId) {
        warnings.push(
          `Initiative ${rollout.initiativeName} not found for store ${rollout.storeCode}`,
        );
        continue;
      }

      const existing = await ctx.db
        .query("rollouts")
        .withIndex("by_store_initiative", (q) =>
          q.eq("storeId", storeId).eq("initiativeId", initiativeId),
        )
        .unique();

      if (existing) {
        await ctx.db.patch(existing._id, {
          participating: rollout.participating,
        });
      } else {
        await ctx.db.insert("rollouts", {
          storeId,
          initiativeId,
          participating: rollout.participating,
          status: rollout.participating ? "not_started" : "dropped",
          health: "green",
          isDelayed: false,
        });
        rolloutsUpserted++;
      }
      rolloutsUpserted++;
    }

    // Record the import
    const importId = await ctx.db.insert("imports", {
      fileName: args.fileName,
      importedBy: args.importedBy,
      rowsParsed: args.stores.length,
      storesUpserted,
      initiativesUpserted,
      rolloutsUpserted,
      warnings,
      status: "committed",
    });

    return {
      importId,
      storesUpserted,
      initiativesUpserted,
      rolloutsUpserted,
      warnings,
    };
  },
});
