# Prism OS — Brand & Positioning

> Read alongside [`DESIGN_SYSTEM.md`](./DESIGN_SYSTEM.md), which holds the
> visual rules. This file is about *what each app is for* and *how the
> family fits together*.

---

## The Family

**Prism OS** is Third Wave Coffee's internal operating system — four sibling
apps that share one design language (Obsidian + JetBrains Mono + glass) and
one identity (the *Prism* wordmark), but each owns a distinct accent color
and a distinct verb.

| App | Accent | Verb | One-liner |
|---|---|---|---|
| **Prism Intelligence** | Ember Emerald `#10b37d` | *understand* | Audit, knowledge, semantic search across the estate. |
| **Prism Escalations** | Tea Orange `#E07B39` | *respond* | Inbox-grade urgency routing — who needs to act now. |
| **Prism Learning** | Ember Emerald `#10b37d` | *grow* | AI-native SCORM authoring for barista training. |
| **Prism Tracker** | Signal Blue `#3B82F6` | *coordinate* | Real-time rollout & initiative tracking across stores. |

Together they answer the four operating questions:

- *Intelligence* — **What do we know?**
- *Escalations* — **What needs attention?**
- *Learning* — **How do we get better?**
- *Tracker* — **Where are we in the plan?**

---

## Why Tracker = Blue

Each app's color encodes its mood:

- **Emerald** for *insight & growth* — the calm color of understanding.
- **Orange** for *urgency* — the color you can't ignore.
- **Blue** for *coordination & flow* — the color of moving parts, of
  schedules, of pipelines on a dashboard.

Tracker shows 478 stores × dozens of initiatives moving through planned →
active → completed. Blue is the right hue for a surface whose job is to make
*motion legible*.

---

## Wordmark

Always written as **Prism Tracker** (two words, both title case).

In display contexts the second word picks up the app's signature gradient:

```
Prism <Tracker>     ← Tracker = text-gradient-signal
```

Same pattern as the siblings:

```
Prism <Intelligence>     ← emerald gradient
Prism <Escalations>      ← orange gradient
Prism <Learning>         ← emerald gradient
Prism <Tracker>          ← blue gradient
```

The "Prism" half is always neutral text (`var(--obsidian-50)`), the
app-specific half is always gradient. This is the single most important
brand consistency rule.

---

## Voice & Tone

| Trait | Means |
|---|---|
| **Operator-grade** | Written for the person on the ground at a store launch, not for execs. Plain, fast, no marketing fluff. |
| **Monospace mindset** | UI text feels like a terminal: tabular, dense, technical, precise. Numbers always tabular-nums. |
| **Uppercase labels** | Every section header, every overline, every kicker — uppercase + wide tracking. Reads as "system speech." |
| **Honest semantic color** | Red means delayed. Amber means at risk. Green means good. Never decorative; always meaningful. |
| **Glass over solid** | Surfaces float; nothing is opaque. The app should feel layered, like looking through a heads-up display. |

---

## Page Title Pattern

Every screen has the same header lockup:

```
<overline kicker>      ← text-overline, signal blue, e.g. "ROLLOUTS · GRID"
<H1>                   ← 32px extrabold, e.g. "Live initiatives"
<one-line subtitle>    ← text-tertiary, e.g. "478 stores · 4 initiatives"
<thin divider>         ← border-b border-subtle
```

---

## What Tracker Is *Not*

To keep the family clean, Tracker stays out of these lanes:

- **Not a CRM.** No customer-facing data. Operators only.
- **Not an audit tool.** That's Intelligence's job. Tracker shows *plan vs reality*; Intelligence asks *was it done right*.
- **Not a ticketing queue.** That's Escalations. Tracker surfaces problems via the snag list, but escalating them lives in Escalations.
- **Not LMS.** That's Learning.

A rollout cell turning **red** in Tracker is the trigger; the *response*
happens in Escalations, the *training fix* happens in Learning, the *root
cause* gets understood in Intelligence. Tracker's job is just to make the
red appear at the right moment.

---

## Cross-App Navigation (Future)

When the user is signed into Prism OS, an "app switcher" lives in the top
right of every app's topbar — a 2×2 grid of the four wordmarks, current
app highlighted in its accent. Implementation lands in Phase 8.

```
┌───────────────────────────┐
│  Intelligence  Escalations │
│  Learning      Tracker ●   │   ← current app dot in its accent
└───────────────────────────┘
```

---

**Owner:** Remy (producer) + Milo (visual)
**Status:** Approved positioning. Use this doc to settle copy / scope disputes.
