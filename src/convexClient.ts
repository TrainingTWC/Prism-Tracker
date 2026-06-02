import { ConvexReactClient } from "convex/react";

/**
 * Convex client. Created only when `VITE_CONVEX_URL` is present so the app
 * keeps building/running on the legacy Firebase path until Convex is activated
 * (run `npx convex dev`, which writes the URL into `.env.local`).
 */
const url = import.meta.env.VITE_CONVEX_URL as string | undefined;

export const convex = url ? new ConvexReactClient(url) : null;
