import { apiRequest } from "./client";
import type {
  Category,
  CategoryInput,
  CorporatePayerInput,
  CounterDepositBatchDetail,
  CounterDepositBatchRow,
  CounterDepositStatus,
  CounterDepositType,
  CounterPaymentChannel,
  CounterPaymentRow,
  CounterReconStatus,
  DuplicateCase,
  IndividualPayerInput,
  IndividualDirectoryCategory,
  CorporateDirectoryCategory,
  CorporateDirectoryRow,
  IndividualDirectoryRow,
  Media,
  MediaMetadataInput,
  MergeExecuteInput,
  Page,
  PageInput,
  PayerProfile,
  PayerStatus,
  PayerType,
  Post,
  PostInput,
  Role,
  RoleInput,
  SettingsPayload,
  SpgEmployee,
  SpgEmployeeInput,
  SpgEmployerPayerInput,
  SpgPayrollBatchDetail,
  SpgPayrollBatchRow,
  UserDetail,
  UserInput,
  PaymentGatewayConfig,
  ReconciliationCaseRow,
  ReconciliationCaseStatus,
  ZakatTypeConfig,
} from "@/types";
import type { AdminMenuPrefs } from "@/config/admin-menu";

export async function fetchDashboardSummary() {
  return apiRequest<{ data: { counts: { posts: number; pages: number; media: number }; recent: { posts: Post[]; pages: Page[] } } }>(
    "/api/dashboard/summary",
  );
}

export async function listPosts(params = "") {
  return apiRequest<{ data: Post[]; meta: Record<string, unknown> }>(`/api/posts${params}`);
}

export async function getPost(id: number) {
  return apiRequest<{ data: Post }>(`/api/posts/${id}`);
}

export async function createPost(input: PostInput) {
  return apiRequest<{ data: Post }>("/api/posts", { method: "POST", body: JSON.stringify(input) });
}

export async function updatePost(id: number, input: PostInput) {
  return apiRequest<{ data: Post }>(`/api/posts/${id}`, { method: "PUT", body: JSON.stringify(input) });
}

export async function deletePost(id: number) {
  return apiRequest<{ data: { success: boolean } }>(`/api/posts/${id}`, { method: "DELETE" });
}

// Categories
export async function listCategories(params = "") {
  return apiRequest<{ data: Category[]; meta: Record<string, unknown> }>(`/api/categories${params}`);
}

export async function getCategory(id: number) {
  return apiRequest<{ data: Category }>(`/api/categories/${id}`);
}

export async function createCategory(input: CategoryInput) {
  return apiRequest<{ data: Category }>("/api/categories", { method: "POST", body: JSON.stringify(input) });
}

export async function updateCategory(id: number, input: CategoryInput) {
  return apiRequest<{ data: Category }>(`/api/categories/${id}`, { method: "PUT", body: JSON.stringify(input) });
}

export async function deleteCategory(id: number) {
  return apiRequest<{ data: { success: boolean } }>(`/api/categories/${id}`, { method: "DELETE" });
}

export async function listPages(params = "") {
  return apiRequest<{ data: Page[]; meta: Record<string, unknown> }>(`/api/pages${params}`);
}

export async function getPage(id: number) {
  return apiRequest<{ data: Page }>(`/api/pages/${id}`);
}

export async function createPage(input: PageInput) {
  return apiRequest<{ data: Page }>("/api/pages", { method: "POST", body: JSON.stringify(input) });
}

export async function updatePage(id: number, input: PageInput) {
  return apiRequest<{ data: Page }>(`/api/pages/${id}`, { method: "PUT", body: JSON.stringify(input) });
}

export async function deletePage(id: number) {
  return apiRequest<{ data: { success: boolean } }>(`/api/pages/${id}`, { method: "DELETE" });
}

export async function listMedia() {
  return apiRequest<{ data: Media[] }>("/api/media");
}

export async function uploadMedia(file: File) {
  const formData = new FormData();
  formData.append("file", file);
  return apiRequest<{ data: Media }>("/api/media/upload", { method: "POST", body: formData });
}

export async function removeMedia(id: number) {
  return apiRequest<{ data: { success: boolean } }>(`/api/media/${id}`, { method: "DELETE" });
}

export async function updateMediaMetadata(id: number, input: MediaMetadataInput) {
  return apiRequest<{ data: Media }>(`/api/media/${id}`, { method: "PUT", body: JSON.stringify(input) });
}

export async function getSettings() {
  return apiRequest<{ data: SettingsPayload }>("/api/settings");
}

export async function updateSettings(payload: SettingsPayload) {
  return apiRequest<{ data: SettingsPayload }>("/api/settings", {
    method: "PUT",
    body: JSON.stringify(payload),
  });
}

export async function getAdminMenuPrefs() {
  return apiRequest<{ data: AdminMenuPrefs | null }>("/api/settings/admin-menu-prefs");
}

export async function saveAdminMenuPrefs(prefs: AdminMenuPrefs) {
  return apiRequest<{ data: AdminMenuPrefs }>("/api/settings/admin-menu-prefs", {
    method: "PUT",
    body: JSON.stringify(prefs),
  });
}

// Users
export async function listUsers() {
  return apiRequest<{ data: UserDetail[] }>("/api/users");
}

export async function getUser(id: number) {
  return apiRequest<{ data: UserDetail }>(`/api/users/${id}`);
}

export async function createUser(input: UserInput) {
  return apiRequest<{ data: UserDetail }>("/api/users", { method: "POST", body: JSON.stringify(input) });
}

export async function updateUser(id: number, input: UserInput) {
  return apiRequest<{ data: UserDetail }>(`/api/users/${id}`, { method: "PUT", body: JSON.stringify(input) });
}

export async function deleteUser(id: number) {
  return apiRequest<{ data: { success: boolean } }>(`/api/users/${id}`, { method: "DELETE" });
}

// Roles
export async function listRoles() {
  return apiRequest<{ data: Role[] }>("/api/roles");
}

export async function getRole(id: number) {
  return apiRequest<{ data: Role }>(`/api/roles/${id}`);
}

export async function createRole(input: RoleInput) {
  return apiRequest<{ data: Role }>("/api/roles", { method: "POST", body: JSON.stringify(input) });
}

export async function updateRole(id: number, input: RoleInput) {
  return apiRequest<{ data: Role }>(`/api/roles/${id}`, { method: "PUT", body: JSON.stringify(input) });
}

export async function deleteRole(id: number) {
  return apiRequest<{ data: { success: boolean } }>(`/api/roles/${id}`, { method: "DELETE" });
}

// Payers
export async function listPayers(params: {
  page?: number;
  limit?: number;
  q?: string;
  type?: PayerType;
  status?: PayerStatus;
}) {
  const qs = new URLSearchParams();
  if (params.page) qs.set("page", String(params.page));
  if (params.limit) qs.set("limit", String(params.limit));
  if (params.q) qs.set("q", params.q);
  if (params.type) qs.set("type", params.type);
  if (params.status) qs.set("status", params.status);
  return apiRequest<{ data: PayerProfile[]; meta: Record<string, unknown> }>(`/api/payers?${qs.toString()}`);
}

export async function listIndividualDirectory(params: {
  page?: number;
  limit?: number;
  q?: string;
  category?: IndividualDirectoryCategory;
}) {
  const qs = new URLSearchParams();
  if (params.page) qs.set("page", String(params.page));
  if (params.limit) qs.set("limit", String(params.limit));
  if (params.q) qs.set("q", params.q);
  if (params.category) qs.set("category", params.category);
  return apiRequest<{ data: IndividualDirectoryRow[]; meta: Record<string, unknown> }>(`/api/payers/individual-directory?${qs.toString()}`);
}

export async function listCorporateDirectory(params: {
  page?: number;
  limit?: number;
  q?: string;
  category?: CorporateDirectoryCategory;
}) {
  const qs = new URLSearchParams();
  if (params.page) qs.set("page", String(params.page));
  if (params.limit) qs.set("limit", String(params.limit));
  if (params.q) qs.set("q", params.q);
  if (params.category) qs.set("category", params.category);
  return apiRequest<{ data: CorporateDirectoryRow[]; meta: Record<string, unknown> }>(`/api/payers/corporate-directory?${qs.toString()}`);
}

export async function getPayer(id: number) {
  return apiRequest<{ data: PayerProfile }>(`/api/payers/${id}`);
}

export async function createIndividualPayer(input: IndividualPayerInput) {
  return apiRequest<{ data: PayerProfile }>("/api/payers/individual", { method: "POST", body: JSON.stringify(input) });
}

export async function createCorporatePayer(input: CorporatePayerInput) {
  return apiRequest<{ data: PayerProfile }>("/api/payers/corporate", { method: "POST", body: JSON.stringify(input) });
}

export async function createSpgEmployer(input: SpgEmployerPayerInput) {
  return apiRequest<{ data: PayerProfile }>("/api/payers/spg-employer", { method: "POST", body: JSON.stringify(input) });
}

export async function updatePayer(id: number, input: Partial<PayerProfile>) {
  return apiRequest<{ data: PayerProfile }>(`/api/payers/${id}`, { method: "PUT", body: JSON.stringify(input) });
}

// SPG
export async function listSpgEmployees(employerPayerId: number) {
  return apiRequest<{ data: SpgEmployee[] }>(`/api/spg/employers/${employerPayerId}/employees`);
}

export async function createSpgEmployee(employerPayerId: number, input: SpgEmployeeInput) {
  return apiRequest<{ data: { employee: SpgEmployee } }>(`/api/spg/employers/${employerPayerId}/employees`, {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export async function importSpgEmployees(employerPayerId: number, employees: SpgEmployeeInput[]) {
  return apiRequest<{ data: { imported: number; duplicateCases: number; rows: SpgEmployee[] } }>(
    `/api/spg/employers/${employerPayerId}/employees/import`,
    { method: "POST", body: JSON.stringify({ employees }) },
  );
}

export async function updateSpgEmployee(id: number, input: Partial<SpgEmployeeInput>) {
  return apiRequest<{ data: SpgEmployee }>(`/api/spg/employees/${id}`, {
    method: "PUT",
    body: JSON.stringify(input),
  });
}

export async function listPendingSpgPayrollBatches() {
  return apiRequest<{ data: SpgPayrollBatchRow[] }>("/api/spg/admin/pending-batches");
}

export async function getSpgPayrollBatchDetail(batchId: number) {
  return apiRequest<{ data: SpgPayrollBatchDetail }>(`/api/spg/batches/${batchId}`);
}

export async function approveSpgPayrollBatch(batchId: number, reason?: string) {
  return apiRequest<{ data: { batchId: number; status: string; officialReceiptNo?: string | null } }>(
    `/api/spg/admin/batches/${batchId}/approve`,
    {
      method: "POST",
      body: JSON.stringify({ reason }),
    },
  );
}

export async function rejectSpgPayrollBatch(batchId: number, reason?: string) {
  return apiRequest<{ data: { batchId: number; status: string } }>(
    `/api/spg/admin/batches/${batchId}/reject`,
    {
      method: "POST",
      body: JSON.stringify({ reason }),
    },
  );
}

// Duplicates + merges
export async function listDuplicateCases(status?: string) {
  const qs = status ? `?status=${encodeURIComponent(status)}` : "";
  return apiRequest<{ data: DuplicateCase[]; meta: Record<string, unknown> }>(`/api/duplicates/cases${qs}`);
}

export async function getDuplicateCase(id: number) {
  return apiRequest<{ data: DuplicateCase }>(`/api/duplicates/cases/${id}`);
}

export async function detectDuplicateForEmployee(employeeId: number) {
  return apiRequest<{ data: { detected: boolean; message?: string; case?: DuplicateCase } }>(
    `/api/duplicates/detect/spg-employee/${employeeId}`,
    { method: "POST" },
  );
}

export async function rejectDuplicateCase(id: number, notes?: string) {
  return apiRequest<{ data: DuplicateCase }>(`/api/duplicates/cases/${id}/reject`, {
    method: "POST",
    body: JSON.stringify({ notes }),
  });
}

export async function executeMerge(input: MergeExecuteInput) {
  return apiRequest<{ data: { id: number } }>("/api/merges/execute", {
    method: "POST",
    body: JSON.stringify(input),
  });
}

// Status + audit
export async function changePayerStatus(payerId: number, status: PayerStatus, reason?: string) {
  return apiRequest<{ data: PayerProfile }>(`/api/status/${payerId}/change`, {
    method: "POST",
    body: JSON.stringify({ status, reason }),
  });
}

export async function addToBlacklist(payerId: number, input: { reason?: string; fromDate?: string; toDate?: string }) {
  return apiRequest<{ data: PayerProfile }>(`/api/status/${payerId}/blacklist`, {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export async function removeFromBlacklist(payerId: number) {
  return apiRequest<{ data: PayerProfile }>(`/api/status/${payerId}/blacklist`, { method: "DELETE" });
}

export async function getPayerHistory(payerId: number) {
  return apiRequest<{ data: { statusHistory: unknown[]; blacklistHistory: unknown[] } }>(`/api/status/${payerId}/history`);
}

export async function getPayerAudit(payerId: number) {
  return apiRequest<{ data: unknown[] }>(`/api/audit/profile/${payerId}`);
}

export async function getPayerStats(payerId: number) {
  return apiRequest<{
    data: {
      totalPaid: number;
      individualTotal: number;
      corporateTotal: number;
      transactionCount: number;
      monthlyBreakdown: Array<{ month: string; individual: number; corporate: number }>;
      zakatTypes: Array<{ type: string; amount: number }>;
      recentTransactions: Array<{
        id: number;
        date: string;
        amount: number;
        source: string;
        zakatType: string;
        status: string;
      }>;
    };
  }>(`/api/payers/${payerId}/stats`);
}

// Zakat Configuration
export async function getZakatTypes() {
  return apiRequest<{ data: { types: ZakatTypeConfig[] } }>("/api/settings/zakat-types");
}

export async function saveZakatTypes(types: ZakatTypeConfig[]) {
  return apiRequest<{ data: { types: ZakatTypeConfig[] } }>("/api/settings/zakat-types", {
    method: "PUT",
    body: JSON.stringify({ types }),
  });
}

export async function getPaymentGateways() {
  return apiRequest<{ data: { gateways: PaymentGatewayConfig[] } }>("/api/settings/payment-gateways");
}

export async function savePaymentGateways(gateways: PaymentGatewayConfig[]) {
  return apiRequest<{ data: { gateways: PaymentGatewayConfig[] } }>("/api/settings/payment-gateways", {
    method: "PUT",
    body: JSON.stringify({ gateways }),
  });
}

// Counter + reconciliation
export async function createCounterPayment(input: {
  guestName: string;
  identityNo: string;
  email?: string;
  phone?: string;
  zakatType: string;
  financialYear: string;
  amount: number;
  paymentChannel: CounterPaymentChannel;
  collectionPoint: string;
  terminalRef?: { rrn: string; authCode: string; tid: string; mid: string };
  notes?: string;
}) {
  return apiRequest<{ data: { paymentId: number; receiptNo: string; paidAt: string; amount: number; status: string } }>("/api/counter/payments", {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export async function listCounterPayments(params: {
  page?: number;
  limit?: number;
  dateFrom?: string;
  dateTo?: string;
  channel?: CounterPaymentChannel;
  reconStatus?: CounterReconStatus;
  collectionPoint?: string;
  staffId?: number;
  q?: string;
}) {
  const qs = new URLSearchParams();
  if (params.page) qs.set("page", String(params.page));
  if (params.limit) qs.set("limit", String(params.limit));
  if (params.dateFrom) qs.set("dateFrom", params.dateFrom);
  if (params.dateTo) qs.set("dateTo", params.dateTo);
  if (params.channel) qs.set("channel", params.channel);
  if (params.reconStatus) qs.set("reconStatus", params.reconStatus);
  if (params.collectionPoint) qs.set("collectionPoint", params.collectionPoint);
  if (params.staffId) qs.set("staffId", String(params.staffId));
  if (params.q) qs.set("q", params.q);
  return apiRequest<{ data: CounterPaymentRow[]; meta: { page: number; limit: number; total: number } }>(`/api/counter/payments?${qs.toString()}`);
}

export async function getCounterPayment(id: number) {
  return apiRequest<{ data: CounterPaymentRow }>(`/api/counter/payments/${id}`);
}

export async function createCounterDeposit(input: {
  depositType: CounterDepositType;
  depositDate: string;
  collectionPoint?: string;
  paymentIds: number[];
  declaredAmount: number;
  notes?: string;
  slipFile?: File | null;
}) {
  const body = new FormData();
  body.append("depositType", input.depositType);
  body.append("depositDate", input.depositDate);
  body.append("declaredAmount", String(input.declaredAmount));
  body.append("paymentIds", JSON.stringify(input.paymentIds));
  if (input.collectionPoint) body.append("collectionPoint", input.collectionPoint);
  if (input.notes) body.append("notes", input.notes);
  if (input.slipFile) body.append("slipFile", input.slipFile);

  return apiRequest<{ data: { depositBatchId: number; referenceNo: string; totalAmount: number; itemCount: number; status: CounterDepositStatus } }>(
    "/api/counter/deposits",
    { method: "POST", body },
  );
}

export async function listCounterDeposits(params: {
  page?: number;
  limit?: number;
  status?: CounterDepositStatus;
  type?: CounterDepositType;
  dateFrom?: string;
  dateTo?: string;
  referenceNo?: string;
}) {
  const qs = new URLSearchParams();
  if (params.page) qs.set("page", String(params.page));
  if (params.limit) qs.set("limit", String(params.limit));
  if (params.status) qs.set("status", params.status);
  if (params.type) qs.set("type", params.type);
  if (params.dateFrom) qs.set("dateFrom", params.dateFrom);
  if (params.dateTo) qs.set("dateTo", params.dateTo);
  if (params.referenceNo) qs.set("referenceNo", params.referenceNo);
  return apiRequest<{ data: CounterDepositBatchRow[]; meta: { page: number; limit: number; total: number } }>(`/api/counter/deposits?${qs.toString()}`);
}

export async function getCounterDeposit(id: number) {
  return apiRequest<{ data: CounterDepositBatchDetail }>(`/api/counter/deposits/${id}`);
}

export async function uploadBankStatement(input: {
  file: File;
  bankAccountNo?: string;
  statementDateFrom?: string;
  statementDateTo?: string;
}) {
  const body = new FormData();
  body.append("file", input.file);
  if (input.bankAccountNo) body.append("bankAccountNo", input.bankAccountNo);
  if (input.statementDateFrom) body.append("statementDateFrom", input.statementDateFrom);
  if (input.statementDateTo) body.append("statementDateTo", input.statementDateTo);
  return apiRequest<{ data: { statementId: number; fileName: string; parsedCount: number; errorCount: number; errors: Array<{ lineNo: number; error: string }> } }>(
    "/api/reconciliation/statements/upload",
    { method: "POST", body },
  );
}

export async function runReconciliation(statementId: number, dayTolerance = 3) {
  return apiRequest<{ data: { matched: number; partial: number; unmatched: number } }>("/api/reconciliation/run", {
    method: "POST",
    body: JSON.stringify({ statementId, dayTolerance }),
  });
}

export async function listReconciliationCases(params: { status?: ReconciliationCaseStatus; page?: number; limit?: number }) {
  const qs = new URLSearchParams();
  if (params.status) qs.set("status", params.status);
  if (params.page) qs.set("page", String(params.page));
  if (params.limit) qs.set("limit", String(params.limit));
  return apiRequest<{ data: ReconciliationCaseRow[]; meta: { page: number; limit: number; total: number } }>(`/api/reconciliation/cases?${qs.toString()}`);
}

export async function resolveReconciliationCase(input: {
  caseId: number;
  action: "map_batch" | "mark_bank_fee" | "mark_reversal" | "ignore";
  batchId?: number;
  reason?: string;
}) {
  return apiRequest<{ data: { caseId: number; status: string } }>(`/api/reconciliation/cases/${input.caseId}/resolve`, {
    method: "POST",
    body: JSON.stringify({
      action: input.action,
      batchId: input.batchId,
      reason: input.reason,
    }),
  });
}

export async function confirmDepositReconciliation(depositBatchId: number) {
  return apiRequest<{ data: { depositBatchId: number; status: string } }>(`/api/reconciliation/deposits/${depositBatchId}/confirm`, {
    method: "POST",
  });
}

export async function lookupPayerByIc(identityNo: string) {
  return apiRequest<{
    data: {
      id: number;
      payerCode: string;
      displayName: string;
      identityNo: string;
      email: string | null;
      phone: string | null;
      individual: { fullName: string } | null;
    };
  }>(`/api/payers/portal-profile/${encodeURIComponent(identityNo)}`);
}

export async function quickRegisterPayer(input: {
  fullName: string;
  mykadOrPassport: string;
  email?: string;
  phone?: string;
  password?: string;
}) {
  return apiRequest<{ data: PayerProfile }>("/api/payers/individual", {
    method: "POST",
    body: JSON.stringify({
      displayName: input.fullName,
      fullName: input.fullName,
      mykadOrPassport: input.mykadOrPassport,
      identityNo: input.mykadOrPassport,
      identityType: "mykad",
      email: input.email || undefined,
      phone: input.phone || undefined,
      password: input.password || undefined,
    }),
  });
}
