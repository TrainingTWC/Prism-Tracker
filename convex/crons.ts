import { cronJobs } from "convex/server";
import { internal } from "./_generated/api";

const crons = cronJobs();

// Sync employee master from Prism Intelligence — every hour at :15
crons.cron(
  "sync-employees-from-intelligence",
  "15 * * * *",
  internal.employees.syncFromIntelligence,
  {}
);

// Sync calendar events from Prism Intelligence — every hour at :30
crons.cron(
  "sync-calendar-from-intelligence",
  "30 * * * *",
  internal.calendarSync.syncFromIntelligence,
  {}
);

export default crons;
