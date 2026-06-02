# Prism Tracker — Design System

> **Part of Prism OS.** This app is the fourth in a family of operations apps
> for Third Wave Coffee. It must look and feel like a sibling of
> Prism Intelligence (`#10b37d` emerald), Prism Escalations (`#E07B39` tea
> orange), and Prism Learning (`#10b37d` emerald). Prism Tracker's signature
> accent is **electric blue (`#3B82F6`)**.

---

## 1. Ecosystem Principles

Every Prism app shares **three immutable foundations**:

1. **Obsidian dark canvas** — the same near-black background scale
2. **JetBrains Mono** — 100% monospace typography for the entire UI
3. **Glassmorphism + uppercase tracking-widest labels** — the Prism "voice"

Each app then layers its own **accent scale** on top:

| App | Codename | Accent name | Hex | Vibe |
|---|---|---|---|---|
| Prism Intelligence | `prism-1.2` | Ember Emerald | `#10b37d` | Insight, analytics |
| Prism Escalations | `prism-escalations` | Tea Orange | `#E07B39` | Urgency, action |
| Prism Learning | `learnflow` | Ember Emerald | `#10b37d` | Growth, mastery |
| **Prism Tracker** | `prism-tracker` | **Signal Blue** | **`#3B82F6`** | **Coordination, flow** |

Blue was chosen because tracker is the *coordination* surface — it shows
movement and state across the whole estate, the "blue moving parts" of ops.

---

## 2. Color System

### 2.1 Obsidian (shared across all Prism apps)

```css
--obsidian-950: #09090B;   /* deepest bg */
--obsidian-900: #0C0C0F;   /* primary bg */
--obsidian-800: #141418;   /* tertiary bg */
--obsidian-700: #1C1C22;   /* skeletons */
--obsidian-600: #27272F;   /* subtle fills */
--obsidian-400: #52525E;   /* muted text */
--obsidian-300: #7A7A88;   /* tertiary text */
--obsidian-200: #A1A1AE;   /* secondary text */
--obsidian-100: #E4E4E9;   /* primary text */
--obsidian-50:  #FAFAFA;   /* hi-contrast text */
```

### 2.2 Signal Blue (Tracker's own accent scale)

Mirrors the Ember scale used by other Prism apps so component recipes
transfer 1:1 — just swap the token name.

```css
--signal-700: #1D4ED8;   /* deep, pressed states */
--signal-600: #2563EB;   /* hover */
--signal-500: #3B82F6;   /* PRIMARY ACCENT */
--signal-400: #60A5FA;   /* secondary accent */
--signal-300: #93C5FD;   /* light accent */
--signal-200: #BFDBFE;   /* very light */
--signal-100: #DBEAFE;   /* nearly white */

--accent:        var(--signal-500);
--accent-dim:    rgba(59, 130, 246, 0.12);
--accent-border: rgba(59, 130, 246, 0.30);
--accent-glow:   rgba(59, 130, 246, 0.25);

--shadow-signal-glow: 0 4px 14px rgba(59, 130, 246, 0.28);
--shadow-signal-soft: 0 0 24px rgba(59, 130, 246, 0.08);
```

### 2.3 Semantic (shared)

```css
--semantic-success: #22C55E;
--semantic-danger:  #EF4444;
--semantic-warning: #EAB308;
--semantic-info:    #3B82F6;   /* same as accent for Tracker */
```

### 2.4 Health colors (Tracker-specific business semantics)

Rollout health uses semantic colors directly, **not** the blue accent —
the accent is for chrome, semantic colors are for data.

```css
--health-red:   #EF4444;   /* delayed / dropped / overdue */
--health-amber: #EAB308;   /* within 7 days of deadline */
--health-green: #22C55E;   /* on-track / live / done */
```

### 2.5 Surface tokens

```css
/* Backgrounds */
--bg-primary:   #09090B;
--bg-secondary: #0C0C0F;
--bg-tertiary:  #141418;
--bg-surface:        rgba(20, 20, 24, 0.85);
--bg-surface-hover:  rgba(28, 28, 34, 0.65);

/* Text */
--text-primary:   #E4E4E9;
--text-secondary: #A1A1AE;
--text-tertiary:  #7A7A88;
--text-muted:     #52525E;

/* Borders */
--border-primary: rgba(39, 39, 47, 0.6);
--border-subtle:  rgba(39, 39, 47, 0.3);

/* Glass */
--glass-bg:     rgba(20, 20, 24, 0.85);
--glass-border: rgba(39, 39, 47, 0.6);
--glass-blur:   16px;

/* Chrome */
--sidebar-bg:     rgba(12, 12, 15, 0.95);
--sidebar-border: rgba(255, 255, 255, 0.04);
--topbar-bg:      rgba(12, 12, 15, 0.78);
--card-bg:        rgba(20, 20, 24, 0.5);
--card-bg-hover:  rgba(28, 28, 34, 0.65);
--input-bg:       rgba(20, 20, 24, 0.6);
--widget-border:  rgba(255, 255, 255, 0.06);
```

### 2.6 Light mode (optional, toggle via `html.light`)

```css
html.light {
  --bg-primary:   #F8F9FA;
  --bg-secondary: #FFFFFF;
  --bg-tertiary:  #F1F3F5;
  --text-primary:   #1A1A2E;
  --text-secondary: #4A4A5A;
  --border-primary: rgba(0, 0, 0, 0.08);
  --border-subtle:  rgba(0, 0, 0, 0.06);
  --glass-bg:       rgba(255, 255, 255, 0.85);
  --sidebar-bg:     rgba(255, 255, 255, 0.95);
}
```

---

## 3. Typography

### 3.1 Font

**JetBrains Mono** for *everything*. No serif, no proportional sans.
This is the most recognizable Prism signature.

```html
<link href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500;600;700;800&display=swap" rel="stylesheet">
```

```css
--font-jb: 'JetBrains Mono', ui-monospace, SFMono-Regular, 'SF Mono', monospace;
--font-sans: var(--font-jb);
--font-mono: var(--font-jb);

html, body { font-family: var(--font-jb); }
```

### 3.2 Scale

| Role | Size | Weight | Tracking | Notes |
|---|---|---|---|---|
| Page title (H1) | 32px | 800 extrabold | `tracking-tight` | hero on dashboard |
| Section head (H2) | 20px | 700 bold | normal | grid section dividers |
| Panel title (H3) | 16px | 600 semibold | normal | card headers |
| Stat value | 36px | 700 bold | `tracking-tight` | KPI numbers |
| Body | 13px | 400–500 | normal | default text |
| Small | 12px | 400 | normal | metadata |
| Label / overline | 10–11px | 700 bold | `0.12em` uppercase | every label, kicker, section divider |
| Micro | 10px | 700 bold | `0.15em` uppercase | sidebar section heads |

### 3.3 Utility classes

```css
.text-overline {
  font-size: 10px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.12em;
  color: var(--accent);          /* signal blue for Tracker */
}

.font-mono-value {
  font-family: var(--font-mono);
  font-variant-numeric: tabular-nums;   /* aligned digits in grids */
}

.text-gradient-signal {
  background: linear-gradient(135deg, #1D4ED8, #3B82F6, #60A5FA);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}
```

---

## 4. Layout

### 4.1 App shell

```
┌─────────────────────────────────────────────────┐
│   Sidebar (256px)  │   Topbar (h-14, sticky)   │
│   sticky, h-100vh  ├───────────────────────────┤
│                    │                           │
│   - Logo lockup    │   Main content            │
│   - Workspace      │   max-w-[1600px]          │
│   - Search         │   p-4 md:p-8              │
│   - Nav sections   │   space-y-6               │
│                    │                           │
│   - Footer status  │                           │
└─────────────────────────────────────────────────┘
```

```css
.prism-app-shell {
  display: grid;
  height: 100vh;
  grid-template-columns: 256px minmax(0, 1fr);
  transition: grid-template-columns 280ms cubic-bezier(0.16, 1, 0.3, 1);
}
.prism-app-shell[data-collapsed='true'] {
  grid-template-columns: 68px minmax(0, 1fr);
}
```

### 4.2 Content widths

- **Main canvas max-width**: `1600px` (enterprise-grade, matches Prism Intelligence)
- **Gutters**: `p-4` on mobile, `p-8` on desktop
- **Section spacing**: `space-y-6`
- **Modal max-width** (auth, dialogs): `max-w-md` (28rem)

---

## 5. Component Recipes

### 5.1 Sidebar

```css
.prism-sidebar {
  position: sticky;
  top: 0;
  z-index: 20;
  display: flex;
  height: 100vh;
  flex-direction: column;
  border-right: 1px solid var(--sidebar-border);
  background: var(--sidebar-bg);
  backdrop-filter: blur(16px) saturate(1.2);
}
```

**Header** — logo + workspace name + role badge

```tsx
<div className="border-b border-[var(--sidebar-border)] px-5 py-5">
  <Link to="/" className="mb-5 flex items-center gap-3 text-[11px] font-semibold uppercase tracking-[0.14em] text-[var(--text-muted)] hover:opacity-80">
    <img src="/prism-logo.png" className="size-8 shrink-0" />
    <span className="prism-sidebar-label">Prism Tracker</span>
  </Link>

  <p className="prism-sidebar-label truncate text-lg font-bold tracking-tight text-[var(--text-primary)]">
    Third Wave Coffee
  </p>

  <span className="badge-pill prism-sidebar-label mt-3 bg-[rgba(59,130,246,0.10)] text-[var(--signal-500)]">
    <span className="size-1.5 rounded-full bg-[var(--signal-500)]" />
    Operator
  </span>
</div>
```

**Nav item**

```css
.prism-nav-item {
  display: flex;
  align-items: center;
  gap: 10px;
  border-radius: 8px;
  padding: 10px 12px;
  color: var(--text-tertiary);
  font-size: 13px;
  font-weight: 600;
  transition: all 150ms cubic-bezier(0.16, 1, 0.3, 1);
}
.prism-nav-item:hover,
.prism-nav-item[data-active='true'] {
  background: rgba(59, 130, 246, 0.10);   /* signal-500 @ 10% */
  color: var(--signal-500);
}
```

**Section divider in nav**

```tsx
<p className="prism-sidebar-label px-3 pb-2 pt-1 text-[10px] font-bold uppercase tracking-[0.15em] text-[var(--text-muted)]">
  Rollouts
</p>
```

**Tracker nav structure**

```
ROLLOUTS
  - Dashboard         (LayoutDashboard)
  - Grid              (Grid3x3)
  - Timeline          (GanttChartSquare)

OPERATIONS
  - Snag List         (AlertTriangle)
  - Alerts            (Bell)
  - Delays            (Clock)

DATA
  - Import            (Upload)
  - Initiatives       (Sparkles)
  - Stores            (Store)

WORKSPACE
  - Members           (Users)
  - Settings          (Settings)
```

**Footer KPI card** (mirrors Prism Learning's "SCORM readiness" tile)

```tsx
<div className="border-t border-[var(--sidebar-border)] p-4">
  <div className="prism-sidebar-label rounded-2xl border border-[var(--border-subtle)] bg-[var(--card-bg)] p-4">
    <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-[var(--text-muted)]">
      Estate health
    </p>
    <div className="mt-3 flex items-end justify-between">
      <span className="font-mono-value text-2xl font-bold text-[var(--obsidian-50)]">
        82%
      </span>
      <span className="badge-pill bg-[rgba(34,197,94,0.08)] text-[var(--semantic-success)]">
        Green
      </span>
    </div>
  </div>
</div>
```

### 5.2 Topbar

```css
.prism-topbar {
  position: sticky;
  top: 0;
  z-index: 15;
  height: 56px;
  border-bottom: 1px solid var(--border-subtle);
  background: var(--topbar-bg);
  backdrop-filter: blur(16px) saturate(1.2);
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 32px;
}
```

Contents (left → right):
- Global search input (max-w-xl)
- Theme toggle (Lucide `Sun` / `Moon`, size-5)
- Notifications bell (size-5)
- Divider `border-l border-[var(--border-subtle)]`
- Avatar (h-8 w-8 rounded-full, signal-blue tinted background)
- Name + role label stack
- Logout (size-5, hover turns `text-[var(--semantic-danger)]`)

### 5.3 Glass panel

```css
.glass {
  background: var(--glass-bg);
  backdrop-filter: blur(var(--glass-blur)) saturate(1.2);
  border: 1px solid var(--glass-border);
  border-radius: 20px;
  box-shadow:
    0 0 0 0.5px rgba(255, 255, 255, 0.04),
    0 4px 24px rgba(0, 0, 0, 0.35),
    inset 0 1px 0 rgba(255, 255, 255, 0.03);
}
```

### 5.4 Widget (KPI / dashboard tile)

```css
.widget {
  background: linear-gradient(
    135deg,
    rgba(20, 20, 24, 0.9) 0%,
    rgba(16, 16, 20, 0.85) 100%
  );
  backdrop-filter: blur(20px) saturate(1.3);
  border: 1px solid var(--widget-border);
  border-radius: 24px;
  box-shadow:
    0 0 0 0.5px rgba(255, 255, 255, 0.03),
    0 8px 32px rgba(0, 0, 0, 0.3),
    inset 0 1px 0 rgba(255, 255, 255, 0.04),
    inset 0 -1px 0 rgba(0, 0, 0, 0.1);
  transition: all 320ms cubic-bezier(0.16, 1, 0.3, 1);
}
.widget:hover {
  transform: translateY(-2px);
  box-shadow:
    0 0 0 0.5px rgba(255, 255, 255, 0.06),
    0 12px 40px rgba(0, 0, 0, 0.36);
}
```

### 5.5 Primary button

```tsx
<button className="
  w-full py-3 rounded-xl
  bg-gradient-to-r from-[#2563EB] to-[#3B82F6]
  text-white font-bold text-sm
  hover:shadow-[0_4px_24px_rgba(59,130,246,0.30)]
  transition-all duration-200
  disabled:opacity-50 disabled:cursor-not-allowed
  flex items-center justify-center gap-2
">
  Sign in
</button>
```

### 5.6 Secondary / ghost button

```tsx
<button className="
  px-3 py-2 rounded-lg
  text-xs font-bold uppercase tracking-[0.12em]
  text-[var(--text-tertiary)]
  border border-[var(--border-subtle)]
  hover:bg-[var(--card-bg-hover)]
  hover:text-[var(--text-primary)]
  transition
">
  Cancel
</button>
```

### 5.7 Icon tile (for empty states, magic-link confirmations)

```css
.prism-icon-tile {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border: 1px solid rgba(59, 130, 246, 0.20);
  background: rgba(59, 130, 246, 0.08);
  color: var(--signal-500);
  box-shadow: 0 0 24px rgba(59, 130, 246, 0.06);
}
```

### 5.8 Badge pill

```css
.badge-pill {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 4px 10px;
  border-radius: 999px;
  font-size: 10px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.10em;
}
```

Variants:
- Success: `bg-[rgba(34,197,94,0.08)] text-[var(--semantic-success)]`
- Danger:  `bg-[rgba(239,68,68,0.08)] text-[var(--semantic-danger)]`
- Warning: `bg-[rgba(234,179,8,0.08)] text-[var(--semantic-warning)]`
- Accent:  `bg-[rgba(59,130,246,0.10)] text-[var(--signal-500)]`

### 5.9 Trend indicator

```tsx
<span className="inline-flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-xl
                 bg-[rgba(59,130,246,0.08)] text-[var(--signal-500)]">
  <ArrowUpRight className="size-3" /> +12%
</span>
```

---

## 6. Landing / Sign-In Screen

Full-screen centered modal on `#09090B` with ambient blue glow.

```tsx
<div className="min-h-screen flex items-center justify-center px-4
                bg-[var(--bg-primary)] relative overflow-hidden">

  {/* Ambient signal glow */}
  <div className="absolute top-1/4 left-1/2 -translate-x-1/2
                  size-[600px] rounded-full
                  bg-[rgba(59,130,246,0.06)] blur-[140px]" />

  <div className="w-full max-w-md relative">

    {/* Branding lockup */}
    <div className="mb-8 text-center">
      <img src="/prism-logo.png" className="mx-auto mb-5 size-14" />
      <p className="text-overline mb-2">Rollout tracking · Prism OS</p>
      <h1 className="text-4xl font-extrabold uppercase tracking-tight text-[var(--obsidian-50)]">
        Prism <span className="text-gradient-signal">Tracker</span>
      </h1>
    </div>

    {/* Sign-in widget */}
    <div className="widget p-8">
      <h2 className="mb-1 text-xl font-bold text-[var(--text-primary)]">
        Sign in
      </h2>
      <p className="mb-6 text-sm text-[var(--text-tertiary)]">
        Use your operator email and password.
      </p>

      {/* Form fields with text-overline labels */}
      {/* Primary signal-blue gradient button */}
    </div>

    <p className="mt-6 text-center text-[10px] uppercase tracking-[0.15em] text-[var(--text-muted)]">
      Powered by Third Wave Coffee · Prism OS
    </p>
  </div>
</div>
```

---

## 7. Border Radius Scale

| Use | Class | Value |
|---|---|---|
| Inputs, small buttons | `rounded-lg` | 8px |
| Cards, primary buttons | `rounded-xl` | 12px |
| Panels | `rounded-2xl` | 16px |
| Hero widgets, modals | `rounded-3xl` | 24px |
| Pills, avatars | `rounded-full` | 999px |

---

## 8. Motion

```css
--ease-out-expo:  cubic-bezier(0.16, 1, 0.30, 1);
--ease-in-out:    cubic-bezier(0.65, 0, 0.35, 1);
--ease-spring:    cubic-bezier(0.34, 1.56, 0.64, 1);
```

- Hover lifts: `translateY(-2px)` over 280–320ms
- Page enter: opacity 0→1, y 20→0, spring (bounce 0, duration 0.4s)
- Sidebar collapse: grid-template-columns over 280ms `--ease-out-expo`
- Selection color: `selection:bg-[rgba(59,130,246,0.20)]`

---

## 9. Iconography

- **Library**: `lucide-react` (already installed)
- **Sidebar icons**: `size-4` (16px)
- **Topbar icons**: `size-5` (20px)
- **Inline icons**: `size-3.5` (14px) for input fields, badge prefixes
- **Status dots**: `size-1.5` (6px) circles with optional glow

Reserved icons for Tracker:
- `LayoutDashboard` — dashboard
- `Grid3x3` — rollout grid
- `GanttChartSquare` — timeline
- `AlertTriangle` — snags
- `Bell` — alerts
- `Clock` — delays
- `Upload` — import
- `Sparkles` — initiatives
- `Store` — stores
- `Users` — members
- `Settings` — settings

---

## 10. Distinctive Prism Signatures (DO NOT BREAK)

These details signal "this is Prism" across all four apps. Tracker must keep them.

1. **100% JetBrains Mono.** No proportional fonts anywhere.
2. **Uppercase `tracking-[0.12em]` to `tracking-[0.15em]` labels** for every overline, section divider, sidebar header.
3. **Obsidian dark canvas** with ambient accent glow blob in background.
4. **Glass panels with inset highlights** — never flat solid cards.
5. **Accent gradient on brand title** — `Prism <Tracker>` where the second word uses `text-gradient-signal`.
6. **Sidebar = 256px sticky** with `data-collapsed` toggle to 68px.
7. **Topbar = 56px sticky** with backdrop-blur.
8. **Tabular-nums monospace numbers** on every KPI value.
9. **Lift-on-hover** `translateY(-2px)` for interactive widgets.
10. **Accent color used sparingly** — chrome, active states, primary CTAs only. Data uses semantic red/amber/green.

---

## 11. Health Pill (Tracker-specific)

Rollout cells in the grid use these:

```tsx
// GREEN — on-track
<span className="badge-pill bg-[rgba(34,197,94,0.08)] text-[var(--semantic-success)]">
  <span className="size-1.5 rounded-full bg-[var(--semantic-success)]" />
  ON TRACK
</span>

// AMBER — within 7 days
<span className="badge-pill bg-[rgba(234,179,8,0.08)] text-[var(--semantic-warning)]">
  <span className="size-1.5 rounded-full bg-[var(--semantic-warning)]" />
  DUE 5D
</span>

// RED — delayed
<span className="badge-pill bg-[rgba(239,68,68,0.08)] text-[var(--semantic-danger)]">
  <span className="size-1.5 rounded-full bg-[var(--semantic-danger)]" />
  DELAYED 3D
</span>
```

---

## 12. Tailwind v4 `@theme` Block (drop into `src/index.css`)

```css
@import "tailwindcss";

@theme {
  /* Obsidian */
  --color-obsidian-950: #09090B;
  --color-obsidian-900: #0C0C0F;
  --color-obsidian-800: #141418;
  --color-obsidian-700: #1C1C22;
  --color-obsidian-600: #27272F;
  --color-obsidian-400: #52525E;
  --color-obsidian-300: #7A7A88;
  --color-obsidian-200: #A1A1AE;
  --color-obsidian-100: #E4E4E9;
  --color-obsidian-50:  #FAFAFA;

  /* Signal Blue (Tracker accent scale) */
  --color-signal-700: #1D4ED8;
  --color-signal-600: #2563EB;
  --color-signal-500: #3B82F6;
  --color-signal-400: #60A5FA;
  --color-signal-300: #93C5FD;
  --color-signal-200: #BFDBFE;
  --color-signal-100: #DBEAFE;

  /* Semantic */
  --color-success: #22C55E;
  --color-danger:  #EF4444;
  --color-warning: #EAB308;
  --color-info:    #3B82F6;

  /* Fonts */
  --font-sans: 'JetBrains Mono', ui-monospace, SFMono-Regular, monospace;
  --font-mono: 'JetBrains Mono', ui-monospace, SFMono-Regular, monospace;

  /* Shadows */
  --shadow-signal-glow: 0 4px 14px rgba(59, 130, 246, 0.28);
  --shadow-signal-soft: 0 0 24px rgba(59, 130, 246, 0.08);
}
```

---

## 13. Migration Plan (from current UI)

The current Prism Tracker UI is light-themed (`bg-slate-50`, blue accents
already). To align with the ecosystem:

| Surface | Current | Target |
|---|---|---|
| App background | `bg-slate-50` | `bg-[var(--bg-primary)]` (#09090B) |
| Header | white border-b | `.prism-topbar` (glass, h-14) |
| Sidebar (currently `aside w-[310px]`) | white panel | `.prism-sidebar` (256px, glass) |
| Cards | `bg-white` | `.glass` or `.widget` |
| Buttons | `bg-blue-500` | gradient `from-signal-600 to-signal-500` |
| Labels | mixed | `.text-overline` (10px, 700, uppercase, 0.12em) |
| Font | system sans | `JetBrains Mono` everywhere |
| Active nav | `bg-blue-500 text-white` | `bg-[rgba(59,130,246,0.10)] text-[var(--signal-500)]` |

This is a **Phase 8 polish** item — Phase 5 (dashboards) should be built
directly against the new tokens so we don't double-pay.

---

**Owner:** Milo (visual director) + Nova (frontend)
**Status:** Approved, source of truth for all Tracker UI work from Phase 5 onward.
