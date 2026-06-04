/**
 * Server-side Google Sheets fetch — avoids browser CORS restrictions.
 * Returns raw CSV text which the frontend parses via parseSimpleFormat.
 */
import { action } from "./_generated/server";
import { v } from "convex/values";

export const fetchGoogleSheet = action({
  args: { url: v.string() },
  handler: async (_ctx, { url }) => {
    const idMatch = url.match(/spreadsheets\/d\/([a-zA-Z0-9_-]+)/);
    if (!idMatch) throw new Error("Not a valid Google Sheets URL");
    const sheetId = idMatch[1];

    // Prefer gid from URL fragment (#gid=...) or query string (?gid=...)
    const gidMatch = url.match(/[#&?]gid=(\d+)/);
    const gid = gidMatch ? gidMatch[1] : "0";

    const exportUrl = `https://docs.google.com/spreadsheets/d/${sheetId}/export?format=csv&gid=${gid}`;
    const res = await fetch(exportUrl);
    if (!res.ok) {
      throw new Error(
        `Google Sheets fetch failed: ${res.status} ${res.statusText}`,
      );
    }
    return await res.text();
  },
});
