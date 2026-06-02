# Phase 5 — UI Spec (Dashboards on Prism OS shell)

> Applies [`docs/DESIGN_SYSTEM.md`](../DESIGN_SYSTEM.md) to the Phase 5
> deliverables. Read DESIGN_SYSTEM.md first, then this. This doc only
> covers the *Tracker-specific* screens; shell rules (sidebar, topbar,
> typography) are inherited from the system doc.

---

## Scope

Phase 5 ships **three views** on top of the new Prism OS shell:

1. **Dashboard** — KPI overview + alerts feed
2. **Grid** — 478 stores × N initiatives matrix
3. **Timeline** — Gantt-style initiative track

Plus the **shell migration** (light → Obsidian dark, slate → glass, system
font → JetBrains Mono).

---

## Screen 1 — Dashboard

Layout: 12-col grid, `gap-6`, max-w-[1600px].

### Page header

```
ROLLOUTS · OVERVIEW                          ← text-overline (signal blue)
Live initiatives                              ← H1 32px extrabold
478 stores · 4 initiatives · updated 2m ago   ← text-tertiary subtitle
─────────────────────────────────────────     ← border-b border-subtle
```

### Row 1 — KPI strip (4 widgets, equal width)

Each is a `.widget` (rounded-3xl gradient glass with hover lift):

| KPI | Value | Trend | Color |
|---|---|---|---|
| Active rollouts | `956` | `+12 this wk` | accent (signal blue) |
| On track | `782 · 82%` | `+4%` | semantic success |
| At risk (amber) | `94 · 10%` | `+1%` | semantic warning |
| Delayed (red) | `80 · 8%` | `-2%` | semantic danger |

Pattern:

```tsx
<div className="widget p-6">
  <p className="text-overline mb-2">ON TRACK</p>
  <div className="flex items-end justify-between">
    <span className="font-mono-value text-4xl font-bold tracking-tight text-[var(--obsidian-50)]">
      782
    </span>
    <span className="badge-pill bg-[rgba(34,197,94,0.08)] text-[var(--semantic-success)]">
      <ArrowUpRight className="size-3" /> +4%
    </span>
  </div>
  <p className="mt-1 text-xs text-[var(--text-tertiary)]">82% of estate</p>
</div>
```

### Row 2 — Two columns

**Left (col-span-8):** "Initiative health" — horizontal stacked bars,
one row per initiative, segmented by red / amber / green proportion. Use
semantic colors, never the accent. Background: `.glass` panel.

**Right (col-span-4):** "Latest alerts" feed — 8 most recent delay alerts
as a vertical list inside `.glass`. Each row:

```tsx
<div className="flex items-start gap-3 py-3 border-b border-[var(--border-subtle)] last:border-0">
  <span className="size-1.5 mt-2 rounded-full bg-[var(--semantic-danger)]
                   shadow-[0_0_8px_rgba(239,68,68,0.6)]" />
  <div className="flex-1 min-w-0">
    <p className="text-[13px] font-semibold text-[var(--text-primary)] truncate">
      H541 · Cold brew trial
    </p>
    <p className="text-[11px] text-[var(--text-muted)]">
      Delayed 3d · vendor · 5m ago
    </p>
  </div>
</div>
```

### Row 3 — Region rollup

A `.glass` panel showing each region (North/South/West/East) as a horizontal
bar of health. Format identical to Row 2 left.

---

## Screen 2 — Grid (the core Tracker view)

This is the highest-density screen in the app — 478 store rows × N
initiative columns. The grid is **the** screen of Prism Tracker.

### Header

```
ROLLOUTS · GRID                               ← text-overline
Store × initiative                            ← H1
Click any cell to inspect · drag header to sort
```

### Filter bar (sticky under topbar)

```tsx
<div className="sticky top-14 z-10 flex items-center gap-3 px-8 py-3
                bg-[var(--bg-secondary)]/80 backdrop-blur-xl
                border-b border-[var(--border-subtle)]">
  <SearchInput placeholder="Find store code, name, manager…" />
  <FilterChip label="Region"     options={["All","North","South","West","East"]} />
  <FilterChip label="Health"     options={["All","Red","Amber","Green"]} />
  <FilterChip label="Status"     options={["All","Planned","Active","Completed","Paused"]} />
  <FilterChip label="Initiative" options={[…]} />
  <span className="ml-auto text-overline">
    Showing 478 stores · 956 cells
  </span>
</div>
```

`FilterChip` is a small pill: `.badge-pill` + dropdown caret. Active state
uses `bg-[rgba(59,130,246,0.10)] text-[var(--signal-500)]`.

### The grid itself

- **Use `react-window` `FixedSizeList`** for store rows (handles 478 rows).
- **Row height: 56px.**
- Sticky left column (96px wide) for store code.
- Headers (initiative names) sticky on top.

**Row anatomy:**

```
┌──────┬──────────────────────────┬───────────┬───────────┬───────────┬─────────┐
│ H541 │ Hauz Khas · Delhi · Std  │  ●        │  ●        │  ◐        │  ●      │
│      │ Manager · 0123456789      │  ON TRACK │  DELAYED  │  DUE 5D   │ N/A     │
└──────┴──────────────────────────┴───────────┴───────────┴───────────┴─────────┘
   sticky        store info col           initiative cells (one per column)
```

**Cell** (rendered ~2,000 times — keep it cheap):

```tsx
<button className="
  flex flex-col items-center justify-center gap-1
  h-full w-full px-2
  border-r border-[var(--border-subtle)]
  hover:bg-[var(--card-bg-hover)]
  transition-colors
">
  {/* Health dot with glow */}
  <span
    className="size-2 rounded-full"
    style={{
      backgroundColor: healthHex,
      boxShadow: `0 0 8px ${healthHex}80`,
    }}
  />
  {/* Status badge */}
  <span className="text-[10px] font-bold uppercase tracking-[0.10em]"
        style={{ color: healthHex }}>
    {statusLabel}
  </span>
</button>
```

`healthHex` ∈ { `#22C55E`, `#EAB308`, `#EF4444`, `var(--text-muted)` for N/A }.

**Don't participate (`participation === 'N'`):** render the cell with
`opacity-30` and no badge — keeps the grid honest about scope.

### Detail drawer (on cell click)

Slide-in panel from the right (`w-[420px]`, full height, `.glass` with
`rounded-l-3xl rounded-r-none`). Contents:

- Header lockup: `STORE · INITIATIVE` overline, then `<H541> × <Cold brew trial>` as H2
- Status pill + health pill row
- Planned start / planned end / actual start / actual end (4 monospace dates)
- "Report delay" CTA (primary signal-blue gradient button) → opens the
  DelayReportModal from Phase 4
- "Mark active / completed" secondary buttons
- Updates feed (timeline of `updates` table entries)

---

## Screen 3 — Timeline

Horizontal Gantt, one row per initiative. Lower priority than Grid; ship as
a v0 that just maps planned start → planned end with the health color.

- Container: `.glass` panel
- Row height: 48px
- Time axis at top: weeks, labeled in `text-overline` style
- Today line: 1px vertical line in `var(--signal-500)`, glow `shadow-signal-glow`
- Initiative bar: `rounded-full h-3` filled with health gradient

---

## Shell migration (do this FIRST, before the three screens)

This is the part that makes the app *look* like a Prism sibling. Without
this, the new screens will look stranded inside an old light shell.

### Step 1 — Tokens (`src/index.css`)

Replace the current file with the `@theme` block from
`DESIGN_SYSTEM.md` §12, plus the class definitions for `.glass`,
`.widget`, `.prism-sidebar`, `.prism-topbar`, `.prism-nav-item`,
`.prism-icon-tile`, `.badge-pill`, `.text-overline`, `.font-mono-value`,
`.text-gradient-signal`.

Add the JetBrains Mono `<link>` to `index.html`.

### Step 2 — Shell components

Create:
- `src/components/shell/AppShell.tsx` — grid wrapper (`.prism-app-shell`)
- `src/components/shell/Sidebar.tsx` — 256px sidebar with nav sections from DESIGN_SYSTEM §5.1
- `src/components/shell/Topbar.tsx` — 56px topbar
- `src/components/shell/PageHeader.tsx` — overline + H1 + subtitle + divider

### Step 3 — Refactor `App.tsx`

```tsx
<AppShell>
  <Sidebar active={tab} onNavigate={setTab} user={user} />
  <div className="prism-shell-right">
    <Topbar user={user} onSignOut={signOut} />
    <main className="mx-auto max-w-[1600px] p-4 md:p-8 space-y-6">
      {tab === 'dashboard' && <Dashboard />}
      {tab === 'grid'      && <RolloutGrid />}
      {tab === 'timeline'  && <Timeline />}
      {tab === 'snags'     && <SnagList />}
      {tab === 'import'    && <SpreadsheetImporter />}
    </main>
  </div>
</AppShell>
```

### Step 4 — Restyle `AuthGate.tsx`

Apply the §6 Landing pattern from DESIGN_SYSTEM. Drop the current
light-themed form into the `.widget` glass panel on Obsidian canvas with
ambient blue glow.

---

## Acceptance Checklist

Shell:
- [ ] Background is `#09090B` everywhere
- [ ] All text is JetBrains Mono
- [ ] Sidebar = 256px, sticky, glass with backdrop-blur
- [ ] Topbar = 56px, sticky, glass with backdrop-blur
- [ ] Wordmark reads "Prism Tracker" with `Tracker` in signal-blue gradient
- [ ] Active nav item: `bg-[rgba(59,130,246,0.10)] text-[var(--signal-500)]`
- [ ] Every label is uppercase + tracking-[0.12em]

Dashboard:
- [ ] 4 KPI widgets, gradient `.widget` style, tabular-nums numerals
- [ ] Trend badges with semantic color
- [ ] Initiative health bar + alerts feed in `.glass`
- [ ] Region rollup row

Grid:
- [ ] 478 stores render via react-window (no scroll jank)
- [ ] Sticky left column for store code; sticky header for initiatives
- [ ] Health dot + status badge per cell, with glow
- [ ] Non-participating cells dimmed to 30% opacity
- [ ] Filter chips work for region / health / status / initiative
- [ ] Click cell → right drawer slides in with detail
- [ ] Drawer "Report delay" CTA wires to the Phase 4 modal

Performance:
- [ ] First paint of Grid screen < 500ms with full 956-cell dataset
- [ ] Scroll FPS ≥ 55 on a mid-range laptop

Visual parity:
- [ ] Side-by-side screenshot against Prism Intelligence and Prism Learning
      shows the same shell language; only the accent differs.

---

**Owner:** Nova (frontend) · review: Milo (visual)
**Blocked by:** none
**Blocks:** Phase 4 delay UI (consumes the detail drawer + reportDelay mutation)
