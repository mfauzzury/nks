import bcrypt from "bcryptjs";
import { GuestPaymentSource, PayerType } from "@prisma/client";
import { Router } from "express";

import { prisma } from "../prisma.js";
import type { AuthedRequest } from "../types.js";
import { writeAuditLog, generatePayerCode } from "../utils/payer.js";
import { sendError, sendOk } from "../utils/responses.js";
import {
  payerCorporateCreateSchema,
  corporateDirectoryQuerySchema,
  corporateZakatPaymentSchema,
  payerIndividualCreateSchema,
  individualDirectoryQuerySchema,
  payerListQuerySchema,
  payerSpgEmployerCreateSchema,
  payerUpdateRequestSchema,
  payerUpdateSchema,
} from "./schemas.js";

export const payersRouter = Router();

payersRouter.post("/login", async (req, res) => {
  const { identityNo, password } = req.body ?? {};
  if (!identityNo || !password) {
    return sendError(res, 400, "VALIDATION_ERROR", "Sila masukkan No. Pengenalan dan Kata Laluan");
  }

  const normalized = (identityNo as string).replace(/[^A-Za-z0-9]/g, "").toUpperCase();
  const variants = [String(identityNo).trim(), normalized].filter(Boolean);
  if (/^\d{12}$/.test(normalized)) {
    variants.push(`${normalized.slice(0, 6)}-${normalized.slice(6, 8)}-${normalized.slice(8)}`);
  }

  const payer = await prisma.payerProfile.findFirst({
    where: {
      identityNo: { in: variants },
      status: "active",
    },
    include: {
      individual: { select: { fullName: true } },
      corporate: { select: { companyName: true, ssmNo: true } },
    },
  });

  if (!payer || !payer.passwordHash) {
    return sendError(res, 401, "INVALID_CREDENTIALS", "No. Pengenalan atau kata laluan tidak sah");
  }

  const valid = await bcrypt.compare(String(password), payer.passwordHash);
  if (!valid) {
    return sendError(res, 401, "INVALID_CREDENTIALS", "No. Pengenalan atau kata laluan tidak sah");
  }

  return sendOk(res, {
    payerId: payer.id,
    payerCode: payer.payerCode,
    payerType: payer.payerType,
    displayName: payer.displayName,
    identityNo: payer.identityNo,
    email: payer.email,
    companyName: payer.corporate?.companyName ?? null,
  });
});

function payerInclude() {
  return {
    individual: true,
    corporate: true,
    spgEmployer: true,
    addresses: true,
    contactPersons: true,
    branches: true,
    shareholders: true,
    documents: true,
    mergedInto: { select: { id: true, payerCode: true, displayName: true } },
  };
}

function stripPasswordHash<T extends Record<string, unknown>>(obj: T): Omit<T, "passwordHash"> {
  const { passwordHash: _, ...rest } = obj;
  return rest as Omit<T, "passwordHash">;
}

function normalizeIdentity(value: string | null | undefined) {
  if (!value) return "";
  return value.replace(/[^A-Za-z0-9]/g, "").toUpperCase();
}

payersRouter.get("/", async (req, res) => {
  const q = payerListQuerySchema.parse(req.query);
  const where = {
    ...(q.type ? { payerType: q.type } : {}),
    ...(q.status ? { status: q.status } : {}),
    ...(q.q
      ? {
          OR: [
            { payerCode: { contains: q.q } },
            { displayName: { contains: q.q } },
            { identityNo: { contains: q.q } },
            { email: { contains: q.q } },
            { phone: { contains: q.q } },
          ],
        }
      : {}),
  };

  const [rows, total] = await Promise.all([
    prisma.payerProfile.findMany({
      where,
      include: payerInclude(),
      orderBy: { createdAt: "desc" },
      skip: (q.page - 1) * q.limit,
      take: q.limit,
    }),
    prisma.payerProfile.count({ where }),
  ]);

  return sendOk(res, rows, { page: q.page, limit: q.limit, total });
});

payersRouter.get("/individual-directory", async (req, res) => {
  const q = individualDirectoryQuerySchema.parse(req.query);

  const [registeredProfiles, guestPayments, spgEmployees] = await Promise.all([
    prisma.payerProfile.findMany({
      where: { payerType: "individu", status: { not: "merged" } },
      include: { individual: true },
      orderBy: { createdAt: "desc" },
    }),
    prisma.guestPayment.findMany({
      where: { status: "success" },
      select: { identityNo: true, guestName: true, email: true, paidAt: true },
      orderBy: { paidAt: "desc" },
    }),
    prisma.spgEmployee.findMany({
      select: {
        employeeIdentityNo: true,
        employeeName: true,
        updatedAt: true,
      },
      orderBy: { updatedAt: "desc" },
    }),
  ]);

  const registeredByIdentity = new Map<string, {
    id: number;
    payerCode: string;
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
  }>();

  for (const payer of registeredProfiles) {
    const identityRaw = payer.individual?.mykadOrPassport || payer.identityNo || "";
    const identity = normalizeIdentity(identityRaw);
    if (!identity) continue;
    registeredByIdentity.set(identity, {
      id: payer.id,
      payerCode: payer.payerCode,
      displayName: payer.displayName,
      identityNo: identityRaw,
      email: payer.email,
      status: payer.status,
      hasDirectContribution: false,
      hasEmployerContribution: false,
      directContributionCount: 0,
      employerContributionCount: 0,
      lastContributionAt: null,
      registrationState: "registered",
    });
  }

  const unregisteredByIdentity = new Map<string, {
    id: null;
    payerCode: null;
    displayName: string;
    identityNo: string;
    email: string | null;
    status: "unregistered";
    hasDirectContribution: boolean;
    hasEmployerContribution: boolean;
    directContributionCount: number;
    employerContributionCount: number;
    lastContributionAt: string | null;
    registrationState: "registered" | "unregistered";
  }>();

  for (const gp of guestPayments) {
    const identity = normalizeIdentity(gp.identityNo);
    if (!identity) continue;

    const targetRegistered = registeredByIdentity.get(identity);
    if (targetRegistered) {
      targetRegistered.hasDirectContribution = true;
      targetRegistered.directContributionCount += 1;
      const paidAtIso = gp.paidAt.toISOString();
      if (!targetRegistered.lastContributionAt || paidAtIso > targetRegistered.lastContributionAt) {
        targetRegistered.lastContributionAt = paidAtIso;
      }
      continue;
    }

    const target = unregisteredByIdentity.get(identity) ?? {
      id: null,
      payerCode: null,
      displayName: gp.guestName,
      identityNo: gp.identityNo,
      email: gp.email ?? null,
      status: "unregistered" as const,
      hasDirectContribution: false,
      hasEmployerContribution: false,
      directContributionCount: 0,
      employerContributionCount: 0,
      lastContributionAt: null,
      registrationState: "unregistered" as const,
    };
    target.hasDirectContribution = true;
    target.directContributionCount += 1;
    if (!target.email && gp.email) {
      target.email = gp.email;
    }
    const paidAtIso = gp.paidAt.toISOString();
    if (!target.lastContributionAt || paidAtIso > target.lastContributionAt) {
      target.lastContributionAt = paidAtIso;
    }
    unregisteredByIdentity.set(identity, target);
  }

  for (const spg of spgEmployees) {
    const identity = normalizeIdentity(spg.employeeIdentityNo);
    if (!identity) continue;

    const targetRegistered = registeredByIdentity.get(identity);
    if (targetRegistered) {
      targetRegistered.hasEmployerContribution = true;
      targetRegistered.employerContributionCount += 1;
      const updatedAtIso = spg.updatedAt.toISOString();
      if (!targetRegistered.lastContributionAt || updatedAtIso > targetRegistered.lastContributionAt) {
        targetRegistered.lastContributionAt = updatedAtIso;
      }
      continue;
    }

    const target = unregisteredByIdentity.get(identity) ?? {
      id: null,
      payerCode: null,
      displayName: spg.employeeName,
      identityNo: spg.employeeIdentityNo,
      email: null,
      status: "unregistered" as const,
      hasDirectContribution: false,
      hasEmployerContribution: false,
      directContributionCount: 0,
      employerContributionCount: 0,
      lastContributionAt: null,
      registrationState: "unregistered" as const,
    };
    target.hasEmployerContribution = true;
    target.employerContributionCount += 1;
    const updatedAtIso = spg.updatedAt.toISOString();
    if (!target.lastContributionAt || updatedAtIso > target.lastContributionAt) {
      target.lastContributionAt = updatedAtIso;
    }
    unregisteredByIdentity.set(identity, target);
  }

  let rows = [
    ...Array.from(registeredByIdentity.values()),
    ...Array.from(unregisteredByIdentity.values()),
  ];

  if (q.category === "registered") {
    rows = rows.filter((row) => row.registrationState === "registered");
  } else if (q.category === "unregistered") {
    rows = rows.filter((row) => row.registrationState === "unregistered");
  }

  if (q.q) {
    const term = q.q.toLowerCase();
    rows = rows.filter((row) =>
      (row.displayName || "").toLowerCase().includes(term) ||
      (row.identityNo || "").toLowerCase().includes(term) ||
      (row.payerCode || "").toLowerCase().includes(term) ||
      (row.email || "").toLowerCase().includes(term),
    );
  }

  rows.sort((a, b) => {
    if (a.registrationState !== b.registrationState) return a.registrationState === "registered" ? -1 : 1;
    const aDate = a.lastContributionAt || "";
    const bDate = b.lastContributionAt || "";
    return bDate.localeCompare(aDate);
  });

  const total = rows.length;
  const start = (q.page - 1) * q.limit;
  const paged = rows.slice(start, start + q.limit);

  return sendOk(res, paged, { page: q.page, limit: q.limit, total });
});

payersRouter.get("/corporate-directory", async (req, res) => {
  const q = corporateDirectoryQuerySchema.parse(req.query);

  const rowsRaw = await prisma.payerProfile.findMany({
    where: {
      payerType: { in: ["korporat", "majikan_spg"] },
      status: { not: "merged" },
    },
    include: {
      corporate: true,
      spgEmployer: true,
      _count: {
        select: {
          spgEmployees: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  function normalize(value: string | null | undefined) {
    return (value || "").replace(/[^A-Za-z0-9]/g, "").toUpperCase();
  }

  const grouped = new Map<string, {
    id: number;
    payerCode: string;
    companyName: string;
    ssmNo: string;
    email: string | null;
    status: string;
    hasPayer: boolean;
    hasSpg: boolean;
  }>();

  for (const row of rowsRaw) {
    const keySsm = normalize(row.corporate?.ssmNo || row.identityNo);
    const key =
      keySsm ||
      `${(row.displayName || "").trim().toLowerCase()}|${(row.email || "").trim().toLowerCase()}`;
    if (!key) continue;

    const existing = grouped.get(key) ?? {
      id: row.id,
      payerCode: row.payerCode,
      companyName: row.corporate?.companyName || row.displayName,
      ssmNo: row.corporate?.ssmNo || row.identityNo || "-",
      email: row.email,
      status: row.status,
      hasPayer: false,
      hasSpg: false,
    };

    const hasPayerActivity = row.payerType === PayerType.korporat || Boolean(row.corporate);
    const hasSpgActivity =
      row.payerType === PayerType.majikan_spg ||
      Boolean(row.spgEmployer) ||
      row._count.spgEmployees > 0;

    if (hasPayerActivity) {
      existing.hasPayer = true;
    }
    if (hasSpgActivity) {
      existing.hasSpg = true;
    }

    if (!existing.email && row.email) existing.email = row.email;
    if (existing.status !== "active" && row.status === "active") existing.status = row.status;
    if (existing.id > row.id) {
      existing.id = row.id;
      existing.payerCode = row.payerCode;
    }

    grouped.set(key, existing);
  }

  let rows = Array.from(grouped.values()).map((row) => ({
    ...row,
    category: row.hasPayer && row.hasSpg ? "both" : row.hasSpg ? "spg" : "payer",
  }));

  if (q.category !== "all") {
    rows = rows.filter((row) => row.category === q.category);
  }

  if (q.q) {
    const term = q.q.toLowerCase();
    rows = rows.filter((row) =>
      row.companyName.toLowerCase().includes(term) ||
      row.ssmNo.toLowerCase().includes(term) ||
      (row.email || "").toLowerCase().includes(term) ||
      row.payerCode.toLowerCase().includes(term),
    );
  }

  rows.sort((a, b) => a.companyName.localeCompare(b.companyName));

  const total = rows.length;
  const start = (q.page - 1) * q.limit;
  const paged = rows.slice(start, start + q.limit);

  return sendOk(res, paged, { page: q.page, limit: q.limit, total });
});

payersRouter.get("/portal-profile/:identityNo", async (req, res) => {
  const rawIdentity = String(req.params.identityNo || "").trim();
  if (!rawIdentity) return sendError(res, 400, "VALIDATION_ERROR", "Identity number is required");

  const normalized = normalizeIdentity(rawIdentity);
  const variants = [rawIdentity, normalized].filter(Boolean);
  if (/^\d{12}$/.test(normalized)) {
    variants.push(`${normalized.slice(0, 6)}-${normalized.slice(6, 8)}-${normalized.slice(8)}`);
  }

  const payer = await prisma.payerProfile.findFirst({
    where: {
      payerType: "individu",
      status: { not: "merged" },
      OR: [
        { identityNo: { in: variants } },
        { individual: { mykadOrPassport: { in: variants } } },
      ],
    },
    include: {
      individual: true,
      addresses: {
        orderBy: [{ isPrimary: "desc" }, { id: "asc" }],
      },
    },
  });

  if (!payer) return sendError(res, 404, "NOT_FOUND", "Payer profile not found");

  const primaryAddress = payer.addresses[0] ?? null;

  return sendOk(res, {
    id: payer.id,
    payerCode: payer.payerCode,
    displayName: payer.displayName,
    identityNo: payer.individual?.mykadOrPassport || payer.identityNo,
    email: payer.email,
    phone: payer.phone,
    individual: payer.individual
      ? {
          fullName: payer.individual.fullName,
          occupation: payer.individual.occupation,
          incomeSource: payer.individual.incomeSource,
          monthlyIncome: payer.individual.monthlyIncome ? Number(payer.individual.monthlyIncome) : null,
        }
      : null,
    address: primaryAddress
      ? {
          line1: primaryAddress.line1,
          line2: primaryAddress.line2,
          city: primaryAddress.city,
          state: primaryAddress.state,
          postcode: primaryAddress.postcode,
          country: primaryAddress.country,
        }
      : null,
  });
});

payersRouter.get("/:id", async (req, res) => {
  const id = Number(req.params.id);
  const payer = await prisma.payerProfile.findUnique({
    where: { id },
    include: {
      ...payerInclude(),
      statusHistory: { orderBy: { changedAt: "desc" }, take: 20 },
      blacklistHistory: { orderBy: { changedAt: "desc" }, take: 20 },
      auditLogs: { orderBy: { performedAt: "desc" }, take: 20 },
    },
  });
  if (!payer) return sendError(res, 404, "NOT_FOUND", "Payer not found");
  return sendOk(res, payer);
});

payersRouter.post("/individual", async (req: AuthedRequest, res) => {
  const input = payerIndividualCreateSchema.parse(req.body);
  const rawPassword = typeof req.body.password === "string" ? req.body.password : null;

  const existingIdentity = await prisma.payerIndividual.findUnique({
    where: { mykadOrPassport: input.mykadOrPassport },
  });
  if (existingIdentity) {
    return sendError(res, 409, "DUPLICATE_IDENTITY", "MyKad/Passport already exists");
  }

  const passwordHash = rawPassword ? await bcrypt.hash(rawPassword, 10) : null;

  const payer = await prisma.payerProfile.create({
    data: {
      payerCode: generatePayerCode(),
      payerType: PayerType.individu,
      displayName: input.displayName,
      identityNo: input.identityNo ?? input.mykadOrPassport,
      identityType: input.identityType ?? "mykad",
      email: input.email,
      phone: input.phone,
      passwordHash,
      status: "active",
      individual: {
        create: {
          fullName: input.fullName,
          mykadOrPassport: input.mykadOrPassport,
          dob: input.dob ? new Date(input.dob) : null,
          gender: input.gender,
          maritalStatus: input.maritalStatus,
          occupation: input.occupation,
          incomeSource: input.incomeSource,
          monthlyIncome: input.monthlyIncome,
        },
      },
      addresses: { create: input.addresses },
      documents: { create: input.documents },
    },
    include: payerInclude(),
  });

  await writeAuditLog({
    entityName: "payer_profile",
    entityId: String(payer.id),
    action: "CREATE_INDIVIDUAL",
    targetPayerId: payer.id,
    newValueJson: payer,
    performedBy: req.auth?.userId,
    ipAddress: req.ip,
  });

  return sendOk(res, stripPasswordHash(payer));
});

payersRouter.post("/corporate", async (req: AuthedRequest, res) => {
  const input = payerCorporateCreateSchema.parse(req.body);
  const rawPassword = typeof req.body.password === "string" ? req.body.password : null;

  const existingSsm = await prisma.payerCorporate.findUnique({
    where: { ssmNo: input.ssmNo },
  });
  if (existingSsm) {
    return sendError(res, 409, "DUPLICATE_SSM", "SSM number already exists");
  }

  const passwordHash = rawPassword ? await bcrypt.hash(rawPassword, 10) : null;

  const payer = await prisma.payerProfile.create({
    data: {
      payerCode: generatePayerCode(),
      payerType: PayerType.korporat,
      displayName: input.displayName,
      identityNo: input.identityNo ?? input.ssmNo,
      identityType: input.identityType ?? "ssm",
      email: input.email,
      phone: input.phone,
      passwordHash,
      status: "active",
      corporate: {
        create: {
          companyName: input.companyName,
          ssmNo: input.ssmNo,
          companyType: input.companyType,
          taxNo: input.taxNo,
          taxBranch: input.taxBranch,
        },
      },
      addresses: { create: input.addresses },
      documents: { create: input.documents },
      contactPersons: { create: input.contactPersons },
      branches: { create: input.branches },
      shareholders: { create: input.shareholders },
    },
    include: payerInclude(),
  });

  await writeAuditLog({
    entityName: "payer_profile",
    entityId: String(payer.id),
    action: "CREATE_CORPORATE",
    targetPayerId: payer.id,
    newValueJson: payer,
    performedBy: req.auth?.userId,
    ipAddress: req.ip,
  });

  return sendOk(res, stripPasswordHash(payer));
});

payersRouter.post("/spg-employer", async (req: AuthedRequest, res) => {
  const input = payerSpgEmployerCreateSchema.parse(req.body);

  const payer = await prisma.payerProfile.create({
    data: {
      payerCode: generatePayerCode(),
      payerType: PayerType.majikan_spg,
      displayName: input.displayName,
      identityNo: input.identityNo,
      identityType: input.identityType ?? "other",
      email: input.email,
      phone: input.phone,
      status: "active",
      spgEmployer: {
        create: {
          agreementNo: input.agreementNo,
          agreementEffectiveDate: input.agreementEffectiveDate ? new Date(input.agreementEffectiveDate) : null,
          agreementExpiryDate: input.agreementExpiryDate ? new Date(input.agreementExpiryDate) : null,
          deductionMode: input.deductionMode,
          deductionValue: input.deductionValue,
          deductionCap: input.deductionCap,
        },
      },
      addresses: { create: input.addresses },
      documents: { create: input.documents },
    },
    include: payerInclude(),
  });

  await writeAuditLog({
    entityName: "payer_profile",
    entityId: String(payer.id),
    action: "CREATE_SPG_EMPLOYER",
    targetPayerId: payer.id,
    newValueJson: payer,
    performedBy: req.auth?.userId,
    ipAddress: req.ip,
  });

  return sendOk(res, payer);
});

payersRouter.put("/:id", async (req: AuthedRequest, res) => {
  const id = Number(req.params.id);
  const input = payerUpdateSchema.parse(req.body);

  const existing = await prisma.payerProfile.findUnique({ where: { id }, include: payerInclude() });
  if (!existing) return sendError(res, 404, "NOT_FOUND", "Payer not found");

  const updated = await prisma.payerProfile.update({
    where: { id },
    data: {
      ...(input.displayName !== undefined ? { displayName: input.displayName } : {}),
      ...(input.identityNo !== undefined ? { identityNo: input.identityNo } : {}),
      ...(input.identityType !== undefined ? { identityType: input.identityType } : {}),
      ...(input.email !== undefined ? { email: input.email } : {}),
      ...(input.phone !== undefined ? { phone: input.phone } : {}),
      ...(input.status !== undefined ? { status: input.status } : {}),
    },
    include: payerInclude(),
  });

  await writeAuditLog({
    entityName: "payer_profile",
    entityId: String(updated.id),
    action: "UPDATE_PROFILE",
    targetPayerId: updated.id,
    oldValueJson: existing,
    newValueJson: updated,
    performedBy: req.auth?.userId,
    ipAddress: req.ip,
  });

  return sendOk(res, updated);
});

payersRouter.post("/update-request", async (req, res) => {
  const input = payerUpdateRequestSchema.parse(req.body);
  const existing = await prisma.payerProfile.findUnique({
    where: { id: input.payerId },
    include: { individual: true },
  });
  if (!existing) return sendError(res, 404, "NOT_FOUND", "Payer not found");
  if (existing.status === "merged") {
    return sendError(res, 409, "MERGED_PROFILE", "Cannot submit update request for merged profile");
  }

  const updated = await prisma.$transaction(async (tx) => {
    const payer = await tx.payerProfile.update({
      where: { id: input.payerId },
      data: {
        ...(input.displayName !== undefined ? { displayName: input.displayName } : {}),
        ...(input.email !== undefined ? { email: input.email } : {}),
        ...(input.phone !== undefined ? { phone: input.phone } : {}),
      },
    });

    if (existing.individual && (input.occupation !== undefined || input.incomeSource !== undefined)) {
      await tx.payerIndividual.update({
        where: { payerId: input.payerId },
        data: {
          ...(input.occupation !== undefined ? { occupation: input.occupation } : {}),
          ...(input.incomeSource !== undefined ? { incomeSource: input.incomeSource } : {}),
        },
      });
    }

    return payer;
  });

  await writeAuditLog({
    entityName: "payer_update_request",
    entityId: String(input.payerId),
    action: input.isCriticalChange ? "SUBMIT_CRITICAL" : "SUBMIT",
    targetPayerId: input.payerId,
    oldValueJson: {
      displayName: existing.displayName,
      email: existing.email,
      phone: existing.phone,
      occupation: existing.individual?.occupation ?? null,
      incomeSource: existing.individual?.incomeSource ?? null,
    },
    newValueJson: {
      displayName: input.displayName,
      email: input.email,
      phone: input.phone,
      occupation: input.occupation,
      incomeSource: input.incomeSource,
      reason: input.reason,
      isCriticalChange: input.isCriticalChange,
    },
    ipAddress: req.ip,
  });

  return sendOk(res, {
    success: true,
    payerId: updated.id,
    message: "Update request submitted",
  });
});

payersRouter.post("/corporate-zakat", async (req, res) => {
  const input = corporateZakatPaymentSchema.parse(req.body);
  const normalizedSsm = normalizeIdentity(input.ssmNo);

  const paymentMethodFull = input.zakatType
    ? `${input.paymentMethod} | ${input.zakatType}`
    : input.paymentMethod;

  const rand = Math.floor(Math.random() * 9000) + 1000;
  const receiptNo = `CRCPT-${Date.now()}-${rand}`;

  const row = await prisma.guestPayment.create({
    data: {
      receiptNo,
      guestName: input.companyName,
      identityNo: normalizedSsm,
      email: input.contactEmail,
      amount: input.amount,
      paymentMethod: paymentMethodFull,
      status: "success",
      source: GuestPaymentSource.CORPORATE_DIRECT,
    },
  });

  return sendOk(res, {
    id: row.id,
    receiptNo: row.receiptNo,
    message: "Bayaran zakat syarikat berjaya direkodkan.",
  });
});

payersRouter.get("/:id/stats", async (req, res) => {
  const id = Number(req.params.id);
  const yearParam = req.query.year ? String(req.query.year) : null;

  const payer = await prisma.payerProfile.findUnique({
    where: { id },
    select: { identityNo: true, individual: { select: { mykadOrPassport: true } } },
  });
  if (!payer) return sendError(res, 404, "NOT_FOUND", "Payer not found");

  const identityNo = payer.individual?.mykadOrPassport || payer.identityNo || "";
  if (!identityNo) return sendOk(res, { totalPaid: 0, individualTotal: 0, corporateTotal: 0, transactionCount: 0, monthlyBreakdown: [], zakatTypes: [], recentTransactions: [] });

  const normalized = normalizeIdentity(identityNo);
  const variants = [identityNo.trim(), normalized].filter(Boolean);
  if (/^\d{12}$/.test(normalized)) {
    variants.push(`${normalized.slice(0, 6)}-${normalized.slice(6, 8)}-${normalized.slice(8)}`);
  }

  const dateFilter: { paidAt?: { gte?: Date; lt?: Date } } = {};
  if (yearParam && /^\d{4}$/.test(yearParam)) {
    const y = Number(yearParam);
    dateFilter.paidAt = { gte: new Date(`${y}-01-01`), lt: new Date(`${y + 1}-01-01`) };
  }

  const payments = await prisma.guestPayment.findMany({
    where: {
      identityNo: { in: variants },
      status: "success",
      ...dateFilter,
    },
    orderBy: { paidAt: "desc" },
  });

  let totalPaid = 0;
  let individualTotal = 0;
  let corporateTotal = 0;
  const monthMap = new Map<string, { individual: number; corporate: number }>();
  const zakatMap = new Map<string, number>();

  for (const p of payments) {
    const amount = Number(p.amount);
    totalPaid += amount;

    const isCorporate = p.receiptNo.startsWith("CRCPT-");
    if (isCorporate) {
      corporateTotal += amount;
    } else {
      individualTotal += amount;
    }

    const monthKey = p.paidAt.toISOString().slice(0, 7);
    const monthEntry = monthMap.get(monthKey) ?? { individual: 0, corporate: 0 };
    if (isCorporate) {
      monthEntry.corporate += amount;
    } else {
      monthEntry.individual += amount;
    }
    monthMap.set(monthKey, monthEntry);

    const parts = p.paymentMethod.split("|").map((s) => s.trim());
    const zakatType = parts.length > 1 ? parts[1] : "Lain-lain";
    zakatMap.set(zakatType, (zakatMap.get(zakatType) ?? 0) + amount);
  }

  const monthNames: Record<string, string> = {
    "01": "Jan", "02": "Feb", "03": "Mac", "04": "Apr", "05": "Mei", "06": "Jun",
    "07": "Jul", "08": "Ogos", "09": "Sep", "10": "Okt", "11": "Nov", "12": "Dis",
  };

  const monthlyBreakdown = Array.from(monthMap.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .slice(-6)
    .map(([key, val]) => ({
      month: monthNames[key.slice(5, 7)] || key.slice(5, 7),
      individual: val.individual,
      corporate: val.corporate,
    }));

  const zakatTypes = Array.from(zakatMap.entries())
    .sort(([, a], [, b]) => b - a)
    .map(([type, amount]) => ({ type, amount }));

  const recentTransactions = payments.slice(0, 10).map((p) => {
    const parts = p.paymentMethod.split("|").map((s) => s.trim());
    const isCorporate = p.receiptNo.startsWith("CRCPT-");
    return {
      id: p.id,
      date: p.paidAt.toISOString(),
      amount: Number(p.amount),
      source: isCorporate ? "Korporat" : "Individu",
      zakatType: parts.length > 1 ? parts[1] : "Lain-lain",
      status: p.status,
      receiptNo: p.receiptNo,
      payerName: p.guestName,
      identityNo: p.identityNo,
      paymentMethod: parts[0],
    };
  });

  return sendOk(res, {
    totalPaid,
    individualTotal,
    corporateTotal,
    transactionCount: payments.length,
    monthlyBreakdown,
    zakatTypes,
    recentTransactions,
  });
});
