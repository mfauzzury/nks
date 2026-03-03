import { z } from "zod";

export const statusSchema = z.enum(["draft", "published", "archived"]);

export const listQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(10),
  q: z.string().optional(),
  status: statusSchema.optional(),
  sortBy: z.string().default("createdAt"),
  sortDir: z.enum(["asc", "desc"]).default("desc"),
});

export const postInputSchema = z.object({
  title: z.string().min(1),
  slug: z.string().optional(),
  excerpt: z.string().optional(),
  content: z.string().min(1),
  status: statusSchema.default("draft"),
  featuredImageId: z.number().int().nullable().optional(),
  categoryIds: z.array(z.number().int()).optional(),
});

export const pageInputSchema = z.object({
  title: z.string().min(1),
  slug: z.string().optional(),
  content: z.string().min(1),
  status: statusSchema.default("draft"),
  featuredImageId: z.number().int().nullable().optional(),
});

export const settingsInputSchema = z.object({
  siteTitle: z.string().min(1),
  tagline: z.string().default(""),
  titleFormat: z.string().min(1),
  metaDescription: z.string().default(""),
  siteIconUrl: z.string().default(""),
  sidebarLogoUrl: z.string().default(""),
  faviconUrl: z.string().default(""),
  language: z.string().min(1),
  timezone: z.string().min(1),
  footerText: z.string().default(""),
});

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

export const categoryInputSchema = z.object({
  name: z.string().min(1),
  slug: z.string().optional(),
  description: z.string().optional(),
});

export const userInputSchema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  password: z.string().min(6).optional(),
  role: z.string().min(1),
  isActive: z.boolean().default(true),
});

export const roleInputSchema = z.object({
  name: z.string().min(1),
  description: z.string().default(""),
  permissions: z.array(z.string()).default([]),
});

export const adminMenuPrefsSchema = z.object({
  groupOrder: z.array(z.string()),
  itemOrder: z.record(z.string(), z.array(z.string())),
  hidden: z.array(z.string()),
  hiddenGroups: z.array(z.string()).default([]),
});

export const mediaMetadataInputSchema = z.object({
  title: z.string().trim().max(255).default(""),
  altText: z.string().trim().max(255).default(""),
  caption: z.string().trim().max(1000).default(""),
  description: z.string().trim().max(5000).default(""),
});

export const payerTypeSchema = z.enum(["individu", "korporat", "majikan_spg"]);
export const payerStatusSchema = z.enum(["active", "inactive", "suspended", "merged"]);
export const identityTypeSchema = z.enum(["mykad", "passport", "ssm", "tax", "other"]);
export const deductionModeSchema = z.enum(["fixed", "percent"]);
export const duplicateCaseStatusSchema = z.enum(["open", "reviewed", "merged", "rejected"]);
export const spgPayrollPaymentChannelSchema = z.enum(["FPX_B2B", "CARD", "CHEQUE", "COUNTER_CASH"]);
export const spgPayrollBatchStatusSchema = z.enum([
  "draft_preview",
  "awaiting_online_payment",
  "pending_payment",
  "paid_success",
  "paid_failed",
  "cancelled",
]);

export const payerListQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  q: z.string().optional(),
  type: payerTypeSchema.optional(),
  status: payerStatusSchema.optional(),
});

export const corporateDirectoryQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  q: z.string().optional(),
  category: z.enum(["all", "payer", "spg", "both"]).default("all"),
});

export const payerAddressInputSchema = z.object({
  addressType: z.string().min(1),
  line1: z.string().min(1),
  line2: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  postcode: z.string().optional(),
  country: z.string().optional(),
  isPrimary: z.boolean().default(false),
});

export const payerContactPersonInputSchema = z.object({
  name: z.string().min(1),
  icNo: z.string().optional(),
  position: z.string().optional(),
  email: z.string().email().optional(),
  phone: z.string().optional(),
  isAuthorized: z.boolean().default(false),
});

export const corporateBranchInputSchema = z.object({
  branchName: z.string().min(1),
  line1: z.string().optional(),
  line2: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  postcode: z.string().optional(),
  country: z.string().optional(),
});

export const corporateShareholderInputSchema = z.object({
  name: z.string().min(1),
  ownershipPercent: z.number().min(0).max(100).optional(),
});

export const payerDocumentInputSchema = z.object({
  docType: z.string().min(1),
  docNo: z.string().optional(),
  fileUrl: z.string().optional(),
});

const payerCoreInputSchema = z.object({
  displayName: z.string().min(1),
  identityNo: z.string().optional(),
  identityType: identityTypeSchema.optional(),
  email: z.string().email().optional(),
  phone: z.string().optional(),
  addresses: z.array(payerAddressInputSchema).default([]),
  documents: z.array(payerDocumentInputSchema).default([]),
});

export const payerIndividualCreateSchema = payerCoreInputSchema.extend({
  fullName: z.string().min(1),
  mykadOrPassport: z.string().min(3),
  dob: z.string().datetime().optional(),
  gender: z.string().optional(),
  maritalStatus: z.string().optional(),
  occupation: z.string().optional(),
  incomeSource: z.string().optional(),
  monthlyIncome: z.number().nonnegative().optional(),
});

export const payerCorporateCreateSchema = payerCoreInputSchema.extend({
  companyName: z.string().min(1),
  ssmNo: z.string().min(3),
  companyType: z.string().optional(),
  taxNo: z.string().optional(),
  taxBranch: z.string().optional(),
  contactPersons: z.array(payerContactPersonInputSchema).default([]),
  branches: z.array(corporateBranchInputSchema).default([]),
  shareholders: z.array(corporateShareholderInputSchema).default([]),
});

export const payerSpgEmployerCreateSchema = payerCoreInputSchema.extend({
  agreementNo: z.string().optional(),
  agreementEffectiveDate: z.string().datetime().optional(),
  agreementExpiryDate: z.string().datetime().optional(),
  deductionMode: deductionModeSchema.optional(),
  deductionValue: z.number().nonnegative().optional(),
  deductionCap: z.number().nonnegative().optional(),
});

export const payerUpdateSchema = z.object({
  displayName: z.string().min(1).optional(),
  identityNo: z.string().optional(),
  identityType: identityTypeSchema.optional(),
  email: z.string().email().optional(),
  phone: z.string().optional(),
  status: payerStatusSchema.optional(),
});

export const payerUpdateRequestSchema = z.object({
  payerId: z.number().int().positive(),
  displayName: z.string().min(1).optional(),
  email: z.string().email().optional(),
  phone: z.string().optional(),
  occupation: z.string().optional(),
  incomeSource: z.string().optional(),
  reason: z.string().optional(),
  isCriticalChange: z.boolean().default(false),
});

export const spgEmployeeInputSchema = z.object({
  employeeIdentityNo: z.string().min(3),
  employeeName: z.string().min(1),
  employeeEmail: z.string().email().optional(),
  employeePhone: z.string().optional(),
  deductionAmount: z.number().nonnegative().optional(),
  employmentStatus: z.string().optional(),
});

export const spgEmployeeImportSchema = z.object({
  employees: z.array(spgEmployeeInputSchema).min(1),
});

export const spgPayrollLineInputSchema = z.object({
  employeeName: z.string().trim().min(1),
  employeeIdentityNo: z.string().trim().min(3),
  amount: z.number().positive(),
});

export const spgBatchCreateSchema = z.object({
  employerPayerId: z.number().int().positive(),
  month: z.number().int().min(1).max(12),
  year: z.number().int().min(2000).max(2200),
  paymentChannel: spgPayrollPaymentChannelSchema,
  rows: z.array(spgPayrollLineInputSchema).min(1).max(2000),
});

export const spgBatchesQuerySchema = z.object({
  employerPayerId: z.coerce.number().int().positive(),
  month: z.coerce.number().int().min(1).max(12).optional(),
  year: z.coerce.number().int().min(2000).max(2200).optional(),
  status: spgPayrollBatchStatusSchema.optional(),
  paymentChannel: spgPayrollPaymentChannelSchema.optional(),
});

export const spgOnlineCallbackSchema = z.object({
  result: z.enum(["success", "failed"]),
  reason: z.string().trim().optional(),
});

export const spgAdminDecisionSchema = z.object({
  reason: z.string().trim().optional(),
});

export const duplicateCaseListQuerySchema = z.object({
  status: duplicateCaseStatusSchema.optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});

export const mergeExecuteSchema = z.object({
  masterPayerId: z.number().int().positive(),
  mergedPayerId: z.number().int().positive(),
  conflictResolution: z.record(z.string(), z.unknown()).default({}),
  duplicateCaseId: z.number().int().positive().optional(),
});

export const payerStatusChangeSchema = z.object({
  status: payerStatusSchema,
  reason: z.string().optional(),
});

export const payerBlacklistSchema = z.object({
  reason: z.string().optional(),
  fromDate: z.string().datetime().optional(),
  toDate: z.string().datetime().optional(),
});

export const individualDirectoryQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(200).default(100),
  q: z.string().optional(),
  category: z.enum(["all", "registered", "unregistered"]).default("all"),
});

export const guestPaymentCreateSchema = z.object({
  guestName: z.string().min(1),
  identityNo: z.string().min(3),
  email: z.string().email().optional(),
  amount: z.number().positive(),
  paymentMethod: z.string().min(1),
});

export const corporateZakatPaymentSchema = z.object({
  ssmNo: z.string().min(1),
  companyName: z.string().min(1),
  contactEmail: z.string().email().optional(),
  amount: z.number().positive(),
  paymentMethod: z.string().min(1),
  zakatType: z.string().optional(),
  financialYear: z.string().optional(),
});

export const zakatTypesSchema = z.object({
  types: z.array(
    z.object({
      code: z.string().trim().min(1),
      name: z.string().trim().min(1),
      formula: z.string().trim().min(1),
      notes: z.string().optional(),
      isActive: z.boolean().default(true),
      uiTemplate: z.enum(["standard_year_amount", "fitrah", "fidyah"]).default("standard_year_amount"),
      codeSnippet: z.string().default(""),
      calculator: z.object({
        mode: z.enum(["none", "formula"]).default("none"),
        expression: z.string().default(""),
        inputs: z.array(
          z.object({
            key: z.string().trim().min(1),
            label: z.string().trim().min(1),
            inputType: z.enum(["number", "integer", "currency", "percentage", "text"]).default("number"),
            required: z.boolean().default(true),
            defaultValue: z.string().optional(),
            notes: z.string().optional(),
          }),
        ).default([]),
      }).default({ mode: "none", expression: "", inputs: [] }),
    }),
  ).min(1),
});

export const paymentGatewaysSchema = z.object({
  gateways: z.array(
    z.object({
      code: z.string().trim().min(1),
      name: z.string().trim().min(1),
      isActive: z.boolean().default(true),
      notes: z.string().optional(),
    }),
  ).default([]),
});
