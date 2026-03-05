# Software Requirement Specification (SRS)

Project: New Kutipan System (NKS 2.0)

Module: 3rd Party Integration Module

Version: 2.0


## 1. Introduction

1.1 Purpose

This document defines the software requirements for the 3rd Party Integration Module of the New Kutipan System (NKS 2.0).

1.2 Scope

The module enables secure FTP-based encrypted file exchange, bulk processing, reconciliation, exception handling, audit logging, and reporting.

## 2. Overall Description

External Systems: JAN, PSP, Bank Islam, Maybank

Transfer Method: FTP, encrypted .txt file, minimum 1000 transactions per file

## 3. Functional Requirements

FR-01: Support FTP auto-polling and manual upload.

FR-02: Decrypt encrypted files.

FR-03: Validate structure and control totals.

FR-04: Validate transaction records.

FR-05: Detect duplicate transactions.

FR-06: Insert into staging table.

FR-07: Batch processing via async queue.

FR-08: Perform reconciliation with internal NKS records.

FR-09: Generate processing and reconciliation reports.

## 4. Use Case Diagram

Actors:

- External System (Bank/JAN/PSP)

- Executive Processing

- Supervisor

- System (NKS Integration Engine)

Use Cases:

1. Upload/Receive Encrypted File

2. Decrypt File

3. Validate File Structure

4. Process Batch Transactions

5. Reconcile Transactions

6. Review Exceptions

7. Approve/Reprocess Transactions

8. View Reports

## 5. Sequence Diagrams

### 5.1 File Processing Sequence

External System → FTP Server → Integration Engine → Decryption Service → Validation Engine → Staging DB → Batch Processor → Main DB

### 5.2 Reconciliation Sequence

Batch Processor → Reconciliation Engine → Internal Transaction DB → Match Result → Exception Queue → Supervisor Review

## 6. Database Schema

### 6.1 Table: INTEGRATION_FILE

file_id (UUID, PK)

file_name (VARCHAR)

source_system (VARCHAR)

total_records (INTEGER)

total_amount (DECIMAL)

status (VARCHAR)

uploaded_date (TIMESTAMP)

### 6.2 Table: INTEGRATION_STAGING

staging_id (UUID, PK)

file_id (UUID, FK)

payer_ic (VARCHAR)

transaction_date (DATE)

amount (DECIMAL)

status (VARCHAR)

error_message (TEXT)

### 6.3 Table: RECONCILIATION_LOG

recon_id (UUID, PK)

staging_id (UUID, FK)

internal_transaction_id (UUID)

match_status (VARCHAR)

recon_date (TIMESTAMP)

## 7. Traceability Matrix


# Annex A: UML Diagrams (Graphical)

## A.1 Use Case Diagram

Diagram below shows the key actors and use cases for the 3rd Party Integration Module.


## A.2 Sequence Diagram — File Processing

Diagram below illustrates end-to-end flow from encrypted file reception to batch upsert into Main DB.


## A.3 Sequence Diagram — Reconciliation & Exception Review

Diagram below illustrates reconciliation, logging, exception routing, and supervisor decision.



# Annex B: Enterprise-Level Database Schema (Production Design)

This section expands the database design to support high-volume ingestion, idempotent processing, reconciliation, auditability, configurability, and operational monitoring.

## B.1 INTEGRATION_SOURCE (Master Reference)


## B.2 INTEGRATION_FILE (File Intake & Control Totals)


## B.3 INTEGRATION_FILE_EVENT (Operational Timeline)


## B.4 INTEGRATION_STAGING_TX (Parsed Transactions Staging)


## B.5 INTEGRATION_STAGING_DUPLICATE (Duplicate Detection Findings)


## B.6 INTEGRATION_JOB (Queue/Batch Orchestration)


## B.7 RECONCILIATION_RESULT (Match Output)


## B.8 RECONCILIATION_ACTION (Supervisor Review & Resolution)


## B.9 INTEGRATION_CONFIG (Runtime Config & Rules)


## B.10 Indexing & Constraints (Summary)

- Unique: INTEGRATION_FILE.file_hash_sha256

- Unique recommended: INTEGRATION_STAGING_TX(file_id, record_hash) to prevent re-import duplicates

- Indexes: payer_ic + tx_date + amount for fast matching

- Partitioning (recommended): INTEGRATION_STAGING_TX and RECONCILIATION_RESULT partition by tx_date (monthly) for scale

## B.11 Data Retention & Purge (Summary)

- Keep INTEGRATION_FILE + events for minimum 7 years (align with audit retention).

- Purge decrypted raw payload after successful import (store only hash + metadata).

- Staging rows may be archived after posting/reconciliation based on policy.


# Annex C: Expanded Traceability Matrix


| Requirement ID | Use Case | Database Table |
| --- | --- | --- |
| FR-01 | Upload File | INTEGRATION_FILE |
| FR-02 | Decrypt File | INTEGRATION_FILE |
| FR-03 | Validate File | INTEGRATION_STAGING |
| FR-05 | Duplicate Detection | INTEGRATION_STAGING |
| FR-08 | Reconciliation | RECONCILIATION_LOG |


| Column | Type | Null | Key/Index | Default | Description |
| --- | --- | --- | --- | --- | --- |
| source_id | UUID | NO | PK | gen_random_uuid() | Unique source id |
| source_code | VARCHAR(30) | NO | UNIQUE | - | JAN / PSP / BANK_ISLAM / MAYBANK |
| source_name | VARCHAR(100) | NO |  | - | Display name |
| transport_type | VARCHAR(20) | NO | INDEX | FTP | FTP / SFTP / MANUAL |
| is_active | BOOLEAN | NO | INDEX | 1 | Active flag |
| created_at | TIMESTAMP | NO |  | CURRENT_TIMESTAMP | Created datetime |


| Column | Type | Null | Key/Index | Default | Description |
| --- | --- | --- | --- | --- | --- |
| file_id | UUID | NO | PK | gen_random_uuid() | Unique file id |
| source_id | UUID | NO | FK, INDEX | - | FK -> INTEGRATION_SOURCE |
| file_name | VARCHAR(255) | NO | INDEX | - | Received file name |
| file_hash_sha256 | CHAR(64) | NO | UNIQUE | - | Idempotency at file level |
| received_channel | VARCHAR(20) | NO | INDEX | FTP | FTP / MANUAL |
| received_at | TIMESTAMP | NO | INDEX | CURRENT_TIMESTAMP | Receive timestamp |
| encrypted | BOOLEAN | NO |  | 1 | Whether file is encrypted |
| encryption_method | VARCHAR(50) | YES |  | - | e.g., AES-256-GCM |
| decrypt_status | VARCHAR(20) | NO | INDEX | PENDING | PENDING/SUCCESS/FAILED |
| validation_status | VARCHAR(20) | NO | INDEX | PENDING | PENDING/PASSED/FAILED |
| processing_status | VARCHAR(20) | NO | INDEX | PENDING | PENDING/IN_PROGRESS/COMPLETED/FAILED |
| total_records_declared | INT | YES |  | NULL | From trailer/control |
| total_amount_declared | DECIMAL(18,2) | YES |  | NULL | From trailer/control |
| total_records_parsed | INT | YES |  | NULL | After parse |
| total_amount_parsed | DECIMAL(18,2) | YES |  | NULL | After parse |
| error_summary | TEXT | YES |  | NULL | High-level error summary |


| Column | Type | Null | Key/Index | Default | Description |
| --- | --- | --- | --- | --- | --- |
| event_id | UUID | NO | PK | gen_random_uuid() | Unique event id |
| file_id | UUID | NO | FK, INDEX | - | FK -> INTEGRATION_FILE |
| event_type | VARCHAR(30) | NO | INDEX | - | RECEIVED/DECRYPTED/VALIDATED/IMPORTED/QUEUED/PROCESSED/RECONCILED |
| event_status | VARCHAR(20) | NO | INDEX | - | SUCCESS/FAILED |
| event_message | TEXT | YES |  | NULL | Details / error |
| created_at | TIMESTAMP | NO | INDEX | CURRENT_TIMESTAMP | Event time |
| created_by | VARCHAR(50) | YES | INDEX | SYSTEM | User id or SYSTEM |


| Column | Type | Null | Key/Index | Default | Description |
| --- | --- | --- | --- | --- | --- |
| staging_tx_id | UUID | NO | PK | gen_random_uuid() | Unique staging row id |
| file_id | UUID | NO | FK, INDEX | - | FK -> INTEGRATION_FILE |
| source_tx_ref | VARCHAR(80) | YES | INDEX | NULL | External reference number |
| payer_ic | VARCHAR(14) | YES | INDEX | NULL | MyKad/Passport (as available) |
| payer_name | VARCHAR(150) | YES |  | NULL | Optional name from source |
| tx_date | DATE | NO | INDEX | - | Transaction date |
| tx_time | TIME | YES |  | NULL | Optional time |
| amount | DECIMAL(18,2) | NO | INDEX | - | Transaction amount |
| channel | VARCHAR(30) | YES | INDEX | NULL | e.g., SPG/PSP/BANK |
| currency | CHAR(3) | NO |  | MYR | Currency |
| record_hash | CHAR(64) | NO | INDEX | - | Idempotency per record (hash of key fields) |
| staging_status | VARCHAR(20) | NO | INDEX | NEW | NEW/INVALID/DUPLICATE/READY/POSTED |
| validation_errors | TEXT | YES |  | NULL | JSON/text list of validation errors |
| created_at | TIMESTAMP | NO | INDEX | CURRENT_TIMESTAMP | Created datetime |


| Column | Type | Null | Key/Index | Default | Description |
| --- | --- | --- | --- | --- | --- |
| dup_id | UUID | NO | PK | gen_random_uuid() | Duplicate finding id |
| staging_tx_id | UUID | NO | FK, INDEX | - | FK -> INTEGRATION_STAGING_TX |
| duplicate_type | VARCHAR(30) | NO | INDEX | - | SAME_FILE / CROSS_FILE / INTERNAL |
| matched_staging_tx_id | UUID | YES | INDEX | NULL | Matched staging row (if any) |
| matched_internal_tx_id | UUID | YES | INDEX | NULL | Matched internal tx id (if any) |
| reason | TEXT | YES |  | NULL | Reason/rule triggered |
| created_at | TIMESTAMP | NO | INDEX | CURRENT_TIMESTAMP | Created datetime |


| Column | Type | Null | Key/Index | Default | Description |
| --- | --- | --- | --- | --- | --- |
| job_id | UUID | NO | PK | gen_random_uuid() | Job id |
| file_id | UUID | NO | FK, INDEX | - | FK -> INTEGRATION_FILE |
| job_type | VARCHAR(30) | NO | INDEX | - | DECRYPT/VALIDATE/IMPORT/PROCESS/RECONCILE |
| job_status | VARCHAR(20) | NO | INDEX | PENDING | PENDING/RUNNING/SUCCESS/FAILED/RETRYING |
| attempt | INT | NO |  | 0 | Retry attempt count |
| max_attempts | INT | NO |  | 5 | Max retries |
| locked_by | VARCHAR(50) | YES | INDEX | NULL | Worker id |
| locked_at | TIMESTAMP | YES |  | NULL | Lock time |
| last_error | TEXT | YES |  | NULL | Last error message |
| created_at | TIMESTAMP | NO | INDEX | CURRENT_TIMESTAMP | Created datetime |
| updated_at | TIMESTAMP | YES | INDEX | NULL | Updated datetime |


| Column | Type | Null | Key/Index | Default | Description |
| --- | --- | --- | --- | --- | --- |
| recon_id | UUID | NO | PK | gen_random_uuid() | Reconciliation row |
| staging_tx_id | UUID | NO | FK, INDEX | - | FK -> INTEGRATION_STAGING_TX |
| internal_tx_id | UUID | YES | INDEX | NULL | Matched internal transaction id |
| match_status | VARCHAR(20) | NO | INDEX | - | MATCHED/DUPLICATE/MISMATCH/UNMATCHED |
| match_rule | VARCHAR(50) | YES | INDEX | NULL | EXACT_IC_AMT_DATE, etc. |
| confidence_score | DECIMAL(5,2) | YES |  | NULL | 0-100 (optional) |
| exception_code | VARCHAR(30) | YES | INDEX | NULL | If status not MATCHED |
| exception_detail | TEXT | YES |  | NULL | Reason / comparison details |
| created_at | TIMESTAMP | NO | INDEX | CURRENT_TIMESTAMP | Created datetime |


| Column | Type | Null | Key/Index | Default | Description |
| --- | --- | --- | --- | --- | --- |
| action_id | UUID | NO | PK | gen_random_uuid() | Action id |
| recon_id | UUID | NO | FK, INDEX | - | FK -> RECONCILIATION_RESULT |
| action_type | VARCHAR(30) | NO | INDEX | - | APPROVE_POST/REJECT/REQUEST_INFO/REPROCESS/MANUAL_MATCH |
| action_note | TEXT | YES |  | NULL | Supervisor comment |
| acted_by | VARCHAR(50) | NO | INDEX | - | User id |
| acted_at | TIMESTAMP | NO | INDEX | CURRENT_TIMESTAMP | Action datetime |


| Column | Type | Null | Key/Index | Default | Description |
| --- | --- | --- | --- | --- | --- |
| config_id | UUID | NO | PK | gen_random_uuid() | Config id |
| source_id | UUID | YES | FK, INDEX | NULL | Optional per source |
| config_key | VARCHAR(80) | NO | INDEX | - | e.g., FTP_PATH, FILE_PATTERN, ENC_METHOD, DUP_RULE |
| config_value | TEXT | NO |  | - | Value (string/JSON) |
| is_secret | BOOLEAN | NO | INDEX | 0 | Indicates secret (stored encrypted) |
| effective_from | TIMESTAMP | YES | INDEX | NULL | Effective start |
| effective_to | TIMESTAMP | YES | INDEX | NULL | Effective end |
| updated_by | VARCHAR(50) | YES | INDEX | SYSTEM | User id |
| updated_at | TIMESTAMP | NO | INDEX | CURRENT_TIMESTAMP | Updated datetime |


| Requirement | Use Case | Primary Tables | Notes |
| --- | --- | --- | --- |
| FR-01 Receive/Upload | UC01 | INTEGRATION_FILE, INTEGRATION_FILE_EVENT | FTP polling/manual upload; file hash idempotency |
| FR-02 Decrypt | UC02 | INTEGRATION_FILE, INTEGRATION_JOB, INTEGRATION_FILE_EVENT | Decrypt status tracked; failures logged |
| FR-03 Validate | UC03 | INTEGRATION_FILE, INTEGRATION_STAGING_TX, INTEGRATION_FILE_EVENT | Header/trailer totals and per-row validation |
| FR-04 Import to Staging | UC04 | INTEGRATION_STAGING_TX, INTEGRATION_JOB | Staging_status NEW/INVALID/READY |
| FR-05 Duplicate Detection | UC05 | INTEGRATION_STAGING_DUPLICATE, INTEGRATION_STAGING_TX | Same-file/cross-file/internal duplicate |
| FR-07 Async Batch Processing | UC05 | INTEGRATION_JOB | Retry and locking semantics |
| FR-08 Reconcile | UC06 | RECONCILIATION_RESULT, INTEGRATION_STAGING_TX | Match statuses and rules |
| FR-09 Review Exceptions | UC07 | RECONCILIATION_ACTION, RECONCILIATION_RESULT | Supervisor decisions recorded |
| NFR Security/Audit | UC08 | INTEGRATION_FILE_EVENT (+ centralized AUDIT_LOG if used) | Every step produces auditable events |
