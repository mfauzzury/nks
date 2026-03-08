# Integration 3rd Party — Demo Cheat Sheet (1 Page)

**NKS 2.0 | LZS | Tender Committee Demo**

---

## Pre-Demo ✓
- [ ] API + admin-web running | [ ] Sample files ready (CSV/Excel) | [ ] Logged in (integration.*)

---

## Flow (15–20 min)

| # | Screen | Path | Key Action | Say |
|---|--------|------|------------|-----|
| 1 | Overview | `/integration/3rd-party` | Show 5 modules | "File Upload, Batch, Reconciliation, Exceptions, Reports" |
| 2 | File Upload | `/integration/3rd-party/file-upload` | Drag file → Intelligent mode → Upload | "AI detects structure, suggests source; supports encrypted .txt, CSV, Excel" |
| 3 | Batch Processing | `/integration/3rd-party/batch-processing` | Process PENDING file → View staging | "Decrypt, validate, parse, duplicate detection" |
| 4 | Reconciliation | `/integration/3rd-party/reconciliation` | Run Reconciliation → View detail | "AI matching + confidence score; human approval required" |
| 5 | Reports | `/integration/3rd-party/reports` | Generate Processing or Reconciliation report | "Audit-ready reports with date range" |

---

## Key Messages
- **Sources:** JAN, PSP (BILPIZ), Bank Islam, Maybank
- **AI:** File structure detection + reconciliation similarity matching
- **Compliance:** Human approval before posting; PDPA, Shariah
- **Security:** Encrypted files, SHA-256 idempotency, 7-year audit retention

---

## Quick Q&A
| Q | A |
|---|---|
| FTP auto-poll? | Manual ready; FTP configurable via INTEGRATION_CONFIG |
| AI replace human? | No — AI suggests; supervisor approves |
| Excel support? | Yes (.xlsx) |

---

*Full script: `Integration_3rd_Party_Demo_Script.md`*
