# Features — Prism Tracker

Detailed specs for the automation that makes Prism Tracker "end-to-end": the delay engine, health scoring, timeline, alerts, and AI insights.

---

## 1. Views (UI surfaces)

| View | Purpose | Evolves from |
|---|---|---|
| **Portfolio Dashboard** | Org-wide health: counts by status/health, delayed items, by region & initiative | [Dashboard.tsx](../src/components/Dashboard.tsx) |
| **Initiatives list** | All trials/launches/pilots with progress bars | [ProjectList.tsx](../src/components/ProjectList.tsx) |
| **Initiative detail** | One trial: participating stores, milestones, timeline, AI risk | TaskBoard area |
| **Rollout board / matrix** | Store × initiative grid (the familiar spreadsheet feel) with status colors | [TaskBoard.tsx](../src/components/TaskBoard.tsx) |
| **Store view** | All initiatives a single store is part of | new |
| **Delays view** | Every delayed rollout grouped by reason category | [SnagList.tsx](../src/components/SnagList.tsx) |
| **Rollout detail** | One store×initiative: status, dates, delay reason, updates, history | [TaskDetailModal.tsx](../src/components/TaskDetailModal.tsx) |
| **Alerts/Inbox** | Notifications for the current user | new |
| **Import wizard** | Upload + preview + commit spreadsheet | new |
| **Admin / master data** | Manage stores, users, delay categories | new |

---

## 2. Delay engine ("delayed due to…")

The headline feature. A scheduled Convex job + manual capture flow.

### 2.1 Automatic detection
A nightly cron (`crons.ts → detectDelays`) scans `rollouts`:

```
For each rollout where status NOT in (completed, dropped):
  if plannedStart && now > plannedStart && status == "not_started":
        -> mark isDelayed = true, status = "delayed"
        -> delayDays = days(now - plannedStart)
  else if plannedEnd && now > plannedEnd && status NOT in (live, completed):
        -> mark isDelayed = true, status = "delayed"
        -> delayDays = days(now - plannedEnd)
  else:
        -> isDelayed = false
```

When a rollout is newly flagged delayed:
- A `system` update is appended ("Auto-flagged delayed: 6 days past planned start").
- An `alert` (`type: slip`) is created for the store's Area Manager and initiative owner.
- The rollout requires a **delay reason** (see below) — surfaced as a "needs reason" badge until filled.

### 2.2 Delay reasons (manual capture)
Whenever a rollout becomes `delayed` (auto or manual), the user must provide:
- **Category** — from `delayCategories` (controlled list).
- **Reason** — free text *"delayed due to…"*.
- Optional **expected new date**.

### 2.3 Delay categories
Proposed seed list (ops to confirm):

| key | label |
|---|---|
| `equipment` | Equipment not installed / faulty (Merrychef, coffee machine) |
| `supply` | Ingredient / stock supply not available |
| `vendor` | Vendor / supplier delay (e.g. Nutaste, Olam, Yoga Bar) |
| `staffing` | Staff not trained / unavailable |
| `store_ops` | Store operational issue / closure / renovation |
| `approval` | Pending internal approval / sign-off |
| `logistics` | Delivery / distribution delay |
| `recipe` | Recipe / SOP not finalized |
| `other` | Other (see note) |

### 2.4 Delays view
- Grouped by category with counts and a bar chart.
- Filter by region, Area Manager, initiative, severity (delayDays buckets: 1–3, 4–7, 8+).
- Each row links to its rollout detail.

---

## 3. Health scoring

`health ∈ {green, amber, red}` per rollout, rolled up to initiative / region / portfolio.

### Rollout health
```
red    if isDelayed and (delayDays > 7 or has open blocker)
amber  if isDelayed (<= 7 days) OR (plannedStart within 3 days and status == not_started)
green  otherwise (on track / live / completed)
```

### Roll-ups
- **Initiative health** = worst-weighted across its rollouts (e.g. % red/amber). Shown as a RAG pill + % on-track.
- **Region health** = aggregate across all rollouts in that region.
- **Portfolio health** = org-wide counts and a single headline RAG.

Computed in `health.ts` reactive queries so dashboards update live; the nightly cron also persists a snapshot for trend charts.

---

## 4. Timeline / Gantt & milestones

- Per-initiative horizontal timeline: planned start→end bar, milestones as markers, today line.
- Store rollouts can render as swimlanes (actualStart→actualEnd vs planned).
- Milestones (`equipment install`, `training`, `go-live`) with `pending/done/missed` states.
- Missed milestone → feeds the delay engine and alerts.

---

## 5. Notifications / alerts

| Trigger | Alert type | Recipients |
|---|---|---|
| Rollout newly delayed | `slip` (warning) | Area Manager + initiative owner |
| Milestone due in ≤ 3 days | `milestone_due` (info) | Initiative owner |
| Blocker / red health raised | `blocker` (critical) | Owner + Regional Lead |
| Weekly digest | `digest` (info) | All editors / leadership |

- **In-app inbox** (reactive `alerts` query, unread badge).
- **Email** (optional) via a Convex action → email provider (Resend/SES). Configurable per user.
- Future channels: Slack/Teams/WhatsApp webhook (open question in [PRD](PRD.md#9-open-questions)).

---

## 6. AI summaries & risk insights

Server-side Convex **actions** call an AI provider (the repo already includes `@google/genai`). Keys stay in Convex env — never in the browser.

| Feature | Input | Output |
|---|---|---|
| **Weekly portfolio summary** | Status snapshot + diffs since last week | A short narrative: "What changed, what's at risk, top 3 delays" |
| **Initiative risk brief** | One initiative's rollouts, delays, milestones | Risk level + likely causes + suggested actions |
| **Delay theme analysis** | All delay reasons (free text) | Clusters reasons into themes, highlights systemic issues (e.g. "Merrychef installs are the #1 blocker in North") |
| **Natural-language ask** (future) | "Which Pizza-trial stores in North are behind?" | Filtered answer + table |

Guardrails: AI output is advisory, clearly labeled "AI-generated," and never auto-changes data — it only summarizes and flags.

---

## 7. Filtering & search (global)

All list/dashboard views share a filter bar:
- Region · City · Area Manager · Store Format · Menu Type
- Initiative · Type (trial/launch/pilot/transition) · Vendor
- Status · Health · Delayed-only · Delay category
- Date range (planned start/end)

Plus free-text search across store name/code and initiative name.

---

## 8. Audit & history

- Every status change and delay capture writes an `updates` row (`kind: status_change | delay | note | system`).
- Rollout detail shows a chronological history (who, when, from→to).
- Import audit retained in `imports`.

---

## 9. Roles & permissions (summary)

| Action | viewer | editor | admin |
|---|---|---|---|
| View dashboards/details | ✅ | ✅ | ✅ |
| Update rollout status / delay reason | ❌ | ✅ | ✅ |
| Create/edit initiatives & milestones | ❌ | ✅ | ✅ |
| Import spreadsheet | ❌ | ❌ | ✅ |
| Manage stores / users / categories | ❌ | ❌ | ✅ |

Optional region scoping limits editors to their own region's rollouts.
