import fs from "node:fs";
import path from "node:path";

import { CounterDepositStatus, CounterDepositType, CounterPaymentChannel, CounterReconStatus, GuestPaymentSource, ReconciliationCaseStatus } from "@prisma/client";
import { Router } from "express";
import multer from "multer";

import { env } from "../config/env.js";
import { prisma } from "../prisma.js";
import type { AuthedRequest } from "../types.js";
import { requireRole, writeAuditLog } from "../utils/payer.js";
import { sendError, sendOk } from "../utils/responses.js";
import { counterDepositCreateSchema, counterDepositsQuerySchema, counterPaymentCreateSchema, counterPaymentsQuerySchema } from "./schemas.js";

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
  const rand = Math.floor(Math.random() * 9000) + 1000;
  return `KRCPT-${Date.now()}-${rand}`;
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

function isCounterOnly(role: string) {
  return role.trim().toLowerCase() === "counter";
}

counterRouter.post("/payments", async (req: AuthedRequest, res) => {
  const actor = await requireRole(req.auth?.userId, ["counter", "penyelia", "eksekutif pemprosesan"], res);
  if (!actor) return;

  const input = counterPaymentCreateSchema.parse(req.body);
  const paymentMethod = `${input.paymentChannel === "COUNTER_CASH" ? "Counter Cash" : "Card Terminal"} | ${input.zakatType}`;

  const row = await prisma.guestPayment.create({
    data: {
      receiptNo: buildCounterReceiptNo(),
      guestName: input.guestName,
      identityNo: normalizeIdentity(input.identityNo),
      email: input.email,
      amount: input.amount,
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

  await writeAuditLog({
    entityName: "counter_payment",
    entityId: String(row.id),
    action: "CREATE",
    newValueJson: {
      receiptNo: row.receiptNo,
      amount: input.amount,
      paymentChannel: input.paymentChannel,
      collectionPoint: input.collectionPoint,
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
      },
    }),
    prisma.guestPayment.count({ where }),
  ]);

  return sendOk(
    res,
    rows.map((row) => ({
      ...row,
      amount: Number(row.amount),
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
        depositType: input.depositType as CounterDepositType,
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
      })
    : [];

  return sendOk(res, {
    ...batch,
    declaredAmount: Number(batch.declaredAmount),
    systemAmount: Number(batch.systemAmount),
    varianceAmount: Number(batch.varianceAmount),
    payments: payments.map((p) => ({ ...p, amount: Number(p.amount) })),
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
