import fs from "node:fs";
import path from "node:path";

import pkg from "@prisma/client";
import { Router } from "express";
import multer from "multer";

const { CounterDepositStatus, CounterPaymentChannel, CounterReconStatus, GuestPaymentSource, ReconciliationCaseStatus, SpgPayrollBatchStatus, SpgPayrollPaymentChannel } = pkg;

import { env } from "../config/env.js";
import { prisma } from "../prisma.js";
import type { AuthedRequest } from "../types.js";
import { requireRole, writeAuditLog } from "../utils/payer.js";
import { sendError, sendOk } from "../utils/responses.js";
import { counterDepositCreateSchema, counterDepositsQuerySchema, counterPaymentCreateSchema, counterPaymentsQuerySchema, counterSpgBatchCreateSchema } from "./schemas.js";

export const counterRouter = Router();

const depositSlipStorage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, env.uploadDir),
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, `counter-deposit-slip-${Date.now()}-${Math.random().toString(36).slice(2, 8)}${ext}`);
  },
});

const depositSlipUpload = multer({
  storage: depositSlipStorage,
  limits: { fileSize: 8 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    const ok = ["application/pdf", "image/png", "image/jpeg", "image/webp"].includes(file.mimetype);
    if (!ok) {
      cb(new Error("Only PDF/PNG/JPG/WEBP files are allowed"));
      return;
    }
    cb(null, true);
  },
});

function normalizeIdentity(identityNo: string) {
  return identityNo.replace(/[^A-Za-z0-9]/g, "").toUpperCase();
}

function buildCounterReceiptNo() {
  const now = Date.now().toString(36).toUpperCase();
  const rand = Math.floor(Math.random() * 900) + 100;
  return `KR${now}${rand}`;
}

function buildCounterDepositReferenceNo() {
  const rand = Math.floor(Math.random() * 900000) + 100000;
  return `CBNK-${Date.now()}-${rand}`;
}

function parseDate(input?: string) {
  if (!input) return undefined;
  const dt = new Date(input);
  return Number.isNaN(dt.getTime()) ? undefined : dt;
}

function normalizeCounterZakatItems(input: {
  zakatItems?: Array<{ zakatType: string; financialYear: string; amount: number }>;
  zakatType?: string;
  financialYear?: string;
  amount?: number;
}) {
  const fromItems = Array.isArray(input.zakatItems) ? input.zakatItems : [];
  const cleaned = fromItems
    .map((x) => ({
      zakatType: String(x.zakatType || "").trim(),
      financialYear: String(x.financialYear || "").trim(),
      amount: Number(x.amount || 0),
    }))
    .filter((x) => x.zakatType && /^\d{4}$/.test(x.financialYear) && Number.isFinite(x.amount) && x.amount > 0);

  if (cleaned.length > 0) return cleaned;

  const legacyType = String(input.zakatType || "").trim();
  const legacyYear = String(input.financialYear || "").trim();
  const legacyAmount = Number(input.amount || 0);
  if (legacyType && /^\d{4}$/.test(legacyYear) && Number.isFinite(legacyAmount) && legacyAmount > 0) {
    return [{ zakatType: legacyType, financialYear: legacyYear, amount: legacyAmount }];
  }

  return [];
}

function isCounterOnly(role: string) {
  return role.trim().toLowerCase() === "counter";
}

counterRouter.post("/payments", async (req: AuthedRequest, res) => {
  const actor = await requireRole(req.auth?.userId, ["counter", "penyelia", "eksekutif pemprosesan"], res);
  if (!actor) return;

  const input = counterPaymentCreateSchema.parse(req.body);
  const channelLabels: Record<string, string> = {
    COUNTER_CASH: "Tunai",
    COUNTER_CARD_TERMINAL: "Kad Terminal",
    COUNTER_CHEQUE: "Cek",
    COUNTER_DEBIT: "Debit",
    COUNTER_QR: "QR",
  };
  const zakatItems = normalizeCounterZakatItems(input);
  if (zakatItems.length === 0) {
    return sendError(res, 400, "VALIDATION_ERROR", "At least one zakat item is required");
  }
  const totalAmount = zakatItems.reduce((sum, item) => sum + Number(item.amount), 0);
  if (typeof input.amount === "number") {
    const roundedInput = Math.round(input.amount * 100) / 100;
    const roundedItems = Math.round(totalAmount * 100) / 100;
    if (roundedInput !== roundedItems) {
      return sendError(res, 400, "VALIDATION_ERROR", "amount must match zakatItems total");
    }
  }
  const paymentMethod = zakatItems.length === 1
    ? `${channelLabels[input.paymentChannel] || input.paymentChannel} | ${zakatItems[0].zakatType} | Tahun ${zakatItems[0].financialYear}`
    : `${channelLabels[input.paymentChannel] || input.paymentChannel} | Multi Zakat (${zakatItems.length}) | Tahun Campuran`;

  const row = await prisma.$transaction(async (tx) => {
    const created = await tx.guestPayment.create({
      data: {
        receiptNo: buildCounterReceiptNo(),
        guestName: input.guestName,
        identityNo: normalizeIdentity(input.identityNo),
        email: input.email,
        amount: totalAmount,
        paymentMethod,
        status: "success",
        source: GuestPaymentSource.COUNTER_COLLECTION,
        counterChannel: input.paymentChannel,
        collectedByUserId: actor.id,
        collectionPoint: input.collectionPoint,
        terminalRrn: input.terminalRef?.rrn,
        terminalAuthCode: input.terminalRef?.authCode,
        terminalTid: input.terminalRef?.tid,
        terminalMid: input.terminalRef?.mid,
        reconStatus: CounterReconStatus.unbatched,
        notes: input.notes,
      },
    });
    await tx.guestPaymentZakatItem.createMany({
      data: zakatItems.map((item) => ({
        guestPaymentId: created.id,
        zakatType: item.zakatType,
        financialYear: item.financialYear,
        amount: item.amount,
      })),
    });
    return created;
  });

  await writeAuditLog({
    entityName: "counter_payment",
    entityId: String(row.id),
    action: "CREATE",
    newValueJson: {
      receiptNo: row.receiptNo,
      amount: totalAmount,
      paymentChannel: input.paymentChannel,
      collectionPoint: input.collectionPoint,
      zakatItems,
    },
    performedBy: actor.id,
    ipAddress: req.ip,
  });

  return sendOk(res, {
    paymentId: row.id,
    receiptNo: row.receiptNo,
    paidAt: row.paidAt.toISOString(),
    amount: Number(row.amount),
    status: row.status,
    paymentChannel: input.paymentChannel,
    collectionPoint: input.collectionPoint,
    zakatItems,
  });
});

counterRouter.get("/payments", async (req: AuthedRequest, res) => {
  const actor = await requireRole(req.auth?.userId, ["counter", "penyelia", "eksekutif pemprosesan"], res);
  if (!actor) return;

  const query = counterPaymentsQuerySchema.parse(req.query);
  const where: Record<string, unknown> = {
    source: GuestPaymentSource.COUNTER_COLLECTION,
  };

  if (query.channel) where.counterChannel = query.channel;
  if (query.reconStatus) where.reconStatus = query.reconStatus;
  if (query.collectionPoint) where.collectionPoint = query.collectionPoint;
  if (query.staffId) where.collectedByUserId = query.staffId;
  if (query.dateFrom || query.dateTo) {
    where.paidAt = {
      ...(query.dateFrom ? { gte: new Date(query.dateFrom) } : {}),
      ...(query.dateTo ? { lte: new Date(query.dateTo) } : {}),
    };
  }
  if (query.q) {
    where.OR = [
      { receiptNo: { contains: query.q } },
      { guestName: { contains: query.q } },
      { identityNo: { contains: normalizeIdentity(query.q) } },
    ];
  }
  if (isCounterOnly(actor.role)) {
    where.collectedByUserId = actor.id;
  }

  const [rows, total] = await Promise.all([
    prisma.guestPayment.findMany({
      where,
      orderBy: { paidAt: "desc" },
      skip: (query.page - 1) * query.limit,
      take: query.limit,
      include: {
        collectedByUser: { select: { id: true, name: true, role: true } },
        depositBatch: { select: { id: true, referenceNo: true, status: true } },
        zakatItems: { select: { id: true, zakatType: true, financialYear: true, amount: true } },
      },
    }),
    prisma.guestPayment.count({ where }),
  ]);

  return sendOk(
    res,
    rows.map((row) => ({
      ...row,
      amount: Number(row.amount),
      zakatItems: row.zakatItems.map((item) => ({ ...item, amount: Number(item.amount) })),
    })),
    { page: query.page, limit: query.limit, total },
  );
});

counterRouter.get("/payments/:id", async (req: AuthedRequest, res) => {
  const actor = await requireRole(req.auth?.userId, ["counter", "penyelia", "eksekutif pemprosesan"], res);
  if (!actor) return;

  const id = Number(req.params.id);
  if (!Number.isFinite(id)) return sendError(res, 400, "VALIDATION_ERROR", "Invalid payment id");

  const row = await prisma.guestPayment.findUnique({
    where: { id },
    include: {
      collectedByUser: { select: { id: true, name: true, role: true } },
      depositBatch: { select: { id: true, referenceNo: true, status: true } },
      zakatItems: { select: { id: true, zakatType: true, financialYear: true, amount: true } },
    },
  });
  if (!row || row.source !== GuestPaymentSource.COUNTER_COLLECTION) {
    return sendError(res, 404, "NOT_FOUND", "Counter payment not found");
  }
  if (isCounterOnly(actor.role) && row.collectedByUserId !== actor.id) {
    return sendError(res, 403, "FORBIDDEN", "You can only view your own records");
  }

  return sendOk(res, {
    ...row,
    amount: Number(row.amount),
    zakatItems: row.zakatItems.map((item) => ({ ...item, amount: Number(item.amount) })),
  });
});

counterRouter.post("/deposits", depositSlipUpload.single("slipFile"), async (req: AuthedRequest, res) => {
  const actor = await requireRole(req.auth?.userId, ["counter", "penyelia", "eksekutif pemprosesan"], res);
  if (!actor) return;

  const parsed = counterDepositCreateSchema.safeParse({
    depositType: req.body?.depositType,
    depositDate: req.body?.depositDate,
    collectionPoint: req.body?.collectionPoint,
    paymentIds: (() => {
      const raw = req.body?.paymentIds;
      if (Array.isArray(raw)) return raw.map((v) => Number(v));
      if (typeof raw === "string") {
        try {
          const arr = JSON.parse(raw);
          return Array.isArray(arr) ? arr.map((v) => Number(v)) : [];
        } catch {
          return [];
        }
      }
      return [];
    })(),
    declaredAmount: Number(req.body?.declaredAmount),
    notes: req.body?.notes,
  });

  if (!parsed.success) {
    return sendError(res, 400, "VALIDATION_ERROR", parsed.error.issues.map((x) => x.message).join(", "));
  }
  const input = parsed.data;

  const expectedChannel = input.depositType === "CASH_BANKIN"
    ? CounterPaymentChannel.COUNTER_CASH
    : CounterPaymentChannel.COUNTER_CARD_TERMINAL;

  const payments = await prisma.guestPayment.findMany({
    where: {
      id: { in: input.paymentIds },
      source: GuestPaymentSource.COUNTER_COLLECTION,
      status: "success",
      reconStatus: CounterReconStatus.unbatched,
      depositBatchId: null,
      counterChannel: expectedChannel,
      ...(isCounterOnly(actor.role) ? { collectedByUserId: actor.id } : {}),
    },
  });

  if (payments.length !== input.paymentIds.length) {
    return sendError(res, 400, "VALIDATION_ERROR", "Some payments are invalid, not eligible, or already batched");
  }

  const systemAmount = payments.reduce((sum, row) => sum + Number(row.amount), 0);
  const roundedSystem = Math.round(systemAmount * 100) / 100;
  const roundedDeclared = Math.round(input.declaredAmount * 100) / 100;
  if (roundedSystem !== roundedDeclared) {
    return sendError(res, 400, "VALIDATION_ERROR", "Declared amount must match exact total selected payment amount");
  }

  const slipUrl = req.file ? `/uploads/${req.file.filename}` : null;
  const depositDate = parseDate(input.depositDate);
  if (!depositDate) return sendError(res, 400, "VALIDATION_ERROR", "Invalid depositDate");

  const created = await prisma.$transaction(async (tx) => {
    const batch = await tx.counterDepositBatch.create({
      data: {
        referenceNo: buildCounterDepositReferenceNo(),
        depositType: input.depositType,
        status: CounterDepositStatus.submitted,
        depositDate,
        declaredAmount: roundedDeclared,
        systemAmount: roundedSystem,
        varianceAmount: 0,
        collectionPoint: input.collectionPoint || null,
        createdBy: actor.id,
        slipUrl,
        notes: input.notes,
      },
    });

    await tx.counterDepositBatchItem.createMany({
      data: payments.map((row) => ({
        batchId: batch.id,
        guestPaymentId: row.id,
        amount: Number(row.amount),
      })),
    });

    await tx.guestPayment.updateMany({
      where: { id: { in: payments.map((x) => x.id) } },
      data: {
        depositBatchId: batch.id,
        reconStatus: CounterReconStatus.batched,
      },
    });

    await tx.counterStatusHistory.create({
      data: {
        entityType: "counter_deposit_batch",
        entityId: batch.id,
        oldStatus: null,
        newStatus: CounterDepositStatus.submitted,
        changedBy: actor.id,
        reason: "Batch submitted for bank-in reconciliation",
        batchId: batch.id,
      },
    });

    return batch;
  });

  await writeAuditLog({
    entityName: "counter_deposit",
    entityId: String(created.id),
    action: "CREATE",
    newValueJson: {
      referenceNo: created.referenceNo,
      depositType: created.depositType,
      paymentCount: payments.length,
      totalAmount: roundedSystem,
    },
    performedBy: actor.id,
    ipAddress: req.ip,
  });

  return sendOk(res, {
    depositBatchId: created.id,
    referenceNo: created.referenceNo,
    totalAmount: Number(created.systemAmount),
    itemCount: payments.length,
    status: created.status,
  });
});

counterRouter.get("/deposits", async (req: AuthedRequest, res) => {
  const actor = await requireRole(req.auth?.userId, ["counter", "penyelia", "eksekutif pemprosesan"], res);
  if (!actor) return;

  const query = counterDepositsQuerySchema.parse(req.query);
  const where: Record<string, unknown> = {};
  if (query.status) where.status = query.status;
  if (query.type) where.depositType = query.type;
  if (query.referenceNo) where.referenceNo = { contains: query.referenceNo };
  if (query.dateFrom || query.dateTo) {
    where.depositDate = {
      ...(query.dateFrom ? { gte: new Date(query.dateFrom) } : {}),
      ...(query.dateTo ? { lte: new Date(query.dateTo) } : {}),
    };
  }
  if (isCounterOnly(actor.role)) {
    where.createdBy = actor.id;
  }

  const [rows, total] = await Promise.all([
    prisma.counterDepositBatch.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (query.page - 1) * query.limit,
      take: query.limit,
      include: {
        createdByUser: { select: { id: true, name: true } },
        approvedByUser: { select: { id: true, name: true } },
        _count: { select: { items: true } },
      },
    }),
    prisma.counterDepositBatch.count({ where }),
  ]);

  return sendOk(
    res,
    rows.map((row) => ({
      ...row,
      declaredAmount: Number(row.declaredAmount),
      systemAmount: Number(row.systemAmount),
      varianceAmount: Number(row.varianceAmount),
      itemCount: row._count.items,
    })),
    { page: query.page, limit: query.limit, total },
  );
});

counterRouter.get("/deposits/:id", async (req: AuthedRequest, res) => {
  const actor = await requireRole(req.auth?.userId, ["counter", "penyelia", "eksekutif pemprosesan"], res);
  if (!actor) return;

  const id = Number(req.params.id);
  if (!Number.isFinite(id)) return sendError(res, 400, "VALIDATION_ERROR", "Invalid deposit id");

  const batch = await prisma.counterDepositBatch.findUnique({
    where: { id },
    include: {
      createdByUser: { select: { id: true, name: true, role: true } },
      approvedByUser: { select: { id: true, name: true, role: true } },
      items: { orderBy: { id: "asc" } },
      statusHistory: { orderBy: { changedAt: "asc" } },
      reconciliationCases: {
        where: { status: { in: [ReconciliationCaseStatus.open, ReconciliationCaseStatus.investigating] } },
        orderBy: { createdAt: "desc" },
      },
    },
  });
  if (!batch) return sendError(res, 404, "NOT_FOUND", "Deposit batch not found");
  if (isCounterOnly(actor.role) && batch.createdBy !== actor.id) {
    return sendError(res, 403, "FORBIDDEN", "You can only view your own deposit batches");
  }

  const paymentIds = batch.items.map((x) => x.guestPaymentId);
  const payments = paymentIds.length
    ? await prisma.guestPayment.findMany({
        where: { id: { in: paymentIds } },
        orderBy: { paidAt: "asc" },
        include: {
          zakatItems: {
            select: { id: true, zakatType: true, financialYear: true, amount: true },
            orderBy: { id: "asc" },
          },
        },
      })
    : [];

  return sendOk(res, {
    ...batch,
    declaredAmount: Number(batch.declaredAmount),
    systemAmount: Number(batch.systemAmount),
    varianceAmount: Number(batch.varianceAmount),
    payments: payments.map((p) => ({
      ...p,
      amount: Number(p.amount),
      zakatItems: p.zakatItems.map((item) => ({ ...item, amount: Number(item.amount) })),
    })),
    items: batch.items.map((item) => ({ ...item, amount: Number(item.amount) })),
  });
});

counterRouter.delete("/deposits/:id/slip-file", async (req: AuthedRequest, res) => {
  const actor = await requireRole(req.auth?.userId, ["counter", "penyelia", "eksekutif pemprosesan"], res);
  if (!actor) return;

  const id = Number(req.params.id);
  if (!Number.isFinite(id)) return sendError(res, 400, "VALIDATION_ERROR", "Invalid deposit id");
  const batch = await prisma.counterDepositBatch.findUnique({ where: { id } });
  if (!batch) return sendError(res, 404, "NOT_FOUND", "Deposit batch not found");
  if (isCounterOnly(actor.role) && batch.createdBy !== actor.id) {
    return sendError(res, 403, "FORBIDDEN", "You can only modify your own deposit batches");
  }
  if (!batch.slipUrl) return sendOk(res, { success: true });

  const filePath = path.join(env.uploadDir, path.basename(batch.slipUrl));
  try {
    fs.unlinkSync(filePath);
  } catch {
    // no-op
  }
  await prisma.counterDepositBatch.update({
    where: { id },
    data: { slipUrl: null },
  });
  return sendOk(res, { success: true });
});

/* ── Counter SPG Batch ─────────────────────────────── */

function buildCounterSpgReferenceNo() {
  const rand = Math.floor(Math.random() * 900000) + 100000;
  return `SPG-CTR-${Date.now()}-${rand}`;
}

counterRouter.post("/spg-batch", async (req: AuthedRequest, res) => {
  const actor = await requireRole(req.auth?.userId, ["counter", "penyelia", "eksekutif pemprosesan"], res);
  if (!actor) return;

  const parsed = counterSpgBatchCreateSchema.safeParse(req.body);
  if (!parsed.success) {
    return sendError(res, 400, "VALIDATION_ERROR", parsed.error.issues.map((x) => x.message).join(", "));
  }
  const input = parsed.data;

  // Verify employer exists and is corporate/majikan_spg
  const employer = await prisma.payerProfile.findFirst({
    where: {
      id: input.employerPayerId,
      payerType: { in: ["korporat", "majikan_spg"] },
      status: { not: "merged" },
    },
  });
  if (!employer) {
    return sendError(res, 404, "NOT_FOUND", "Corporate payer not found or not eligible for SPG");
  }

  // Normalize and validate rows
  const normalizedRows = input.rows.map((row, idx) => ({
    rowNo: idx + 1,
    employeeName: row.employeeName.trim(),
    employeeIdentityNo: normalizeIdentity(row.employeeIdentityNo),
    amount: row.amount,
  }));

  // Check for duplicates within the submitted rows
  const icCounts = new Map<string, number>();
  for (const row of normalizedRows) {
    const key = row.employeeIdentityNo;
    icCounts.set(key, (icCounts.get(key) || 0) + 1);
  }
  const inFileDupes = new Set<string>();
  for (const [key, count] of icCounts) {
    if (count > 1) inFileDupes.add(key);
  }

  // Check for duplicates against existing batches for same employer/month/year
  const existingLines = normalizedRows.length
    ? await prisma.spgPayrollLine.findMany({
        where: {
          employeeIdentityNo: { in: normalizedRows.map((r) => r.employeeIdentityNo) },
          batch: {
            employerPayerId: input.employerPayerId,
            month: input.month,
            year: input.year,
            status: { notIn: [SpgPayrollBatchStatus.cancelled, SpgPayrollBatchStatus.paid_failed] },
          },
        },
        select: { employeeIdentityNo: true },
      })
    : [];
  const existingSet = new Set(existingLines.map((x) => normalizeIdentity(x.employeeIdentityNo)));

  // Check against agreed deduction amounts from SpgEmployee records
  const agreedRecords = normalizedRows.length
    ? await prisma.spgEmployee.findMany({
        where: {
          employerPayerId: input.employerPayerId,
          employeeIdentityNo: { in: normalizedRows.map((r) => r.employeeIdentityNo) },
        },
        select: { employeeIdentityNo: true, deductionAmount: true },
      })
    : [];
  const agreedMap = new Map<string, number>();
  for (const emp of agreedRecords) {
    if (emp.deductionAmount != null) {
      agreedMap.set(normalizeIdentity(emp.employeeIdentityNo), Number(emp.deductionAmount));
    }
  }

  // Validate amounts against agreed amounts — hard error if mismatch
  const amountMismatches = normalizedRows
    .filter((r) => {
      const agreed = agreedMap.get(r.employeeIdentityNo);
      return agreed !== undefined && r.amount !== agreed;
    })
    .map((r) => ({
      employeeIdentityNo: r.employeeIdentityNo,
      employeeName: r.employeeName,
      submitted: r.amount,
      agreed: agreedMap.get(r.employeeIdentityNo)!,
    }));

  if (amountMismatches.length > 0) {
    const details = amountMismatches
      .map((m) => `${m.employeeName} (${m.employeeIdentityNo}): dihantar RM ${m.submitted.toFixed(2)}, perjanjian RM ${m.agreed.toFixed(2)}`)
      .join("; ");
    return sendError(res, 400, "VALIDATION_ERROR", `Amaun tidak sepadan dengan perjanjian: ${details}`);
  }

  const totalAmount = normalizedRows.reduce((sum, row) => sum + row.amount, 0);
  const paymentChannel = input.paymentChannel;

  const batch = await prisma.$transaction(async (tx) => {
    const created = await tx.spgPayrollBatch.create({
      data: {
        referenceNo: buildCounterSpgReferenceNo(),
        employerPayerId: input.employerPayerId,
        month: input.month,
        year: input.year,
        paymentChannel,
        status: SpgPayrollBatchStatus.pending_payment,
        currency: "MYR",
        totalAmount,
        rowCount: normalizedRows.length,
        submittedAt: new Date(),
      },
    });

    await tx.spgPayrollLine.createMany({
      data: normalizedRows.map((row) => ({
        batchId: created.id,
        employeeName: row.employeeName,
        employeeIdentityNo: row.employeeIdentityNo,
        amount: row.amount,
        isDuplicateInFile: inFileDupes.has(row.employeeIdentityNo),
        isDuplicateInMonthBatch: existingSet.has(row.employeeIdentityNo),
      })),
    });

    await tx.spgPayrollStatusHistory.create({
      data: {
        batchId: created.id,
        oldStatus: null,
        newStatus: SpgPayrollBatchStatus.pending_payment,
        changedBy: actor.id,
        reason: "Submitted via counter — waiting payment verification",
      },
    });

    return created;
  });

  await writeAuditLog({
    entityName: "spg_payroll_batch",
    entityId: String(batch.id),
    action: "CREATE",
    newValueJson: {
      referenceNo: batch.referenceNo,
      employerPayerId: batch.employerPayerId,
      rowCount: normalizedRows.length,
      totalAmount,
      paymentChannel: input.paymentChannel,
      collectionPoint: input.collectionPoint,
      source: "counter",
    },
    performedBy: actor.id,
    ipAddress: req.ip,
  });

  return sendOk(res, {
    batchId: batch.id,
    referenceNo: batch.referenceNo,
    totalAmount: Number(batch.totalAmount),
    rowCount: batch.rowCount,
    status: batch.status,
  });
});
