# Prism Tracker — Data Visualization Spec (the Ballistic Edition)

> Source of truth for **every** dashboard, chart, table, editor, and creator
> built on the master spreadsheet. The store mapping sheet is the spine —
> `storeCode` is the join key across every surface in this app.
>
> Read after [`DESIGN_SYSTEM.md`](../DESIGN_SYSTEM.md) and
> [`ui-spec.md`](./ui-spec.md). This doc expands ui-spec.md from 3 screens
> to the **full visualization surface area**.

---

## 0. Principle

**Every column from the sheet appears in at least one dashboard.** No field
is dead weight. If we can't visualize it, it doesn't belong in the schema.

The full field inventory the app must consume:

**Store master (`stores` table):**
`storeCode` · `storeName` · `areaManager` · `region` · `city` · `storeFormat` · `menuType` · `coffeeMachine` · `merrychefType` · `active`

**Initiative master (`initiatives` table):**
`name` · `type` · `status` · `productCategory` · `variants[]` · `regions[]` · `cities[]` · `vendor` · `plannedStart` · `plannedEnd` · `ownerEmail` · `notes`

**Rollout (`rollouts` table — the store × initiative cell):**
`storeId` · `initiativeId` · `participating` · `status` · `plannedStart` · `plannedEnd` · `actualStart` · `actualEnd` · `health` · `isDelayed` · `delayCategory` · `delayReason` · `delayDays` · `assignedTo` · `lastUpdatedBy`

**Supporting:** `milestones`, `updates`, `alerts`, `delayCategories`, `imports`.

Every chart below cites *which fields* it consumes.

---

## 1. Information Architecture (Sidebar Nav)

```
ROLLOUTS
  ├─ Dashboard         /              executive overview
  ├─ Grid              /grid          478 × N matrix
  ├─ Timeline          /timeline      Gantt by initiative
  ├─ Calendar          /calendar      month view of all dates
  └─ Map               /map           cities on India map

STORES
  ├─ All Stores        /stores        master table editor
  ├─ Store Profile     /stores/:code  single store deep-dive
  └─ Equipment         /equipment     coffee machine + merrychef inventory

INITIATIVES
  ├─ All Initiatives   /initiatives   master list + create
  ├─ Initiative Page   /initiatives/:id   single initiative deep-dive
  └─ Vendors           /vendors       vendor performance scorecard

OPERATIONS
  ├─ Snag List         /snags         red rollouts queue
  ├─ Delays            /delays        delay reason analytics
  ├─ Alerts            /alerts        notification feed
  └─ Area Managers     /managers      AM leaderboard

DATA
  ├─ Import            /import        spreadsheet upload wizard
  ├─ Export            /export        round-trip back to Excel
  └─ Audit Log         /audit         every change, every user

WORKSPACE
  ├─ Members           /members
  └─ Settings          /settings
```

15 top-level views. Each documented below.

---

## 2. Screen 1 — Dashboard (Executive Overview)

Single scroll. Six bands. Built for the COO opening the app on Monday morning.

### Band A — Title + global filters

```
ROLLOUTS · OVERVIEW
Live initiatives
478 stores · 7 initiatives · 956 rollouts · updated 2m ago
─────────────────────────────────────────
[Region: All ▾]  [Format: All ▾]  [Initiative type: All ▾]  [Date window: All ▾]
```

Filters persist across all dashboard bands via URL params (`?region=South-1&type=trial`).

### Band B — Hero KPI strip (6 widgets)

| Widget | Value | Fields used |
|---|---|---|
| Active rollouts | count where `participating=true` | `rollouts.participating` |
| On track | count + % where `health='green'` | `rollouts.health` |
| At risk | count + % where `health='amber'` | `rollouts.health` |
| Delayed | count + % where `health='red'` | `rollouts.health` |
| Avg delay (days) | avg `delayDays` where `isDelayed` | `rollouts.delayDays` |
| Coverage | % stores with ≥1 active rollout | `rollouts.storeId` distinct |

### Band C — Initiative health matrix (the centerpiece)

A **horizontal stacked bar per initiative**. Each bar = 100% of participating
stores, segmented into green / amber / red / not-started slices. One row
per initiative; sorted by % red descending so the worst is on top.

Hover any segment → tooltip lists the affected stores.

*Fields:* `initiatives.name`, `rollouts.health`, `rollouts.status`.

### Band D — Region rollup (2-col grid of mini-cards)

One card per region (`South-1`, `North`, `West`, etc.). Inside each card:
- Total stores in region
- % green / % amber / % red mini-bar
- Top 3 delayed stores by `delayDays`
- Top delay category in this region

*Fields:* `stores.region`, `rollouts.health`, `rollouts.delayDays`, `rollouts.delayCategory`.

### Band E — Two-column

**Left (col-span-8) — Delay reasons donut + ranked list**
Donut of `delayCategory` distribution (equipment / supply / vendor / staffing
/ store_ops / approval / logistics / recipe / other). Right side: ranked
table with count, % of all delays, avg `delayDays`, top region.

*Fields:* `rollouts.delayCategory`, `rollouts.delayDays`, `stores.region`.

**Right (col-span-4) — Latest activity feed**
Live stream of `updates` joined to `rollouts` joined to `stores`. Format:
`<storeCode> · <initiative name> · <kind> · <author> · <time>`.
Color the left dot by `update.kind` (note=blue, status_change=signal-blue,
delay=red, system=muted).

*Fields:* `updates.*`, `stores.storeCode`, `initiatives.name`.

### Band F — Equipment readiness mini

Three small widgets stacked horizontally:
1. **Coffee machine mix** — bar chart by `coffeeMachine`
2. **Merrychef coverage** — % stores with each `merrychefType`
3. **Format split** — pie of `storeFormat` (Highstreet / Mall / Drive-thru / …)

*Fields:* `stores.coffeeMachine`, `stores.merrychefType`, `stores.storeFormat`.

---

## 3. Screen 2 — Grid (the 478 × N Matrix)

Spec already detailed in [`ui-spec.md`](./ui-spec.md) §Grid. Adding here:

### Column toggles

Above the grid, a "Columns" menu lets the user reveal **store master fields
as extra left-side columns**:

```
Always visible:   storeCode · storeName
Toggleable:       region · city · areaManager · storeFormat · menuType
                  · coffeeMachine · merrychefType · active
```

This turns the grid into a hybrid master-data + rollout view. Sticky-left
columns expand as toggles are turned on.

### Row grouping

Group toggle (top right of grid): `None | Region | City | Area Manager | Format | Coffee Machine`. Grouped mode collapses rows into sectioned sub-grids with subtotals (green/amber/red counts) per group.

### Bulk actions toolbar (appears when ≥1 cell selected)

Multi-select cells via shift-click or drag. Then:
- **Mark active** (sets `status='in_progress'`, `actualStart=now`)
- **Report delay** (opens delay modal, applies to all selected)
- **Reassign** (sets `assignedTo`)
- **Export selection** (CSV of selected cells)

*Fields written:* `rollouts.status`, `rollouts.actualStart`, `rollouts.delayCategory/Reason`, `rollouts.assignedTo`.

### Conditional formatting layer

Toggle: `Color by → health | days-overdue | actual vs planned | delay category`.
Repaints the entire grid using the chosen heatmap so a single view can ask
different questions of the same data.

---

## 4. Screen 3 — Timeline (Gantt)

Three Gantt modes, switchable via segmented control:

### 4a. Initiative Gantt

One row per initiative. Bar spans `plannedStart → plannedEnd` (from
`initiatives` table). Below the bar, an overlay line spans
`min(rollouts.actualStart) → max(rollouts.actualEnd)`.

Bar color = aggregate health of participating rollouts. Width of overlay vs
plan shows slip at a glance. Today line (signal-blue, glowing) cuts vertically.

*Fields:* `initiatives.plannedStart/End`, `rollouts.actualStart/End`, `rollouts.health`.

### 4b. Store Gantt

For a single store (`/stores/:code/timeline`): one row per initiative the
store participates in. Each row shows planned bar + actual overlay.

*Fields:* same, filtered by `storeId`.

### 4c. Vendor Gantt

One row per `vendor`. Bar = earliest plannedStart of any initiative for
that vendor → latest plannedEnd. Useful for "which vendor has parallel
launches we should be worried about."

*Fields:* `initiatives.vendor`, `initiatives.plannedStart/End`.

### Interactions

- Drag bar edge → edits `plannedStart` / `plannedEnd` (admin only; writes `updates` row).
- Click bar → opens initiative detail drawer.
- Pinch / scroll wheel → zoom (day / week / month / quarter).

---

## 5. Screen 4 — Calendar

Month view. Each day cell shows:
- Number of `plannedStart` events that day (signal-blue dot)
- Number of `plannedEnd` deadlines that day (amber dot)
- Number of `delays` reported that day (red dot)
- Number of `milestones` due (purple dot)

Click a day → side drawer lists the events. Switch to week view for hourly
detail. Switch to agenda view for a flat list.

*Fields:* every date field across `initiatives`, `rollouts`, `milestones`, `updates`.

---

## 6. Screen 5 — Map

India outline (SVG, no external map tile dependency for v1). Cities from
`stores.city` plotted as bubbles:
- **Bubble size** = store count in that city
- **Bubble fill** = aggregate health % (green→amber→red gradient)
- **Hover** = tooltip with city stats: store count, top initiatives, % delayed

Click a bubble → drills to a city detail panel listing every store with
inline health pills.

*Fields:* `stores.city`, `stores.region`, `rollouts.health`.

### Region overlay

Toggle to color the country by region instead of bubbles — uses
`stores.region` to build region shapes (or just region-colored bubbles in v1).

---

## 7. Screen 6 — All Stores (master table editor)

The store mapping sheet, **in the app**. Every column from `stores` table
shown, sortable, filterable, editable inline. This is the canonical editor
for store master data.

### Columns

| # | Column | Editable | Filter |
|---|---|---|---|
| 1 | storeCode | no (PK) | search |
| 2 | storeName | yes | search |
| 3 | areaManager | yes (dropdown) | dropdown |
| 4 | region | yes (dropdown) | dropdown |
| 5 | city | yes | dropdown |
| 6 | storeFormat | yes (dropdown) | dropdown |
| 7 | menuType | yes (dropdown) | dropdown |
| 8 | coffeeMachine | yes (dropdown) | dropdown |
| 9 | merrychefType | yes (dropdown) | dropdown |
| 10 | active | yes (toggle) | toggle |
| 11 | # active rollouts | computed | range |
| 12 | health summary | computed (`g/a/r` pills) | dropdown |

Top bar: search · advanced filter builder · column toggle · density toggle
(compact/comfortable/spacious) · "+ New store" · "Export CSV".

### Inline editing

Click any editable cell → contenteditable; Enter commits via `stores.update`
mutation; Esc cancels; cell flashes signal-blue on save. Dropdown cells use
a small popover with type-ahead search.

### Bulk edit

Select N rows → toolbar: bulk-reassign area manager, bulk-set region,
bulk-deactivate. Each bulk action writes an `updates` audit row.

---

## 8. Screen 7 — Store Profile (`/stores/:code`)

The single-store deep-dive. Five tabs.

### Tab 1 — Overview

- Header lockup: `STORE` overline → `S017 · TWC-Sarjapur Road` H1 → sub-line with city, region, area manager
- 4 KPI tiles: active rollouts · % on-track · open delays · last update timestamp
- Equipment card: coffee machine · merrychef type · format · menu type (all from `stores`)
- Mini-Gantt of all this store's rollouts

### Tab 2 — Rollouts

Table of every rollout for this store. Columns: initiative, status, health,
plannedStart, plannedEnd, actualStart, actualEnd, delayDays, delayCategory,
delayReason, assignedTo, lastUpdatedBy, last update timestamp.

### Tab 3 — Activity

Vertical timeline of `updates` filtered by this store's rollouts. Grouped
by day. Each item shows kind icon, author, text.

### Tab 4 — Snags

Just this store's red rollouts with the delay-report quick form inline.

### Tab 5 — Edit

The master record editor — same fields as §7 but in a single form layout.
"Deactivate store" CTA at the bottom (admin only).

---

## 9. Screen 8 — Equipment

Cross-tab of `coffeeMachine` × `merrychefType` with store counts. Useful
for "how many La Marzocco + E2S combos do we have, and what's their roll-up
health?"

Also: two leaderboards side by side:
- Top 5 coffee machines by store count (bar)
- Top 5 merrychef types by store count (bar)

*Fields:* `stores.coffeeMachine`, `stores.merrychefType`.

---

## 10. Screen 9 — All Initiatives + Creator

### List view

Card grid (3 cols on desktop). Each card:
- Initiative name + type pill (trial/launch/pilot/transition)
- Status pill
- Vendor (if any)
- Date window
- Stat row: `<N participating> / <total>` · `<X%> on-track`
- Mini health bar (green/amber/red proportion)
- Variant chips (`variants[]`)

Sort: status, planned start, % delayed, alphabetical.
Filter: type, status, vendor, region, date window.

### "+ New Initiative" creator

Multi-step wizard:

1. **Basics** — name, type (radio), productCategory, vendor, ownerEmail, notes
2. **Variants** — chip input (add/remove `variants[]`)
3. **Scope** — region multiselect, city multiselect (or "all stores")
4. **Schedule** — plannedStart, plannedEnd (date pickers), milestones array
5. **Participating stores** — auto-prefilled from scope rules; allow manual add/remove. Live count: "456 stores will participate"
6. **Review** — diff summary, then commit → creates initiative + N rollouts in one mutation

*Fields written:* every field of `initiatives` + N `rollouts` with defaults.

---

## 11. Screen 10 — Initiative Page (`/initiatives/:id`)

Five tabs, mirroring Store Profile:

### Tab 1 — Overview
KPI tiles · participating-stores stacked bar by region · vendor card · variant chips · timeline mini-Gantt.

### Tab 2 — Participation Matrix
Single-column grid: all participating stores, with health and status. Sortable, filterable. Bulk actions (mark active, report delay) on selection.

### Tab 3 — Milestones
List of `milestones` for this initiative. Toggle done/pending/missed. Add milestone form. Each milestone shows due date countdown.

### Tab 4 — Activity
Filtered `updates` feed.

### Tab 5 — Edit
Form editor for the initiative master.

---

## 12. Screen 11 — Vendors

Auto-derived from `initiatives.vendor`. One row per vendor:

| Vendor | # Initiatives | Avg planned duration | Avg actual duration | % on-track | Avg delay days | Top delay reason | Health pill |
|---|---|---|---|---|---|---|---|

Click vendor → detail page with all initiatives, all rollouts, vendor-level Gantt.

*Fields:* `initiatives.vendor`, joined to `rollouts.*`.

---

## 13. Screen 12 — Snag List

Already exists. Upgrade: filter by `delayCategory`, sort by `delayDays` desc,
show `assignedTo` + `lastUpdatedBy`. Add "Resolve" inline action.

---

## 14. Screen 13 — Delays (analytics)

The delay-engine deep-dive. Four charts:

1. **Trend** — line chart of delay count over time (last 90 days), by category
2. **Categories** — bar chart, count of delays per `delayCategory`, with avg `delayDays` overlay
3. **By region** — small-multiples: one mini-bar per region, segmented by category
4. **MTTR** — average days from delay reported → resolved (uses `updates` history)

*Fields:* `rollouts.delayCategory/Days/isDelayed`, `updates.kind='delay'`, `stores.region`.

---

## 15. Screen 14 — Area Managers (leaderboard)

Auto-derived from `stores.areaManager`. One row per AM:

| AM | # Stores | # Rollouts | % On-track | Avg delay | Open snags | Last update | Health |
|---|---|---|---|---|---|---|---|

Sort by health desc (best on top) or worst-first toggle. Click AM → page
listing their stores with mini-Ganttkrs.

*Fields:* `stores.areaManager`, `rollouts.*`, `updates.authorEmail` (if matches AM).

---

## 16. Screen 15 — Alerts

Inbox-style list of `alerts` for the current user. Filters: type, severity,
read/unread. Mark read, archive, snooze. Real-time via Convex subscription.

---

## 17. Screen 16 — Import (Wizard)

5-step:

1. **Upload** — drop XLSX/CSV; SheetJS parses in browser
2. **Detect** — show detected header block (rows 1–3), allow user to confirm/correct
3. **Map columns** — auto-mapped, user can re-map
4. **Preview** — diff summary: stores added/changed, initiatives added/changed, rollouts added/changed, warnings list
5. **Commit** — writes via `imports.commit` action; success → audit row, link to view

### Always-visible side panel

Live stats while parsing: rows scanned, stores detected, initiatives detected, rollouts detected, warnings.

---

## 18. Screen 17 — Export

Round-trip: rebuilds the matrix (stores as rows, initiatives as columns, status/Yes in cells) and offers XLSX + CSV download.

Toggle: include `actualStart/End`, include `delayCategory/Reason`, include
`assignedTo`, include `updates` count per cell.

---

## 19. Screen 18 — Audit Log

Every `updates` row across the app, with filters by user, kind, date range,
rollout. The "what happened" log. Export to CSV.

*Fields:* `updates.*` joined to `rollouts.storeId/initiativeId` joined to `stores.storeCode`.

---

## 20. Field → Surface Coverage Matrix

Proof every field is used.

### `stores`

| Field | Used in |
|---|---|
| storeCode | Grid (sticky col), All Stores, Store Profile (URL), Audit, every join |
| storeName | All surfaces displaying a store |
| areaManager | Grid group/filter, AM Leaderboard, Stores table, default `assignedTo` |
| region | Dashboard rollup, Map, Grid filter/group, Delays-by-region |
| city | Map, Stores filter |
| storeFormat | Dashboard equipment band, Stores filter |
| menuType | Stores filter, segment analysis |
| coffeeMachine | Equipment dashboard, Stores filter |
| merrychefType | Equipment dashboard, Stores filter |
| active | Stores filter (default: active only) |

### `initiatives`

| Field | Used in |
|---|---|
| name | Everywhere |
| type | Initiative filter, card pill |
| status | Initiative filter, card pill, dashboard counts |
| productCategory | Initiative filter |
| variants[] | Initiative card chips, creator wizard step 2 |
| regions[] / cities[] | Creator step 3, participation prefill |
| vendor | Vendor dashboard, initiative card |
| plannedStart/End | Gantt, calendar, dashboard date filter |
| ownerEmail | Initiative page, alerts routing |
| notes | Initiative page overview |

### `rollouts`

| Field | Used in |
|---|---|
| storeId / initiativeId | Every join |
| participating | Grid (dimmed cells), filter |
| status | Grid cell badge, KPI counts |
| plannedStart/End | Store Gantt, calendar |
| actualStart/End | Gantt overlay, slip calculation |
| health | Every health pill, every region rollup |
| isDelayed | Snag list, alerts trigger |
| delayCategory | Delays dashboard, dashboard donut |
| delayReason | Drawer detail, audit |
| delayDays | KPI (avg delay), AM leaderboard, snag list sort |
| assignedTo | Drawer, leaderboard, bulk reassign |
| lastUpdatedBy | Audit, stores table |

### Supporting

- `milestones` → Initiative Page tab 3, Calendar dots, dashboard upcoming
- `updates` → Dashboard activity feed, Audit log, Store Profile activity, Initiative activity
- `alerts` → Alerts inbox, topbar badge
- `delayCategories` → Delay donut color/label, delay report modal dropdown
- `imports` → Audit, Import wizard history list

✅ **100% field coverage.**

---

## 21. Visualization Library Choices

Keep deps lean. One library per category:

| Need | Library | Why |
|---|---|---|
| Charts (bar/line/donut/area) | **Recharts** | Already React, composable, themeable |
| Gantt | **`@nivo/bar`** in time-x mode, *or* custom SVG | Avoid heavy frappe-gantt; we have only ~20 bars max per view |
| Calendar | **`react-day-picker`** + custom day renderers | Lightweight, fully styleable |
| India map | **Custom SVG** of India states + projected city dots | Avoids leaflet/mapbox dependency for v1 |
| Big tables / grid | **`@tanstack/react-table`** + **`react-window`** | Already needed for 478-row grid |
| Drag / sortable | **`@dnd-kit/core`** | For Gantt drag-to-reschedule |
| Date math | **`date-fns`** | Tree-shakeable |

All charts inherit theme from CSS vars defined in DESIGN_SYSTEM.md so the
signal-blue accent and Obsidian canvas flow through automatically.

---

## 22. Performance Budgets

| Surface | First paint | Interactive |
|---|---|---|
| Dashboard | < 600ms | < 1.2s |
| Grid (478 × 7) | < 500ms | < 800ms |
| Timeline (7 initiatives) | < 400ms | < 700ms |
| Map | < 700ms | < 1.2s |
| Store Profile | < 400ms | < 700ms |

Tactics:
- Convex `useQuery` per-screen, never fetch everything upfront
- `react-window` virtualization on Grid, All Stores, Audit
- Recharts charts memoized; tooltip-only data computed on hover
- Charts share a single derived selector (avoid recomputing per widget)

---

## 23. Build Order (Phase 5 execution)

1. Shell migration (sidebar, topbar, tokens) — unblocks everything visual
2. Dashboard (Band B + C + E first; D, F second pass)
3. Grid + column toggles + grouping + drawer
4. All Stores editor
5. Store Profile
6. Initiative list + Creator wizard
7. Initiative Page
8. Timeline (initiative mode → store mode → vendor mode)
9. Snag List upgrade + Delays analytics
10. Vendors + Area Managers leaderboards
11. Calendar
12. Map
13. Alerts inbox
14. Import wizard upgrade
15. Export + Audit log

Each lands behind its own route; can be shipped incrementally.

---

**Owner:** Nova (impl) · Milo (visual) · Sage (data shape) · Remy (scope)
**Status:** Approved — this is the full Phase 5 vision. ui-spec.md remains the
minimum-viable shipping cut; this doc is the maximalist target.
