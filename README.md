# Prism Tracker

**An end-to-end, automated rollout tracker for new launches, trials, pilots, and transitions across retail stores.**

Prism Tracker turns a sprawling Excel "Ongoing Tracker" spreadsheet into a live, automated command center. It tracks which **stores** are participating in which **initiatives** (trials / launches / pilots / transitions), monitors timelines, automatically flags items that are **delayed (and why)**, rolls up **health scores** per initiative and region, and surfaces **AI-generated status summaries and risk insights**.

> Part of the **Prism** suite of internal apps. Blue is the Prism Tracker accent color.

---

## Why this exists

Today the source of truth is a single wide spreadsheet — `Ongoing Tracker'2026 - New Launches & Trials` — structured as a **matrix**:

- **Rows** = stores (Store Code, Store Name, Area Manager, Region, City, Store Format, Menu Type, Coffee Machine, Merrychef oven type).
- **Columns** = each trial / launch / pilot (e.g. *Masala Chai Powder*, *Dilicia Milk*, *Yoga Bar Oat Milk*, *Napoli Margherita Pizza*, *Vanilla Frappe (Nutaste / Olam)*, *Pasta Pilot*), each with its own start/end dates and regional scope.
- **Cells** = `Yes` when a store is in that initiative.

A spreadsheet can't tell you *"Store S017's Pizza trial is 6 days late because the Merrychef oven hasn't been installed."* Prism Tracker can.

---

## What it does

| Capability | Description |
|---|---|
| **Excel/CSV import + ongoing sync** | Ingest the matrix spreadsheet, auto-detect stores, initiatives, and participation cells. Re-import to update without duplicating. |
| **Store × Initiative model** | Normalizes the matrix into stores, initiatives, and per-store "rollout" records. |
| **Auto delay detection + reasons** | Compares planned vs. actual dates, auto-flags overdue rollouts, and captures structured *"delayed due to…"* reasons. |
| **Status roll-ups & health scores** | RAG (Red/Amber/Green) health per rollout, per initiative, per region, and across the whole portfolio. |
| **Timeline / Gantt & milestones** | Visual schedules per initiative with milestones and critical dates. |
| **Notifications / alerts** | Alerts when items slip, milestones approach, or blockers are raised. |
| **AI summaries & risk insights** | Auto-generated narrative status, "what changed this week," and risk flags. |

---

## Tech stack

| Layer | Choice |
|---|---|
| **Frontend** | React 19 + TypeScript + Vite + Tailwind CSS v4 (existing codebase, rebranded) |
| **Backend / DB / realtime** | **Convex** (reactive database, server functions, scheduled jobs) — replaces Firebase entirely |
| **Auth** | **Convex Auth** (email/password or magic-link — no Google Workspace dependency) |
| **Hosting** | **GitHub Pages** (static SPA build) |
| **Edge / DNS / CDN** | **Cloudflare** (DNS, CDN, caching, security in front of Pages) |
| **Icons / motion** | lucide-react, motion |

> The current code uses Firebase (Auth + Firestore). The migration to Convex is documented in [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) and [docs/DATA_MODEL.md](docs/DATA_MODEL.md).

---

## Documentation

| Doc | Purpose |
|---|---|
| [docs/PRD.md](docs/PRD.md) | Product requirements, personas, user stories, success metrics |
| [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) | System architecture, Firebase→Convex migration, hosting topology |
| [docs/DATA_MODEL.md](docs/DATA_MODEL.md) | Convex schema (stores, initiatives, rollouts, delays, milestones) |
| [docs/DATA_IMPORT.md](docs/DATA_IMPORT.md) | Spreadsheet → schema mapping and import pipeline |
| [docs/FEATURES.md](docs/FEATURES.md) | Feature specs: delay engine, automation, health scoring, AI |
| [docs/DESIGN_SYSTEM.md](docs/DESIGN_SYSTEM.md) | Prism design language, blue accent tokens, components |
| [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md) | GitHub Pages + Cloudflare + Convex deployment |
| [docs/ROADMAP.md](docs/ROADMAP.md) | Phased delivery plan |

---

## Run locally

**Prerequisites:** Node.js 20+, a Convex account.

```bash
# 1. Install dependencies
npm install

# 2. Start Convex (creates a dev deployment, watches functions)
npx convex dev

# 3. In a second terminal, start the web app
npm run dev
```

The app runs at `http://localhost:3000`.

> Migration note: until the Convex backend lands, the app still boots against Firebase. See [docs/ROADMAP.md](docs/ROADMAP.md) for the cutover sequence.

---

## Project status

Planning complete. Backend migration to Convex, the import pipeline, and rebrand are the first build phases. The GitHub repository will be connected after planning sign-off.
