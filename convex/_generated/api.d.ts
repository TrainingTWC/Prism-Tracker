/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type * as auth from "../auth.js";
import type * as delayCategories from "../delayCategories.js";
import type * as http from "../http.js";
import type * as import_ from "../import.js";
import type * as initiatives from "../initiatives.js";
import type * as rollouts from "../rollouts.js";
import type * as seed from "../seed.js";
import type * as seedUser from "../seedUser.js";
import type * as seedUserHelpers from "../seedUserHelpers.js";
import type * as stores from "../stores.js";
import type * as user from "../user.js";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

declare const fullApi: ApiFromModules<{
  auth: typeof auth;
  delayCategories: typeof delayCategories;
  http: typeof http;
  import: typeof import_;
  initiatives: typeof initiatives;
  rollouts: typeof rollouts;
  seed: typeof seed;
  seedUser: typeof seedUser;
  seedUserHelpers: typeof seedUserHelpers;
  stores: typeof stores;
  user: typeof user;
}>;

/**
 * A utility for referencing Convex functions in your app's public API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;

/**
 * A utility for referencing Convex functions in your app's internal API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = internal.myModule.myFunction;
 * ```
 */
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;

export declare const components: {};
