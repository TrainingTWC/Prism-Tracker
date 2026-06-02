# Product Requirements Document — Prism Tracker

**Version:** 1.0 (planning)
**Status:** Draft for sign-off
**Owner:** Internal Operations / Launches & Trials team

---

## 1. Summary

Prism Tracker is an internal web app that replaces a manually maintained Excel "Ongoing Tracker" with a live, automated system for managing **new product launches, trials, pilots, and transitions** across a network of retail coffee stores. It answers three questions the spreadsheet cannot answer well:

1. **Where are we?** — real-time status of every store rollout, every initiative, every region.
2. **What is slipping and why?** — automatic delay detection with structured *"delayed due to…"* reasons.
3. **What needs attention now?** — health scores, risk flags, and AI-written summaries.

---

## 2. Goals & non-goals

### Goals
- Eliminate manual spreadsheet upkeep; import the existing Excel/CSV as the seed data.
- Provide a normalized model: **Stores × Initiatives → Rollouts**.
- Automate delay detection, health roll-ups, milestones, and alerts.
- Give leadership a portfolio dashboard and AI status narratives.
- Ship as a static SPA on GitHub Pages, fronted by Cloudflare, backed by Convex.

### Non-goals (v1)
- Not a POS / inventory / supply-chain system.
- No native mobile app (responsive web only).
- No public access — internal authenticated users only.
- No financial / P&L reporting.

---

## 3. Personas

| Persona | Needs | Primary views |
|---|---|---|
| **Launch / Category Manager** (owner) | Create & schedule initiatives, see which stores are live vs. delayed, capture delay reasons, get AI summaries | Initiative detail, Portfolio dashboard, Gantt |
| **Area Manager** | See trials for *their* stores, update store-level status, log blockers | Store view, My rollouts, Alerts |
| **Regional Lead** | Region roll-up health, identify lagging stores | Region dashboard, Health heatmap |
| **Leadership / Viewer** | High-level portfolio health and weekly narrative | Portfolio dashboard, AI weekly summary |
| **Admin** | Import spreadsheets, manage stores/users, fix data | Import wizard, Admin/master data |

---

## 4. Domain glossary

| Term | Meaning |
|---|---|
| **Store** | A physical retail outlet (e.g. `S017 — TWC-Sarjapur Road`). Has Area Manager, Region, City, Format, Menu Type, Coffee Machine, Merrychef oven type. |
| **Initiative** | A trial, launch, pilot, or transition of a product/menu item (e.g. *Napoli Margherita Pizza*, *Vanilla Frappe (Olam)*, *Pasta Pilot*). Has scope (regions/cities), planned start/end, and variants. |
| **Initiative type** | `trial` · `launch` · `pilot` · `transition`. |
| **Rollout** | The participation of one store in one initiative. The "Yes" cell in the matrix, enriched with status, dates, health, and delay info. |
| **Milestone** | A key date within an initiative (e.g. equipment install, training, go-live). |
| **Delay** | A rollout (or initiative) whose actual progress is behind plan, with a captured reason and category. |
| **Health** | RAG status (Green / Amber / Red) computed from schedule + blockers. |

---

## 5. User stories

### Import & setup
- As an **Admin**, I can upload the Excel/CSV and the system detects stores, initiatives, and which stores participate in which initiative.
- As an **Admin**, I can re-import an updated sheet and the system updates existing records instead of duplicating them.
- As an **Admin**, I can review and confirm a mapping preview before committing the import.

### Tracking
- As a **Launch Manager**, I can create an initiative with type, scope, planned start/end, and variants.
- As a **Launch Manager**, I can assign stores to an initiative (or have them auto-assigned from the matrix).
- As an **Area Manager**, I can update a store rollout's status (`not_started → in_progress → live → completed`, or `delayed` / `dropped`).
- As any user, I can attach notes and blockers to a rollout.

### Delay engine
- As the **system**, I automatically mark a rollout `delayed` when `today > plannedStart` and status is still `not_started` (or `today > plannedEnd` and not `live/completed`).
- As an **Area Manager**, when I (or the system) mark something delayed, I must select a **delay category** and write a **reason** (*"delayed due to…"*).
- As a **Launch Manager**, I can see all delayed rollouts grouped by reason category.

### Roll-ups, timeline, alerts
- As a **Regional Lead**, I can see health rolled up by region and by initiative.
- As a **Launch Manager**, I can view a Gantt timeline of initiatives and milestones.
- As any user, I receive alerts when items slip, a milestone is near, or a blocker is raised.

### AI
- As **Leadership**, I can read an AI-generated weekly summary ("what changed, what's at risk").
- As a **Launch Manager**, I can get an AI risk assessment for a single initiative.

---

## 6. Functional requirements

| ID | Requirement | Priority |
|---|---|---|
| FR-1 | Import Excel/CSV matrix; normalize into stores, initiatives, rollouts | Must |
| FR-2 | Idempotent re-import (update, don't duplicate) keyed on Store Code + Initiative name | Must |
| FR-3 | CRUD for stores, initiatives, rollouts, milestones | Must |
| FR-4 | Automatic delay detection via scheduled job | Must |
| FR-5 | Structured delay reasons (category + free text), required on `delayed` | Must |
| FR-6 | Health scoring per rollout/initiative/region/portfolio | Must |
| FR-7 | Portfolio dashboard with filters (region, type, status, AM) | Must |
| FR-8 | Gantt / timeline view with milestones | Should |
| FR-9 | In-app notifications + optional email | Should |
| FR-10 | AI summaries & risk insights | Should |
| FR-11 | Audit log of status & date changes | Should |
| FR-12 | Role-based access (admin / editor / viewer) | Should |
| FR-13 | Export current state back to CSV/Excel | Could |

---

## 7. Non-functional requirements

- **Performance:** dashboard loads < 2s for ~500 stores × ~20 initiatives (~10k rollouts).
- **Realtime:** Convex reactive queries — UI updates without manual refresh.
- **Availability:** static front-end on GitHub Pages + Cloudflare CDN; Convex managed backend.
- **Security:** authenticated access only; least-privilege by role; see [ARCHITECTURE.md](ARCHITECTURE.md#security).
- **Cost:** stay within Convex + GitHub Pages + Cloudflare free/low tiers for internal scale.
- **Accessibility:** keyboard navigable, WCAG AA color contrast (blue accent palette).

---

## 8. Success metrics

| Metric | Target |
|---|---|
| Spreadsheet replaced as source of truth | 100% within 1 month of launch |
| Time to produce weekly status | From hours → minutes (AI summary) |
| % rollouts with a captured delay reason when overdue | > 95% |
| Stale data (no update > 14 days on active rollout) | < 10% |
| Manager adoption (weekly active editors) | ≥ 80% of Area Managers |

---

## 9. Open questions

- Email/alert channel: email only, or also Slack/Teams/WhatsApp?
- Exact delay categories — see proposed list in [FEATURES.md](FEATURES.md#delay-categories); needs ops confirmation.
- Which AI provider for summaries (the current code already wires `@google/genai`)?
- Historical Excel snapshots — import only the latest, or keep a version history?
