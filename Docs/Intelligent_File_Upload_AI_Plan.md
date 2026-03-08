# Intelligent File Upload using AI – Implementation Plan

**Reference:** [NKS_AI_Integration_Module_Diagrams.md](./NKS_AI_Integration_Module_Diagrams.md)  
**Current Screen:** `IntegrationFileUploadView.vue`  
**Date:** March 2026

---

## 1. Executive Summary

The **Intelligent File Upload** feature enhances the existing Integration 3rd Party File Upload screen by using **AI File Parser (LLM Structure Detection)** to automatically detect file structure, infer source, and suggest file type—reducing manual configuration and human error.

This aligns with the AI Architecture Diagram:
- **File Intake Service** → **AI File Parser (LLM Structure Detection)** → **Standardized Transaction Format**

---

## 2. Current State vs Target State

| Aspect | Current (Manual) | Target (Intelligent) |
|--------|------------------|----------------------|
| **Source (Sumber)** | User must select before upload | AI infers from filename/content; user can confirm |
| **File Type** | User must select (ENCRYPTED_TXT, TXT, CSV, EXCEL) | AI detects from extension + content; user can confirm |
| **Column Mapping** | Rule-based (COLUMN_ALIASES) in processor | AI detects structure (delimiter, headers, column roles) |
| **Validation** | Post-upload only | Pre-upload preview + post-upload validation |
| **User Flow** | Fill form → Upload → Process | Upload → AI analyzes → User confirms → Process |

---

## 3. User Flow (Intelligent Upload)

```
┌─────────────────────────────────────────────────────────────────────────────┐
│ 1. UPLOAD (Drop or Browse)                                                  │
│    User drops file without pre-selecting Source or File Type                 │
└─────────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│ 2. AI ANALYSIS (Client or Server)                                           │
│    • Read file header / sample rows                                          │
│    • LLM: Detect delimiter, column roles, format                              │
│    • Infer source (e.g. Bank Islam format vs JAN format)                     │
│    • Infer file type (CSV, TXT, EXCEL)                                       │
└─────────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│ 3. PREVIEW & CONFIRM                                                         │
│    • Show detected: Source, File Type, Column Mapping                         │
│    • Preview first 5–10 rows                                                 │
│    • User can override Source / File Type if AI is wrong                     │
│    • User clicks "Confirm & Upload"                                          │
└─────────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│ 4. UPLOAD & PROCESS                                                          │
│    • Send file + AI-detected metadata to API                                 │
│    • Backend stores file + column mapping (if AI-provided)                   │
│    • Trigger processing (existing flow)                                      │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 4. Technical Components

### 4.1 Frontend (admin-web)

| Component | Responsibility |
|-----------|----------------|
| **IntegrationFileUploadView.vue** | Add "Intelligent Upload" mode: upload-first, then AI analysis |
| **New: useAIFileParser composable** | Call AI parse API with file sample; return structure + suggestions |
| **New: FilePreviewPanel.vue** | Display detected structure, column mapping, sample rows |
| **API: integration.ts** | Add `analyzeFileStructure(file: File)` and optional `uploadWithAIMetadata(...)` |

### 4.2 Backend (api-server)

| Component | Responsibility |
|-----------|----------------|
| **New: POST /api/integration/files/analyze** | Accept file (or sample), return AI-detected structure |
| **New: ai-file-parser service** | LLM call to detect delimiter, headers, column roles (payerIc, payerName, txDate, amount, sourceTxRef) |
| **IntegrationFile schema** | Add optional `columnMappingJson` to store AI-detected mapping |
| **integration-processor.ts** | Use `columnMappingJson` when present; fallback to rule-based |

### 4.3 AI / LLM Integration

| Option | Pros | Cons |
|--------|------|------|
| **A. OpenAI API (GPT-4)** | Strong structure detection | Cost, API key, data leaves org |
| **B. Azure OpenAI** | Enterprise, data residency | Setup complexity |
| **C. Local LLM (Ollama, etc.)** | No external API, PDPA-friendly | Lower accuracy, infra needed |
| **D. Hybrid: Rule-based + LLM fallback** | Cost control, fallback when rules fail | More logic |

**Recommendation:** Start with **Option D** – use existing rule-based logic first; call LLM only when:
- Delimiter/header detection is ambiguous
- Column mapping fails (e.g. non-standard headers)
- User explicitly requests "AI detect"

---

## 5. Data Model Changes

### 5.1 IntegrationFile (Prisma)

```prisma
model IntegrationFile {
  // ... existing fields ...
  columnMappingJson String?   // JSON: { "payerIc": "IC_NO", "payerName": "NAMA", ... }
  aiDetectedSource  String?   // AI-suggested source code
  aiConfidence      Float?   // 0–1 confidence score
}
```

### 5.2 API: Analyze Response

```typescript
interface AIFileAnalysisResult {
  fileType: "TXT" | "CSV" | "EXCEL" | "ENCRYPTED_TXT";
  suggestedSource: string | null;  // e.g. "BANK_ISLAM"
  confidence: number;
  delimiter: string;
  hasHeader: boolean;
  columnMapping: Record<string, string>;  // standardField -> detectedHeader
  sampleRows: Array<Record<string, string>>;
  warnings: string[];
}
```

---

## 6. Implementation Phases

### Phase 1: UI Enhancement (No AI Yet)
- Add "Quick Upload" mode: user drops file first, then form appears with defaults
- Pre-fill File Type from extension (.csv → CSV, .xlsx → EXCEL)
- Improve UX: show file name, size, type before upload

### Phase 2: Client-Side Structure Detection
- Add rule-based structure detection in frontend (read first N lines)
- Detect delimiter, header row, basic column hints
- Show preview before upload
- No LLM yet; validates feasibility

### Phase 3: AI File Parser (Backend)
- New endpoint: `POST /api/integration/files/analyze`
- Integrate LLM (OpenAI/Azure/local) for structure detection
- Return `AIFileAnalysisResult` to frontend
- Store `columnMappingJson` in IntegrationFile when AI used

### Phase 4: Processor Integration
- Update `integration-processor.ts` to use `columnMappingJson` when present
- Fallback to existing COLUMN_ALIASES when not

### Phase 5: Full Intelligent Flow
- Combine: Upload → Analyze → Preview → Confirm → Process
- Add "Use AI to detect" toggle for users who want automation
- Audit log: record when AI was used vs manual

---

## 7. Security & Compliance

| Requirement | Approach |
|-------------|----------|
| **PDPA** | Avoid sending full file to external LLM; use sample rows only; consider local LLM |
| **Audit** | Log AI analysis requests, results, user overrides |
| **Human approval** | AI suggestions are always confirmable; no auto-finalize |
| **Shariah governance** | AI assists; human approves before financial records finalized |

---

## 8. Dependencies

- LLM API key (OpenAI/Azure) or local LLM setup
- Frontend: ability to read file content (FileReader) for client-side preview
- Backend: new env var e.g. `OPENAI_API_KEY` or `AI_PARSER_ENABLED`

---

## 9. Success Criteria

1. User can upload file without pre-selecting Source/File Type
2. AI correctly detects structure in ≥80% of known bank/PSP formats
3. User can override AI suggestions before upload
4. Processing uses AI-detected mapping when available
5. Audit trail records AI usage

---

## 10. Files to Create/Modify

| File | Action |
|------|--------|
| `apps/admin-web/src/views/integration/IntegrationFileUploadView.vue` | Extend with Intelligent Upload mode |
| `apps/admin-web/src/composables/useAIFileParser.ts` | New composable |
| `apps/admin-web/src/api/integration.ts` | Add `analyzeFileStructure` |
| `apps/api-server/src/routes/integration.ts` | Add `POST /files/analyze` |
| `apps/api-server/src/services/ai-file-parser.ts` | New service |
| `apps/api-server/prisma/schema.prisma` | Add `columnMappingJson`, `aiDetectedSource`, `aiConfidence` |
| `apps/api-server/src/services/integration-processor.ts` | Use column mapping from DB |

---

End of Plan
