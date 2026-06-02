# Sprint 3 Plan: Convex Auth Migration

**Status:** 🟡 Ready to Start  
**Estimated:** 1-2 hours  
**Goal:** Replace Firebase auth with Convex email/password auth  
**Success Criteria:** User can sign up, sign in, sign out via Convex; ProjectContext removed

---

## Tasks

### Task 1: Update App.tsx Auth Provider Chain (30 min)
- [x] ConvexAuthProvider already wraps app in main.tsx
- [ ] Remove Firebase provider from App.tsx
- [ ] Remove `useProjects()` hook (depends on Firebase)
- [ ] Replace with Convex `useAuth()` from @convex-dev/auth

**Code Changes:**
```tsx
// Before: Firebase auth state
const { user, loadingAuth, logout, login } = useProjects();

// After: Convex auth state
const { isLoading, user, signOut } = useAuth();
const signIn = async (email, password) => { /* Convex flow */ };
```

### Task 2: Create Convex Auth UI Component (40 min)
- [ ] New: `src/components/AuthGate.tsx` 
- [ ] Sign-up form (email, password)
- [ ] Sign-in form (email, password)
- [ ] Link between forms
- [ ] Blue-themed styling (match Prism design)
- [ ] Show loading state during auth

**Tests:**
- Sign up new user → success → redirects to dashboard
- Sign in existing user → success → redirects  
- Wrong password → error message
- Missing email → validation error

### Task 3: Wire AuthGate to App.tsx (20 min)
- [ ] Import AuthGate
- [ ] Show gate if `!user && !isLoading`
- [ ] Show dashboard if `user`
- [ ] Remove Firebase login button

### Task 4: Update Header with Convex User (10 min)
- [ ] Display `user.email` instead of `user.displayName`
- [ ] Wire logout to `signOut()`
- [ ] Remove dev mode bypass (or keep for testing)

---

## Blocked By
- None — all Convex backend ready

## Blocks
- Phase 4 (needs auth context to persist user session)
- Phase 5 (depends on auth for useQuery scope)

---

## Testing

### Manual Playthrough
1. Start `npm run dev` (no ?dev=true)
2. Page should show AuthGate (sign up/sign in)
3. Sign up: email@test.com / password → redirects to import tab (empty state)
4. Click sign out → back to AuthGate
5. Sign in with same email/password → dashboard

### Edge Cases
- Sign up with existing email → error
- Sign in with wrong password → error
- Session persists on page reload (Convex stores token in localStorage)

---

## Dependencies
- @convex-dev/auth v0.0.87 (already installed)
- Convex auth.ts functions (already deployed)

---

## Artifacts
- src/components/AuthGate.tsx (new, ~150 lines)
- src/App.tsx (modified, remove ProjectContext import)
- git commit: `feat: phase 3 - convex auth migration`
