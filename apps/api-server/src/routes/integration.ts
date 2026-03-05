import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";

import pkg from "@prisma/client";
const { IntegrationFileType } = pkg;
import { Router } from "express";
import multer from "multer";

import { env } from "../config/env.js";
import { prisma } from "../prisma.js";
import { analyzeFileWithAI } from "../services/ai-file-parser.js";
import { processIntegrationFile } from "../services/integration-processor.js";
import { getAISuggestionsForUnmatched } from "../services/ai-reconciliation-assist.js";
import { runReconciliation } from "../services/reconciliation-service.js";
import type { AuthedRequest } from "../types.js";
import { sendError, sendOk } from "../utils/responses.js";

const integrationUploadDir = path.join(env.uploadDir, "integration");
fs.mkdirSync(integrationUploadDir, { recursive: true });

const allowedExtensions = new Set([".txt", ".enc", ".gpg", ".csv", ".xlsx", ".xls"]);
const maxIntegrationFileBytes = 50 * 1024 * 1024; // 50MB

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, integrationUploadDir),
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const safeBase = file.originalname
      .toLowerCase()
      .replace(/[^a-z0-9.\-_]/g, "-")
      .replace(/-+/g, "-");
    const name = path.basename(safeBase, ext) || "file";
    cb(null, `integration-${Date.now()}-${name}${ext}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: maxIntegrationFileBytes },
  fileFilter: (_req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    if (!allowedExtensions.has(ext)) {
      cb(new Error("Unsupported file type. Allowed: .txt, .enc, .gpg, .csv, .xlsx, .xls"));
      return;
    }
    cb(null, true);
  },
});

export const integrationRouter = Router();

function sha256Buffer(buffer: Buffer): string {
  return crypto.createHash("sha256").update(buffer).digest("hex");
}

integrationRouter.post("/files/analyze", upload.single("file"), async (req: AuthedRequest, res) => {
  const file = req.file;
  if (!file) {
    return sendError(res, 400, "FILE_REQUIRED", "No file uploaded");
  }

  try {
    const result = await analyzeFileWithAI(file.path, file.originalname);
    return sendOk(res, result);
  } catch (e) {
    const msg = e instanceof Error ? e.message : "AI analysis failed";
    return sendError(res, 500, "AI_ANALYSIS_FAILED", msg);
  } finally {
    try {
      fs.unlinkSync(file.path);
    } catch {
      /* ignore */
    }
  }
});

integrationRouter.get("/sources", async (_req, res) => {
  const sources = await prisma.integrationSource.findMany({
    where: { isActive: true },
    include: { category: true },
    orderBy: { code: "asc" },
  });
  return sendOk(res, sources);
});

integrationRouter.post("/files/upload", upload.single("file"), async (req: AuthedRequest, res) => {
  const file = req.file;
  if (!file) {
    return sendError(res, 400, "FILE_REQUIRED", "No file uploaded");
  }

  const sourceCode = String(req.body?.source ?? "").trim();
  const fileTypeRaw = String(req.body?.fileType ?? "").trim();
  const description = String(req.body?.description ?? "").trim() || null;

  if (!sourceCode) {
    try { fs.unlinkSync(file.path); } catch { /* ignore */ }
    return sendError(res, 400, "SOURCE_REQUIRED", "Source is required");
  }

  const source = await prisma.integrationSource.findUnique({
    where: { code: sourceCode, isActive: true },
  });
  if (!source) {
    try { fs.unlinkSync(file.path); } catch { /* ignore */ }
    return sendError(res, 400, "INVALID_SOURCE", `Unknown source: ${sourceCode}`);
  }

  const validFileTypes = ["ENCRYPTED_TXT", "TXT", "CSV", "EXCEL"];
  const fileType = validFileTypes.includes(fileTypeRaw) ? (fileTypeRaw as IntegrationFileType) : IntegrationFileType.ENCRYPTED_TXT;

  const columnMappingJson = String(req.body?.columnMappingJson ?? "").trim() || null;
  const aiDetectedSource = String(req.body?.aiDetectedSource ?? "").trim() || null;
  const aiConfidenceRaw = req.body?.aiConfidence;
  const aiConfidence = typeof aiConfidenceRaw === "number" ? aiConfidenceRaw : (typeof aiConfidenceRaw === "string" ? parseFloat(aiConfidenceRaw) : null);

  const fileBuffer = fs.readFileSync(file.path);
  const fileHashSha256 = sha256Buffer(fileBuffer);

  const existing = await prisma.integrationFile.findUnique({
    where: { fileHashSha256 },
  });
  if (existing) {
    try { fs.unlinkSync(file.path); } catch { /* ignore */ }
    return sendError(res, 409, "DUPLICATE_FILE", "File with same content already uploaded (duplicate)");
  }

  const record = await prisma.integrationFile.create({
    data: {
      sourceId: source.id,
      fileName: file.originalname,
      filePath: file.path,
      fileHashSha256,
      receivedChannel: "MANUAL",
      fileType,
      description,
      encrypted: fileType === "ENCRYPTED_TXT",
      decryptStatus: "PENDING",
      validationStatus: "PENDING",
      processingStatus: "PENDING",
      columnMappingJson,
      aiDetectedSource,
      aiConfidence: aiConfidence != null && !Number.isNaN(aiConfidence) ? aiConfidence : null,
    },
    include: {
      source: { include: { category: true } },
    },
  });

  await prisma.integrationFileEvent.create({
    data: {
      fileId: record.id,
      eventType: "RECEIVED",
      eventStatus: "SUCCESS",
      eventMessage: `Manual upload: ${file.originalname}`,
      createdBy: req.auth?.name ?? "SYSTEM",
    },
  });

  return sendOk(res, record);
});

integrationRouter.get("/files", async (req, res) => {
  const limit = Math.min(Number(req.query?.limit) || 50, 100);
  const offset = Number(req.query?.offset) || 0;
  const sourceCode = String(req.query?.source ?? "").trim();

  const where = sourceCode ? { source: { code: sourceCode } } : {};

  const [files, total] = await Promise.all([
    prisma.integrationFile.findMany({
      where,
      include: { source: { include: { category: true } } },
      orderBy: { receivedAt: "desc" },
      take: limit,
      skip: offset,
    }),
    prisma.integrationFile.count({ where }),
  ]);

  return sendOk(res, files, { total, limit, offset });
});

integrationRouter.delete("/files/:id", async (req: AuthedRequest, res) => {
  const fileId = Number(req.params.id);
  if (!Number.isInteger(fileId) || fileId < 1) {
    return sendError(res, 400, "INVALID_ID", "Invalid file ID");
  }

  const file = await prisma.integrationFile.findUnique({ where: { id: fileId } });
  if (!file) {
    return sendError(res, 404, "NOT_FOUND", "File not found");
  }

  if (!["PENDING", "FAILED"].includes(file.processingStatus)) {
    return sendError(res, 400, "CANNOT_DELETE", "Only PENDING or FAILED files can be removed. Successfully processed files cannot be deleted.");
  }

  if (file.filePath && fs.existsSync(file.filePath)) {
    try {
      fs.unlinkSync(file.filePath);
    } catch {
      /* continue - delete DB record anyway */
    }
  }

  await prisma.integrationFile.delete({ where: { id: fileId } });
  return sendOk(res, { deleted: true });
});

integrationRouter.get("/files/:id/staging", async (req, res) => {
  const fileId = Number(req.params.id);
  if (!Number.isInteger(fileId) || fileId < 1) {
    return sendError(res, 400, "INVALID_ID", "Invalid file ID");
  }

  const file = await prisma.integrationFile.findUnique({
    where: { id: fileId },
    include: { source: { include: { category: true } } },
  });
  if (!file) {
    return sendError(res, 404, "NOT_FOUND", "File not found");
  }

  const limit = Math.min(Number(req.query?.limit) || 100, 500);
  const offset = Number(req.query?.offset) || 0;

  const [rows, total] = await Promise.all([
    prisma.integrationStagingTx.findMany({
      where: { fileId },
      orderBy: { id: "asc" },
      take: limit,
      skip: offset,
      select: {
        id: true,
        payerIc: true,
        payerName: true,
        txDate: true,
        txTime: true,
        amount: true,
        sourceTxRef: true,
        channel: true,
        stagingStatus: true,
      },
    }),
    prisma.integrationStagingTx.count({ where: { fileId } }),
  ]);

  return sendOk(res, { file, data: rows, meta: { total, limit, offset } });
});

integrationRouter.post("/files/:id/process", async (req: AuthedRequest, res) => {
  const fileId = Number(req.params.id);
  if (!Number.isInteger(fileId) || fileId < 1) {
    return sendError(res, 400, "INVALID_ID", "Invalid file ID");
  }

  const createdBy = req.auth?.name ?? "SYSTEM";

  try {
    const result = await processIntegrationFile(fileId, createdBy);
    if (!result.success) {
      return sendError(res, 400, "PROCESS_FAILED", result.error ?? "Processing failed");
    }
    const updated = await prisma.integrationFile.findUnique({
      where: { id: fileId },
      include: { source: { include: { category: true } } },
    });
    return sendOk(res, { ...result, file: updated });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Processing failed";
    return sendError(res, 500, "PROCESS_ERROR", msg);
  }
});

// -----------------------------------------------------------------------------
// Reconciliation
// -----------------------------------------------------------------------------

integrationRouter.get("/reconciliation/runs", async (req, res) => {
  const limit = Math.min(Number(req.query?.limit) || 50, 100);
  const offset = Number(req.query?.offset) || 0;
  const search = String(req.query?.search ?? "").trim().toLowerCase();

  // Only show successfully processed files (ready for reconciliation)
  const filesWhere: { processingStatus: "SUCCESS"; OR?: Array<{ fileName?: { contains: string }; id?: number }> } = {
    processingStatus: "SUCCESS",
  };
  if (search) {
    const conditions: Array<{ fileName?: { contains: string }; id?: number }> = [{ fileName: { contains: search } }];
    const num = Number(search);
    if (!Number.isNaN(num) && num > 0) conditions.push({ id: num });
    filesWhere.OR = conditions;
  }

  const files = await prisma.integrationFile.findMany({
    where: filesWhere,
    include: {
      source: { include: { category: true } },
      stagingTxs: {
        include: {
          reconResults: { take: 1, orderBy: { id: "desc" } },
        },
      },
    },
    orderBy: { receivedAt: "desc" },
    take: limit,
    skip: offset,
  });

  const runs = await Promise.all(
    files.map(async (f) => {
      const stagingIds = f.stagingTxs.map((s) => s.id);
      const [matched, unmatched, mismatch, duplicate] = await Promise.all([
        prisma.reconciliationResult.count({ where: { stagingTxId: { in: stagingIds }, matchStatus: "MATCHED" } }),
        prisma.reconciliationResult.count({ where: { stagingTxId: { in: stagingIds }, matchStatus: "UNMATCHED" } }),
        prisma.reconciliationResult.count({ where: { stagingTxId: { in: stagingIds }, matchStatus: "MISMATCH" } }),
        prisma.reconciliationResult.count({ where: { stagingTxId: { in: stagingIds }, matchStatus: "DUPLICATE" } }),
      ]);
      const totalRecon = matched + unmatched + mismatch + duplicate;
      const totalStaging = stagingIds.length;
      const hasRecon = totalRecon > 0;
      return {
        runId: `F-${f.id}`,
        fileId: f.id,
        fileName: f.fileName,
        date: f.receivedAt,
        source: f.source?.code ?? null,
        totalStaging,
        matched,
        unmatched,
        mismatch,
        duplicate,
        status: hasRecon ? "COMPLETED" : "PENDING",
      };
    }),
  );

  const total = await prisma.integrationFile.count({ where: filesWhere });
  return sendOk(res, runs, { total, limit, offset });
});

integrationRouter.get("/reconciliation/runs/:fileId/results", async (req, res) => {
  const fileId = Number(req.params.fileId);
  if (!Number.isInteger(fileId) || fileId < 1) {
    return sendError(res, 400, "INVALID_ID", "Invalid file ID");
  }

  const file = await prisma.integrationFile.findUnique({
    where: { id: fileId },
    include: { source: true },
  });
  if (!file) {
    return sendError(res, 404, "NOT_FOUND", "File not found");
  }

  const results = await prisma.reconciliationResult.findMany({
    where: { stagingTx: { fileId } },
    include: {
      stagingTx: true,
      actions: { orderBy: { actedAt: "desc" } },
      matchLinks: true,
    },
    orderBy: { id: "asc" },
  });

  return sendOk(res, results);
});

integrationRouter.get("/reconciliation/runs/:fileId", async (req, res) => {
  const fileId = Number(req.params.fileId);
  if (!Number.isInteger(fileId) || fileId < 1) {
    return sendError(res, 400, "INVALID_ID", "Invalid file ID");
  }

  const file = await prisma.integrationFile.findUnique({
    where: { id: fileId, processingStatus: "SUCCESS" },
    include: { source: { include: { category: true } } },
  });
  if (!file) {
    return sendError(res, 404, "NOT_FOUND", "File not found");
  }

  const stagingIds = (await prisma.integrationStagingTx.findMany({ where: { fileId }, select: { id: true } })).map((s) => s.id);
  const [matched, unmatched, mismatch, duplicate] = await Promise.all([
    prisma.reconciliationResult.count({ where: { stagingTxId: { in: stagingIds }, matchStatus: "MATCHED" } }),
    prisma.reconciliationResult.count({ where: { stagingTxId: { in: stagingIds }, matchStatus: "UNMATCHED" } }),
    prisma.reconciliationResult.count({ where: { stagingTxId: { in: stagingIds }, matchStatus: "MISMATCH" } }),
    prisma.reconciliationResult.count({ where: { stagingTxId: { in: stagingIds }, matchStatus: "DUPLICATE" } }),
  ]);
  const hasRecon = matched + unmatched + mismatch + duplicate > 0;

  return sendOk(res, {
    runId: `F-${file.id}`,
    fileId: file.id,
    fileName: file.fileName,
    date: file.receivedAt,
    source: file.source?.code ?? null,
    totalStaging: stagingIds.length,
    matched,
    unmatched,
    mismatch,
    duplicate,
    status: hasRecon ? "COMPLETED" : "PENDING",
  });
});

integrationRouter.post("/reconciliation/run/:fileId", async (req: AuthedRequest, res) => {
  const fileId = Number(req.params.fileId);
  if (!Number.isInteger(fileId) || fileId < 1) {
    return sendError(res, 400, "INVALID_ID", "Invalid file ID");
  }

  const createdBy = req.auth?.name ?? "SYSTEM";
  const rerun = req.body?.rerun === true;

  try {
    const result = await runReconciliation(fileId, createdBy, { rerun });
    if (!result.success) {
      return sendError(res, 400, "RECONCILIATION_FAILED", result.error ?? "Reconciliation failed");
    }
    return sendOk(res, result);
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Reconciliation failed";
    return sendError(res, 500, "RECONCILIATION_ERROR", msg);
  }
});

integrationRouter.post("/reconciliation/runs/:fileId/ai-assist", async (req: AuthedRequest, res) => {
  const fileId = Number(req.params.fileId);
  if (!Number.isInteger(fileId) || fileId < 1) {
    return sendError(res, 400, "INVALID_ID", "Invalid file ID");
  }

  const limit = Math.min(Number(req.body?.limit) || 50, 100);

  try {
    const result = await getAISuggestionsForUnmatched(fileId, limit);
    if (!result.success || result.error) {
      return sendError(res, 500, "AI_ASSIST_FAILED", result.error ?? "AI Assist failed");
    }
    return sendOk(res, result.data);
  } catch (e) {
    const msg = e instanceof Error ? e.message : "AI Assist failed";
    return sendError(res, 500, "AI_ASSIST_ERROR", msg);
  }
});

// Search internal records for Manual Match (GuestPayment or BankStatement by file source)
integrationRouter.get("/reconciliation/search-internal", async (req: AuthedRequest, res) => {
  const q = String(req.query?.q ?? "").trim();
  const fileId = Number(req.query?.fileId ?? 0);

  if (!Number.isInteger(fileId) || fileId < 1) {
    return sendError(res, 400, "INVALID_FILE_ID", "fileId is required");
  }

  const file = await prisma.integrationFile.findUnique({
    where: { id: fileId },
    include: { source: { include: { category: true } } },
  });
  if (!file) {
    return sendError(res, 404, "FILE_NOT_FOUND", "File not found");
  }

  const categoryCode = file.source?.category?.code ?? null;
  const useBankStatement = categoryCode === "SPG" || categoryCode === "BANK";
  const useGuestPayment = categoryCode === "PSP" || !useBankStatement;

  const results: Array<{
    internalTxId: string;
    reference: string;
    name: string;
    amount: number;
    date: string;
    linkedInfo: { linkedCount: number; linkedTotalAmount: number; remainingAmount: number };
  }> = [];

  if (useGuestPayment && q.length >= 2) {
    const where: object[] = [
      { receiptNo: { contains: q } },
      { guestName: { contains: q } },
      { identityNo: { contains: q.replace(/\D/g, "") } },
    ];
    const payments = await prisma.guestPayment.findMany({
      where: { status: "success", OR: where },
      orderBy: { paidAt: "desc" },
      take: 20,
      select: { id: true, receiptNo: true, guestName: true, amount: true, paidAt: true },
    });
    for (const p of payments) {
      const internalTxId = `GuestPayment-${p.id}`;
      const linked = await prisma.reconciliationResult.findMany({
        where: { internalTxId, matchStatus: "MATCHED" },
        include: { stagingTx: { select: { amount: true } } },
      });
      const linkedTotal = linked.reduce((s, r) => s + Number(r.stagingTx.amount), 0);
      const internalAmount = Number(p.amount);
      results.push({
        internalTxId,
        reference: p.receiptNo,
        name: p.guestName,
        amount: internalAmount,
        date: p.paidAt.toISOString().slice(0, 10),
        linkedInfo: {
          linkedCount: linked.length,
          linkedTotalAmount: linkedTotal,
          remainingAmount: Math.max(0, internalAmount - linkedTotal),
        },
      });
    }
  }

  if (useBankStatement && q.length >= 2) {
    const where: object[] = [
      { paymentReference: { contains: q } },
      { counterparty: { contains: q } },
      { description: { contains: q } },
    ];
    const txs = await prisma.bankStatementTransaction.findMany({
      where: { OR: where },
      orderBy: { valueDate: "desc" },
      take: 20,
      select: { id: true, paymentReference: true, counterparty: true, amount: true, valueDate: true },
    });
    for (const t of txs) {
      const internalTxId = `BankStatementTransaction-${t.id}`;
      const linked = await prisma.reconciliationResult.findMany({
        where: { internalTxId, matchStatus: "MATCHED" },
        include: { stagingTx: { select: { amount: true } } },
      });
      const linkedTotal = linked.reduce((s, r) => s + Number(r.stagingTx.amount), 0);
      const internalAmount = Number(t.amount);
      results.push({
        internalTxId,
        reference: t.paymentReference ?? t.counterparty ?? "—",
        name: t.counterparty ?? "—",
        amount: internalAmount,
        date: t.valueDate.toISOString().slice(0, 10),
        linkedInfo: {
          linkedCount: linked.length,
          linkedTotalAmount: linkedTotal,
          remainingAmount: Math.max(0, internalAmount - linkedTotal),
        },
      });
    }
  }

  return sendOk(res, { data: results });
});

const AMOUNT_TOLERANCE = 0.02; // 2% for many-to-one validation

integrationRouter.post("/reconciliation/apply-match", async (req: AuthedRequest, res) => {
  const reconResultId = Number(req.body?.reconResultId);
  const internalTxId = String(req.body?.internalTxId ?? "").trim();
  const source = String(req.body?.source ?? "manual").toLowerCase();

  if (!Number.isInteger(reconResultId) || reconResultId < 1) {
    return sendError(res, 400, "INVALID_RECON_ID", "Invalid reconciliation result ID");
  }
  const isGuestPayment = internalTxId.startsWith("GuestPayment-");
  const isBankStatement = internalTxId.startsWith("BankStatementTransaction-");
  if (!internalTxId || (!isGuestPayment && !isBankStatement)) {
    return sendError(res, 400, "INVALID_INTERNAL_TX", "Valid internal transaction ID required (GuestPayment-{id} or BankStatementTransaction-{id})");
  }

  const actedBy = req.auth?.name ?? "SYSTEM";

  const recon = await prisma.reconciliationResult.findUnique({
    where: { id: reconResultId },
    include: { stagingTx: true },
  });
  if (!recon) {
    return sendError(res, 404, "NOT_FOUND", "Reconciliation result not found");
  }
  if (recon.matchStatus !== "UNMATCHED") {
    return sendError(res, 400, "ALREADY_MATCHED", "This item is already matched");
  }

  const currentAmount = Number(recon.stagingTx.amount);

  // Resolve internal record and its total amount (Phase 1: many-to-one validation)
  let internalAmount: number;
  if (isGuestPayment) {
    const id = parseInt(internalTxId.replace("GuestPayment-", ""), 10);
    if (!Number.isInteger(id) || id < 1) {
      return sendError(res, 400, "INVALID_INTERNAL_TX", "Invalid GuestPayment ID");
    }
    const gp = await prisma.guestPayment.findUnique({ where: { id }, select: { amount: true, status: true } });
    if (!gp || gp.status !== "success") {
      return sendError(res, 404, "INTERNAL_NOT_FOUND", "GuestPayment not found or not successful");
    }
    internalAmount = Number(gp.amount);
  } else {
    const id = parseInt(internalTxId.replace("BankStatementTransaction-", ""), 10);
    if (!Number.isInteger(id) || id < 1) {
      return sendError(res, 400, "INVALID_INTERNAL_TX", "Invalid BankStatementTransaction ID");
    }
    const bst = await prisma.bankStatementTransaction.findUnique({ where: { id }, select: { amount: true } });
    if (!bst) {
      return sendError(res, 404, "INTERNAL_NOT_FOUND", "BankStatementTransaction not found");
    }
    internalAmount = Number(bst.amount);
  }

  // Sum of staging amounts already linked to this internalTxId (many-to-one)
  const alreadyLinked = await prisma.reconciliationResult.findMany({
    where: { internalTxId, matchStatus: "MATCHED", id: { not: reconResultId } },
    include: { stagingTx: { select: { amount: true } } },
  });
  const linkedTotal = alreadyLinked.reduce((sum, r) => sum + Number(r.stagingTx.amount), 0);
  const newTotal = linkedTotal + currentAmount;
  const maxAllowed = internalAmount * (1 + AMOUNT_TOLERANCE);
  if (newTotal > maxAllowed) {
    return sendError(
      res,
      400,
      "INSUFFICIENT_REMAINING_AMOUNT",
      `Internal record amount RM ${internalAmount.toFixed(2)}. Already linked: RM ${linkedTotal.toFixed(2)}. Current RM ${currentAmount.toFixed(2)} exceeds remaining.`,
    );
  }

  const isAiAssist = source === "ai_assist";
  const matchRule = isAiAssist ? "AI_ASSIST" : "MANUAL_MATCH";
  const actionType = isAiAssist ? "AI_ASSIST_MATCH" : "MANUAL_MATCH";
  const actionNote =
    alreadyLinked.length > 0
      ? `Matched to ${internalTxId} (many-to-one: ${alreadyLinked.length + 1} staging txs)`
      : `Matched to ${internalTxId}`;

  await prisma.$transaction([
    prisma.reconciliationResult.update({
      where: { id: reconResultId },
      data: {
        internalTxId,
        matchStatus: "MATCHED",
        matchRule,
        confidenceScore: 90,
      },
    }),
    prisma.reconciliationAction.create({
      data: {
        reconId: reconResultId,
        actionType,
        actionNote,
        actedBy,
      },
    }),
  ]);

  return sendOk(res, { success: true, reconResultId, internalTxId });
});

// Batch many-to-one: link multiple staging txs to one internal record
integrationRouter.post("/reconciliation/apply-match-batch", async (req: AuthedRequest, res) => {
  const reconResultIds = Array.isArray(req.body?.reconResultIds) ? req.body.reconResultIds : [];
  const internalTxId = String(req.body?.internalTxId ?? "").trim();

  const ids = reconResultIds.map((x: unknown) => Number(x)).filter((n: number) => Number.isInteger(n) && n > 0);
  if (ids.length === 0) {
    return sendError(res, 400, "INVALID_IDS", "At least one reconResultId required");
  }

  const isGuestPayment = internalTxId.startsWith("GuestPayment-");
  const isBankStatement = internalTxId.startsWith("BankStatementTransaction-");
  if (!internalTxId || (!isGuestPayment && !isBankStatement)) {
    return sendError(res, 400, "INVALID_INTERNAL_TX", "Valid internal transaction ID required");
  }

  const actedBy = req.auth?.name ?? "SYSTEM";

  const recons = await prisma.reconciliationResult.findMany({
    where: { id: { in: ids } },
    include: { stagingTx: true },
  });
  if (recons.length !== ids.length) {
    return sendError(res, 404, "NOT_FOUND", "Some reconciliation results not found");
  }
  const unmatched = recons.filter((r) => r.matchStatus === "UNMATCHED");
  if (unmatched.length === 0) {
    return sendError(res, 400, "ALREADY_MATCHED", "All selected items are already matched");
  }

  const batchTotal = unmatched.reduce((sum, r) => sum + Number(r.stagingTx.amount), 0);

  let internalAmount: number;
  if (isGuestPayment) {
    const id = parseInt(internalTxId.replace("GuestPayment-", ""), 10);
    if (!Number.isInteger(id) || id < 1) {
      return sendError(res, 400, "INVALID_INTERNAL_TX", "Invalid GuestPayment ID");
    }
    const gp = await prisma.guestPayment.findUnique({ where: { id }, select: { amount: true, status: true } });
    if (!gp || gp.status !== "success") {
      return sendError(res, 404, "INTERNAL_NOT_FOUND", "GuestPayment not found or not successful");
    }
    internalAmount = Number(gp.amount);
  } else {
    const id = parseInt(internalTxId.replace("BankStatementTransaction-", ""), 10);
    if (!Number.isInteger(id) || id < 1) {
      return sendError(res, 400, "INVALID_INTERNAL_TX", "Invalid BankStatementTransaction ID");
    }
    const bst = await prisma.bankStatementTransaction.findUnique({ where: { id }, select: { amount: true } });
    if (!bst) {
      return sendError(res, 404, "INTERNAL_NOT_FOUND", "BankStatementTransaction not found");
    }
    internalAmount = Number(bst.amount);
  }

  const alreadyLinked = await prisma.reconciliationResult.findMany({
    where: { internalTxId, matchStatus: "MATCHED", id: { notIn: ids } },
    include: { stagingTx: { select: { amount: true } } },
  });
  const linkedTotal = alreadyLinked.reduce((sum, r) => sum + Number(r.stagingTx.amount), 0);
  const newTotal = linkedTotal + batchTotal;
  const maxAllowed = internalAmount * (1 + AMOUNT_TOLERANCE);
  if (newTotal > maxAllowed) {
    return sendError(
      res,
      400,
      "INSUFFICIENT_REMAINING_AMOUNT",
      `Internal record RM ${internalAmount.toFixed(2)}. Already linked: RM ${linkedTotal.toFixed(2)}. Batch total RM ${batchTotal.toFixed(2)} exceeds remaining.`,
    );
  }

  await prisma.$transaction([
    ...unmatched.map((r) =>
      prisma.reconciliationResult.update({
        where: { id: r.id },
        data: {
          internalTxId,
          matchStatus: "MATCHED",
          matchRule: "MANUAL_MATCH_BATCH",
          confidenceScore: 90,
        },
      }),
    ),
    ...unmatched.map((r) =>
      prisma.reconciliationAction.create({
        data: {
          reconId: r.id,
          actionType: "MANUAL_MATCH_BATCH",
          actionNote: `Batch matched to ${internalTxId} (${unmatched.length} staging txs)`,
          actedBy,
        },
      }),
    ),
  ]);

  return sendOk(res, {
    success: true,
    applied: unmatched.length,
    reconResultIds: unmatched.map((r) => r.id),
    internalTxId,
  });
});

// Helper: resolve internal amount from internalTxId
async function getInternalAmount(internalTxId: string): Promise<number | null> {
  if (internalTxId.startsWith("GuestPayment-")) {
    const id = parseInt(internalTxId.replace("GuestPayment-", ""), 10);
    const gp = await prisma.guestPayment.findUnique({ where: { id }, select: { amount: true, status: true } });
    return gp && gp.status === "success" ? Number(gp.amount) : null;
  }
  if (internalTxId.startsWith("BankStatementTransaction-")) {
    const id = parseInt(internalTxId.replace("BankStatementTransaction-", ""), 10);
    const bst = await prisma.bankStatementTransaction.findUnique({ where: { id }, select: { amount: true } });
    return bst ? Number(bst.amount) : null;
  }
  return null;
}

// Helper: check if internal is already linked (via internalTxId or matchLinks)
async function isInternalAlreadyLinked(internalTxId: string, excludeReconIds: number[]): Promise<boolean> {
  const byResult = await prisma.reconciliationResult.count({
    where: { internalTxId, matchStatus: "MATCHED", id: { notIn: excludeReconIds } },
  });
  if (byResult > 0) return true;
  const byLink = await prisma.reconciliationMatchLink.count({
    where: { internalTxId, reconResultId: { notIn: excludeReconIds } },
  });
  return byLink > 0;
}

// One-to-many: link one staging tx to multiple internal records
integrationRouter.post("/reconciliation/apply-match-one-to-many", async (req: AuthedRequest, res) => {
  const reconResultId = Number(req.body?.reconResultId);
  const internalTxIds = Array.isArray(req.body?.internalTxIds) ? req.body.internalTxIds : [];

  const ids = (internalTxIds as unknown[]).map((x) => String(x).trim()).filter((s) => s.length > 0);
  if (!Number.isInteger(reconResultId) || reconResultId < 1 || ids.length < 2) {
    return sendError(res, 400, "INVALID_INPUT", "reconResultId and at least 2 internalTxIds required for one-to-many");
  }

  const actedBy = req.auth?.name ?? "SYSTEM";

  const recon = await prisma.reconciliationResult.findUnique({
    where: { id: reconResultId },
    include: { stagingTx: true },
  });
  if (!recon) return sendError(res, 404, "NOT_FOUND", "Reconciliation result not found");
  if (recon.matchStatus !== "UNMATCHED") {
    return sendError(res, 400, "ALREADY_MATCHED", "This item is already matched");
  }

  const stagingAmount = Number(recon.stagingTx.amount);
  let totalInternal = 0;
  const validIds: string[] = [];

  for (const txId of ids) {
    if (!txId.startsWith("GuestPayment-") && !txId.startsWith("BankStatementTransaction-")) continue;
    const amt = await getInternalAmount(txId);
    if (amt == null) continue;
    const alreadyLinked = await isInternalAlreadyLinked(txId, [reconResultId]);
    if (alreadyLinked) {
      return sendError(res, 400, "INTERNAL_ALREADY_LINKED", `Internal ${txId} is already linked to another record`);
    }
    totalInternal += amt;
    validIds.push(txId);
  }

  if (validIds.length < 2) {
    return sendError(res, 400, "INVALID_INPUT", "At least 2 valid internal records required");
  }

  const minAllowed = stagingAmount * (1 - AMOUNT_TOLERANCE);
  const maxAllowed = stagingAmount * (1 + AMOUNT_TOLERANCE);
  if (totalInternal < minAllowed || totalInternal > maxAllowed) {
    return sendError(
      res,
      400,
      "AMOUNT_MISMATCH",
      `Staging RM ${stagingAmount.toFixed(2)}. Internal total RM ${totalInternal.toFixed(2)} outside tolerance.`,
    );
  }

  await prisma.$transaction([
    prisma.reconciliationResult.update({
      where: { id: reconResultId },
      data: {
        internalTxId: validIds[0],
        matchStatus: "MATCHED",
        matchRule: "MANUAL_MATCH_ONE_TO_MANY",
        confidenceScore: 90,
      },
    }),
    ...validIds.map((txId) =>
      prisma.reconciliationMatchLink.create({
        data: { reconResultId, internalTxId: txId },
      }),
    ),
    prisma.reconciliationAction.create({
      data: {
        reconId: reconResultId,
        actionType: "MANUAL_MATCH_ONE_TO_MANY",
        actionNote: `Matched to ${validIds.length} internal records: ${validIds.join(", ")}`,
        actedBy,
      },
    }),
  ]);

  return sendOk(res, { success: true, reconResultId, internalTxIds: validIds });
});

// Batch one-to-many: apply one-to-many for multiple staging txs
integrationRouter.post("/reconciliation/apply-match-one-to-many-batch", async (req: AuthedRequest, res) => {
  const items = Array.isArray(req.body?.items) ? req.body.items : [];

  if (items.length === 0) {
    return sendError(res, 400, "INVALID_INPUT", "At least one item with reconResultId and internalTxIds required");
  }

  const actedBy = req.auth?.name ?? "SYSTEM";
  const results: { reconResultId: number; success: boolean; error?: string }[] = [];

  for (const item of items as Array<{ reconResultId: number; internalTxIds: string[] }>) {
    const reconResultId = Number(item?.reconResultId);
    const internalTxIds = Array.isArray(item?.internalTxIds) ? item.internalTxIds : [];
    const ids = internalTxIds.map((x: unknown) => String(x).trim()).filter((s: string) => s.length > 0);

    if (!Number.isInteger(reconResultId) || reconResultId < 1 || ids.length < 2) {
      results.push({ reconResultId, success: false, error: "Need reconResultId and at least 2 internalTxIds" });
      continue;
    }

    const recon = await prisma.reconciliationResult.findUnique({
      where: { id: reconResultId },
      include: { stagingTx: true },
    });
    if (!recon || recon.matchStatus !== "UNMATCHED") {
      results.push({ reconResultId, success: false, error: "Not found or already matched" });
      continue;
    }

    const stagingAmount = Number(recon.stagingTx.amount);
    let totalInternal = 0;
    const validIds: string[] = [];

    for (const txId of ids) {
      if (!txId.startsWith("GuestPayment-") && !txId.startsWith("BankStatementTransaction-")) continue;
      const amt = await getInternalAmount(txId);
      if (amt == null) continue;
      const alreadyLinked = await isInternalAlreadyLinked(txId, [reconResultId]);
      if (alreadyLinked) {
        results.push({ reconResultId, success: false, error: `${txId} already linked` });
        validIds.length = 0;
        break;
      }
      totalInternal += amt;
      validIds.push(txId);
    }

    if (validIds.length < 2) {
      results.push({ reconResultId, success: false, error: "At least 2 valid internal records required" });
      continue;
    }

    const minAllowed = stagingAmount * (1 - AMOUNT_TOLERANCE);
    const maxAllowed = stagingAmount * (1 + AMOUNT_TOLERANCE);
    if (totalInternal < minAllowed || totalInternal > maxAllowed) {
      results.push({
        reconResultId,
        success: false,
        error: `Amount mismatch: staging RM ${stagingAmount.toFixed(2)}, internal RM ${totalInternal.toFixed(2)}`,
      });
      continue;
    }

    try {
      await prisma.$transaction([
        prisma.reconciliationResult.update({
          where: { id: reconResultId },
          data: {
            internalTxId: validIds[0],
            matchStatus: "MATCHED",
            matchRule: "MANUAL_MATCH_ONE_TO_MANY",
            confidenceScore: 90,
          },
        }),
        ...validIds.map((txId: string) =>
          prisma.reconciliationMatchLink.create({
            data: { reconResultId, internalTxId: txId },
          }),
        ),
        prisma.reconciliationAction.create({
          data: {
            reconId: reconResultId,
            actionType: "MANUAL_MATCH_ONE_TO_MANY",
            actionNote: `Batch 1:N: matched to ${validIds.length} internal records`,
            actedBy,
          },
        }),
      ]);
      results.push({ reconResultId, success: true });
    } catch (e) {
      results.push({ reconResultId, success: false, error: e instanceof Error ? e.message : "Transaction failed" });
    }
  }

  return sendOk(res, { success: true, results });
});

// Phase 3: Many-to-many — links with amountAllocated per (reconResultId, internalTxId)
interface ManyToManyLink {
  reconResultId: number;
  internalTxId: string;
  amountAllocated: number;
}

integrationRouter.post("/reconciliation/apply-match-many-to-many", async (req: AuthedRequest, res) => {
  const linksRaw = Array.isArray(req.body?.links) ? req.body.links : [];
  const links: ManyToManyLink[] = linksRaw
    .map((x: unknown) => {
      const o = x as Record<string, unknown>;
      const reconResultId = Number(o?.reconResultId);
      const internalTxId = String(o?.internalTxId ?? "").trim();
      const amountAllocated = Number(o?.amountAllocated);
      if (!Number.isInteger(reconResultId) || reconResultId < 1 || !internalTxId || Number.isNaN(amountAllocated) || amountAllocated <= 0) return null;
      if (!internalTxId.startsWith("GuestPayment-") && !internalTxId.startsWith("BankStatementTransaction-")) return null;
      return { reconResultId, internalTxId, amountAllocated };
    })
    .filter((x: ManyToManyLink | null): x is ManyToManyLink => x !== null);

  if (links.length === 0) {
    return sendError(res, 400, "INVALID_INPUT", "At least one link with reconResultId, internalTxId, amountAllocated required");
  }

  const reconResultIds: number[] = [...new Set(links.map((l: ManyToManyLink) => l.reconResultId))];
  const internalTxIds: string[] = [...new Set(links.map((l: ManyToManyLink) => l.internalTxId))];

  if (reconResultIds.length < 2 && internalTxIds.length < 2) {
    return sendError(res, 400, "INVALID_INPUT", "N:M requires at least 2 staging rows OR 2 internal records");
  }

  const actedBy = req.auth?.name ?? "SYSTEM";

  const recons = await prisma.reconciliationResult.findMany({
    where: { id: { in: reconResultIds } },
    include: { stagingTx: true },
  });
  if (recons.length !== reconResultIds.length) {
    return sendError(res, 404, "NOT_FOUND", "Some reconciliation results not found");
  }
  const unmatched = recons.filter((r) => r.matchStatus === "UNMATCHED");
  if (unmatched.length !== recons.length) {
    return sendError(res, 400, "ALREADY_MATCHED", "All staging rows must be UNMATCHED");
  }

  for (const recon of recons) {
    const sumAlloc = links.filter((l: ManyToManyLink) => l.reconResultId === recon.id).reduce((s: number, l: ManyToManyLink) => s + l.amountAllocated, 0);
    const stagingAmount = Number(recon.stagingTx?.amount ?? 0);
    const minAllowed = stagingAmount * (1 - AMOUNT_TOLERANCE);
    const maxAllowed = stagingAmount * (1 + AMOUNT_TOLERANCE);
    if (sumAlloc < minAllowed || sumAlloc > maxAllowed) {
      return sendError(
        res,
        400,
        "AMOUNT_MISMATCH",
        `Staging TX ${recon.stagingTxId}: allocated RM ${sumAlloc.toFixed(2)} vs staging RM ${stagingAmount.toFixed(2)}`,
      );
    }
  }

  for (const internalTxId of internalTxIds) {
    const amt = await getInternalAmount(internalTxId);
    if (amt == null) {
      return sendError(res, 404, "INTERNAL_NOT_FOUND", `Internal ${internalTxId} not found`);
    }
    const alreadyLinked = await isInternalAlreadyLinked(internalTxId, reconResultIds);
    if (alreadyLinked) {
      return sendError(res, 400, "INTERNAL_ALREADY_LINKED", `Internal ${internalTxId} already linked`);
    }
    const sumAlloc = links.filter((l: ManyToManyLink) => l.internalTxId === internalTxId).reduce((s: number, l: ManyToManyLink) => s + l.amountAllocated, 0);
    const maxAllowed = amt * (1 + AMOUNT_TOLERANCE);
    if (sumAlloc > maxAllowed) {
      return sendError(
        res,
        400,
        "INSUFFICIENT_INTERNAL",
        `Internal ${internalTxId}: allocated RM ${sumAlloc.toFixed(2)} exceeds amount RM ${amt.toFixed(2)}`,
      );
    }
  }

  await prisma.$transaction([
    ...reconResultIds.map((id: number) =>
      prisma.reconciliationResult.update({
        where: { id },
        data: {
          internalTxId: links.find((l: ManyToManyLink) => l.reconResultId === id)?.internalTxId ?? null,
          matchStatus: "MATCHED",
          matchRule: "MANUAL_MATCH_MANY_TO_MANY",
          confidenceScore: 90,
        },
      }),
    ),
    ...links.map((l: ManyToManyLink) =>
      prisma.reconciliationMatchLink.create({
        data: {
          reconResultId: l.reconResultId,
          internalTxId: l.internalTxId,
          amountAllocated: l.amountAllocated,
        },
      }),
    ),
    ...reconResultIds.map((id: number) =>
      prisma.reconciliationAction.create({
        data: {
          reconId: id,
          actionType: "MANUAL_MATCH_MANY_TO_MANY",
          actionNote: `N:M group: ${reconResultIds.length} staging ↔ ${internalTxIds.length} internal`,
          actedBy,
        },
      }),
    ),
  ]);

  return sendOk(res, {
    success: true,
    reconResultIds,
    internalTxIds,
    linksCount: links.length,
  });
});

// Batch many-to-many: multiple N:M groups
integrationRouter.post("/reconciliation/apply-match-many-to-many-batch", async (req: AuthedRequest, res) => {
  const groups = Array.isArray(req.body?.groups) ? req.body.groups : [];
  if (groups.length === 0) {
    return sendError(res, 400, "INVALID_INPUT", "At least one group with links required");
  }

  const actedBy = req.auth?.name ?? "SYSTEM";
  const results: { groupIndex: number; success: boolean; reconResultIds?: number[]; error?: string }[] = [];

  for (let gi = 0; gi < groups.length; gi++) {
    const groupItem = groups[gi] as { links?: unknown[] } | undefined;
    const linksRaw = Array.isArray(groupItem?.links) ? groupItem.links : [];
    const links: ManyToManyLink[] = linksRaw
      .map((x: unknown) => {
        const o = x as Record<string, unknown>;
        const reconResultId = Number(o?.reconResultId);
        const internalTxId = String(o?.internalTxId ?? "").trim();
        const amountAllocated = Number(o?.amountAllocated);
        if (!Number.isInteger(reconResultId) || reconResultId < 1 || !internalTxId || Number.isNaN(amountAllocated) || amountAllocated <= 0) return null;
        if (!internalTxId.startsWith("GuestPayment-") && !internalTxId.startsWith("BankStatementTransaction-")) return null;
        return { reconResultId, internalTxId, amountAllocated };
      })
      .filter((x: ManyToManyLink | null): x is ManyToManyLink => x !== null);

    if (links.length === 0) {
      results.push({ groupIndex: gi, success: false, error: "No valid links" });
      continue;
    }

    const reconResultIds: number[] = [...new Set(links.map((l: ManyToManyLink) => l.reconResultId))];
    const internalTxIds: string[] = [...new Set(links.map((l: ManyToManyLink) => l.internalTxId))];

    if (reconResultIds.length < 2 && internalTxIds.length < 2) {
      results.push({ groupIndex: gi, success: false, error: "N:M requires at least 2 staging OR 2 internal" });
      continue;
    }

    const recons = await prisma.reconciliationResult.findMany({
      where: { id: { in: reconResultIds } },
      include: { stagingTx: true },
    });
    if (recons.length !== reconResultIds.length) {
      results.push({ groupIndex: gi, success: false, error: "Some recon results not found" });
      continue;
    }
    const unmatched = recons.filter((r) => r.matchStatus === "UNMATCHED");
    if (unmatched.length !== recons.length) {
      results.push({ groupIndex: gi, success: false, error: "All staging must be UNMATCHED" });
      continue;
    }

    let valid = true;
    for (const recon of recons) {
      const sumAlloc = links.filter((l: ManyToManyLink) => l.reconResultId === recon.id).reduce((s: number, l: ManyToManyLink) => s + l.amountAllocated, 0);
      const stagingAmount = Number(recon.stagingTx?.amount ?? 0);
      const minAllowed = stagingAmount * (1 - AMOUNT_TOLERANCE);
      const maxAllowed = stagingAmount * (1 + AMOUNT_TOLERANCE);
      if (sumAlloc < minAllowed || sumAlloc > maxAllowed) {
        results.push({
          groupIndex: gi,
          success: false,
          error: `Staging ${recon.stagingTxId}: allocated RM ${sumAlloc.toFixed(2)} vs RM ${stagingAmount.toFixed(2)}`,
        });
        valid = false;
        break;
      }
    }
    if (!valid) continue;

    for (const internalTxId of internalTxIds) {
      const amt = await getInternalAmount(internalTxId);
      if (amt == null) {
        results.push({ groupIndex: gi, success: false, error: `Internal ${internalTxId} not found` });
        valid = false;
        break;
      }
      const alreadyLinked = await isInternalAlreadyLinked(internalTxId, reconResultIds);
      if (alreadyLinked) {
        results.push({ groupIndex: gi, success: false, error: `${internalTxId} already linked` });
        valid = false;
        break;
      }
      const sumAlloc = links.filter((l: ManyToManyLink) => l.internalTxId === internalTxId).reduce((s: number, l: ManyToManyLink) => s + l.amountAllocated, 0);
      const maxAllowed = amt * (1 + AMOUNT_TOLERANCE);
      if (sumAlloc > maxAllowed) {
        results.push({
          groupIndex: gi,
          success: false,
          error: `Internal ${internalTxId}: allocated RM ${sumAlloc.toFixed(2)} exceeds RM ${amt.toFixed(2)}`,
        });
        valid = false;
        break;
      }
    }
    if (!valid) continue;

    try {
      await prisma.$transaction([
        ...reconResultIds.map((id: number) =>
          prisma.reconciliationResult.update({
            where: { id },
            data: {
              internalTxId: links.find((l: ManyToManyLink) => l.reconResultId === id)?.internalTxId ?? null,
              matchStatus: "MATCHED",
              matchRule: "MANUAL_MATCH_MANY_TO_MANY",
              confidenceScore: 90,
            },
          }),
        ),
        ...links.map((l: ManyToManyLink) =>
          prisma.reconciliationMatchLink.create({
            data: {
              reconResultId: l.reconResultId,
              internalTxId: l.internalTxId,
              amountAllocated: l.amountAllocated,
            },
          }),
        ),
        ...reconResultIds.map((id: number) =>
          prisma.reconciliationAction.create({
            data: {
              reconId: id,
              actionType: "MANUAL_MATCH_MANY_TO_MANY",
              actionNote: `Batch N:M: ${reconResultIds.length} staging ↔ ${internalTxIds.length} internal`,
              actedBy,
            },
          }),
        ),
      ]);
      results.push({ groupIndex: gi, success: true, reconResultIds });
    } catch (e) {
      results.push({ groupIndex: gi, success: false, error: e instanceof Error ? e.message : "Transaction failed" });
    }
  }

  return sendOk(res, { success: true, results });
});
