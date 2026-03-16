# Release Prep: Counter Desk Phase 2A-2C

Date: 2026-03-16
Scope: Counter Desk multi-item transaction flow, audit visibility, reconciliation action validation.

## Included
- Phase 2A (Backend)
  - Multi-zakat item model (`GuestPaymentZakatItem`) with backward-compatible counter payment payload.
  - Counter create/list/detail APIs support `zakatItems`.
  - Guardrail: legacy `amount` must match sum of `zakatItems` if both provided.
- Phase 2B (Desk UI)
  - Counter Desk receipt preview + PDF itemization for multiple zakat rows.
  - Saved receipt snapshot prevents preview drift after submit.
  - `Transaksi Baru` reset action.
- Phase 2C (Audit/Reconciliation)
  - Payments/deposits/reconciliation screens show item-level zakat summaries.
  - Reconciliation case payload includes batch `itemCount`.
  - Reconciliation matched batch detail modal includes payment-level zakat summary.
  - Confirm failure hint now shows matched vs system amounts.

## Key Routes
- `/counter/desk`
- `/counter/payments`
- `/counter/deposits`
- `/counter/reconciliation`

## Verification Summary
- Build checks:
  - `npm run build:api` (PASS)
  - `npm run build:admin` (PASS)
- API smoke:
  - Auth + protected access (PASS)
  - Counter endpoints payload checks (PASS)
  - Reconciliation flow (`upload` -> `run` -> `cases`) (PASS)
  - Case resolution (`ignore`, `map_batch`) (PASS)
  - Confirm guardrail validation (PASS, expected rejection when totals mismatch)

## Runtime Notes
- Reconciliation sample dataset created for validation using:
  - statement upload with `nks-recon-sample.csv`
  - reconciliation run on `statementId=1`
- This created open cases used to validate UI rendering and case actions.

## Known Non-Blocking Warning
- Admin production build emits bundle size warning for main chunk (>500kB).

## Suggested Release Steps
1. Snapshot DB backup.
2. Deploy API + admin web.
3. Smoke-test the 4 key routes above.
4. Validate one live counter transaction with multi-zakat items.
5. Validate one reconciliation case action in staging/prod-safe test window.
