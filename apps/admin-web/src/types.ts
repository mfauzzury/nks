export type PublishStatus = "draft" | "published" | "archived";
export type ThemeColor = "violet" | "blue" | "green" | "red" | "black-white" | "grey";

export type ApiError = { error: { code: string; message: string; details?: unknown } };

export type ApiResponse<T> = { data: T; meta?: Record<string, unknown> };

export type User = {
  id: number;
  email: string;
  name: string;
  photoUrl?: string;
  role?: string;
  permissions?: string[];
};

export type PostInput = {
  title: string;
  slug?: string;
  excerpt?: string;
  content: string;
  status: PublishStatus;
  featuredImageId?: number | null;
  categoryIds?: number[];
};

export type Post = PostInput & {
  id: number;
  slug: string;
  publishedAt: string | null;
  createdAt: string;
  updatedAt: string;
  featuredImage?: Media | null;
  categories?: Category[];
};

export type CategoryInput = {
  name: string;
  slug?: string;
  description?: string;
};

export type Category = {
  id: number;
  name: string;
  slug: string;
  description: string | null;
  createdAt: string;
  updatedAt: string;
  _count?: { posts: number };
};

export type PageInput = {
  title: string;
  slug?: string;
  content: string;
  status: PublishStatus;
  featuredImageId?: number | null;
};

export type Page = PageInput & {
  id: number;
  slug: string;
  publishedAt: string | null;
  createdAt: string;
  updatedAt: string;
  featuredImage?: Media | null;
};

export type Media = {
  id: number;
  filename: string;
  originalName: string;
  title: string | null;
  caption: string | null;
  description: string | null;
  mimeType: string;
  size: number;
  width: number | null;
  height: number | null;
  altText: string | null;
  path: string;
  url: string;
  createdAt: string;
};

export type MediaMetadataInput = {
  title: string;
  altText: string;
  caption: string;
  description: string;
};

export type SettingsPayload = {
  siteTitle: string;
  tagline: string;
  titleFormat: string;
  metaDescription: string;
  siteIconUrl: string;
  sidebarLogoUrl: string;
  faviconUrl: string;
  language: string;
  timezone: string;
  footerText: string;
};

export type Role = {
  id: number;
  name: string;
  description: string;
  permissions: string[];
  createdAt: string;
  updatedAt: string;
};

export type RoleInput = {
  name: string;
  description: string;
  permissions: string[];
};

export type UserDetail = {
  id: number;
  name: string;
  email: string;
  role: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
};

export type UserInput = {
  name: string;
  email: string;
  password?: string;
  role: string;
  isActive: boolean;
};

export type PayerType = "individu" | "korporat" | "majikan_spg";
export type PayerStatus = "active" | "inactive" | "suspended" | "merged";
export type IdentityType = "mykad" | "passport" | "ssm" | "tax" | "other";
export type DeductionMode = "fixed" | "percent";
export type DuplicateCaseStatus = "open" | "reviewed" | "merged" | "rejected";

export type PayerAddressInput = {
  addressType: string;
  line1: string;
  line2?: string;
  city?: string;
  state?: string;
  postcode?: string;
  country?: string;
  isPrimary?: boolean;
};

export type PayerBaseInput = {
  displayName: string;
  identityNo?: string;
  identityType?: IdentityType;
  email?: string;
  phone?: string;
  addresses?: PayerAddressInput[];
  documents?: Array<{ docType: string; docNo?: string; fileUrl?: string }>;
};

export type IndividualPayerInput = PayerBaseInput & {
  fullName: string;
  mykadOrPassport: string;
  dob?: string;
  gender?: string;
  maritalStatus?: string;
  occupation?: string;
  incomeSource?: string;
  monthlyIncome?: number;
};

export type CorporatePayerInput = PayerBaseInput & {
  companyName: string;
  ssmNo: string;
  companyType?: string;
  taxNo?: string;
  taxBranch?: string;
  contactPersons?: Array<{
    name: string;
    icNo?: string;
    position?: string;
    email?: string;
    phone?: string;
    isAuthorized?: boolean;
  }>;
  branches?: Array<{
    branchName: string;
    line1?: string;
    line2?: string;
    city?: string;
    state?: string;
    postcode?: string;
    country?: string;
  }>;
  shareholders?: Array<{ name: string; ownershipPercent?: number }>;
};

export type SpgEmployerPayerInput = PayerBaseInput & {
  agreementNo?: string;
  agreementEffectiveDate?: string;
  agreementExpiryDate?: string;
  deductionMode?: DeductionMode;
  deductionValue?: number;
  deductionCap?: number;
};

export type PayerProfile = {
  id: number;
  payerCode: string;
  payerType: PayerType;
  displayName: string;
  identityNo: string | null;
  identityType: IdentityType | null;
  email: string | null;
  phone: string | null;
  status: PayerStatus;
  isBlacklisted: boolean;
  blacklistReason: string | null;
  blacklistFrom: string | null;
  blacklistTo: string | null;
  mergedIntoPayerId: number | null;
  createdAt: string;
  updatedAt: string;
  individual?: {
    payerId: number;
    fullName: string;
    mykadOrPassport: string;
    dob: string | null;
    gender: string | null;
    maritalStatus: string | null;
    occupation: string | null;
    incomeSource: string | null;
    monthlyIncome: string | null;
  } | null;
  corporate?: {
    payerId: number;
    companyName: string;
    ssmNo: string;
    companyType: string | null;
    taxNo: string | null;
    taxBranch: string | null;
  } | null;
  spgEmployer?: {
    payerId: number;
    agreementNo: string | null;
    agreementEffectiveDate: string | null;
    agreementExpiryDate: string | null;
    deductionMode: DeductionMode | null;
    deductionValue: string | null;
    deductionCap: string | null;
  } | null;
};

export type SpgEmployeeInput = {
  employeeIdentityNo: string;
  employeeName: string;
  employeeEmail?: string;
  employeePhone?: string;
  deductionAmount?: number;
  employmentStatus?: string;
};

export type SpgEmployee = {
  id: number;
  employerPayerId: number;
  employeeIdentityNo: string;
  employeeName: string;
  employeeEmail: string | null;
  employeePhone: string | null;
  deductionAmount: string | null;
  employmentStatus: string | null;
  linkedIndividualPayerId: number | null;
  createdAt: string;
  updatedAt: string;
};

export type SpgPayrollPaymentChannel = "FPX_B2B" | "CARD" | "CHEQUE" | "COUNTER_CASH";
export type SpgPayrollBatchStatus = "draft_preview" | "awaiting_online_payment" | "pending_payment" | "paid_success" | "paid_failed" | "cancelled";

export type SpgPayrollBatchRow = {
  id: number;
  referenceNo: string;
  employerPayerId: number;
  month: number;
  year: number;
  paymentChannel: SpgPayrollPaymentChannel;
  status: SpgPayrollBatchStatus;
  currency: string;
  totalAmount: string;
  rowCount: number;
  supportingSlipUrl: string | null;
  officialReceiptNo: string | null;
  submittedAt: string | null;
  paidAt: string | null;
  createdAt: string;
  updatedAt: string;
  employer?: {
    id: number;
    displayName: string;
    payerCode: string;
  };
};

export type SpgPayrollBatchDetail = SpgPayrollBatchRow & {
  lines: Array<{
    id: number;
    employeeName: string;
    employeeIdentityNo: string;
    amount: string;
    isDuplicateInFile: boolean;
    isDuplicateInMonthBatch: boolean;
    validationJson: unknown;
  }>;
  statusHistory: Array<{
    id: number;
    oldStatus: SpgPayrollBatchStatus | null;
    newStatus: SpgPayrollBatchStatus;
    changedBy: number | null;
    changedAt: string;
    reason: string | null;
  }>;
  duplicateSummary: {
    duplicateInFileCount: number;
    duplicateInMonthBatchCount: number;
  };
};

export type IndividualDirectoryCategory = "all" | "registered" | "unregistered";

export type IndividualDirectoryRow = {
  id: number | null;
  payerCode: string | null;
  displayName: string;
  identityNo: string;
  email: string | null;
  status: string;
  hasDirectContribution: boolean;
  hasEmployerContribution: boolean;
  directContributionCount: number;
  employerContributionCount: number;
  lastContributionAt: string | null;
  registrationState: "registered" | "unregistered";
};

export type CorporateDirectoryCategory = "all" | "payer" | "spg" | "both";

export type CorporateDirectoryRow = {
  id: number;
  payerCode: string;
  companyName: string;
  ssmNo: string;
  email: string | null;
  status: string;
  hasPayer: boolean;
  hasSpg: boolean;
  category: "payer" | "spg" | "both";
};

export type DuplicateCase = {
  id: number;
  source: "spg_import" | "manual";
  status: DuplicateCaseStatus;
  detectedAt: string;
  detectedBy: number | null;
  notes: string | null;
  matches: Array<{
    id: number;
    caseId: number;
    candidatePayerId: number;
    matchedSpgEmployeeId: number;
    matchScore: string;
    matchReasonJson: unknown;
    candidatePayer: PayerProfile;
    matchedSpgEmployee: SpgEmployee;
  }>;
};

export type MergeExecuteInput = {
  masterPayerId: number;
  mergedPayerId: number;
  conflictResolution?: Record<string, unknown>;
  duplicateCaseId?: number;
};

export type PaymentGatewayConfig = {
  code: string;
  name: string;
  isActive: boolean;
  notes?: string;
};

export type SourceCategoryConfig = {
  code: string;
  name: string;
  isActive: boolean;
  notes?: string;
};

export type SourceDataConfig = {
  code: string;
  name: string;
  categoryCode: string;
  isActive: boolean;
  notes?: string;
};

export type ZakatTypeConfig = {
  code: string;
  name: string;
  formula: string;
  notes?: string;
  isActive: boolean;
  uiTemplate?: "standard_year_amount" | "fitrah" | "fidyah";
  codeSnippet?: string;
  calculator?: {
    mode: "none" | "formula";
    expression: string;
    inputs: Array<{
      key: string;
      label: string;
      inputType: "number" | "integer" | "currency" | "percentage" | "text";
      required: boolean;
      defaultValue?: string;
      notes?: string;
    }>;
  };
};
