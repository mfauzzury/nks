# Integration 3rd Party - Table Creation Plan

## 1. Screen-to-Table Mapping

| Screen | Purpose | Current Storage | Proposed Table(s) |
|--------|---------|-----------------|-------------------|
| **Kategori Sumber** | Manage source categories (SPG, PSP, BANK) | `Setting.sourceCategories` (JSON) | `IntegrationSourceCategory` |
| **Sumber Data** | Manage sources (JAN, BILPIZ, BANK_ISLAM, MAYBANK) | `Setting.sourceData` (JSON) | `IntegrationSource` |
| **File Upload** | Upload files from selected source | Form only (no persist) | `IntegrationFile` + related tables |

---

## 2. Field Mapping from Screens

### 2.1 Kategori Sumber (SourceCategoriesView.vue)

| UI Field | Type | Table Column |
|----------|------|--------------|
| Kod | text | `code` (PK) |
| Nama | text | `name` |
| Aktif | checkbox | `isActive` |
| Nota | text | `notes` |

### 2.2 Sumber Data (SumberDataListView.vue, SumberDataEditorView.vue)

| UI Field | Type | Table Column |
|----------|------|--------------|
| Kod | text | `code` (PK) |
| Nama | text | `name` |
| Kategori Sumber | select | `categoryId` (FK → IntegrationSourceCategory) |
| Aktif | checkbox | `isActive` |
| Nota | text | `notes` |

### 2.3 File Upload (IntegrationFileUploadView.vue)

| UI Field | Type | Table Column |
|----------|------|--------------|
| Sumber | select (JAN, BILPIZ, BANK_ISLAM, MAYBANK) | `sourceId` (FK → IntegrationSource) |
| Jenis Fail | select (ENCRYPTED_TXT, TXT, CSV, EXCEL) | `fileType` |
| Transfer Method | MANUAL (for this screen) | `receivedChannel` |
| Catatan | textarea | stored in `IntegrationFile.description` or event |

---

## 3. Table Design Summary

### Tier 1: Master Data (aligned with screens)

1. **IntegrationSourceCategory** — Kategori Sumber
   - Replaces `Setting.sourceCategories` JSON
   - Fields: id, code, name, isActive, notes, createdAt, updatedAt

2. **IntegrationSource** — Sumber Data
   - Replaces `Setting.sourceData` JSON
   - Fields: id, code, name, categoryId (FK), transportType, isActive, notes, createdAt, updatedAt
   - File Upload "Sumber" dropdown = IntegrationSource

### Tier 2: File Intake (File Upload flow)

3. **IntegrationFile** — File intake & control totals
   - sourceId (FK → IntegrationSource)
   - fileType (ENCRYPTED_TXT, TXT, CSV, EXCEL)
   - file_name, file_hash, received_channel, status fields, etc.

4. **IntegrationFileEvent** — Operational timeline

5. **IntegrationStagingTx** — Parsed transactions staging

6. **IntegrationStagingDuplicate** — Duplicate detection

7. **IntegrationJob** — Queue/batch orchestration

8. **ReconciliationResult** — Match output

9. **ReconciliationAction** — Supervisor review

10. **IntegrationConfig** — Runtime config (optional, can use Setting table)

---

## 4. Migration Strategy

- **Phase 1**: Create new tables (IntegrationSourceCategory, IntegrationSource, IntegrationFile, etc.)
- **Phase 2**: Migrate existing JSON data from Setting table to new tables (separate migration script)
- **Phase 3**: Update API routes to use new tables instead of Setting JSON
- **Phase 4**: Update admin-web to call new API (or keep same API contract)

---

## 5. File Type Enum (matches File Upload screen)

```
ENCRYPTED_TXT | Plain .txt | CSV | Excel (.xlsx)
```

---

## 6. Transport Type (matches SRS)

```
FTP | SFTP | MANUAL
```

---

## 7. Notes

- **IntegrationSource.code** must match File Upload dropdown values: JAN, BILPIZ, BANK_ISLAM, MAYBANK
- **IntegrationSourceCategory.code** must match Sumber Data category: SPG, PSP, BANK
- Seed data should populate default categories and sources to match current `DEFAULT_SOURCE_CATEGORIES` and `DEFAULT_SOURCE_DATA`
