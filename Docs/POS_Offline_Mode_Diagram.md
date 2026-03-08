# POS Offline Mode Diagram

## Scope
This design is for **POS module only** so payment collection can continue when internet is unavailable.

## 1. High-Level Architecture
```mermaid
flowchart LR
    Cashier[Cashier / Counter Staff] --> POS[POS App]

    POS --> LocalDB[(Local Queue DB\nSQLite / IndexedDB)]
    POS --> Printer[Receipt Printer]

    POS --> Net{Internet Available?}
    Net -- No --> LocalDB
    Net -- Yes --> SyncEngine[Sync Engine]

    SyncEngine --> API[API Server]
    API --> CoreDB[(Central Database)]

    API --> Ack[Sync Ack\nSYNCED / FAILED_SYNC]
    Ack --> LocalDB

    LocalDB --> Supervisor[Supervisor Reconciliation View]
```

## 2. Payment Flow (Online/Offline)
```mermaid
sequenceDiagram
    autonumber
    participant C as Cashier
    participant P as POS App
    participant L as Local Queue DB
    participant S as Sync Engine
    participant A as API Server

    C->>P: Enter payment details
    P->>L: Save transaction (PENDING_SYNC)
    P->>C: Show success + local receipt no.

    alt Internet available now
        P->>S: Trigger immediate sync
        S->>A: POST payment (client_txn_id)
        A-->>S: SYNCED / duplicate-safe ACK
        S->>L: Update status to SYNCED
    else Internet unavailable
        Note over P,S: Continue accepting payments offline
    end

    loop Background retry when online
        S->>L: Fetch PENDING_SYNC / FAILED_SYNC
        S->>A: Retry POST (same client_txn_id)
        A-->>S: SYNCED or FAILED_SYNC reason
        S->>L: Update status + sync metadata
    end
```

## 3. Transaction State Machine
```mermaid
stateDiagram-v2
    [*] --> PENDING_SYNC: payment captured locally
    PENDING_SYNC --> SYNCING: sync job started
    SYNCING --> SYNCED: server accepted / idempotent duplicate
    SYNCING --> FAILED_SYNC: rejected / timeout / validation issue
    FAILED_SYNC --> SYNCING: retry or manual requeue
    PENDING_SYNC --> VOIDED: supervisor void before sync
    FAILED_SYNC --> VOIDED: supervisor void after failure
    SYNCED --> [*]
    VOIDED --> [*]
```

## 4. Key Rules
- Every payment has immutable `client_txn_id` (UUID) for idempotent sync.
- Offline-acceptable channels: cash, cheque, manual methods.
- Online-only channels (gateway/real-time auth) must be blocked or marked pending policy.
- Printed offline receipt must include clear marker: `OFFLINE - Pending Sync`.
- No silent drop: failed sync must stay visible in reconciliation queue.

## 5. Minimum Data Fields (Local Queue)
- `client_txn_id`
- `local_receipt_no`
- `status` (`PENDING_SYNC | SYNCING | SYNCED | FAILED_SYNC | VOIDED`)
- `amount`, `payer`, `zakat_type`, `payment_channel`, `counter_id`, `staff_id`
- `created_at_local`, `last_sync_at`, `sync_error`
