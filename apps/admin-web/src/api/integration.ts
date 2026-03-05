import { apiRequest } from "./client";

export interface IntegrationSource {
  id: number;
  code: string;
  name: string;
  categoryId: number;
  transportType: string;
  isActive: boolean;
  category?: { code: string; name: string };
}

export interface IntegrationFile {
  id: number;
  sourceId: number;
  fileName: string;
  filePath?: string | null;
  fileHashSha256: string;
  receivedChannel: string;
  fileType: string;
  description: string | null;
  receivedAt: string;
  processingStatus: string;
  totalRecordsDeclared?: number | null;
  totalRecordsParsed?: number | null;
  source?: IntegrationSource & { category?: { code: string; name: string } };
}

export async function listIntegrationSources() {
  return apiRequest<{ data: IntegrationSource[] }>("/api/integration/sources");
}

export interface AIFileAnalysisResult {
  fileType: "TXT" | "CSV" | "EXCEL" | "ENCRYPTED_TXT";
  suggestedSource: string | null;
  confidence: number;
  delimiter: string;
  hasHeader: boolean;
  columnMapping: Record<string, string>;
  sampleRows: Array<Record<string, string>>;
  warnings: string[];
}

export async function analyzeFileStructure(file: File) {
  const formData = new FormData();
  formData.append("file", file);
  return apiRequest<{ data: AIFileAnalysisResult }>("/api/integration/files/analyze", {
    method: "POST",
    body: formData,
  });
}

export async function uploadIntegrationFile(
  file: File,
  source: string,
  fileType: string,
  description?: string,
  aiMetadata?: { columnMappingJson?: string; aiDetectedSource?: string; aiConfidence?: number },
) {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("source", source);
  formData.append("fileType", fileType);
  if (description) formData.append("description", description);
  if (aiMetadata?.columnMappingJson) formData.append("columnMappingJson", aiMetadata.columnMappingJson);
  if (aiMetadata?.aiDetectedSource) formData.append("aiDetectedSource", aiMetadata.aiDetectedSource);
  if (aiMetadata?.aiConfidence != null) formData.append("aiConfidence", String(aiMetadata.aiConfidence));

  return apiRequest<{ data: IntegrationFile }>("/api/integration/files/upload", {
    method: "POST",
    body: formData,
  });
}

export async function listIntegrationFiles(params?: { source?: string; limit?: number; offset?: number }) {
  const search = new URLSearchParams();
  if (params?.source) search.set("source", params.source);
  if (params?.limit) search.set("limit", String(params.limit));
  if (params?.offset) search.set("offset", String(params.offset));
  const qs = search.toString();
  return apiRequest<{ data: IntegrationFile[]; meta: { total: number; limit: number; offset: number } }>(
    `/api/integration/files${qs ? `?${qs}` : ""}`,
  );
}

export async function deleteIntegrationFile(fileId: number) {
  return apiRequest<{ deleted: boolean }>(`/api/integration/files/${fileId}`, {
    method: "DELETE",
  });
}

export async function processIntegrationFile(fileId: number) {
  return apiRequest<{ data: { success: boolean; recordsParsed: number; file?: IntegrationFile }; error?: { message: string } }>(
    `/api/integration/files/${fileId}/process`,
    { method: "POST" },
  );
}

export interface IntegrationStagingRow {
  id: number;
  payerIc: string | null;
  payerName: string | null;
  txDate: string;
  txTime: string | null;
  amount: number;
  sourceTxRef: string | null;
  channel: string | null;
  stagingStatus: string;
}

export async function getIntegrationFileStaging(fileId: number, params?: { limit?: number; offset?: number }) {
  const search = new URLSearchParams();
  if (params?.limit) search.set("limit", String(params.limit));
  if (params?.offset) search.set("offset", String(params.offset));
  const qs = search.toString();
  return apiRequest<{
    data: { file: IntegrationFile; data: IntegrationStagingRow[]; meta: { total: number; limit: number; offset: number } };
  }>(`/api/integration/files/${fileId}/staging${qs ? `?${qs}` : ""}`);
}

// -----------------------------------------------------------------------------
// Reconciliation
// -----------------------------------------------------------------------------

export interface ReconciliationRun {
  runId: string;
  fileId: number;
  fileName: string;
  date: string;
  source: string | null;
  totalStaging: number;
  matched: number;
  unmatched: number;
  mismatch: number;
  duplicate: number;
  status: "PENDING" | "COMPLETED";
}

export async function listReconciliationRuns(params?: { search?: string; limit?: number; offset?: number }) {
  const search = new URLSearchParams();
  if (params?.search) search.set("search", params.search);
  if (params?.limit) search.set("limit", String(params.limit));
  if (params?.offset) search.set("offset", String(params.offset));
  const qs = search.toString();
  return apiRequest<{
    data: ReconciliationRun[];
    meta: { total: number; limit: number; offset: number };
  }>(`/api/integration/reconciliation/runs${qs ? `?${qs}` : ""}`);
}

export async function getReconciliationRun(fileId: number) {
  return apiRequest<{ data: ReconciliationRun }>(`/api/integration/reconciliation/runs/${fileId}`);
}

export interface ReconciliationResultRow {
  id: number;
  stagingTxId: number;
  internalTxId: string | null;
  matchStatus: string;
  matchRule: string | null;
  confidenceScore: number | null;
  stagingTx: {
    id: number;
    payerIc: string | null;
    payerName: string | null;
    txDate: string;
    amount: number;
    sourceTxRef: string | null;
  };
  actions?: Array<{ id: number; actionType: string; actionNote: string | null; actedBy: string; actedAt: string }>;
  matchLinks?: Array<{ id: number; internalTxId: string; amountAllocated: number | null }>;
}

export async function getReconciliationResults(fileId: number) {
  return apiRequest<{ data: ReconciliationResultRow[] }>(`/api/integration/reconciliation/runs/${fileId}/results`);
}

export async function runReconciliation(fileId: number, rerun = false) {
  return apiRequest<{
    data: { success: boolean; result: { matched: number; unmatched: number; mismatch: number; duplicate: number } };
  }>(`/api/integration/reconciliation/run/${fileId}`, {
    method: "POST",
    body: JSON.stringify({ rerun }),
    headers: { "Content-Type": "application/json" },
  });
}

export interface AISuggestedMatch {
  reconResultId: number;
  stagingTxId: number;
  suggestedInternalTxId: string | null;
  suggestedReceiptNo: string | null;
  confidence: number;
  reason: string;
  /** Summary from GuestPayment/BankStatement for confident decision-making */
  suggestedInternalSummary?: {
    date: string;
    reference: string;
    amount: number;
  };
}

export interface AIAssistResult {
  suggestions: AISuggestedMatch[];
  processed: number;
  suggested: number;
}

export async function getAIAssistSuggestions(fileId: number, limit?: number) {
  return apiRequest<{ data: AIAssistResult }>(`/api/integration/reconciliation/runs/${fileId}/ai-assist`, {
    method: "POST",
    body: JSON.stringify({ limit: limit ?? 50 }),
    headers: { "Content-Type": "application/json" },
  });
}

export interface SearchInternalResult {
  internalTxId: string;
  reference: string;
  name: string;
  amount: number;
  date: string;
  linkedInfo: { linkedCount: number; linkedTotalAmount: number; remainingAmount: number };
}

export async function searchInternalForMatch(fileId: number, q: string) {
  const params = new URLSearchParams({ fileId: String(fileId), q });
  return apiRequest<{ data: SearchInternalResult[] }>(
    `/api/integration/reconciliation/search-internal?${params}`,
  );
}

export async function applyReconciliationMatch(
  reconResultId: number,
  internalTxId: string,
  source?: "ai_assist" | "manual",
) {
  return apiRequest<{ success: boolean; reconResultId: number; internalTxId: string }>(
    "/api/integration/reconciliation/apply-match",
    {
      method: "POST",
      body: JSON.stringify({ reconResultId, internalTxId, source: source ?? "manual" }),
      headers: { "Content-Type": "application/json" },
    },
  );
}

export async function applyReconciliationMatchBatch(reconResultIds: number[], internalTxId: string) {
  return apiRequest<{ success: boolean; applied: number; reconResultIds: number[]; internalTxId: string }>(
    "/api/integration/reconciliation/apply-match-batch",
    {
      method: "POST",
      body: JSON.stringify({ reconResultIds, internalTxId }),
      headers: { "Content-Type": "application/json" },
    },
  );
}

export async function applyReconciliationMatchOneToMany(reconResultId: number, internalTxIds: string[]) {
  return apiRequest<{ success: boolean; reconResultId: number; internalTxIds: string[] }>(
    "/api/integration/reconciliation/apply-match-one-to-many",
    {
      method: "POST",
      body: JSON.stringify({ reconResultId, internalTxIds }),
      headers: { "Content-Type": "application/json" },
    },
  );
}

export async function applyReconciliationMatchOneToManyBatch(
  items: Array<{ reconResultId: number; internalTxIds: string[] }>,
) {
  return apiRequest<{
    success: boolean;
    results: Array<{ reconResultId: number; success: boolean; error?: string }>;
  }>(
    "/api/integration/reconciliation/apply-match-one-to-many-batch",
    {
      method: "POST",
      body: JSON.stringify({ items }),
      headers: { "Content-Type": "application/json" },
    },
  );
}

export interface ManyToManyLink {
  reconResultId: number;
  internalTxId: string;
  amountAllocated: number;
}

export async function applyReconciliationMatchManyToMany(links: ManyToManyLink[]) {
  return apiRequest<{
    success: boolean;
    reconResultIds: number[];
    internalTxIds: string[];
    linksCount: number;
  }>("/api/integration/reconciliation/apply-match-many-to-many", {
    method: "POST",
    body: JSON.stringify({ links }),
    headers: { "Content-Type": "application/json" },
  });
}

export async function applyReconciliationMatchManyToManyBatch(groups: Array<{ links: ManyToManyLink[] }>) {
  return apiRequest<{
    success: boolean;
    results: Array<{ groupIndex: number; success: boolean; reconResultIds?: number[]; error?: string }>;
  }>("/api/integration/reconciliation/apply-match-many-to-many-batch", {
    method: "POST",
    body: JSON.stringify({ groups }),
    headers: { "Content-Type": "application/json" },
  });
}
