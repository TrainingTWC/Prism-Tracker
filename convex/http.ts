import { httpRouter } from "convex/server";
import { httpAction } from "./_generated/server";
import { auth } from "./auth";
import { api, internal } from "./_generated/api";

const http = httpRouter();

// Registers the Convex Auth HTTP endpoints (sign-in, token refresh, etc.).
auth.addHttpRoutes(http);

// ─── Helper ───────────────────────────────────────────────────────────────

function verifyApiKey(request: Request): boolean {
  const apiKey = process.env.INTEGRATION_API_KEY;
  if (!apiKey) return false;
  const header = request.headers.get("Authorization");
  return header === `Bearer ${apiKey}`;
}

function unauthorized(): Response {
  return new Response(JSON.stringify({ error: "Unauthorized" }), {
    status: 401,
    headers: { "Content-Type": "application/json" },
  });
}

// ─── Cross-app endpoints ──────────────────────────────────────────────────

/**
 * GET /api/stores
 * Returns the active store list for Prism Intelligence to consume.
 * Requires Authorization: Bearer <INTEGRATION_API_KEY>
 */
http.route({
  path: "/api/stores",
  method: "GET",
  handler: httpAction(async (ctx, request) => {
    if (!verifyApiKey(request)) return unauthorized();
    const stores = await ctx.runQuery(api.stores.list, {});
    return new Response(JSON.stringify(stores), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
      },
    });
  }),
});

/**
 * GET /api/calendar
 * Returns initiative start/end dates and milestone due dates for Intelligence.
 * Requires Authorization: Bearer <INTEGRATION_API_KEY>
 */
http.route({
  path: "/api/calendar",
  method: "GET",
  handler: httpAction(async (ctx, request) => {
    if (!verifyApiKey(request)) return unauthorized();
    const events = await ctx.runQuery(
      internal.calendarSync.buildTrackerEvents,
      {}
    );
    return new Response(JSON.stringify(events), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
      },
    });
  }),
});

export default http;

