# Admin Account Detection & Merge Scenario (Pre-Registration Payments)

## 1. Objective
Define a clear end-to-end scenario for admin operations when an individual account is newly registered, but the same IC already has historical payment records made before registration.

This scenario supports:
- Detection of legacy/pre-registration payments.
- Admin-led account consolidation (merge decision and execution).
- Verification that totals and history are reflected consistently in both:
  - Admin site (payer profile/statistics), and
  - Payer portal (records/dashboard).

---

## 2. Scope

### In Scope
- Individual account detection by IC/payer profile.
- Admin merge decision and execution flow.
- Reflection of combined historical amounts in profile/statistics views.
- UAT scenario and demo script for presentation.

### Out of Scope
- Corporate entity merge logic.
- Payment reversal/refund workflows.
- Database migration or schema change implementation.

---

## 3. Current System Behavior (As-Is)

### What already exists
- SPG duplicate handling exists (SPG employee vs individual candidate flow).
- Merge API exists: `POST /api/merges/execute`.
- Admin stats endpoint is identity-based: `GET /api/payers/:id/stats`.
- Portal guest payment history endpoint is identity-based: `GET /api/guest-payments/by-identity/:identityNo`.

### Current gap
- There is no dedicated admin page specifically for:
  - searching newly registered accounts with pre-registration payment history, and
  - guiding a reconciliation/merge flow for this case type.

---

## 4. Seeded Test Accounts (Deterministic)

Use these seeded records for demo/UAT consistency.

### A. Primary demo account (recommended)
- IC: `900105101900`
- Seed receipt: `GRCPT-SEED-GUEST-001`
- Amount: `RM30`
- Guest name: `Muhammad Amir Hakim Bin Abdullah`
- Main usage: register this IC as a new individual, then run admin detection + merge/reconciliation scenario.
- Few sample legacy merge source profiles (seeded):
  - `PYR-IND-LEG-900105-A` (`identityNo = 900105101900`, `status = inactive`)
  - `PYR-IND-LEG-900105-B` (`identityNo = 900105101900`, `status = inactive`)
  - `PYR-IND-LEG-900105-C` (`identityNo = 900105-10-1900`, `status = inactive`)
  - `PYR-IND-LEG-900105-D` (`identityNo = 900105-10-1900`, `status = inactive`)

### B. Secondary control account
- IC: `900206101901`
- Seed receipt: `GRCPT-SEED-GUEST-002`
- Amount: `RM33`
- Sample legacy merge source profile (seeded): `PYR-IND-LEG-900206-A` (`identityNo = 900206-10-1901`, `status = inactive`)

### C. Optional SPG-linked variant (if you want "few payments" narrative)
- IC: `900909104200`
- Person label in seed group: Danial Luqman (Group C context)
- Seed batch reference: `REQ-SPG-BATCH-2026-01`
- Payroll line amount: `RM140`

---

## 5. Target Admin Flow (To-Be, future page behavior)

### 5.1 Search & detect
Admin opens a dedicated reconciliation page and searches by:
- IC,
- payer code, or
- payer name.

The page should display:
- potential account candidates,
- legacy/orphan payment summary,
- confidence indicators (identity exact match / normalized match).

### 5.2 Select merge direction
Admin explicitly selects:
- `Master Account` (kept active),
- `Merged Account/Source` (to be merged into master).

### 5.3 Execute merge
System executes merge and records audit trail.

### 5.4 Verify post-merge panel
System shows:
- merge result status,
- affected payer IDs,
- merged totals summary,
- quick links to admin payer detail and portal check.

---

## 6. Data Mapping Rules

- Master account remains `active`.
- Merged account status becomes `merged`.
- Merged account stores `mergedIntoPayerId = <masterPayerId>`.
- Historical amounts tied to identity must appear under master in stats/history views.
- No double-counting is allowed.
- Normalized identity format must be treated as equivalent (with/without dashes).

---

## 7. Step-by-Step UAT Scenario

## 7.1 Preconditions
1. Seed data is loaded from current `apps/api-server/prisma/seed.ts`.
2. Admin user has permission to run merge actions.
3. Primary seed payment exists for IC `900105101900`.

## 7.2 Registration action
1. Register a new individual account using IC `900105101900`.
2. Confirm registration success and capture generated payer ID (`newPayerId`).

## 7.3 Admin detection action
1. In admin, search by IC `900105101900`.
2. Confirm system shows:
   - newly registered payer profile, and
   - historical pre-registration payment footprint (`GRCPT-SEED-GUEST-001`, RM30).

## 7.4 Merge action
1. Select the registered account as `Master Account`.
2. Select source/duplicate account representation as `Merged Account/Source`.
3. Execute merge via existing merge process.
4. Confirm merge result and audit log creation.

## 7.5 Verification action
Verify at both surfaces:

1. Admin profile view
- Open `/payers/:id` for master account.
- Confirm totals/stats include merged historical amount.
- Confirm merged account is no longer active (status `merged`).

2. Portal view (same IC)
- Login/open records for IC `900105101900`.
- Confirm transaction history reflects expected legacy payment continuity.

---

## 8. Acceptance Criteria

1. Admin can find candidate by IC search.
2. Merge execution succeeds and writes audit log.
3. Totals after merge are correct and consistent.
4. Merged profile is marked as `merged` and linked to master.
5. Admin and portal views are aligned for the same IC.

---

## 9. Negative / Edge Cases

1. Same payer selected as both master and merged:
- Expected: reject with validation error.

2. Merged account already merged:
- Expected: reject with conflict/error (`already merged` behavior).

3. No matching legacy payment:
- Expected: show no-action/empty reconciliation state.

4. Identity normalization variant:
- Example: `900202-10-1001` vs `900202101001`
- Expected: system resolves as same identity for detection.

---

## 10. Demo Script (60–90 seconds)

Use this short presentation flow:

1. "This user just registered with IC `900105101900`."
2. "Before registration, there was already a payment record: `GRCPT-SEED-GUEST-001` (RM30)."
3. Open admin reconciliation flow and search by IC.
4. Show candidate + legacy payment summary.
5. Select master + merged source and execute merge.
6. Open admin payer detail: show totals now include RM30.
7. Open portal records for same IC: show aligned transaction history.
8. Close with: "Both admin and portal now reflect one consolidated payer history."

---

## 11. API / Interface Notes

### Existing APIs used in validation
- `POST /api/merges/execute`
- `GET /api/payers/:id/stats`
- `GET /api/guest-payments/by-identity/:identityNo`

### Important note
No immediate API change is required for this documentation/scenario task.

### Optional future API proposal (for dedicated reconciliation UX)
- `GET /api/reconciliation/accounts?identityNo=...`
- `POST /api/reconciliation/merge-account`

These can be introduced if the team prefers a purpose-built reconciliation module instead of directly using `/api/merges/execute` from UI.

---

## 12. Test Cases

1. Happy path: newly registered account + pre-existing direct payment is detected and consolidated.
2. Happy path variant: include SPG-linked IC `900909104200`.
3. Invalid merge target: same master and merged payer IDs.
4. Attempt merge on already-merged profile.
5. Identity normalization handling (dashed vs non-dashed IC).

---

## 13. Assumptions & Defaults

- Database seeded with current `seed.ts`.
- Default demo account is `900105101900`.
- Scenario documentation includes both target flow and current gap.
- Seeded accounts are used (no ad-hoc data dependency).
- This document defines scenario/UAT only; implementation of new dedicated page follows in a separate engineering task.
