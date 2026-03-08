import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";

import pkg from "@prisma/client";
const { IntegrationFileType } = pkg;
import type { IntegrationFileType as IntegrationFileTypeEnum } from "@prisma/client";
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
  // Sync from Setting (Sumber Data + Kategori Sumber screens) so dropdown includes newly added sources
  const catRow = await prisma.setting.findUnique({ where: { key: "sourceCategories" } });
  const categories = catRow ? (JSON.parse(catRow.value) as Array<{ code: string; name: string; isActive: boolean }>) : [];
  for (const cat of categories) {
    await prisma.integrationSourceCategory.upsert({
      where: { code: cat.code },
      update: { name: cat.name, isActive: cat.isActive },
      create: { code: cat.code, name: cat.name, isActive: cat.isActive },
    });
  }
  const row = await prisma.setting.findUnique({ where: { key: "sourceData" } });
  const items = row ? (JSON.parse(row.value) as Array<{ code: string; name: string; categoryCode: string; isActive: boolean }>) : [];
  for (const item of items) {
    const category = await prisma.integrationSourceCategory.findUnique({ where: { code: item.categoryCode } });
    if (category) {
      await prisma.integrationSource.upsert({
        where: { code: item.code },
        update: { name: item.name, categoryId: category.id, isActive: item.isActive },
        create: {
          code: item.code,
          name: item.name,
          categoryId: category.id,
          transportType: "MANUAL",
          isActive: item.isActive,
        },
      });
    }
  }
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
  const fileType = validFileTypes.includes(fileTypeRaw) ? (fileTypeRaw as IntegrationFileTypeEnum) : IntegrationFileType.ENCRYPTED_TXT;

  const columnMappingJson = String(req.body?.columnMappingJson ?? "").trim() || null;
  const aiDetectedSource = String(req.body?.aiDetectedSource ?? "").trim() || null;
  const aiConfidenceRaw = req.body?.aiConfidence;
  const aiConfidence = typeof aiConfidenceRaw === "number" ? aiConfidenceRaw : (typeof aiConfidenceRaw === "string" ? parseFloat(aiConfidenceRaw) : null);

  // Reject if file with same name already exists
  const existingByName = await prisma.integrationFile.findFirst({
    where: { fileName: file.originalname },
  });
  if (existingByName) {
    try { fs.unlinkSync(file.path); } catch { /* ignore */ }
    return sendError(res, 409, "DUPLICATE_FILE_NAME", `File "${file.originalname}" already exists. Use a different filename.`);
  }

  const fileBuffer = fs.readFileSync(file.path);
  const fileHashSha256 = sha256Buffer(fileBuffer);

  const existingByHash = await prisma.integrationFile.findUnique({
    where: { fileHashSha256 },
  });
  if (existingByHash) {
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

// -----------------------------------------------------------------------------
// Exceptions (Exception Queue for supervisor review)
// -----------------------------------------------------------------------------

integrationRouter.get("/exceptions", async (req, res) => {
  const limit = Math.min(Number(req.query?.limit) || 50, 200);
  const offset = Number(req.query?.offset) || 0;
  const statusFilter = String(req.query?.status ?? "").trim().toLowerCase();
  const matchStatuses: string[] =
    statusFilter === "unmatched"
      ? ["UNMATCHED"]
      : statusFilter === "mismatch"
        ? ["MISMATCH"]
        : ["UNMATCHED", "MISMATCH"];

  const where = { matchStatus: { in: matchStatuses } };

  const [exceptions, total] = await Promise.all([
    prisma.reconciliationResult.findMany({
      where,
      include: {
        stagingTx: { include: { file: { include: { source: true } } } },
      },
      orderBy: { id: "desc" },
      take: limit,
      skip: offset,
    }),
    prisma.reconciliationResult.count({ where }),
  ]);

  const items = exceptions.map((r) => ({
    id: r.id,
    stagingTxId: r.stagingTxId,
    matchStatus: r.matchStatus,
    exceptionCode: r.exceptionCode,
    exceptionDetail: r.exceptionDetail,
    matchRule: r.matchRule,
    internalTxId: r.internalTxId,
    payerIc: r.stagingTx.payerIc,
    payerName: r.stagingTx.payerName,
    txDate: r.stagingTx.txDate.toISOString().slice(0, 10),
    amount: Number(r.stagingTx.amount),
    sourceTxRef: r.stagingTx.sourceTxRef,
    fileName: r.stagingTx.file?.fileName ?? null,
    sourceCode: r.stagingTx.file?.source?.code ?? null,
    sourceName: r.stagingTx.file?.source?.name ?? null,
    createdAt: r.createdAt.toISOString(),
  }));

  return sendOk(res, items, { total, limit, offset });
});

// -----------------------------------------------------------------------------
// Reports
// -----------------------------------------------------------------------------

integrationRouter.get("/reports/processing", async (req, res) => {
  const fromDate = req.query?.from ? String(req.query.from).trim() : null;
  const toDate = req.query?.to ? String(req.query.to).trim() : null;

  const where: { receivedAt?: { gte?: Date; lte?: Date } } = {};
  if (fromDate) {
    const d = new Date(fromDate);
    if (!Number.isNaN(d.getTime())) where.receivedAt = { ...where.receivedAt, gte: d };
  }
  if (toDate) {
    const d = new Date(toDate);
    if (!Number.isNaN(d.getTime())) {
      d.setHours(23, 59, 59, 999);
      where.receivedAt = { ...where.receivedAt, lte: d };
    }
  }

  const files = await prisma.integrationFile.findMany({
    where: Object.keys(where).length > 0 ? where : undefined,
    include: {
      source: { include: { category: true } },
      _count: { select: { stagingTxs: true } },
    },
    orderBy: { receivedAt: "desc" },
  });

  const byProcessingStatus = { PENDING: 0, IN_PROGRESS: 0, SUCCESS: 0, FAILED: 0 };
  const byValidationStatus = { PENDING: 0, PASSED: 0, FAILED: 0 };
  let totalRecordsParsed = 0;
  let totalAmountParsed = 0;
  let totalRecordsDeclared = 0;
  let totalAmountDeclared = 0;

  const sourceMap = new Map<string, { sourceCode: string; sourceName: string; fileCount: number; recordsParsed: number; amountParsed: number }>();

  for (const f of files) {
    const status = f.processingStatus as keyof typeof byProcessingStatus;
    if (status in byProcessingStatus) byProcessingStatus[status]++;

    const valStatus = f.validationStatus as keyof typeof byValidationStatus;
    if (valStatus in byValidationStatus) byValidationStatus[valStatus]++;

    const records = f.totalRecordsParsed ?? f._count.stagingTxs ?? 0;
    const amount = Number(f.totalAmountParsed ?? 0);
    totalRecordsParsed += records;
    totalAmountParsed += amount;
    totalRecordsDeclared += f.totalRecordsDeclared ?? 0;
    totalAmountDeclared += Number(f.totalAmountDeclared ?? 0);

    const src = f.source;
    if (src) {
      const key = src.code;
      const existing = sourceMap.get(key);
      if (existing) {
        existing.fileCount++;
        existing.recordsParsed += records;
        existing.amountParsed += amount;
      } else {
        sourceMap.set(key, {
          sourceCode: src.code,
          sourceName: src.name,
          fileCount: 1,
          recordsParsed: records,
          amountParsed: amount,
        });
      }
    }
  }

  const bySource = Array.from(sourceMap.values()).sort((a, b) => a.sourceCode.localeCompare(b.sourceCode));

  const recentFiles = files.slice(0, 20).map((f) => ({
    id: f.id,
    fileName: f.fileName,
    sourceCode: f.source?.code ?? null,
    sourceName: f.source?.name ?? null,
    receivedAt: f.receivedAt.toISOString(),
    processingStatus: f.processingStatus,
    validationStatus: f.validationStatus,
    totalRecordsParsed: f.totalRecordsParsed ?? f._count.stagingTxs ?? null,
    totalAmountParsed: f.totalAmountParsed != null ? Number(f.totalAmountParsed) : null,
    errorSummary: f.errorSummary,
  }));

  return sendOk(res, {
    generatedAt: new Date().toISOString(),
    dateRange: fromDate || toDate ? { from: fromDate ?? null, to: toDate ?? null } : null,
    summary: {
      totalFiles: files.length,
      byProcessingStatus,
      byValidationStatus,
      totalRecordsParsed,
      totalAmountParsed,
      totalRecordsDeclared,
      totalAmountDeclared,
    },
    bySource,
    recentFiles,
  });
});

integrationRouter.get("/reports/payer", async (req, res) => {
  const fromDate = req.query?.from ? String(req.query.from).trim() : null;
  const toDate = req.query?.to ? String(req.query.to).trim() : null;
  const limit = Math.min(Number(req.query?.limit) || 100, 500);

  const txWhere: { txDate?: { gte?: Date; lte?: Date } } = {};
  if (fromDate) {
    const d = new Date(fromDate);
    if (!Number.isNaN(d.getTime())) txWhere.txDate = { ...txWhere.txDate, gte: d };
  }
  if (toDate) {
    const d = new Date(toDate);
    if (!Number.isNaN(d.getTime())) {
      d.setHours(23, 59, 59, 999);
      txWhere.txDate = { ...txWhere.txDate, lte: d };
    }
  }

  const stagingTxs = await prisma.integrationStagingTx.findMany({
    where: {
      ...txWhere,
      file: { processingStatus: "SUCCESS" },
    },
    include: {
      file: { include: { source: true } },
    },
  });

  const payerMap = new Map<
    string,
    { payerIc: string | null; payerName: string | null; txCount: number; totalAmount: number; firstTx: Date; lastTx: Date; sources: Set<string> }
  >();

  for (const st of stagingTxs) {
    const key = (st.payerIc ?? "").trim() || (st.payerName ?? "").trim() || "—";
    const existing = payerMap.get(key);
    const amt = Number(st.amount);
    const src = st.file?.source?.code ?? null;

    if (existing) {
      existing.txCount++;
      existing.totalAmount += amt;
      if (st.txDate < existing.firstTx) existing.firstTx = st.txDate;
      if (st.txDate > existing.lastTx) existing.lastTx = st.txDate;
      if (src) existing.sources.add(src);
    } else {
      payerMap.set(key, {
        payerIc: st.payerIc,
        payerName: st.payerName,
        txCount: 1,
        totalAmount: amt,
        firstTx: st.txDate,
        lastTx: st.txDate,
        sources: new Set(src ? [src] : []),
      });
    }
  }

  const payers = Array.from(payerMap.values())
    .map((p) => ({
      payerIc: p.payerIc,
      payerName: p.payerName,
      txCount: p.txCount,
      totalAmount: p.totalAmount,
      firstTxDate: p.firstTx.toISOString().slice(0, 10),
      lastTxDate: p.lastTx.toISOString().slice(0, 10),
      sources: Array.from(p.sources).sort(),
    }))
    .sort((a, b) => b.totalAmount - a.totalAmount)
    .slice(0, limit);

  let totalTransactions = 0;
  let totalAmount = 0;
  for (const p of payerMap.values()) {
    totalTransactions += p.txCount;
    totalAmount += p.totalAmount;
  }

  return sendOk(res, {
    generatedAt: new Date().toISOString(),
    dateRange: fromDate || toDate ? { from: fromDate ?? null, to: toDate ?? null } : null,
    summary: {
      totalPayers: payerMap.size,
      totalTransactions,
      totalAmount,
    },
    payers,
  });
});

integrationRouter.get("/reports/reconciliation", async (req, res) => {
  const fromDate = req.query?.from ? String(req.query.from).trim() : null;
  const toDate = req.query?.to ? String(req.query.to).trim() : null;
  const exceptionLimit = Math.min(Number(req.query?.exceptionLimit) || 50, 200);

  const fileWhere: { receivedAt?: { gte?: Date; lte?: Date } } = {};
  if (fromDate) {
    const d = new Date(fromDate);
    if (!Number.isNaN(d.getTime())) fileWhere.receivedAt = { ...fileWhere.receivedAt, gte: d };
  }
  if (toDate) {
    const d = new Date(toDate);
    if (!Number.isNaN(d.getTime())) {
      d.setHours(23, 59, 59, 999);
      fileWhere.receivedAt = { ...fileWhere.receivedAt, lte: d };
    }
  }

  const files = await prisma.integrationFile.findMany({
    where: { processingStatus: "SUCCESS", ...(Object.keys(fileWhere).length > 0 ? fileWhere : {}) },
    include: {
      source: { include: { category: true } },
      stagingTxs: { select: { id: true } },
    },
    orderBy: { receivedAt: "desc" },
  });

  const byFile: Array<{
    fileId: number;
    fileName: string;
    sourceCode: string | null;
    sourceName: string | null;
    receivedAt: string;
    totalStaging: number;
    matched: number;
    unmatched: number;
    mismatch: number;
    duplicate: number;
  }> = [];

  const sourceMap = new Map<string, { sourceCode: string; sourceName: string; totalStaging: number; matched: number; unmatched: number; mismatch: number; duplicate: number }>();

  let totalStaging = 0;
  let totalMatched = 0;
  let totalUnmatched = 0;
  let totalMismatch = 0;
  let totalDuplicate = 0;

  const allStagingIds: number[] = [];

  for (const f of files) {
    const stagingIds = f.stagingTxs.map((s) => s.id);
    allStagingIds.push(...stagingIds);

    const [matched, unmatched, mismatch, duplicate] = await Promise.all([
      prisma.reconciliationResult.count({ where: { stagingTxId: { in: stagingIds }, matchStatus: "MATCHED" } }),
      prisma.reconciliationResult.count({ where: { stagingTxId: { in: stagingIds }, matchStatus: "UNMATCHED" } }),
      prisma.reconciliationResult.count({ where: { stagingTxId: { in: stagingIds }, matchStatus: "MISMATCH" } }),
      prisma.reconciliationResult.count({ where: { stagingTxId: { in: stagingIds }, matchStatus: "DUPLICATE" } }),
    ]);

    totalStaging += stagingIds.length;
    totalMatched += matched;
    totalUnmatched += unmatched;
    totalMismatch += mismatch;
    totalDuplicate += duplicate;

    byFile.push({
      fileId: f.id,
      fileName: f.fileName,
      sourceCode: f.source?.code ?? null,
      sourceName: f.source?.name ?? null,
      receivedAt: f.receivedAt.toISOString(),
      totalStaging: stagingIds.length,
      matched,
      unmatched,
      mismatch,
      duplicate,
    });

    const src = f.source;
    if (src) {
      const existing = sourceMap.get(src.code);
      if (existing) {
        existing.totalStaging += stagingIds.length;
        existing.matched += matched;
        existing.unmatched += unmatched;
        existing.mismatch += mismatch;
        existing.duplicate += duplicate;
      } else {
        sourceMap.set(src.code, {
          sourceCode: src.code,
          sourceName: src.name,
          totalStaging: stagingIds.length,
          matched,
          unmatched,
          mismatch,
          duplicate,
        });
      }
    }
  }

  const bySource = Array.from(sourceMap.values()).sort((a, b) => a.sourceCode.localeCompare(b.sourceCode));

  const exceptions = await prisma.reconciliationResult.findMany({
    where: {
      stagingTxId: { in: allStagingIds },
      matchStatus: { in: ["UNMATCHED", "MISMATCH"] },
    },
    include: {
      stagingTx: { include: { file: { include: { source: true } } } },
    },
    orderBy: { id: "desc" },
    take: exceptionLimit,
  });

  const exceptionsFormatted = exceptions.map((r) => ({
    id: r.id,
    stagingTxId: r.stagingTxId,
    matchStatus: r.matchStatus,
    exceptionCode: r.exceptionCode,
    exceptionDetail: r.exceptionDetail,
    matchRule: r.matchRule,
    internalTxId: r.internalTxId,
    payerIc: r.stagingTx.payerIc,
    payerName: r.stagingTx.payerName,
    txDate: r.stagingTx.txDate.toISOString().slice(0, 10),
    amount: Number(r.stagingTx.amount),
    sourceTxRef: r.stagingTx.sourceTxRef,
    fileName: r.stagingTx.file?.fileName ?? null,
    sourceCode: r.stagingTx.file?.source?.code ?? null,
  }));

  const matchRate = totalStaging > 0 ? Math.round((totalMatched / totalStaging) * 100) : 0;

  return sendOk(res, {
    generatedAt: new Date().toISOString(),
    dateRange: fromDate || toDate ? { from: fromDate ?? null, to: toDate ?? null } : null,
    summary: {
      totalFiles: files.length,
      totalStaging,
      matched: totalMatched,
      unmatched: totalUnmatched,
      mismatch: totalMismatch,
      duplicate: totalDuplicate,
      matchRate,
    },
    byFile,
    bySource,
    exceptions: exceptionsFormatted,
  });
});

integrationRouter.get("/reports/trends", async (req, res) => {
  const fromDate = req.query?.from ? String(req.query.from).trim() : null;
  const toDate = req.query?.to ? String(req.query.to).trim() : null;
  const groupBy = (req.query?.groupBy as string) || "day";
  const validGroup = ["day", "week", "month"].includes(groupBy) ? groupBy : "day";

  const fileWhere: { receivedAt?: { gte?: Date; lte?: Date } } = {};
  if (fromDate) {
    const d = new Date(fromDate);
    if (!Number.isNaN(d.getTime())) fileWhere.receivedAt = { ...fileWhere.receivedAt, gte: d };
  }
  if (toDate) {
    const d = new Date(toDate);
    if (!Number.isNaN(d.getTime())) {
      d.setHours(23, 59, 59, 999);
      fileWhere.receivedAt = { ...fileWhere.receivedAt, lte: d };
    }
  }

  const files = await prisma.integrationFile.findMany({
    where: Object.keys(fileWhere).length > 0 ? fileWhere : undefined,
    include: {
      source: { include: { category: true } },
      _count: { select: { stagingTxs: true } },
    },
    orderBy: { receivedAt: "asc" },
  });

  function getPeriodKey(d: Date): string {
    const y = d.getFullYear();
    const m = d.getMonth();
    const day = d.getDate();
    if (validGroup === "month") return `${y}-${String(m + 1).padStart(2, "0")}`;
    if (validGroup === "week") {
      const start = new Date(d);
      start.setDate(day - start.getDay());
      return start.toISOString().slice(0, 10);
    }
    return d.toISOString().slice(0, 10);
  }

  const periodMap = new Map<string, { fileCount: number; recordCount: number; amount: number }>();
  const sourceMap = new Map<string, { sourceCode: string; sourceName: string; categoryCode: string; categoryName: string; fileCount: number; recordCount: number; amount: number }>();
  const categoryMap = new Map<string, { categoryCode: string; categoryName: string; fileCount: number; recordCount: number; amount: number }>();

  let totalFiles = 0;
  let totalRecords = 0;
  let totalAmount = 0;
  let successCount = 0;

  for (const f of files) {
    const key = getPeriodKey(f.receivedAt);
    const records = f.totalRecordsParsed ?? f._count.stagingTxs ?? 0;
    const amount = Number(f.totalAmountParsed ?? 0);

    const existing = periodMap.get(key);
    if (existing) {
      existing.fileCount++;
      existing.recordCount += records;
      existing.amount += amount;
    } else {
      periodMap.set(key, { fileCount: 1, recordCount: records, amount });
    }

    totalFiles++;
    totalRecords += records;
    totalAmount += amount;
    if (f.processingStatus === "SUCCESS") successCount++;

    const src = f.source;
    if (src) {
      const key = src.code;
      const existingSrc = sourceMap.get(key);
      if (existingSrc) {
        existingSrc.fileCount++;
        existingSrc.recordCount += records;
        existingSrc.amount += amount;
      } else {
        sourceMap.set(key, {
          sourceCode: src.code,
          sourceName: src.name,
          categoryCode: src.category?.code ?? "—",
          categoryName: src.category?.name ?? "—",
          fileCount: 1,
          recordCount: records,
          amount,
        });
      }

      const catCode = src.category?.code ?? "—";
      const catName = src.category?.name ?? "—";
      const existingCat = categoryMap.get(catCode);
      if (existingCat) {
        existingCat.fileCount++;
        existingCat.recordCount += records;
        existingCat.amount += amount;
      } else {
        categoryMap.set(catCode, {
          categoryCode: catCode,
          categoryName: catName,
          fileCount: 1,
          recordCount: records,
          amount,
        });
      }
    }
  }

  const volumeByPeriod = Array.from(periodMap.entries())
    .sort((a, b) => a[0].localeCompare(b[0]))
    .map(([period, data]) => ({ period, ...data }));

  const bySource = Array.from(sourceMap.values())
    .sort((a, b) => b.amount - a.amount)
    .map((s) => ({
      ...s,
      pctAmount: totalAmount > 0 ? Math.round((s.amount / totalAmount) * 100) : 0,
    }));

  const byCategory = Array.from(categoryMap.values())
    .sort((a, b) => b.amount - a.amount)
    .map((c) => ({
      ...c,
      pctAmount: totalAmount > 0 ? Math.round((c.amount / totalAmount) * 100) : 0,
    }));

  const successRate = totalFiles > 0 ? Math.round((successCount / totalFiles) * 100) : 0;
  const avgRecordsPerFile = totalFiles > 0 ? Math.round(totalRecords / totalFiles) : 0;

  return sendOk(res, {
    generatedAt: new Date().toISOString(),
    dateRange: fromDate || toDate ? { from: fromDate ?? null, to: toDate ?? null } : null,
    groupBy: validGroup,
    summary: {
      totalFiles,
      totalRecords,
      totalAmount,
      successCount,
      successRate,
      avgRecordsPerFile,
    },
    volumeByPeriod,
    bySource,
    byCategory,
  });
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
      stagingTx: { include: { duplicates: true, file: { select: { fileName: true } } } },
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

  // Always search both GuestPayment and BankStatement - internal records may exist
  // in either table regardless of the file's source category (PSP/SPG/BANK)
  const results: Array<{
    internalTxId: string;
    reference: string;
    name: string;
    amount: number;
    date: string;
    linkedInfo: { linkedCount: number; linkedTotalAmount: number; remainingAmount: number };
  }> = [];

  const digitsOnly = q.replace(/\D/g, "");
  const guestWhere =
    digitsOnly.length >= 2
      ? [
          { receiptNo: { contains: q } },
          { guestName: { contains: q } },
          { identityNo: { contains: digitsOnly } },
        ]
      : [{ receiptNo: { contains: q } }, { guestName: { contains: q } }];

  if (q.length >= 2) {
    const where: object[] = guestWhere;
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

  if (q.length >= 2) {
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

  return sendOk(res, results);
});

const SOURCES_USE_GUEST_PAYMENT = ["PSP"];
const SOURCES_USE_BANK_STATEMENT = ["SPG", "BANK"];
const SOURCE_CODES_USE_BANK_STATEMENT = ["JAN", "BANK_ISLAM", "MAYBANK"]; // fallback: use BankStatement
const SOURCE_CODES_USE_GUEST_PAYMENT = ["BILPIZ", "AMIL_BILPIZ02"]; // fallback: use GuestPayment (PSP)

// List internal records for Manual Match / N:1 / 1:N / N:M — GuestPayment for PSP, BankStatement for JAN/SPG/BANK
integrationRouter.get("/reconciliation/internal-for-match", async (req: AuthedRequest, res) => {
  const fileId = Number(req.query?.fileId ?? 0);
  const limit = Math.min(Number(req.query?.limit) || 50, 200);
  const offset = Number(req.query?.offset) ?? 0;
  const q = String(req.query?.search ?? "").trim();

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
  const sourceCode = (file.source?.code ?? "").trim();
  const sourceCodeUpper = sourceCode.toUpperCase();
  // Prefer source-code fallbacks (case-insensitive); then category
  const useBankStatement =
    SOURCE_CODES_USE_GUEST_PAYMENT.some((c) => c.toUpperCase() === sourceCodeUpper)
      ? false
      : SOURCE_CODES_USE_BANK_STATEMENT.some((c) => c.toUpperCase() === sourceCodeUpper) ||
        SOURCES_USE_BANK_STATEMENT.includes(categoryCode ?? "") ||
        SOURCE_CODES_USE_BANK_STATEMENT.includes(sourceCode);

  const resultShape = {
    internalTxId: "",
    reference: "",
    name: "",
    identityNo: "" as string | null,
    amount: 0,
    date: "",
    description: null as string | null,
    linkedInfo: { linkedCount: 0, linkedTotalAmount: 0, remainingAmount: 0 },
  };

  if (useBankStatement) {
    const where: { OR?: object[] } = {};
    if (q.length >= 1) {
      where.OR = [
        { paymentReference: { contains: q } },
        { counterparty: { contains: q } },
        { description: { contains: q } },
      ];
    }
    const FETCH_BATCH = 200;
    const allFiltered: typeof resultShape[] = [];
    let dbSkip = 0;

    while (true) {
      const txs = await prisma.bankStatementTransaction.findMany({
        where: Object.keys(where).length > 0 ? where : undefined,
        orderBy: { valueDate: "desc" },
        take: FETCH_BATCH,
        skip: dbSkip,
        select: { id: true, paymentReference: true, counterparty: true, amount: true, valueDate: true, description: true },
      });
      if (txs.length === 0) break;

      const internalTxIds = txs.map((t) => `BankStatementTransaction-${t.id}`);
      const linkedRows = await prisma.reconciliationResult.findMany({
        where: { internalTxId: { in: internalTxIds }, matchStatus: "MATCHED" },
        include: { stagingTx: { select: { amount: true } } },
      });
      const linkedByInternal = new Map<string, { total: number; count: number }>();
      for (const r of linkedRows) {
        if (r.internalTxId) {
          const cur = linkedByInternal.get(r.internalTxId) ?? { total: 0, count: 0 };
          cur.total += Number(r.stagingTx.amount);
          cur.count += 1;
          linkedByInternal.set(r.internalTxId, cur);
        }
      }

      for (const t of txs) {
        const internalTxId = `BankStatementTransaction-${t.id}`;
        const linked = linkedByInternal.get(internalTxId) ?? { total: 0, count: 0 };
        const internalAmount = Number(t.amount);
        const remainingAmount = Math.max(0, internalAmount - linked.total);
        // Show all records (including fully-matched) so user can see data; selection disabled when remainingAmount insufficient
        allFiltered.push({
          internalTxId,
          reference: t.paymentReference ?? t.counterparty ?? "—",
          name: t.counterparty ?? "—",
          identityNo: null,
          amount: internalAmount,
          date: t.valueDate.toISOString().slice(0, 10),
          description: t.description ?? null,
          linkedInfo: {
            linkedCount: linked.count,
            linkedTotalAmount: linked.total,
            remainingAmount,
          },
        });
      }
      dbSkip += txs.length;
      if (txs.length < FETCH_BATCH) break;
    }

    const results = allFiltered.slice(offset, offset + limit);
    const total = allFiltered.length;
    return sendOk(res, results, {
      total,
      limit,
      offset,
      internalSourceType: "BankStatement",
      _debug: { sourceCode, categoryCode, useBankStatement: true },
    });
  }

  // PSP: GuestPayment
  const where: { status: string; OR?: object[] } = { status: "success" };
  if (q.length >= 1) {
    const digitsOnly = q.replace(/\D/g, "");
    where.OR =
      digitsOnly.length >= 1
        ? [
            { receiptNo: { contains: q } },
            { guestName: { contains: q } },
            { identityNo: { contains: digitsOnly } },
          ]
        : [{ receiptNo: { contains: q } }, { guestName: { contains: q } }];
  }

  const FETCH_BATCH = 200;
  const allFiltered: typeof resultShape[] = [];
  let dbSkip = 0;

  while (true) {
    const payments = await prisma.guestPayment.findMany({
      where,
      orderBy: { paidAt: "desc" },
      take: FETCH_BATCH,
      skip: dbSkip,
      select: { id: true, receiptNo: true, guestName: true, identityNo: true, amount: true, paidAt: true },
    });
    if (payments.length === 0) break;

    const internalTxIds = payments.map((p) => `GuestPayment-${p.id}`);
    const linkedRows = await prisma.reconciliationResult.findMany({
      where: { internalTxId: { in: internalTxIds }, matchStatus: "MATCHED" },
      include: { stagingTx: { select: { amount: true } } },
    });
    const linkedByInternal = new Map<string, { total: number; count: number }>();
    for (const r of linkedRows) {
      if (r.internalTxId) {
        const cur = linkedByInternal.get(r.internalTxId) ?? { total: 0, count: 0 };
        cur.total += Number(r.stagingTx.amount);
        cur.count += 1;
        linkedByInternal.set(r.internalTxId, cur);
      }
    }

    for (const p of payments) {
      const internalTxId = `GuestPayment-${p.id}`;
      const linked = linkedByInternal.get(internalTxId) ?? { total: 0, count: 0 };
      const internalAmount = Number(p.amount);
      const remainingAmount = Math.max(0, internalAmount - linked.total);
      if (remainingAmount === 0 && linked.count > 0) continue;
      allFiltered.push({
        internalTxId,
        reference: p.receiptNo,
        name: p.guestName,
        identityNo: p.identityNo,
        amount: internalAmount,
        date: p.paidAt.toISOString().slice(0, 10),
        description: null,
        linkedInfo: {
          linkedCount: linked.count,
          linkedTotalAmount: linked.total,
          remainingAmount,
        },
      });
    }
    dbSkip += payments.length;
    if (payments.length < FETCH_BATCH) break;
  }

  const results = allFiltered.slice(offset, offset + limit);
  const total = allFiltered.length;
  return sendOk(res, results, {
    total,
    limit,
    offset,
    internalSourceType: "GuestPayment",
    _debug: { sourceCode, categoryCode, useBankStatement: false },
  });
});

// List BankStatementTransaction for JAN/BANK — legacy fallback when internal-for-match returns empty
integrationRouter.get("/reconciliation/bank-statement-list", async (req: AuthedRequest, res) => {
  const limit = Math.min(Number(req.query?.limit) || 50, 200);
  const offset = Math.max(0, Math.floor(Number(req.query?.offset) || 0));
  const q = String(req.query?.search ?? "").trim();

  const where: { OR?: object[] } = {};
  if (q.length >= 1) {
    where.OR = [
      { paymentReference: { contains: q } },
      { counterparty: { contains: q } },
      { description: { contains: q } },
    ];
  }

  const txs = await prisma.bankStatementTransaction.findMany({
    where: Object.keys(where).length > 0 ? where : undefined,
    orderBy: { valueDate: "desc" },
    take: limit,
    skip: offset,
    select: { id: true, paymentReference: true, counterparty: true, amount: true, valueDate: true, description: true },
  });

  const internalTxIds = txs.map((t) => `BankStatementTransaction-${t.id}`);
  const linkedRows =
    internalTxIds.length > 0
      ? await prisma.reconciliationResult.findMany({
          where: { internalTxId: { in: internalTxIds }, matchStatus: "MATCHED" },
          include: { stagingTx: { select: { amount: true } } },
        })
      : [];
  const linkedByInternal = new Map<string, { total: number; count: number }>();
  for (const r of linkedRows) {
    if (r.internalTxId) {
      const cur = linkedByInternal.get(r.internalTxId) ?? { total: 0, count: 0 };
      cur.total += Number(r.stagingTx.amount);
      cur.count += 1;
      linkedByInternal.set(r.internalTxId, cur);
    }
  }

  const total = await prisma.bankStatementTransaction.count({
    where: Object.keys(where).length > 0 ? where : undefined,
  });

  const data = txs.map((t) => {
    const internalTxId = `BankStatementTransaction-${t.id}`;
    const linked = linkedByInternal.get(internalTxId) ?? { total: 0, count: 0 };
    const internalAmount = Number(t.amount);
    const remainingAmount = Math.max(0, internalAmount - linked.total);
    return {
      internalTxId,
      reference: t.paymentReference ?? t.counterparty ?? "—",
      name: t.counterparty ?? "—",
      identityNo: null as string | null,
      amount: internalAmount,
      date: t.valueDate.toISOString().slice(0, 10),
      description: t.description ?? null,
      linkedInfo: { linkedCount: linked.count, linkedTotalAmount: linked.total, remainingAmount },
    };
  });

  return sendOk(res, data, { total, limit, offset, internalSourceType: "BankStatement" });
});

// List GuestPayment for PSP Manual Match datatable (paginated, searchable) — legacy, prefer internal-for-match with fileId
integrationRouter.get("/reconciliation/guest-payments", async (req: AuthedRequest, res) => {
  const limit = Math.min(Number(req.query?.limit) || 50, 200);
  const offset = Number(req.query?.offset) || 0;
  const q = String(req.query?.search ?? "").trim();

  const where: { status: string; OR?: object[] } = { status: "success" };
  if (q.length >= 1) {
    const digitsOnly = q.replace(/\D/g, "");
    where.OR =
      digitsOnly.length >= 1
        ? [
            { receiptNo: { contains: q } },
            { guestName: { contains: q } },
            { identityNo: { contains: digitsOnly } },
          ]
        : [{ receiptNo: { contains: q } }, { guestName: { contains: q } }];
  }

  // Fetch in batches, filter out fully-allocated (BAKI 0) records
  const FETCH_BATCH = 200;
  const allFiltered: Array<{
    internalTxId: string;
    reference: string;
    name: string;
    identityNo: string;
    amount: number;
    date: string;
    linkedInfo: { linkedCount: number; linkedTotalAmount: number; remainingAmount: number };
  }> = [];
  let dbSkip = 0;

  while (true) {
    const payments = await prisma.guestPayment.findMany({
      where,
      orderBy: { paidAt: "desc" },
      take: FETCH_BATCH,
      skip: dbSkip,
      select: { id: true, receiptNo: true, guestName: true, identityNo: true, amount: true, paidAt: true },
    });
    if (payments.length === 0) break;

    const internalTxIds = payments.map((p) => `GuestPayment-${p.id}`);
    const linkedRows = await prisma.reconciliationResult.findMany({
      where: { internalTxId: { in: internalTxIds }, matchStatus: "MATCHED" },
      include: { stagingTx: { select: { amount: true } } },
    });
    const linkedByInternal = new Map<string, { total: number; count: number }>();
    for (const r of linkedRows) {
      if (r.internalTxId) {
        const cur = linkedByInternal.get(r.internalTxId) ?? { total: 0, count: 0 };
        cur.total += Number(r.stagingTx.amount);
        cur.count += 1;
        linkedByInternal.set(r.internalTxId, cur);
      }
    }

    for (const p of payments) {
      const internalTxId = `GuestPayment-${p.id}`;
      const linked = linkedByInternal.get(internalTxId) ?? { total: 0, count: 0 };
      const internalAmount = Number(p.amount);
      const remainingAmount = Math.max(0, internalAmount - linked.total);
      if (remainingAmount === 0 && linked.count > 0) continue;
      allFiltered.push({
        internalTxId,
        reference: p.receiptNo,
        name: p.guestName,
        identityNo: p.identityNo,
        amount: internalAmount,
        date: p.paidAt.toISOString().slice(0, 10),
        linkedInfo: {
          linkedCount: linked.count,
          linkedTotalAmount: linked.total,
          remainingAmount,
        },
      });
    }
    dbSkip += payments.length;
    if (payments.length < FETCH_BATCH) break;
  }

  const results = allFiltered.slice(offset, offset + limit);
  const total = allFiltered.length;

  return sendOk(res, results, { total, limit, offset });
});

// Get internal transaction details for Siasat (variance investigation)
integrationRouter.get("/reconciliation/internal-detail", async (req: AuthedRequest, res) => {
  const internalTxId = String(req.query?.internalTxId ?? "").trim();
  if (!internalTxId) {
    return sendError(res, 400, "INVALID_INPUT", "internalTxId required");
  }
  if (internalTxId.startsWith("GuestPayment-")) {
    const id = parseInt(internalTxId.replace("GuestPayment-", ""), 10);
    if (!Number.isInteger(id) || id < 1) {
      return sendError(res, 400, "INVALID_INPUT", "Invalid GuestPayment ID");
    }
    const gp = await prisma.guestPayment.findUnique({
      where: { id },
      select: { id: true, receiptNo: true, guestName: true, identityNo: true, amount: true, paidAt: true },
    });
    if (!gp) return sendError(res, 404, "NOT_FOUND", "GuestPayment not found");
    return sendOk(res, {
      type: "GuestPayment",
      internalTxId: `GuestPayment-${gp.id}`,
      reference: gp.receiptNo,
      name: gp.guestName,
      identityNo: gp.identityNo,
      amount: Number(gp.amount),
      date: gp.paidAt.toISOString().slice(0, 10),
    });
  }
  if (internalTxId.startsWith("BankStatementTransaction-")) {
    const id = parseInt(internalTxId.replace("BankStatementTransaction-", ""), 10);
    if (!Number.isInteger(id) || id < 1) {
      return sendError(res, 400, "INVALID_INPUT", "Invalid BankStatementTransaction ID");
    }
    const bst = await prisma.bankStatementTransaction.findUnique({
      where: { id },
      select: { id: true, paymentReference: true, counterparty: true, amount: true, valueDate: true },
    });
    if (!bst) return sendError(res, 404, "NOT_FOUND", "BankStatementTransaction not found");
    return sendOk(res, {
      type: "BankStatementTransaction",
      internalTxId: `BankStatementTransaction-${bst.id}`,
      reference: bst.paymentReference ?? bst.counterparty ?? "—",
      name: bst.counterparty ?? "—",
      identityNo: null,
      amount: Number(bst.amount),
      date: bst.valueDate.toISOString().slice(0, 10),
    });
  }
  return sendError(res, 400, "INVALID_INPUT", "Invalid internalTxId format");
});

// Get staging tx details for Siasat (duplicate investigation - shows matched row)
integrationRouter.get("/reconciliation/staging-detail", async (req: AuthedRequest, res) => {
  const stagingTxId = Number(req.query?.stagingTxId);
  if (!Number.isInteger(stagingTxId) || stagingTxId < 1) {
    return sendError(res, 400, "INVALID_INPUT", "stagingTxId required");
  }
  const st = await prisma.integrationStagingTx.findUnique({
    where: { id: stagingTxId },
    include: { file: { select: { fileName: true } } },
  });
  if (!st) return sendError(res, 404, "NOT_FOUND", "Staging transaction not found");
  return sendOk(res, {
    type: "IntegrationStagingTx",
    internalTxId: `StagingTx-${st.id}`,
    reference: st.sourceTxRef ?? "—",
    name: st.payerName ?? "—",
    identityNo: st.payerIc ?? null,
    amount: Number(st.amount),
    date: st.txDate.toISOString().slice(0, 10),
    fileName: st.file?.fileName ?? null,
  });
});

const AMOUNT_TOLERANCE = 0.01; // 1% for many-to-one validation

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
