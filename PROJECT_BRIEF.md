# PROJECT_BRIEF.md: Prism Tracker

**Last Updated:** June 2, 2026  
**Status:** Phase 2 Complete (CSV Importer Functional) → Phase 3 Ready (Convex Auth)

---

## 1. Project Overview

**Prism Tracker** is an end-to-end rollout management platform for TWC Coffee (7+ regional stores, 4+ concurrent initiatives: trials, launches, pilots, transitions). 

**Problem:** No centralized visibility into rollout health, participation delays, blockers across regions.  
**Solution:** Reactive database (Convex) syncing store × initiative matrix, auto-flagging delays with reasons, aggregating health (red/amber/green) across regions.

**Key Metrics:**
- 478 stores ✓ imported
- 4 initiatives ✓ imported  
- 956 rollout cells ✓ imported
- Delay categories: 9 (equipment, supply, vendor, staffing, store_ops, approval, logistics, recipe, other)

---

## 2. Product Description

### Core Flows
1. **CSV Import** (Phase 2 ✓): Upload stores × initiatives matrix → parse dates → idempotent upsert to Convex
2. **Track Rollout Health** (Phase 4-5): Per-rollout status (planned/active/completed), health (red/amber/green), participation flag
3. **Report Delays** (Phase 4): Flag rollout as delayed, pick reason, auto-create alert, compute days-overdue
4. **Dashboard Aggregation** (Phase 5): Grid by store/initiative, timeline view, region rollup, alerts panel
5. **AI Summaries** (Phase 6, optional): Gemini API generates rollout status prose
6. **Production Deployment** (Phase 7): GitHub Pages (static) + Cloudflare CDN/DNS → custom domain

### Health Scoring Rules
- **Red**: Delayed, dropped, or past deadline without going live
- **Amber**: Within 7 days of deadline but not yet live
- **Green**: On track, live, or completed

---

## 3. Tech Stack

| Layer | Tech | Notes |
|-------|------|-------|
| **Frontend** | React 19.0.1 + TypeScript 5.8.2 | Vite 6.2.3, Tailwind v4.1.14, Lucide icons |
| **Backend** | Convex (cloud-hosted) | Reactive DB, email/password auth, cron-ready |
| **Deployment** | GitHub Pages + Cloudflare | Custom domain: Tracker.prismintelligence.in |
| **Data** | 10 Convex tables (stores, initiatives, rollouts, delays, alerts, etc.) | Idempotent upserts by composite keys |
| **Auth** | Email/password (Convex Auth) | No Google OAuth (org constraint) |
| **AI** | Gemini API (Phase 6, optional) | Rollout summary generation |

**Excluded by Design:**
- Firebase (replaced by Convex)
- Google OAuth (email/password only)
- Complex DB migrations (Convex schema is source of truth)

---

## 4. Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        BROWSER (React)                       │
│   App.tsx (tabs: dashboard, board, snags, import, auth)     │
│   Components: Dashboard, TaskBoard, SnagList, SpreadsheetImporter
└────────────┬────────────────────────────────────────────────┘
             │ ConvexReactClient (websocket)
             │
             ▼
┌─────────────────────────────────────────────────────────────┐
│                   CONVEX BACKEND (Cloud)                     │
│  ┌──────────────────────────────────────────────────────┐   │
│  │ Schema (convex/schema.ts):                           │   │
│  │  • stores, initiatives, rollouts (join table)        │   │
│  │  • delayCategories, delays, alerts, updates, imports │   │
│  │  • profiles, milestones (future)                     │   │
│  └──────────────────────────────────────────────────────┘   │
│  ┌──────────────────────────────────────────────────────┐   │
│  │ Functions (convex/*.ts):                             │   │
│  │  • stores.ts (CRUD, idempotent by storeCode)        │   │
│  │  • initiatives.ts (CRUD, by name)                   │   │
│  │  • rollouts.ts (upsert, setStatus, reportDelay)     │   │
│  │  • import.ts (bulkImport mutation)                  │   │
│  │  • auth.ts (signIn/signOut, password provider)      │   │
│  └──────────────────────────────────────────────────────┘   │
│  ┌──────────────────────────────────────────────────────┐   │
│  │ Auth: Email/password via @convex-dev/auth          │   │
│  └──────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
             │ Exports api types via convex/_generated/api
             ▼
┌─────────────────────────────────────────────────────────────┐
│              DEPLOYMENT (GitHub + Cloudflare)                │
│  GitHub Pages (dist/) + GitHub Actions (build on push)      │
│  Cloudflare DNS: CNAME tracker → TrainingTWC.github.io      │
│  Live: https://Tracker.prismintelligence.in                 │
└─────────────────────────────────────────────────────────────┘
```

---

## 5. Key Files Map

### Backend (Convex)
- `convex/schema.ts` — All 10 tables with indexes
- `convex/auth.ts` — Email/password auth config
- `convex/stores.ts` — Store CRUD (idempotent by storeCode)
- `convex/initiatives.ts` — Initiative CRUD (by name)
- `convex/rollouts.ts` — Rollout operations + delay engine + health scoring
- `convex/delayCategories.ts` — List + seed
- `convex/import.ts` — Bulk upsert mutation (180 lines)
- `convex/seed.ts` — Data seeding

### Frontend (React)
- `src/App.tsx` — Main app, tabs (dashboard/board/snags/import), dev mode bypass
- `src/convexClient.ts` — Guarded ConvexReactClient init
- `src/main.tsx` — App entry + ConvexAuthProvider
- `src/lib/importParser.ts` — CSV parsing (matrix format, date handling)
- `src/components/SpreadsheetImporter.tsx` — File upload, preview, import UI (blue-themed)
- `src/context/ProjectContext.tsx` — Firebase auth (to be replaced Phase 3)
- `src/components/Dashboard.tsx` — Grid placeholder (to wire to Convex Phase 5)
- `src/components/TaskBoard.tsx` — Timeline placeholder (to wire Phase 5)
- `src/components/SnagList.tsx` — Alerts placeholder (to wire Phase 5)

### Config & Deployment
- `.env.local.example` — VITE_CONVEX_URL (written by `npx convex dev`)
- `.github/workflows/deploy.yml` — GitHub Actions (build + deploy to Pages)
- `public/CNAME` — Custom domain for Pages
- `public/404.html` — SPA routing fallback
- `vite.config.ts` — Base: '/', excludes convex/

### Documentation (Existing)
- `README.md` — Rebrand to Prism Tracker
- `docs/PRD.md` — Product requirements (trials, launches, delays)
- `docs/ARCHITECTURE.md` — System design + data flow
- `docs/DATA_MODEL.md` — Convex schema breakdown
- `docs/DATA_IMPORT.md` — CSV matrix format explained
- `docs/FEATURES.md` — Delay engine, auto-alerts, health scoring
- `docs/DESIGN_SYSTEM.md` — Blue accent, Tailwind, component patterns
- `docs/DEPLOYMENT.md` — GitHub Pages + Cloudflare setup
- `docs/ROADMAP.md` — Phase 0-8 breakdown

---

## 6. Team Roles (For This Project)

| Role | Name | Responsibilities |
|------|------|------------------|
| Producer | **Remy** | Sprint planning, issue triage, PR merging, coordination |
| Backend Eng | **Sage** | Convex functions, auth, data mutations, queries |
| Frontend Eng | **Nova** | React components, state, styling, UX flows |
| QA Engineer | **Ivy** | E2E testing, bug filing, playthrough sign-off |
| DevOps Eng | **Dash** | GitHub Actions, Pages deployment, Cloudflare DNS |

**Single Agent Mode:** These roles execute sequentially in one context (this chat). For larger teams, spin up separate chats per role.

---

## 7. Sprint Status

| Phase | Name | Status | Commit | Stores | Initiatives | Rollouts |
|-------|------|--------|--------|--------|------------|----------|
| 0 | Rebrand | ✅ Done | 8c0ae70 | — | — | — |
| 1 | Convex Backend | ✅ Done | 8c0ae70 | — | — | — |
| 2 | CSV Importer | ✅ Done | 03a4510 | 478 | 4 | 956 |
| 3 | Convex Auth | 🟡 Ready | — | — | — | — |
| 4 | Delay Engine UI | 🟡 Ready | — | — | — | — |
| 5 | Dashboards | 🟡 Ready | — | — | — | — |
| 6 | AI Summaries | 🟡 Ready | — | — | — | — |
| 7 | Production | 🟡 Ready | — | — | — | — |
| 8 | Polish | 🟡 Ready | — | — | — | — |

---

## 8. Current State (Post-Phase 2)

### What's Working
✅ Convex backend fully functional at https://compassionate-toad-781.convex.cloud  
✅ 9 delay categories seeded  
✅ CSV importer parses matrix format, handles messy dates, idempotent upserts  
✅ 478 stores, 4 initiatives, 956 rollouts imported into Convex  
✅ Health scoring logic ready (red/amber/green)  
✅ Delay reporting engine ready (reportDelay mutation)  

### What's NOT Working Yet
❌ Firebase auth still active (Phase 3 blocks this)  
❌ UI components not wired to Convex queries  
❌ Dashboard/board/snags pages still show Firebase placeholders  
❌ GitHub Pages not live (needs repo settings + Cloudflare DNS)  

### Immediate Next Steps
1. **Phase 3:** Replace Firebase Auth with Convex email/password (1-2 hours)
2. **Phase 4:** Wire SpreadsheetImporter to display success/error, migrate Dashboard to Convex queries (2-3 hours)
3. **Phase 5:** Build rollout grid, health indicators, timeline (3-4 hours)
4. **Phase 7:** Activate GitHub Pages + Cloudflare (manual setup required)

---

## 9. Security Rules

### Current Constraints
- **No Google OAuth** — Email/password only (org policy)
- **Convex-hosted** — No custom server needed (Convex Auth handles it)
- **Public GitHub repo** — No secrets in code, use GitHub Actions secrets instead
- **Idempotent imports** — Prevent accidental duplicates via (storeCode), (initiativeName), (storeId, initiativeId) keys

### Auth Flow (Phase 3)
```
1. User enters email + password
2. Convex Auth creates session
3. ConvexAuthProvider wraps app
4. useAuth() gives { isLoading, user, signIn, signOut }
5. Protected queries require user context
```

---

## 10. How to Run Locally

### Prerequisites
- Node v24.15.0 (or higher)
- npm 10.x
- Convex account (free tier ok)
- Git

### First Time Setup
```bash
cd "c:\Users\Amritanshu\Downloads\lightweight-project-tracker (1)"

# Install dependencies
npm install

# Start Convex dev server (generates VITE_CONVEX_URL in .env.local)
npx convex dev

# In another terminal, start Vite dev server
npm run dev

# Open browser: http://localhost:3001/?dev=true (dev mode bypasses auth)
```

### Regular Development
```bash
# Terminal 1: Convex backend
npx convex dev

# Terminal 2: Vite dev server
npm run dev

# Open http://localhost:3001/?dev=true to test importer
# Remove ?dev=true in Phase 3 after Convex Auth is live
```

### Seed Data
```bash
# Seed 9 delay categories (idempotent, safe to re-run)
npx convex run seed:delayCategories
```

---

## 11. How to Deploy

### Phase 7: Production Deployment

#### Step 1: Enable GitHub Pages
1. Go to repo Settings → Pages
2. Source = "GitHub Actions"
3. (Already configured, Actions workflow ready)

#### Step 2: Add GitHub Actions Secrets
```bash
# Get Convex URL from .env.local
cat .env.local | grep VITE_CONVEX_URL
# Example: https://compassionate-toad-781.convex.cloud

# Add to repo Settings → Secrets:
VITE_CONVEX_URL=<paste-convex-url>
GEMINI_API_KEY=<optional, for Phase 6>
```

#### Step 3: Deploy to Pages
```bash
git push origin main
# GitHub Actions automatically builds and deploys to Pages
# Wait ~2 min for build/deploy
```

#### Step 4: Configure Cloudflare DNS (Manual)
1. Go to Cloudflare dashboard → DNS
2. Add CNAME record:
   - Name: `tracker`
   - Target: `TrainingTWC.github.io` (or repo name)
   - Proxy Status: Proxied (orange cloud)
   - TTL: Auto
3. Custom domain active: https://Tracker.prismintelligence.in

---

## 12. Cross-Chat Handoff Protocol

When context gets long (>150 messages), create a checkpoint:

**Before ending chat:**
1. Commit all code: `git add . && git commit -m "Phase N: description" && git push origin main`
2. Update `docs/sprint-N/progress.md` with current status
3. Update `PROJECT_BRIEF.md` sections 7-8
4. Write `docs/sprint-N/done.md` with lessons

**Cold start prompt (next chat):**
```
Read PROJECT_BRIEF.md and docs/sprint-N/progress.md.

What's done:
- [read from done.md]

What's next:
- [read from progress.md]

Continue from where it left off.
```

---

## 13. Bug & Fix Tracking

All issues tracked as GitHub Issues (single source of truth):

```bash
# When filing a bug
git commit -m "fix: description (Fixes #NN)"

# When filing a feature request
# Go to repo → Issues → New Issue → use template

# Link in PROJECT_BRIEF.md and docs/sprint-N/progress.md
```

Current issues:
- (None yet — Phase 2 working end-to-end)

---

## 14. Multi-Repo Setup (Single-Agent Mode)

For this project, we're working in **one clone**:
```
c:\Users\Amritanshu\Downloads\lightweight-project-tracker (1)
```

Branch strategy:
- `main` — production-ready (must pass build + import test)
- `feature/phase-N` — work-in-progress (created per phase)

### Merge Rules
1. ✅ All phases must build without errors
2. ✅ CSV importer must parse test file successfully
3. ✅ Convex mutations must upsert idempotently
4. ✅ No secrets in code (use .env.local + GitHub Actions secrets)

---

## Next Actions (Prioritized)

### 🔴 HIGH PRIORITY (Blocking Production)
- [ ] **Phase 3:** Convex Auth — Replace Firebase login with email/password form
- [ ] **Phase 5:** Wire Dashboard to Convex queries (useQuery + rollout grid)
- [ ] **Phase 7:** GitHub Pages live (manual repo settings + Cloudflare DNS)

### 🟡 MEDIUM PRIORITY (Feature Complete)
- [ ] Phase 4: Delay reporting UI (reportDelay form)
- [ ] Phase 6: Gemini API integration (optional)
- [ ] Performance: Code-split chunks (fix 836kB warning)

### 🟢 LOW PRIORITY (Polish)
- [ ] Phase 8: Accessibility audit
- [ ] TypeScript strict mode compliance
- [ ] E2E tests with Playwright

---

## Questions for Reviewers

1. **Auth:** Should Phase 3 support password reset flow? (Currently: sign up only)
2. **Rollups:** Should store × initiative grid be read-only or allow inline edits?
3. **Alerts:** Should system generate daily digest emails? (Cron-ready but not implemented)

---

**Repository:** https://github.com/TrainingTWC/Prism-Tracker  
**Deployment:** Pending Phase 7 (GitHub Pages + Cloudflare)  
**Last Tested:** June 2, 2026 (CSV importer ✓, 956 rollouts imported)
