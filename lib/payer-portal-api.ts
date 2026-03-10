import { getPortalSession } from "@/lib/portal-session";
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:4000";

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const headers = new Headers(init?.headers || {});
  const hasBody = init?.body !== undefined && init?.body !== null;
  const isFormData = typeof FormData !== "undefined" && init?.body instanceof FormData;
  if (hasBody && !isFormData && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...init,
    headers,
  });

  const payload = await response.json();
  if (!response.ok) {
    throw new Error(payload?.error?.message || "Request failed");
  }
  return payload as T;
}

export type PortalResult = { data: { id?: number; success?: boolean; message?: string; payerId?: number } };
export type GuestPaymentResult = {
  data: {
    id: number;
    receiptNo: string;
    status: string;
    previousTransactionCount: number;
    hasExistingIndividualAccount: boolean;
    existingPayer: { payerCode: string; displayName: string } | null;
  };
};
export type GuestReceiptResult = {
  data: {
    id: number;
    receiptNo: string;
    guestName: string;
    identityNo: string;
    email: string | null;
    amount: string;
    paymentMethod: string;
    status: string;
    source: string;
    paidAt: string;
    previousTransactionCount: number;
    hasExistingIndividualAccount: boolean;
    existingPayer: { payerCode: string; displayName: string } | null;
  };
};
export type IdentityTransactionsResult = {
  data: {
    identityNo: string;
    totalTransactions: number;
    totalAmount: number;
    latestPaidAt: string | null;
    transactions: Array<{
      id: number;
      receiptNo: string;
      guestName: string;
      identityNo: string;
      amount: string;
      paymentMethod: string;
      status: string;
      paidAt: string;
    }>;
  };
};
export type SpgAgreementResult = {
  data: {
    agreements: Array<{
      employerName: string;
      employerPayerCode: string;
      deductionAmount: number | null;
      agreementNo: string | null;
      agreementEffectiveDate: string | null;
      agreementExpiryDate: string | null;
      employmentStatus: string | null;
    }>;
    deductionHistory: Array<{
      batchReferenceNo: string;
      periodMonth: number;
      periodYear: number;
      amount: number;
      paidAt: string | null;
      employerName: string;
    }>;
  };
};

export type PublicZakatType = {
  code: string;
  name: string;
  isActive: boolean;
  description?: string;
};

export type PayerLoginResult = {
  data: {
    payerId: number;
    payerCode: string;
    payerType: string;
    displayName: string;
    identityNo: string | null;
    email: string | null;
    companyName: string | null;
  };
};
export type IndividualPortalProfileResult = {
  data: {
    id: number;
    payerCode: string;
    displayName: string;
    identityNo: string | null;
    email: string | null;
    phone: string | null;
    individual: {
      fullName: string;
      occupation: string | null;
      incomeSource: string | null;
      monthlyIncome: number | null;
    } | null;
    address: {
      line1: string;
      line2: string | null;
      city: string | null;
      state: string | null;
      postcode: string | null;
      country: string | null;
    } | null;
  };
};
export type CorporatePortalProfileResult = {
  data: {
    id: number;
    payerCode: string;
    displayName: string;
    identityNo: string | null;
    email: string | null;
    phone: string | null;
    payerType: string;
    corporate: {
      companyName: string;
      ssmNo: string;
      companyType: string | null;
      taxNo: string | null;
      taxBranch: string | null;
    } | null;
    contactPersons: Array<{
      name: string;
      icNo: string | null;
      position: string | null;
      email: string | null;
      phone: string | null;
      isAuthorized: boolean;
    }>;
  };
};

export function loginPayer(input: { identityNo: string; password: string }) {
  return request<PayerLoginResult>("/api/payers/login", {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export function getPortalIndividualProfile(identityNo: string) {
  return request<IndividualPortalProfileResult>(`/api/payers/portal-profile/${encodeURIComponent(identityNo)}`);
}

export function getPortalCorporateProfile(ssmNo: string) {
  return request<CorporatePortalProfileResult>(`/api/payers/portal-profile/corporate/${encodeURIComponent(ssmNo)}`);
}

export function registerIndividual(input: Record<string, unknown>) {
  return request<PortalResult>("/api/payers/individual", {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export function registerCorporate(input: Record<string, unknown>) {
  return request<PortalResult>("/api/payers/corporate", {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export function registerSpgEmployer(input: Record<string, unknown>) {
  return request<PortalResult>("/api/payers/spg-employer", {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export function submitProfileUpdateRequest(input: Record<string, unknown>) {
  return request<PortalResult>("/api/payers/update-request", {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export function createGuestPayment(input: {
  guestName: string;
  identityNo: string;
  email?: string;
  amount: number;
  paymentMethod: string;
  financialYear: string;
}) {
  return request<GuestPaymentResult>("/api/guest-payments", {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export function getGuestReceipt(receiptId: number) {
  return request<GuestReceiptResult>(`/api/guest-payments/${receiptId}`);
}

export function getTransactionsByIdentity(identityNo: string) {
  return request<IdentityTransactionsResult>(`/api/guest-payments/by-identity/${encodeURIComponent(identityNo)}`);
}

export function getSpgAgreementByIdentity(identityNo: string) {
  return request<SpgAgreementResult>(`/api/payers/portal-profile/${encodeURIComponent(identityNo)}/spg-agreement`);
}

export function getPublicZakatTypes() {
  return request<{ data: { types: PublicZakatType[] } }>("/api/settings/zakat-types");
}

export type CorporateZakatResult = { data: { id: number; receiptNo: string; message: string } };

export function payZakatCorporate(input: {
  ssmNo: string;
  companyName: string;
  contactEmail?: string;
  amount: number;
  paymentMethod: string;
  zakatType?: string;
  financialYear: string;
}) {
  return request<CorporateZakatResult>("/api/payers/corporate-zakat", {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export type ScheduledPaymentResult = {
  data: {
    id: number;
    scheduleRef: string;
    status: string;
    totalInstalments: number;
    completedInstalments: number;
    amountPerInstalment: string;
    frequency: string;
    nextChargeDate: string;
    firstPayment: {
      id: number;
      receiptNo: string;
    };
  };
};

export function createScheduledPayment(input: {
  payerName: string;
  identityNo: string;
  email?: string;
  zakatType: string;
  financialYear: string;
  amountPerInstalment: number;
  totalInstalments: number;
  frequency: "monthly" | "quarterly" | "yearly";
  cardLast4: string;
  cardBrand: "VISA" | "MASTERCARD";
  source?: string;
  collectionPoint?: string;
}) {
  return request<ScheduledPaymentResult>("/api/scheduled-payments", {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export function getScheduledPaymentsByIdentity(identityNo: string) {
  return request<{
    data: Array<{
      id: number;
      scheduleRef: string;
      zakatType: string;
      amountPerInstalment: string;
      totalInstalments: number;
      completedInstalments: number;
      frequency: string;
      status: string;
      nextChargeDate: string;
      createdAt: string;
    }>;
  }>(`/api/scheduled-payments/by-identity/${encodeURIComponent(identityNo)}`);
}

function portalHeaders() {
  const session = getPortalSession();
  if (!session) return {};
  return {
    "x-payer-id": String(session.payerId),
    "x-payer-type": session.payerType,
  };
}

export type SpgPreviewRow = {
  rowNo: number;
  employeeName: string;
  employeeIdentityNo: string;
  amount: number | null;
  errors: string[];
  agreedAmount: number | null;
  duplicateInFile: boolean;
  duplicateInMonthBatch: boolean;
};

export type SpgBatchListItem = {
  id: number;
  referenceNo: string;
  month: number;
  year: number;
  paymentChannel: "FPX_B2B" | "CARD" | "CHEQUE" | "COUNTER_CASH";
  status: "draft_preview" | "awaiting_online_payment" | "pending_payment" | "paid_success" | "paid_failed" | "cancelled";
  totalAmount: string;
  rowCount: number;
  submittedAt: string | null;
  paidAt: string | null;
  officialReceiptNo: string | null;
  createdAt: string;
};

export type SpgBatchDetailResult = {
  data: {
    id: number;
    referenceNo: string;
    employerPayerId: number;
    month: number;
    year: number;
    paymentChannel: "FPX_B2B" | "CARD" | "CHEQUE" | "COUNTER_CASH";
    status: "draft_preview" | "awaiting_online_payment" | "pending_payment" | "paid_success" | "paid_failed" | "cancelled";
    totalAmount: string;
    rowCount: number;
    supportingSlipUrl: string | null;
    officialReceiptNo: string | null;
    submittedAt: string | null;
    paidAt: string | null;
    employer: { id: number; displayName: string; payerCode: string; identityNo: string | null; email: string | null };
    duplicateSummary: { duplicateInFileCount: number; duplicateInMonthBatchCount: number };
    lines: Array<{
      id: number;
      employeeName: string;
      employeeIdentityNo: string;
      amount: string;
      isDuplicateInFile: boolean;
      isDuplicateInMonthBatch: boolean;
    }>;
    statusHistory: Array<{
      id: number;
      oldStatus: string | null;
      newStatus: string;
      changedAt: string;
      reason: string | null;
    }>;
  };
};

export function downloadSpgTemplate(format: "xlsx" | "csv" = "xlsx") {
  const url = `${API_BASE_URL}/api/spg/template?format=${format}`;
  window.open(url, "_blank", "noopener,noreferrer");
}

export async function previewSpgBatchUpload(input: {
  employerPayerId: number;
  month: number;
  year: number;
  file: File;
}) {
  const body = new FormData();
  body.append("employerPayerId", String(input.employerPayerId));
  body.append("month", String(input.month));
  body.append("year", String(input.year));
  body.append("file", input.file);
  return request<{
    data: {
      employerPayerId: number;
      month: number;
      year: number;
      rows: SpgPreviewRow[];
      totals: {
        rowCount: number;
        validRowCount: number;
        invalidRowCount: number;
        duplicateRowCount: number;
        totalAmount: number;
      };
    };
  }>("/api/spg/batches/preview", {
    method: "POST",
    headers: portalHeaders(),
    body,
  });
}

export async function revalidateSpgBatch(input: {
  employerPayerId: number;
  month: number;
  year: number;
  rows: Array<{ employeeName: string; employeeIdentityNo: string; amount: number }>;
}) {
  return request<{
    data: {
      employerPayerId: number;
      month: number;
      year: number;
      rows: SpgPreviewRow[];
      totals: {
        rowCount: number;
        validRowCount: number;
        invalidRowCount: number;
        duplicateRowCount: number;
        totalAmount: number;
      };
    };
  }>("/api/spg/batches/revalidate", {
    method: "POST",
    headers: portalHeaders(),
    body: JSON.stringify(input),
  });
}

export async function createSpgBatch(input: {
  employerPayerId: number;
  month: number;
  year: number;
  paymentChannel: "FPX_B2B" | "CARD" | "CHEQUE" | "COUNTER_CASH";
  rows: Array<{ employeeName: string; employeeIdentityNo: string; amount: number }>;
  supportingSlip?: File | null;
}) {
  const body = new FormData();
  body.append("employerPayerId", String(input.employerPayerId));
  body.append("month", String(input.month));
  body.append("year", String(input.year));
  body.append("paymentChannel", input.paymentChannel);
  body.append("rows", JSON.stringify(input.rows));
  if (input.supportingSlip) body.append("supportingSlip", input.supportingSlip);

  return request<{
    data: {
      batchId: number;
      referenceNo: string;
      status: string;
      nextAction: { type: "online_payment" | "pending_reference"; endpoint: string };
    };
  }>("/api/spg/batches", {
    method: "POST",
    headers: portalHeaders(),
    body,
  });
}

export function initiateSpgOnlinePayment(batchId: number) {
  return request<{ data: { paymentToken: string; redirectUrl: string } }>(`/api/spg/batches/${batchId}/pay/online/initiate`, {
    method: "POST",
    headers: portalHeaders(),
  });
}

export function callbackSpgOnlinePayment(batchId: number, result: "success" | "failed", reason?: string) {
  return request<{ data: { batchId: number; status: string; officialReceiptNo?: string | null } }>(`/api/spg/batches/${batchId}/pay/online/callback`, {
    method: "POST",
    headers: portalHeaders(),
    body: JSON.stringify({ result, reason }),
  });
}

export function getSpgBatchList(input: {
  employerPayerId: number;
  month?: number;
  year?: number;
  status?: string;
  paymentChannel?: string;
}) {
  const params = new URLSearchParams();
  params.set("employerPayerId", String(input.employerPayerId));
  if (input.month) params.set("month", String(input.month));
  if (input.year) params.set("year", String(input.year));
  if (input.status) params.set("status", input.status);
  if (input.paymentChannel) params.set("paymentChannel", input.paymentChannel);
  return request<{ data: SpgBatchListItem[] }>(`/api/spg/batches?${params.toString()}`, {
    headers: portalHeaders(),
  });
}

export function getSpgBatchDetail(batchId: number) {
  return request<SpgBatchDetailResult>(`/api/spg/batches/${batchId}`, {
    headers: portalHeaders(),
  });
}

export type SpgEmployeeRecord = {
  id: number;
  employerPayerId: number;
  employeeIdentityNo: string;
  employeeName: string;
  employeeEmail: string | null;
  employeePhone: string | null;
  deductionAmount: number | null;
  employmentStatus: string | null;
  createdAt: string;
  updatedAt: string;
};

export function listEmployees(payerId: number) {
  return request<{ data: SpgEmployeeRecord[] }>(`/api/spg/employers/${payerId}/employees`, {
    headers: portalHeaders(),
  });
}

export function createEmployee(payerId: number, data: { employeeName: string; employeeIdentityNo: string; deductionAmount?: number | null; employmentStatus?: string | null }) {
  return request<{ data: { employee: SpgEmployeeRecord; duplicateCase: unknown } }>(`/api/spg/employers/${payerId}/employees`, {
    method: "POST",
    headers: portalHeaders(),
    body: JSON.stringify(data),
  });
}

export function updateEmployee(employeeId: number, data: Partial<{ employeeName: string; employeeIdentityNo: string; deductionAmount: number | null; employmentStatus: string | null }>) {
  return request<{ data: SpgEmployeeRecord }>(`/api/spg/employees/${employeeId}`, {
    method: "PUT",
    headers: portalHeaders(),
    body: JSON.stringify(data),
  });
}

export function importEmployees(payerId: number, employees: Array<{ employeeName: string; employeeIdentityNo: string; deductionAmount?: number | null; employmentStatus?: string | null }>) {
  return request<{ data: { imported: number; duplicateCases: number; rows: SpgEmployeeRecord[] } }>(`/api/spg/employers/${payerId}/employees/import`, {
    method: "POST",
    headers: portalHeaders(),
    body: JSON.stringify({ employees }),
  });
}

export function getSpgBatchReceipt(batchId: number) {
  return request<{
    data: {
      batchId: number;
      referenceNo: string;
      receiptNo: string;
      employerName: string;
      employerCode: string;
      employerIdentityNo: string | null;
      month: number;
      year: number;
      paymentChannel: string;
      totalAmount: number;
      rowCount: number;
      paidAt: string | null;
      issuedAt: string | null;
      lines: Array<{ id: number; employeeName: string; employeeIdentityNo: string; amount: number }>;
    };
  }>(`/api/spg/batches/${batchId}/receipt`, {
    headers: portalHeaders(),
  });
}
