# Design System — Prism Tracker

Prism Tracker follows the **Prism** app family aesthetic: clean, dense, "operational console" UI with crisp borders, mono labels, subtle dot-grid background, and a single strong accent. For this app the accent is **blue**.

> The current code uses **indigo** (`indigo-500`/`600`) as accent and a slate neutral base. The rebrand swaps the accent family to **blue** and updates copy/branding from "PROJECTSYNC.IO" → "Prism Tracker."

---

## 1. Brand

| Token | Value |
|---|---|
| App name | **Prism Tracker** |
| Wordmark | `PRISM TRACKER` (uppercase, extrabold, tracking-tight) — replaces `PROJECTSYNC.IO` in [App.tsx](../src/App.tsx) header |
| Logo mark | Prism glyph (rotated square / refracted triangle) in a dark tile, consistent with other Prism apps |
| Tagline | "Launch & trial rollout tracker" |

---

## 2. Color tokens

### Accent — Blue (replaces indigo)
| Role | Tailwind | Hex |
|---|---|---|
| Accent / primary | `blue-500` | `#3B82F6` |
| Accent hover | `blue-600` | `#2563EB` |
| Accent active/strong | `blue-700` | `#1D4ED8` |
| Accent subtle bg | `blue-50` | `#EFF6FF` |
| Accent border | `blue-100` | `#DBEAFE` |
| Accent text on subtle | `blue-600` | `#2563EB` |

### Neutral base (unchanged — Prism slate)
| Role | Tailwind |
|---|---|
| Page background | `#F8FAFC` (`slate-50`) + dot-grid pattern |
| Surface / cards | `white` |
| Borders | `slate-200` |
| Primary text | `slate-900` |
| Secondary text | `slate-500` / `slate-600` |
| Strong UI (active tab, buttons) | `slate-900` |

### Semantic / status
| Meaning | Color |
|---|---|
| Health Green / on-track / live | `emerald-500` |
| Health Amber / at-risk / delayed ≤7d | `amber-500` |
| Health Red / critical / delayed >7d | `rose-500` / `red-500` |
| Info | `blue-500` |
| Completed | `emerald-600` |
| Not started | `slate-400` |
| In progress | `blue-500` |

### Replacement guide (find → replace in code)
| Old (indigo) | New (blue) |
|---|---|
| `bg-indigo-500` | `bg-blue-500` |
| `hover:bg-indigo-600` | `hover:bg-blue-600` |
| `text-indigo-500` / `text-indigo-600` | `text-blue-500` / `text-blue-600` |
| `bg-indigo-50` | `bg-blue-50` |
| `border-indigo-100` | `border-blue-100` |
| `shadow-indigo-100` | `shadow-blue-100` |

Files touched: [App.tsx](../src/App.tsx), [Dashboard.tsx](../src/components/Dashboard.tsx), and the loading spinner / login portal accents.

---

## 3. Typography

- **Font:** Inter (already set in [index.css](../src/index.css)), system fallback.
- **Headings:** `font-black` / `font-extrabold`, `tracking-tight`.
- **Labels / meta:** `font-mono`, uppercase, `tracking-widest`, tiny sizes (`text-[9px]`–`text-[10px]`) — the signature Prism "console" label style.
- **Body:** `text-xs` / `text-sm`, `text-slate-600`.

---

## 4. Surface & shape language

- **Cards:** `bg-white border border-slate-200 rounded-sm shadow-xs`.
- **Radius:** mostly `rounded-sm` (sharp, technical) with `rounded-xl`/`2xl` reserved for the login portal and modals.
- **Background texture:** `.grid-pattern` dot-grid (`radial-gradient(#cbd5e1 1.2px, transparent 1.2px)`, 20px) — keep.
- **Status pills:** uppercase, `text-[9px]`, `font-black`, colored bg + white text or subtle tint.
- **Live indicator:** pulsing dot (`animate-pulse`) — repurpose "SYNCED: FIREBASE MAIN" → "SYNCED: CONVEX LIVE".

---

## 5. Components (themed for blue)

| Component | Notes |
|---|---|
| Primary button | `bg-blue-500 hover:bg-blue-600 text-white font-bold rounded-xl` (portal) / `rounded-sm` (toolbar) |
| Secondary button | `bg-slate-50 border border-slate-200 hover:bg-slate-900 hover:text-white` |
| Active tab | `bg-slate-900 text-white` (unchanged); inactive `text-slate-600 hover:text-slate-900` |
| Health badge | Green/Amber/Red pill per [FEATURES.md](FEATURES.md#health-scoring) |
| Delay badge | Amber/Red pill + category label; "needs reason" outline variant |
| KPI stat card | White card, big number, mono uppercase caption, blue accent icon tile (`bg-blue-50 text-blue-600`) |
| Matrix cell | Store×initiative grid cell colored by status (slate/blue/emerald/amber/rose) |
| Gantt bar | Planned bar `slate-200`, actual `blue-500`, delayed segment `rose-400`, today line `blue-600` |

---

## 6. Status & health color map (single source of truth)

| Rollout status | Dot/badge |
|---|---|
| `not_started` | slate-400 |
| `in_progress` | blue-500 |
| `live` | emerald-500 |
| `completed` | emerald-600 |
| `delayed` | amber-500 (→ rose if >7d) |
| `dropped` | slate-300 (muted) |

| Health | Color |
|---|---|
| green | emerald-500 |
| amber | amber-500 |
| red | rose-500 |

---

## 7. Layout patterns (keep from current app)

- **Header bar** (h-16, sticky): logo + wordmark + live indicator + user session + sign-out.
- **Left sidebar** (~310px): navigation / initiative list.
- **Main workspace**: tabbed (Dashboard / Board / Delays) content with `bg-slate-50/40`.
- **Right-side modal/slide-over** for detail (rollout detail), evolved from [TaskDetailModal.tsx](../src/components/TaskDetailModal.tsx).

---

## 8. Accessibility

- Maintain WCAG AA contrast: blue-600 text on white passes; avoid blue-400 for text.
- Don't rely on color alone for status — pair color with label/icon (badges include text).
- All interactive elements keyboard-focusable with visible focus ring (`ring-blue-500`).
