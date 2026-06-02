# Security Specification: Lightweight Project Tracker

This document defines the security rules, invariants, and threat models for the collaborative Lightweight Project Tracker.

## 1. Data Invariants

1. **Project Ownership and Membership**: A project can only be created by an authenticated user, who becomes its owner. Only members listed in the project's `memberEmails` or the owner can read/write sub-resources (tasks, snags, comments).
2. **Task-Project Relational Invariant**:
   - A task cannot exist without its parent project document.
   - Access to tasks is strictly inherited from membership of the parent project.
3. **Deadlines & Timelines**:
   - Every task must have a valid `timelineStart` and `timelineEnd` formatted as strings (`YYYY-MM-DD`).
4. **Status and Priority Boundaries**:
   - Task `status` is restricted to: `todo`, `in_progress`, `review`, `completed`.
   - Task `priority` is restricted to: `low`, `medium`, `high`, `critical`.
   - Snag `status` is restricted to: `open`, `resolved`.
   - Snag `priority` is restricted to: `low`, `medium`, `high`.
5. **Team Bounds**:
   - A hard limit of 10 maximum members per project to prevent resource exhaustion.
6. **File Size and Count Enforcements**:
   - Task attachments are stored as structured objects in an array. The array size must not exceed 10.
7. **Identity Integrity**:
   - Comments must match the authenticated user's email or UID. No user can post on behalf of another team member.
   - `createdAt` and `ownerId` must be immutable after document creation.

---

## 2. The "Dirty Dozen" Threat Payloads

The following payloads represent malicious attempts to bypass identity, integrity, or system state:

### 1. The Impersonator Create
**Intent:** An unauthenticated clickjack attempt to create a Project.
**Payload:**
```json
{
  "name": "Hacked Project",
  "ownerId": "some_stolen_id",
  "ownerEmail": "another_user@domain.com"
}
```
**Expected Outcome:** `PERMISSION_DENIED`

### 2. The Fake Member Read
**Intent:** An authenticated user who is NOT a project owner or member attempts to read a project.
**Request:** `get(/projects/project_abc)` with `request.auth.uid = "baddy_uid"`.
**Expected Outcome:** `PERMISSION_DENIED`

### 3. The Shadow Member Update
**Intent:** A project contributor tries to inject themselves as the project owner.
**Payload (update):**
```json
{
  "name": "Super Project Tracker",
  "ownerId": "baddy_uid"
}
```
**Expected Outcome:** `PERMISSION_DENIED` (ownerId is immutable).

### 4. Bypassing Status Steps (Status Out of Bounds)
**Intent:** Injected task with a status that does not exist in the allowed Enum.
**Payload:**
```json
{
  "title": "Malicious Task",
  "status": "ultra_completed",
  "priority": "high",
  "assignedTo": "alice@company.com"
}
```
**Expected Outcome:** `PERMISSION_DENIED`

### 5. Denying Wallet via Gigantic Document IDs
**Intent:** Create a document with a 2MB key name to degrade indexer performance.
**Path:** `/projects/VERY_LONG_STRING_REPEATING_2000_TIMES`
**Expected Outcome:** `PERMISSION_DENIED` (ID exceeds 128 characters or contains invalid characters).

### 6. Overriding the Hardened Timestamp
**Intent:** Artificially set a historic or future date to corrupt timeline analysis.
**Payload:**
```json
{
  "title": "Malicious Task",
  "createdAt": "1999-01-01T00:00:00Z"
}
```
**Expected Outcome:** `PERMISSION_DENIED` (must equal `request.time`).

### 7. Spoofed Comment Author
**Intent:** A user posts a comment claiming they are a manager when they are not.
**Payload:**
```json
{
  "text": "Go to lunch, I approved this.",
  "author": "alice@company.com",
  "authorUid": "alice_uid"
}
```
**Auth Context:** `request.auth.uid = "charlie_uid"`, `request.auth.token.email = "charlie@company.com"`
**Expected Outcome:** `PERMISSION_DENIED`

### 8. Exceeding Attachment Invariant
**Intent:** Injecting 50 attachments into a task array to cause storage creep.
**Payload:**
```json
{
  "attachments": [
    {"name": "file1.pdf", "url": "http://..."},
    {"name": "file2.pdf", "url": "http://..."},
    // ... x50 items
  ]
}
```
**Expected Outcome:** `PERMISSION_DENIED` (array size exceeds 10 limits).

### 9. Task Orphan Creation
**Intent:** Direct creation of a task without checking if the parent project exists.
**Request:** `create(/projects/nonexistent_project_123/tasks/task_abc)`
**Expected Outcome:** `PERMISSION_DENIED`

### 10. Sneaking Ghost Fields (Shadow Fields Audit)
**Intent:** Sending additional field parameters like `isAdmin: true` to bypass roles.
**Payload:**
```json
{
  "title": "Nice Task",
  "status": "todo",
  "priority": "high",
  "assignedTo": "alice@company.com",
  "timelineStart": "2026-05-27",
  "timelineEnd": "2026-06-27",
  "isAdmin": true
}
```
**Expected Outcome:** `PERMISSION_DENIED` (shadow field check rejects because key keys size does not match schema).

### 11. Bypassing Email Verification Check
**Intent:** Reading projects while email verification token is set to false.
**Auth Context:** `request.auth.uid = "member_uid"`, `request.auth.token.email_verified = false`
**Expected Outcome:** `PERMISSION_DENIED`

### 12. Deleting Completed Task Lockout
**Intent:** Deleting a locked completed project task to rewrite history.
**Request:** `delete(/projects/project_abc/tasks/completed_task_abc)` with `request.auth.uid` of a non-owner member.
**Expected Outcome:** `PERMISSION_DENIED` (only Project Owner can delete tasks, or completed state locks direct deletions).

---

## 3. Test Runner Plan

A conceptual test runner file is placed in `/firestore.rules.test.ts` to assert security permissions and deny all 12 malicious payloads. Output errors must map to proper codes.
