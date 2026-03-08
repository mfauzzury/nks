# Reconciliation Mapping Scenarios

Design for supporting one-to-one, one-to-many, many-to-one, and many-to-many mappings.

---

## Current State: One-to-One Only

| Aspect | Current |
|--------|---------|
| **Model** | `ReconciliationResult`: `stagingTxId` (1) → `internalTxId` (1) |
| **Apply** | Manual Match / Force Match links one staging tx to one GuestPayment/BankStatement |
| **Validation** | Single internal ID per staging tx |

---

## Mapping Scenarios

| Scenario | Description | Example |
|---------|-------------|---------|
| **1:1** | 1 staging → 1 internal | Bank TXN-001 (RM 100) → Receipt GRCPT-001 (RM 100) |
| **1:N** | 1 staging → N internal | Bank TXN-001 (RM 200) → Receipt A (RM 80) + Receipt B (RM 120) |
| **N:1** | N staging → 1 internal | Bank TXN-001 (RM 60) + TXN-002 (RM 40) → Receipt GRCPT-001 (RM 100) |
| **N:M** | N staging ↔ M internal | 2 bank txs (RM 150 total) ↔ 3 receipts (RM 50 each) |

---

## Proposed Schema Changes

### Option A: Link Table (Recommended)

Introduce `ReconciliationMatchLink` to support all scenarios:

```prisma
model ReconciliationMatchLink {
  id              Int       @id @default(autoincrement())
  stagingTxId     Int
  internalTxId    String    @db.VarChar(80)   // GuestPayment-123 or BankStatementTransaction-456
  amountAllocated Decimal?  @db.Decimal(18, 2)  // For partial matches
  matchType       String    @db.VarChar(20)   // ONE_TO_ONE, ONE_TO_MANY, MANY_TO_ONE, MANY_TO_MANY
  createdAt       DateTime  @default(now())
  
  stagingTx       IntegrationStagingTx @relation(...)
  
  @@unique([stagingTxId, internalTxId])  // Prevent duplicate links
  @@index([internalTxId])  // For "which staging txs use this internal?"
}
```

- **1:1**: One link per staging tx.
- **1:N**: Multiple links with same `stagingTxId`, different `internalTxId`; `amountAllocated` optional.
- **N:1**: Multiple links with same `internalTxId`, different `stagingTxId`; `amountAllocated` for partial.
- **N:M**: Multiple links in both directions; `amountAllocated` required.

### Option B: Extend ReconciliationResult

Keep `ReconciliationResult` as the main record, add JSON for multiple internals:

```prisma
// Add to ReconciliationResult
internalTxIds    String?   @db.Text  // JSON: ["GuestPayment-1","GuestPayment-2"]
amountAllocated  Decimal?  @db.Decimal(18, 2)  // For partial (many-to-one)
```

Simpler but less flexible for N:M and reporting.

---

## Implementation Phases

### Phase 1: Many-to-One ✅ Implemented

- **Change**: Allow multiple `ReconciliationResult` rows to share the same `internalTxId`.
- **Logic**: Sum of staging amounts ≤ internal amount (2% tolerance); validation in apply-match.
- **UI**: Manual Match search, select internal record; shows "X staging sudah dipadankan · Baki RM Y" for many-to-one.
- **Schema**: No change.

### Phase 2: One-to-Many ✅ Implemented

- **Change**: One staging tx → multiple internal records.
- **Schema**: `ReconciliationMatchLink` table (reconResultId, internalTxId).
- **Logic**: Sum of internal amounts ≈ staging amount (2% tolerance).
- **UI**: 1:N button, multi-select internal records; Batch 1:N for multiple staging txs.

### Phase 3: Many-to-Many ✅ Implemented

- **Change**: Full link table; groups of staging ↔ groups of internal.
- **Schema**: `ReconciliationMatchLink` with `amountAllocated` (used for N:M).
- **API**: `apply-match-many-to-many`, `apply-match-many-to-many-batch`.
- **UI**: N:M button, group match modal with allocation grid; batch mode splits groups.

---

## UI Considerations

| Scenario | Manual Match Flow | Display |
|----------|-------------------|---------|
| **1:1** | Select 1 internal → Apply | Current |
| **1:N** | Add internal 1, Add internal 2, … → Apply when total matches | List of linked internals with amounts |
| **N:1** | Select 1 internal (may already have links) → Allocate amount → Apply | "Linked: TXN-001 (RM 60), TXN-002 (RM 40)" |
| **N:M** | Select staging group + internal group → Allocate per link → Apply | Matrix/grid view |

---

## Recommendation

1. **Phase 1 (Many-to-One)**: Implement first with minimal schema changes.
2. **Phase 2 (One-to-Many)**: Add link table or `internalTxIds` when needed.
3. **Phase 3 (Many-to-Many)**: Full link table when business requires it.

---

## Next Steps

1. Confirm which scenarios are required for MVP.
2. Update apply-match API to support multiple internal IDs and amount allocation.
3. Extend Manual Match modal for multi-select and amount allocation.
4. Add validation (sum of amounts, duplicate prevention).
