# Phase 5: Dashboards & Rollout Grid

## Overview
Transform the Prism Tracker from login screen to **real-time rollout visibility**. Display all 478 stores × 4 initiatives in an efficient grid with health indicators, status pills, and interactive details.

## Goals
1. ✅ Query all rollouts from Convex with store/initiative join data
2. ✅ Build responsive rollout grid (stores as rows, initiatives as columns)
3. ✅ Display health colors (red/amber/green) for each rollout cell
4. ✅ Show status badges (planned/active/completed/paused/cancelled)
5. ✅ Add delay indicator if rollout is delayed
6. ✅ Create region/store filter UI
7. ✅ Responsive layout for 478 rows

## Architecture

### Dashboard.tsx (Main Component)
- Query: `useQuery(api.rollouts.listDetailed)` → loads all 956 rollouts + store/initiative metadata
- State: activeFilters (region, storeCode, status)
- Render: Grid container with virtual scrolling (performance critical for 478 rows)
- Sub-components:
  - RolloutGrid (grid cell rendering)
  - FilterBar (region, store, status filters)
  - HealthLegend (color reference: red/amber/green)

### RolloutGrid Component
- Virtualized table: react-window (handles 478 rows efficiently)
- Column headers: Initiative names (4 columns)
- Row headers: Store codes + names
- Cell content:
  ```
  Health dot (red/amber/green)
  Status pill (planned/active/etc)
  Y/N participation badge
  Delay days (if delayed)
  ```

### Data Flow
```
Convex Query (api.rollouts.listDetailed)
  ↓
Array<{ store, initiative, rollout }>
  ↓
Group by store, pivot by initiative
  ↓
Render grid cells with health colors
```

## Implementation Tasks

### Task 1: Extend Dashboard.tsx Query (15 min)
- Add: `const rollouts = useQuery(api.rollouts.listDetailed);`
- Add loading state
- Add error boundary
- Format data into grid structure

### Task 2: Create GridCell Component (20 min)
- Renders a single rollout cell
- Shows: health dot + status + delay info
- Responsive text sizing for small screens
- Click handler: dispatch to parent for detail modal

### Task 3: Build RolloutGrid Virtualized Table (30 min)
- Use react-window List component
- Columns: 4 initiatives (+ store code column)
- Rows: 478 stores
- Virtual scrolling for performance
- Sticky headers

### Task 4: Add FilterBar (25 min)
- Region dropdown (auto-detect from store data)
- Store search (searchable dropdown)
- Status filter (checkboxes: planned/active/completed/paused/cancelled)
- Apply filters to display

### Task 5: Styling & Layout (20 min)
- Blue accent colors for health dots
- Responsive grid (mobile: collapse to list view)
- Print-friendly styling
- Dark mode support (Tailwind)

## Estimated Effort
- Total: 2 hours (110 min)
- Blocking: Phase 3 auth (DONE)
- Unblocks: Phase 4 delay UI, Phase 7 production

## Testing Checklist
- [ ] Load dashboard → see all 478 stores × 4 initiatives grid
- [ ] Verify health colors match data (red if delayed, green if active/completed, amber if within 7 days)
- [ ] Filter by region → see only stores in that region
- [ ] Search for store code → grid updates
- [ ] Click cell → detail modal opens (reuse TaskDetailModal from Phase 1)
- [ ] Scroll performance → should be smooth even with 478 rows
- [ ] Mobile → grid converts to list or collapsed view

## Success Criteria
- ✅ All 956 rollouts displayed in grid (benchmarked: load <500ms)
- ✅ Health colors accurate per business logic
- ✅ Filters working correctly
- ✅ No console errors or TypeScript issues
- ✅ Mobile responsive (tested on 320px width)
- ✅ Commit: "Phase 5 COMPLETE: Rollout dashboard grid with health colors"

## Next Phases
- Phase 4: Delay UI (detail modals, delay reporting)
- Phase 6: AI summaries (if time permits)
- Phase 7: Production deployment
