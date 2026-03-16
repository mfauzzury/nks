# Changelog

## 2026-03-16

### Counter Desk (Admin) - Current Status
- Implemented new Counter Desk page at `/counter/desk` with desktop multi-panel layout.
- Added menu entry under `Kutipan Kaunter`.
- Configured Counter Desk launch in new tab from audit flow.
- Kept existing `/counter/pos` unchanged.
- Rewired route/menu/button after `corrad-express` sync so Counter Desk remains accessible from latest admin shell.

### Next Phase Plan
- Phase 2A (Backend first): support multi-zakat items in one counter transaction via normalized transaction item model and backward-compatible API changes.
- Phase 2B (UI): allow multiple zakat rows in Counter Desk panel with itemized total/receipt.
- Phase 2C (Audit/Reconciliation): expose item-level details in audit views and ensure recon compatibility with header totals.
- Phase 2D (Future): OCR/webcam-based payer detail capture for Panel 1 (manual + lookup remains in place until this phase).

### Phase Status (Reopened)
- Active now: Phase 2A (Backend first, multi-transaction model for one payment).
- Next: Phase 2B (Counter Desk multi-zakat rows + receipt itemization).
- Follow-up: Phase 2C (audit/reconciliation item-level visibility).
- Deferred: Phase 2D (OCR/webcam payer capture).

### Phase 2A Progress
- Added normalized backend model `GuestPaymentZakatItem` linked to `GuestPayment`.
- `POST /api/counter/payments` now accepts `zakatItems[]` (multi item) with backward-compatible legacy fallback fields.
- Counter payment creation now saves header + item rows in one transaction.
- API now validates legacy `amount` (if provided) must match `zakatItems` total.
- Counter list/detail APIs now return `zakatItems` for item-level UI and audit usage.
- Dashboard and payer stats now aggregate by item-level zakat data when available (fallback to legacy `paymentMethod` parsing for older records).

### Phase 2B Progress
- Counter Desk receipt preview now supports itemized multi-zakat rendering with synchronized totals.
- After successful save, receipt panel uses saved transaction snapshot (payer, channel, collection point, item rows) to prevent drift when draft fields are edited.
- Receipt PDF export now includes itemized zakat rows when multiple items are present.
- Added `Transaksi Baru` action to reset draft and start next counter transaction cleanly.

### Phase 2C Progress
- Counter Payments audit list now shows itemized zakat summary (type + year) and receipt modal includes per-item breakdown.
- Counter Payments quick PDF export now includes zakat item lines for audit traceability.
- Counter Deposit detail API now returns payment `zakatItems` for item-level reconciliation visibility.
- Counter Deposits screen (selection + batch detail) now displays zakat summaries per payment row.
- Reconciliation Cases now include batch transaction count (`itemCount`) for better exception context.
- Reconciliation screen now supports opening matched batch detail modal with payment-level zakat breakdown.

### Phase 2C QA Log (2026-03-16)
- PASS: `npm run build:api`
- PASS: `npm run build:admin`
- PASS: Menu vs Router integrity (`UNMATCHED_MENU_PATHS` empty).
- PASS: Authenticated API smoke (`POST /api/auth/login`, `GET /api/auth/me`).
- PASS: `GET /api/counter/payments?page=1&limit=5` returns `zakatItems` field per payment row.
- PASS: `GET /api/counter/deposits?page=1&limit=5` returns `itemCount` per batch row.
- PASS: `GET /api/counter/deposits/1` returns `payments[].zakatItems` for batch detail payload.
- PASS: `GET /api/reconciliation/cases?page=1&limit=10` endpoint reachable and returns expected envelope.
- PASS: Runtime reconciliation sample seeded via API flow (`upload` + `run`) and now returns real cases:
  - 2 × `unmatched_statement_line`
  - 1 × `unmatched_deposit_batch` with `batch.itemCount` populated.
- PASS: Resolve workflow validated (`POST /api/reconciliation/cases/:id/resolve`):
  - Case `#2` resolved via `ignore` (statement line marked `ignored`).
  - Case `#1` resolved via `map_batch` to batch `#1` (statement line marked `manual_matched`, case status `resolved`).
- PASS: Reconciliation confirm guardrail validated:
  - `POST /api/reconciliation/deposits/1/confirm` correctly rejected with `VALIDATION_ERROR` when matched statement total != batch system amount.
- PASS: Confirm failure UX polished:
  - Backend error now includes matched vs system amount details.
  - Reconciliation UI now shows actionable batch-specific hint after confirm failure.
- MANUAL UI CHECKLIST (ready):
  - `/counter/payments`: verify zakat summary column and receipt modal itemized breakdown.
  - `/counter/deposits`: verify zakat column in selectable payments and batch detail modal.
  - `/counter/reconciliation`: verify matched batch table shows item count and detail modal opens with itemized zakat rows.

### Important Product Note
- Panel 1 user detail can be entered manually and via lookup now.
- OCR/webcam capture is intentionally deferred to a later phase.
