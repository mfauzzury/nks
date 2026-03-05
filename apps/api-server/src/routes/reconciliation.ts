import pkg from "@prisma/client";
const { BankStatementMatchStatus, CounterDepositStatus, CounterReconStatus, ReconciliationCaseStatus, ReconciliationCaseType } = pkg;
import { Router } from "express";
import multer from "multer";

import { prisma } from "../prisma.js";
import type { AuthedRequest } from "../types.js";
import { requireRole, writeAuditLog } from "../utils/payer.js";
import { sendError, sendOk } from "../utils/responses.js";
import {
  bankStatementUploadSchema,
  reconciliationCasesQuerySchema,
  reconciliationResolveSchema,
  reconciliationRunSchema,
} from "./schemas.js";

export const reconciliationRouter = Router();

const statementUpload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 8 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    const ok = file.mimetype === "text/csv" || file.originalname.toLowerCase().endsWith(".csv");
    if (!ok) {
      cb(new Error("Only CSV files are allowed"));
      return;
    }
    cb(null, true);
  },
});

function parseAmount(raw: string) {
  const cleaned = raw.replace(/[",\s]/g, "").trim();
  if (!cleaned) return null;
  const n = Number(cleaned);
  if (!Number.isFinite(n)) return null;
  return Math.round(n * 100) / 100;
}

function parseCsvLine(line: string) {
  const out: string[] = [];
  let current = "";
  let inQuotes = false;

  for (let i = 0; i < line.length; i += 1) {
    const ch = line[i];
    if (ch === '"') {
      if (inQuotes && line[i + 1] === '"') {
        current += '"';
        i += 1;
      } else {
        inQuotes = !inQuotes;
      }
      continue;
    }
    if (ch === "," && !inQuotes) {
      out.push(current.trim());
      current = "";
      continue;
    }
    current += ch;
  }
  out.push(current.trim());
  return out;
}

function dayDiff(a: Date, b: Date) {
  const one = Date.UTC(a.getFullYear(), a.getMonth(), a.getDate());
  const two = Date.UTC(b.getFullYear(), b.getMonth(), b.getDate());
  return Math.abs(Math.round((one - two) / (1000 * 60 * 60 * 24)));
}

reconciliationRouter.post("/statements/upload", statementUpload.single("file"), async (req: AuthedRequest, res) => {
  const actor = await requireRole(req.auth?.userId, ["penyelia", "eksekutif pemprosesan"], res);
  if (!actor) return;

  const file = req.file;
  if (!file) return sendError(res, 400, "VALIDATION_ERROR", "CSV file is required");

  const meta = bankStatementUploadSchema.parse({
    bankAccountNo: req.body?.bankAccountNo,
    statementDateFrom: req.body?.statementDateFrom,
    statementDateTo: req.body?.statementDateTo,
  });

  const csv = file.buffer.toString("utf-8").replace(/^\uFEFF/, "");
  const lines = csv.split(/\r?\n/).filter((x) => x.trim().length > 0);
  if (lines.length < 2) {
    return sendError(res, 400, "VALIDATION_ERROR", "CSV must include header and at least one data row");
  }

  const headers = parseCsvLine(lines[0]).map((h) => h.toLowerCase().replace(/\s+/g, ""));
  const idx = {
    txnDate: headers.findIndex((h) => ["txndate", "date", "transactiondate"].includes(h)),
    description: headers.findIndex((h) => ["description", "remarks", "details"].includes(h)),
    referenceNo: headers.findIndex((h) => ["referenceno", "reference", "ref", "refno"].includes(h)),
    debit: headers.findIndex((h) => h === "debit"),
    credit: headers.findIndex((h) => h === "credit"),
    amount: headers.findIndex((h) => ["amount", "netamount", "net"].includes(h)),
  };

  if (idx.txnDate < 0 || idx.description < 0) {
    return sendError(res, 400, "VALIDATION_ERROR", "CSV must include Date/TxnDate and Description columns");
  }

  const parsedRows: Array<{
    lineNo: number;
    txnDate: Date;
    description: string;
    referenceNo?: string;
    debit: number | null;
    credit: number | null;
    netAmount: number;
  }> = [];
  const errors: Array<{ lineNo: number; error: string }> = [];

  for (let i = 1; i < lines.length; i += 1) {
    const row = parseCsvLine(lines[i]);
    const lineNo = i + 1;
    const dateRaw = row[idx.txnDate] || "";
    const descRaw = row[idx.description] || "";
    const refRaw = idx.referenceNo >= 0 ? row[idx.referenceNo] : "";
    const txnDate = new Date(dateRaw);
    if (Number.isNaN(txnDate.getTime())) {
      errors.push({ lineNo, error: "Invalid transaction date" });
      continue;
    }
    if (!descRaw.trim()) {
      errors.push({ lineNo, error: "Description is required" });
      continue;
    }

    const debit = idx.debit >= 0 ? parseAmount(row[idx.debit] || "") : null;
    const credit = idx.credit >= 0 ? parseAmount(row[idx.credit] || "") : null;
    const directAmount = idx.amount >= 0 ? parseAmount(row[idx.amount] || "") : null;

    let netAmount = directAmount;
    if (netAmount === null) {
      const d = debit || 0;
      const c = credit || 0;
      netAmount = Math.round((c - d) * 100) / 100;
    }

    if (netAmount === null || !Number.isFinite(netAmount)) {
      errors.push({ lineNo, error: "Unable to derive amount from row" });
      continue;
    }

    parsedRows.push({
      lineNo,
      txnDate,
      description: descRaw.trim(),
      referenceNo: refRaw?.trim() || undefined,
      debit,
      credit,
      netAmount,
    });
  }

  const created = await prisma.$transaction(async (tx) => {
    const statement = await tx.bankStatementImport.create({
      data: {
        bankAccountNo: meta.bankAccountNo || null,
        statementDateFrom: meta.statementDateFrom ? new Date(meta.statementDateFrom) : null,
        statementDateTo: meta.statementDateTo ? new Date(meta.statementDateTo) : null,
        fileName: file.originalname,
        uploadedBy: actor.id,
      },
    });

    if (parsedRows.length > 0) {
      await tx.bankStatementLine.createMany({
        data: parsedRows.map((row) => ({
          importId: statement.id,
          lineNo: row.lineNo,
          txnDate: row.txnDate,
          description: row.description,
          referenceNo: row.referenceNo,
          debit: row.debit,
          credit: row.credit,
          netAmount: row.netAmount,
          matchStatus: BankStatementMatchStatus.unmatched,
        })),
      });
    }

    return statement;
  });

  await writeAuditLog({
    entityName: "bank_statement_import",
    entityId: String(created.id),
    action: "UPLOAD",
    newValueJson: {
      fileName: file.originalname,
      parsedRows: parsedRows.length,
      errors: errors.length,
    },
    performedBy: actor.id,
    ipAddress: req.ip,
  });

  return sendOk(res, {
    statementId: created.id,
    fileName: created.fileName,
    parsedCount: parsedRows.length,
    errorCount: errors.length,
    errors,
  });
});

reconciliationRouter.post("/run", async (req: AuthedRequest, res) => {
  const actor = await requireRole(req.auth?.userId, ["penyelia", "eksekutif pemprosesan"], res);
  if (!actor) return;

  const input = reconciliationRunSchema.parse(req.body);
  const statement = await prisma.bankStatementImport.findUnique({ where: { id: input.statementId } });
  if (!statement) return sendError(res, 404, "NOT_FOUND", "Statement not found");

  const lines = await prisma.bankStatementLine.findMany({
    where: {
      importId: statement.id,
      matchStatus: BankStatementMatchStatus.unmatched,
      netAmount: { gt: 0 },
    },
    orderBy: { txnDate: "asc" },
  });

  let matched = 0;
  let partial = 0;
  let unmatched = 0;

  for (const line of lines) {
    const candidates = await prisma.counterDepositBatch.findMany({
      where: {
        status: { in: [CounterDepositStatus.submitted, CounterDepositStatus.matched, CounterDepositStatus.variance] },
        systemAmount: line.netAmount,
      },
      orderBy: { depositDate: "asc" },
      include: {
        statementLines: {
          where: {
            matchStatus: { in: [BankStatementMatchStatus.auto_matched, BankStatementMatchStatus.manual_matched] },
          },
        },
      },
    });

    const filtered = candidates.filter((batch) => {
      const nearDate = dayDiff(batch.depositDate, line.txnDate) <= input.dayTolerance;
      const hasReferenceHint = !!line.referenceNo && batch.referenceNo.toLowerCase().includes(line.referenceNo.toLowerCase());
      return nearDate || hasReferenceHint;
    });

    if (filtered.length === 1) {
      const target = filtered[0];
      await prisma.$transaction(async (tx) => {
        await tx.bankStatementLine.update({
          where: { id: line.id },
          data: {
            matchedBatchId: target.id,
            matchStatus: BankStatementMatchStatus.auto_matched,
          },
        });
        await tx.counterDepositBatch.update({
          where: { id: target.id },
          data: {
            status: CounterDepositStatus.matched,
            bankInDate: line.txnDate,
            varianceAmount: 0,
          },
        });
      });
      matched += 1;
      continue;
    }

    if (filtered.length > 1) {
      const existing = await prisma.reconciliationCase.findFirst({
        where: {
          statementLineId: line.id,
          status: { in: [ReconciliationCaseStatus.open, ReconciliationCaseStatus.investigating] },
        },
      });
      if (!existing) {
        await prisma.reconciliationCase.create({
          data: {
            caseType: ReconciliationCaseType.unmatched_statement_line,
            status: ReconciliationCaseStatus.open,
            statementLineId: line.id,
            reason: "Multiple possible deposit batch matches",
            assignedTo: actor.id,
          },
        });
      }
      partial += 1;
      continue;
    }

    const existing = await prisma.reconciliationCase.findFirst({
      where: {
        statementLineId: line.id,
        status: { in: [ReconciliationCaseStatus.open, ReconciliationCaseStatus.investigating] },
      },
    });
    if (!existing) {
      await prisma.reconciliationCase.create({
        data: {
          caseType: ReconciliationCaseType.unmatched_statement_line,
          status: ReconciliationCaseStatus.open,
          statementLineId: line.id,
          reason: "No matching deposit batch found",
          assignedTo: actor.id,
        },
      });
    }
    unmatched += 1;
  }

  const unmatchedBatches = await prisma.counterDepositBatch.findMany({
    where: {
      status: CounterDepositStatus.submitted,
      statementLines: { none: { matchStatus: { in: [BankStatementMatchStatus.auto_matched, BankStatementMatchStatus.manual_matched] } } },
    },
    select: { id: true },
  });

  for (const batch of unmatchedBatches) {
    const existing = await prisma.reconciliationCase.findFirst({
      where: {
        batchId: batch.id,
        caseType: ReconciliationCaseType.unmatched_deposit_batch,
        status: { in: [ReconciliationCaseStatus.open, ReconciliationCaseStatus.investigating] },
      },
    });
    if (!existing) {
      await prisma.reconciliationCase.create({
        data: {
          caseType: ReconciliationCaseType.unmatched_deposit_batch,
          status: ReconciliationCaseStatus.open,
          batchId: batch.id,
          reason: "Deposit batch not found in bank statement",
          assignedTo: actor.id,
        },
      });
    }
  }

  await writeAuditLog({
    entityName: "reconciliation_run",
    entityId: String(statement.id),
    action: "RUN",
    newValueJson: { matched, partial, unmatched },
    performedBy: actor.id,
    ipAddress: req.ip,
  });

  return sendOk(res, { matched, partial, unmatched });
});

reconciliationRouter.get("/cases", async (req: AuthedRequest, res) => {
  const actor = await requireRole(req.auth?.userId, ["penyelia", "eksekutif pemprosesan"], res);
  if (!actor) return;

  const query = reconciliationCasesQuerySchema.parse(req.query);
  const where = {
    ...(query.status ? { status: query.status } : {}),
  };

  const [rows, total] = await Promise.all([
    prisma.reconciliationCase.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (query.page - 1) * query.limit,
      take: query.limit,
      include: {
        batch: { select: { id: true, referenceNo: true, depositType: true, status: true, systemAmount: true } },
        statementLine: { select: { id: true, lineNo: true, txnDate: true, description: true, referenceNo: true, netAmount: true, matchStatus: true } },
        assignedToUser: { select: { id: true, name: true, role: true } },
        resolvedByUser: { select: { id: true, name: true, role: true } },
      },
    }),
    prisma.reconciliationCase.count({ where }),
  ]);

  return sendOk(
    res,
    rows.map((row) => ({
      ...row,
      differenceAmount: row.differenceAmount == null ? null : Number(row.differenceAmount),
      batch: row.batch
        ? {
            ...row.batch,
            systemAmount: Number(row.batch.systemAmount),
          }
        : null,
      statementLine: row.statementLine
        ? {
            ...row.statementLine,
            netAmount: Number(row.statementLine.netAmount),
          }
        : null,
    })),
    { page: query.page, limit: query.limit, total },
  );
});

reconciliationRouter.post("/cases/:id/resolve", async (req: AuthedRequest, res) => {
  const actor = await requireRole(req.auth?.userId, ["penyelia", "eksekutif pemprosesan"], res);
  if (!actor) return;

  const id = Number(req.params.id);
  if (!Number.isFinite(id)) return sendError(res, 400, "VALIDATION_ERROR", "Invalid case id");
  const input = reconciliationResolveSchema.parse(req.body);

  const existing = await prisma.reconciliationCase.findUnique({ where: { id }, include: { statementLine: true } });
  if (!existing) return sendError(res, 404, "NOT_FOUND", "Reconciliation case not found");

  if (input.action === "map_batch") {
    if (!input.batchId) {
      return sendError(res, 400, "VALIDATION_ERROR", "batchId is required for map_batch");
    }
    const batch = await prisma.counterDepositBatch.findUnique({ where: { id: input.batchId } });
    if (!batch) return sendError(res, 404, "NOT_FOUND", "Batch not found");

    await prisma.$transaction(async (tx) => {
      if (existing.statementLineId) {
        await tx.bankStatementLine.update({
          where: { id: existing.statementLineId },
          data: {
            matchedBatchId: batch.id,
            matchStatus: BankStatementMatchStatus.manual_matched,
          },
        });
      }
      await tx.counterDepositBatch.update({
        where: { id: batch.id },
        data: {
          status: CounterDepositStatus.matched,
          varianceAmount: 0,
        },
      });
      await tx.reconciliationCase.update({
        where: { id },
        data: {
          batchId: batch.id,
          status: ReconciliationCaseStatus.resolved,
          reason: input.reason || "Manually mapped to deposit batch",
          resolvedBy: actor.id,
          resolvedAt: new Date(),
        },
      });
      await tx.counterStatusHistory.create({
        data: {
          entityType: "reconciliation_case",
          entityId: id,
          oldStatus: existing.status,
          newStatus: ReconciliationCaseStatus.resolved,
          changedBy: actor.id,
          reason: input.reason || "Case resolved by manual mapping",
          reconciliationCaseId: id,
        },
      });
    });
  } else {
    const caseType = input.action === "mark_bank_fee"
      ? ReconciliationCaseType.bank_fee
      : input.action === "mark_reversal"
        ? ReconciliationCaseType.reversal
        : existing.caseType;

    await prisma.$transaction(async (tx) => {
      if (existing.statementLineId) {
        await tx.bankStatementLine.update({
          where: { id: existing.statementLineId },
          data: {
            matchStatus: BankStatementMatchStatus.ignored,
          },
        });
      }
      await tx.reconciliationCase.update({
        where: { id },
        data: {
          caseType,
          status: ReconciliationCaseStatus.resolved,
          reason: input.reason || "Case resolved",
          resolvedBy: actor.id,
          resolvedAt: new Date(),
        },
      });
      await tx.counterStatusHistory.create({
        data: {
          entityType: "reconciliation_case",
          entityId: id,
          oldStatus: existing.status,
          newStatus: ReconciliationCaseStatus.resolved,
          changedBy: actor.id,
          reason: input.reason || "Case resolved",
          reconciliationCaseId: id,
        },
      });
    });
  }

  await writeAuditLog({
    entityName: "reconciliation_case",
    entityId: String(id),
    action: "RESOLVE",
    newValueJson: input,
    performedBy: actor.id,
    ipAddress: req.ip,
  });

  return sendOk(res, { caseId: id, status: ReconciliationCaseStatus.resolved });
});

reconciliationRouter.post("/deposits/:id/confirm", async (req: AuthedRequest, res) => {
  const actor = await requireRole(req.auth?.userId, ["penyelia"], res);
  if (!actor) return;

  const id = Number(req.params.id);
  if (!Number.isFinite(id)) return sendError(res, 400, "VALIDATION_ERROR", "Invalid deposit id");

  const batch = await prisma.counterDepositBatch.findUnique({
    where: { id },
    include: {
      statementLines: {
        where: { matchStatus: { in: [BankStatementMatchStatus.auto_matched, BankStatementMatchStatus.manual_matched] } },
      },
      guestPayments: true,
    },
  });
  if (!batch) return sendError(res, 404, "NOT_FOUND", "Deposit batch not found");

  const matchedTotal = batch.statementLines.reduce((sum, line) => sum + Number(line.netAmount), 0);
  const systemAmount = Number(batch.systemAmount);
  const variance = Math.round((systemAmount - matchedTotal) * 100) / 100;
  if (variance !== 0) {
    return sendError(res, 400, "VALIDATION_ERROR", "Batch cannot be confirmed because matched amount does not equal system amount");
  }

  await prisma.$transaction(async (tx) => {
    await tx.counterDepositBatch.update({
      where: { id },
      data: {
        status: CounterDepositStatus.reconciled,
        approvedBy: actor.id,
        approvedAt: new Date(),
        varianceAmount: 0,
      },
    });

    await tx.guestPayment.updateMany({
      where: { id: { in: batch.guestPayments.map((x) => x.id) } },
      data: { reconStatus: CounterReconStatus.reconciled },
    });

    await tx.reconciliationCase.updateMany({
      where: {
        batchId: id,
        status: { in: [ReconciliationCaseStatus.open, ReconciliationCaseStatus.investigating] },
      },
      data: {
        status: ReconciliationCaseStatus.resolved,
        reason: "Auto-closed after deposit confirmed",
        resolvedBy: actor.id,
        resolvedAt: new Date(),
      },
    });

    await tx.counterStatusHistory.create({
      data: {
        entityType: "counter_deposit_batch",
        entityId: id,
        oldStatus: batch.status,
        newStatus: CounterDepositStatus.reconciled,
        changedBy: actor.id,
        reason: "Deposit reconciliation confirmed",
        batchId: id,
      },
    });
  });

  await writeAuditLog({
    entityName: "counter_deposit",
    entityId: String(id),
    action: "CONFIRM_RECONCILIATION",
    oldValueJson: { status: batch.status },
    newValueJson: { status: CounterDepositStatus.reconciled },
    performedBy: actor.id,
    ipAddress: req.ip,
  });

  return sendOk(res, { depositBatchId: id, status: CounterDepositStatus.reconciled });
});
