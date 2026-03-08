import fs from "node:fs";
import path from "node:path";

import pkg from "@prisma/client";
const { SpgPayrollBatchStatus, SpgPayrollPaymentChannel } = pkg;
import type { SpgPayrollBatchStatus as SpgPayrollBatchStatusType, SpgPayrollPaymentChannel as SpgPayrollPaymentChannelType } from "@prisma/client";
import { Router } from "express";
import multer from "multer";
import * as XLSX from "xlsx";

import { env } from "../config/env.js";
import { detectSpgEmployeeDuplicate } from "../services/duplicates.js";
import { prisma } from "../prisma.js";
import type { AuthedRequest } from "../types.js";
import { hasRole, writeAuditLog } from "../utils/payer.js";
import { sendError, sendOk } from "../utils/responses.js";
import {
  spgAdminDecisionSchema,
  spgBatchCreateSchema,
  spgBatchesQuerySchema,
  spgEmployeeImportSchema,
  spgEmployeeInputSchema,
  spgOnlineCallbackSchema,
} from "./schemas.js";

type PreviewRow = {
  rowNo: number;
  employeeName: string;
  employeeIdentityNo: string;
  amount: number | null;
  errors: string[];
  agreedAmount: number | null;
  duplicateInFile: boolean;
  duplicateInMonthBatch: boolean;
};

const ONLINE_CHANNELS = new Set<SpgPayrollPaymentChannelType>([
  SpgPayrollPaymentChannel.FPX_B2B,
  SpgPayrollPaymentChannel.CARD,
]);

const slipStorage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, env.uploadDir),
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, `spg-slip-${Date.now()}-${Math.random().toString(36).slice(2, 8)}${ext}`);
  },
});

const slipUpload = multer({
  storage: slipStorage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    const ok = [
      "application/pdf",
      "image/png",
      "image/jpeg",
      "image/webp",
    ].includes(file.mimetype);
    if (!ok) {
      cb(new Error("Only PDF/PNG/JPG/WEBP files are allowed"));
      return;
    }
    cb(null, true);
  },
});

const previewUpload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 },
});

export const spgRouter = Router();

function normalizeIdentity(input: string) {
  return input.replace(/[^A-Za-z0-9]/g, "").toUpperCase();
}

function parsePortalHeader(req: AuthedRequest) {
  const payerIdRaw = req.header("x-payer-id");
  const payerType = String(req.header("x-payer-type") || "").trim();
  const payerId = Number(payerIdRaw);
  if (!Number.isFinite(payerId) || payerId <= 0 || !payerType) {
    return null;
  }
  return { payerId, payerType };
}

async function requirePortalEmployer(req: AuthedRequest, res: Parameters<typeof sendError>[0], expectedEmployerPayerId?: number) {
  const portal = parsePortalHeader(req);
  if (!portal) {
    sendError(res, 401, "UNAUTHORIZED", "Portal session header is required");
    return null;
  }
  if (!["korporat", "majikan_spg"].includes(portal.payerType)) {
    sendError(res, 403, "FORBIDDEN", "Corporate portal access required");
    return null;
  }
  if (expectedEmployerPayerId && portal.payerId !== expectedEmployerPayerId) {
    sendError(res, 403, "FORBIDDEN", "Employer mismatch");
    return null;
  }

  const employer = await prisma.payerProfile.findUnique({
    where: { id: portal.payerId },
    select: { id: true, payerType: true, displayName: true },
  });
  if (!employer || !["korporat", "majikan_spg"].includes(employer.payerType)) {
    sendError(res, 404, "NOT_FOUND", "Employer profile not found");
    return null;
  }
  if (expectedEmployerPayerId && employer.id !== expectedEmployerPayerId) {
    sendError(res, 403, "FORBIDDEN", "Employer mismatch");
    return null;
  }
  return employer;
}

function parseWorkbookRows(buffer: Buffer, filename: string) {
  const workbook = XLSX.read(buffer, { type: "buffer" });
  const firstSheetName = workbook.SheetNames[0];
  if (!firstSheetName) throw new Error("No worksheet found");
  const worksheet = workbook.Sheets[firstSheetName];
  const rows = XLSX.utils.sheet_to_json<Record<string, unknown>>(worksheet, { defval: "" });

  const required = ["Name", "IC No", "Amount"];
  const headers = rows.length > 0 ? Object.keys(rows[0] || {}) : [];
  const missing = required.filter((name) => !headers.includes(name));
  if (missing.length > 0) {
    throw new Error(`Missing required columns: ${missing.join(", ")}`);
  }

  if (rows.length > 2000) {
    throw new Error("Maximum 2000 rows per upload");
  }

  return rows.map((raw, idx) => ({
    rowNo: idx + 2,
    employeeName: String(raw["Name"] || "").trim(),
    employeeIdentityNo: normalizeIdentity(String(raw["IC No"] || "").trim()),
    amountText: String(raw["Amount"] || "").trim(),
    sourceFile: filename,
  }));
}

async function annotatePreviewRows(input: Array<{
  rowNo: number;
  employeeName: string;
  employeeIdentityNo: string;
  amountText?: string;
  amount?: number;
}>, employerPayerId: number, month: number, year: number) {
  const normalizedIds = input.map((x) => x.employeeIdentityNo).filter(Boolean);
  const existing = normalizedIds.length
    ? await prisma.spgPayrollLine.findMany({
        where: {
          employeeIdentityNo: { in: normalizedIds },
          batch: {
            employerPayerId,
            month,
            year,
          },
        },
        select: { employeeIdentityNo: true },
      })
    : [];
  const existingSet = new Set(existing.map((x) => normalizeIdentity(x.employeeIdentityNo)));

  // Lookup agreed deduction amounts from SpgEmployee records
  const agreedRecords = normalizedIds.length
    ? await prisma.spgEmployee.findMany({
        where: { employerPayerId, employeeIdentityNo: { in: normalizedIds } },
        select: { employeeIdentityNo: true, deductionAmount: true },
      })
    : [];
  const agreedMap = new Map<string, number>();
  for (const emp of agreedRecords) {
    if (emp.deductionAmount != null) {
      agreedMap.set(normalizeIdentity(emp.employeeIdentityNo), Number(emp.deductionAmount));
    }
  }

  const inFileCount = new Map<string, number>();
  for (const row of input) {
    if (!row.employeeIdentityNo) continue;
    const key = normalizeIdentity(row.employeeIdentityNo);
    inFileCount.set(key, (inFileCount.get(key) || 0) + 1);
  }

  const result: PreviewRow[] = input.map((row) => {
    const errors: string[] = [];
    if (!row.employeeName) errors.push("Name is required");
    if (!row.employeeIdentityNo || row.employeeIdentityNo.length < 3) errors.push("IC No is required");

    const amount = typeof row.amount === "number"
      ? row.amount
      : Number((row.amountText || "0").replace(/,/g, ""));
    if (!Number.isFinite(amount) || amount <= 0) {
      errors.push("Amount must be greater than 0");
    } else if (!Number.isInteger(amount * 100)) {
      errors.push("Amount supports max 2 decimal places");
    }

    const key = normalizeIdentity(row.employeeIdentityNo || "");
    const duplicateInFile = key.length > 0 && (inFileCount.get(key) || 0) > 1;
    const duplicateInMonthBatch = key.length > 0 && existingSet.has(key);

    // Check against agreed deduction amount
    const agreed = agreedMap.get(key) ?? null;
    if (agreed !== null && Number.isFinite(amount) && amount !== agreed) {
      errors.push(`Amaun tidak sepadan dengan perjanjian (RM ${agreed.toFixed(2)})`);
    }

    return {
      rowNo: row.rowNo,
      employeeName: row.employeeName,
      employeeIdentityNo: key,
      amount: Number.isFinite(amount) ? amount : null,
      errors,
      agreedAmount: agreed,
      duplicateInFile,
      duplicateInMonthBatch,
    };
  });

  return result;
}

function buildBatchReferenceNo() {
  const timePart = Date.now().toString(36).toUpperCase();
  const randPart = Math.random().toString(36).slice(2, 6).toUpperCase();
  return `SPG-${timePart}-${randPart}`;
}

function buildSpgReceiptNo() {
  const rand = Math.floor(Math.random() * 9000) + 1000;
  return `SPGRCPT-${Date.now()}-${rand}`;
}

spgRouter.get("/template", (req, res) => {
  const format = String(req.query.format || "xlsx").toLowerCase();
  const rows = [
    { "Name": "Ahmad bin Ali", "IC No": "900101011234", "Amount": 125.5 },
    { "Name": "Siti binti Hassan", "IC No": "880305105678", "Amount": 200.0 },
  ];

  if (format === "csv") {
    const csv = ["Name,IC No,Amount", ...rows.map((r) => `${r["Name"]},${r["IC No"]},${r["Amount"]}`)].join("\n");
    res.setHeader("Content-Type", "text/csv; charset=utf-8");
    res.setHeader("Content-Disposition", "attachment; filename=spg-template.csv");
    res.send(csv);
    return;
  }

  const ws = XLSX.utils.json_to_sheet(rows);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "SPG Template");
  const buffer = XLSX.write(wb, { type: "buffer", bookType: "xlsx" });
  res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
  res.setHeader("Content-Disposition", "attachment; filename=spg-template.xlsx");
  res.send(buffer);
});

spgRouter.post("/batches/preview", previewUpload.single("file"), async (req: AuthedRequest, res) => {
  const employerPayerId = Number(req.body?.employerPayerId);
  const month = Number(req.body?.month);
  const year = Number(req.body?.year);
  const file = req.file;
  if (!Number.isFinite(employerPayerId) || !Number.isFinite(month) || !Number.isFinite(year)) {
    return sendError(res, 400, "VALIDATION_ERROR", "employerPayerId, month and year are required");
  }
  if (!file) return sendError(res, 400, "VALIDATION_ERROR", "Upload file is required");

  const employer = await requirePortalEmployer(req, res, employerPayerId);
  if (!employer) return;

  try {
    const parsed = parseWorkbookRows(file.buffer, file.originalname);
    const preview = await annotatePreviewRows(parsed, employerPayerId, month, year);
    const validRows = preview.filter((x) => x.errors.length === 0);
    const totalAmount = validRows.reduce((sum, x) => sum + Number(x.amount || 0), 0);
    const invalidCount = preview.filter((x) => x.errors.length > 0).length;
    const duplicateCount = preview.filter((x) => x.duplicateInFile || x.duplicateInMonthBatch).length;

    await writeAuditLog({
      entityName: "spg_payroll_batch_preview",
      entityId: String(employerPayerId),
      action: "PREVIEW_UPLOAD",
      targetPayerId: employerPayerId,
      newValueJson: { file: file.originalname, month, year, rowCount: preview.length },
      ipAddress: req.ip,
    });

    return sendOk(res, {
      employerPayerId,
      month,
      year,
      rows: preview,
      totals: {
        rowCount: preview.length,
        validRowCount: validRows.length,
        invalidRowCount: invalidCount,
        duplicateRowCount: duplicateCount,
        totalAmount,
      },
    });
  } catch (error) {
    return sendError(res, 400, "VALIDATION_ERROR", error instanceof Error ? error.message : "Failed to parse upload");
  }
});

spgRouter.post("/batches/revalidate", async (req: AuthedRequest, res) => {
  const { month, year, rows: inputRows } = req.body || {};
  if (!Number.isFinite(Number(month)) || !Number.isFinite(Number(year))) {
    return sendError(res, 400, "VALIDATION_ERROR", "month and year are required");
  }
  if (!Array.isArray(inputRows) || inputRows.length === 0) {
    return sendError(res, 400, "VALIDATION_ERROR", "rows array is required");
  }
  const employer = await requirePortalEmployer(req, res);
  if (!employer) return;
  const employerPayerId = employer.id;

  const parsed = inputRows.map((r: { employeeName?: string; employeeIdentityNo?: string; amount?: number }, idx: number) => ({
    rowNo: idx + 1,
    employeeName: String(r.employeeName || "").trim(),
    employeeIdentityNo: normalizeIdentity(String(r.employeeIdentityNo || "")),
    amount: Number(r.amount) || 0,
  }));

  const preview = await annotatePreviewRows(parsed, employerPayerId, Number(month), Number(year));
  const validRows = preview.filter((x) => x.errors.length === 0);
  const totalAmount = validRows.reduce((sum, x) => sum + Number(x.amount || 0), 0);

  return sendOk(res, {
    employerPayerId,
    month: Number(month),
    year: Number(year),
    rows: preview,
    totals: {
      rowCount: preview.length,
      validRowCount: validRows.length,
      invalidRowCount: preview.filter((x) => x.errors.length > 0).length,
      duplicateRowCount: preview.filter((x) => x.duplicateInFile || x.duplicateInMonthBatch).length,
      totalAmount,
    },
  });
});

spgRouter.post("/batches", slipUpload.single("supportingSlip"), async (req: AuthedRequest, res) => {
  const parsedRowsRaw = (() => {
    try {
      return JSON.parse(String(req.body?.rows || "[]"));
    } catch {
      return null;
    }
  })();
  if (!Array.isArray(parsedRowsRaw)) {
    return sendError(res, 400, "VALIDATION_ERROR", "rows must be a valid JSON array");
  }

  const payload = spgBatchCreateSchema.safeParse({
    employerPayerId: Number(req.body?.employerPayerId),
    month: Number(req.body?.month),
    year: Number(req.body?.year),
    paymentChannel: req.body?.paymentChannel,
    rows: parsedRowsRaw,
  });
  if (!payload.success) {
    return sendError(res, 400, "VALIDATION_ERROR", payload.error.issues.map((x) => x.message).join(", "));
  }
  const input = payload.data;

  const employer = await requirePortalEmployer(req, res, input.employerPayerId);
  if (!employer) return;

  if (input.paymentChannel === "CHEQUE" && !req.file) {
    return sendError(res, 400, "VALIDATION_ERROR", "Supporting slip is required for cheque payment");
  }

  const normalizedRows = input.rows.map((row, idx) => ({
    rowNo: idx + 1,
    employeeName: row.employeeName.trim(),
    employeeIdentityNo: normalizeIdentity(row.employeeIdentityNo),
    amount: row.amount,
  }));

  const annotated = await annotatePreviewRows(normalizedRows, input.employerPayerId, input.month, input.year);
  const invalid = annotated.filter((x) => x.errors.length > 0 || x.duplicateInFile || x.duplicateInMonthBatch);
  if (invalid.length > 0) {
    return sendError(res, 400, "VALIDATION_ERROR", "Rows contain validation errors or duplicates. Please fix before submit.");
  }

  const totalAmount = annotated.reduce((sum, row) => sum + Number(row.amount || 0), 0);
  const status: SpgPayrollBatchStatusType = ONLINE_CHANNELS.has(input.paymentChannel)
    ? SpgPayrollBatchStatus.awaiting_online_payment
    : SpgPayrollBatchStatus.pending_payment;

  const supportingSlipUrl = req.file ? `/uploads/${req.file.filename}` : null;
  const batch = await prisma.$transaction(async (tx) => {
    const created = await tx.spgPayrollBatch.create({
      data: {
        referenceNo: buildBatchReferenceNo(),
        employerPayerId: input.employerPayerId,
        month: input.month,
        year: input.year,
        paymentChannel: input.paymentChannel,
        status,
        currency: "MYR",
        totalAmount,
        rowCount: annotated.length,
        supportingSlipUrl,
        submittedAt: new Date(),
      },
    });

    await tx.spgPayrollLine.createMany({
      data: annotated.map((row) => ({
        batchId: created.id,
        employeeName: row.employeeName,
        employeeIdentityNo: row.employeeIdentityNo,
        amount: Number(row.amount),
        isDuplicateInFile: row.duplicateInFile,
        isDuplicateInMonthBatch: row.duplicateInMonthBatch,
        validationJson: row.errors.length > 0 ? row.errors : undefined,
      })),
    });

    await tx.spgPayrollStatusHistory.create({
      data: {
        batchId: created.id,
        oldStatus: null,
        newStatus: status,
        changedBy: req.auth?.userId ?? null,
        reason: status === SpgPayrollBatchStatus.pending_payment
          ? "Submitted and waiting payment verification"
          : "Submitted and waiting online payment",
      },
    });
    return created;
  });

  await writeAuditLog({
    entityName: "spg_payroll_batch",
    entityId: String(batch.id),
    action: "CREATE",
    targetPayerId: batch.employerPayerId,
    newValueJson: {
      batchId: batch.id,
      referenceNo: batch.referenceNo,
      paymentChannel: batch.paymentChannel,
      status: batch.status,
      rowCount: batch.rowCount,
      totalAmount,
    },
    performedBy: req.auth?.userId,
    ipAddress: req.ip,
  });

  return sendOk(res, {
    batchId: batch.id,
    referenceNo: batch.referenceNo,
    status: batch.status,
    nextAction: ONLINE_CHANNELS.has(batch.paymentChannel)
      ? { type: "online_payment", endpoint: `/api/spg/batches/${batch.id}/pay/online/initiate` }
      : { type: "pending_reference", endpoint: `/payer/corporate/spg/${batch.id}/summary` },
  });
});

spgRouter.post("/batches/:batchId/pay/online/initiate", async (req: AuthedRequest, res) => {
  const batchId = Number(req.params.batchId);
  if (!Number.isFinite(batchId)) return sendError(res, 400, "VALIDATION_ERROR", "Invalid batch id");

  const batch = await prisma.spgPayrollBatch.findUnique({ where: { id: batchId } });
  if (!batch) return sendError(res, 404, "NOT_FOUND", "SPG batch not found");

  const employer = await requirePortalEmployer(req, res, batch.employerPayerId);
  if (!employer) return;

  if (!ONLINE_CHANNELS.has(batch.paymentChannel)) {
    return sendError(res, 400, "VALIDATION_ERROR", "Online initiate is only for FPX_B2B or CARD");
  }
  if (batch.status !== SpgPayrollBatchStatus.awaiting_online_payment) {
    return sendError(res, 400, "VALIDATION_ERROR", "Batch is not awaiting online payment");
  }

  const paymentToken = `MOCKPAY-${batch.id}-${Date.now()}`;
  const redirectUrl = `/payer/corporate/spg/${batch.id}/summary?mode=online&token=${paymentToken}`;

  await writeAuditLog({
    entityName: "spg_payroll_batch",
    entityId: String(batch.id),
    action: "ONLINE_INITIATE",
    targetPayerId: batch.employerPayerId,
    newValueJson: { paymentToken },
    ipAddress: req.ip,
  });

  return sendOk(res, { paymentToken, redirectUrl });
});

spgRouter.post("/batches/:batchId/pay/online/callback", async (req: AuthedRequest, res) => {
  const batchId = Number(req.params.batchId);
  if (!Number.isFinite(batchId)) return sendError(res, 400, "VALIDATION_ERROR", "Invalid batch id");
  const payload = spgOnlineCallbackSchema.parse(req.body);

  const batch = await prisma.spgPayrollBatch.findUnique({ where: { id: batchId } });
  if (!batch) return sendError(res, 404, "NOT_FOUND", "SPG batch not found");
  const employer = await requirePortalEmployer(req, res, batch.employerPayerId);
  if (!employer) return;

  const nextStatus: SpgPayrollBatchStatusType = payload.result === "success"
    ? SpgPayrollBatchStatus.paid_success
    : SpgPayrollBatchStatus.paid_failed;

  const updated = await prisma.$transaction(async (tx) => {
    const row = await tx.spgPayrollBatch.update({
      where: { id: batch.id },
      data: {
        status: nextStatus,
        paidAt: nextStatus === SpgPayrollBatchStatus.paid_success ? new Date() : null,
        officialReceiptNo: nextStatus === SpgPayrollBatchStatus.paid_success
          ? batch.officialReceiptNo ?? buildSpgReceiptNo()
          : null,
      },
    });

    await tx.spgPayrollStatusHistory.create({
      data: {
        batchId: batch.id,
        oldStatus: batch.status,
        newStatus: nextStatus,
        changedBy: req.auth?.userId ?? null,
        reason: payload.reason || (nextStatus === SpgPayrollBatchStatus.paid_success ? "Online payment callback success" : "Online payment callback failed"),
      },
    });

    if (nextStatus === SpgPayrollBatchStatus.paid_success) {
      await tx.spgPayrollReceipt.upsert({
        where: { batchId: batch.id },
        update: { receiptNo: row.officialReceiptNo || buildSpgReceiptNo(), issuedAt: new Date() },
        create: { batchId: batch.id, receiptNo: row.officialReceiptNo || buildSpgReceiptNo() },
      });
    }
    return row;
  });

  await writeAuditLog({
    entityName: "spg_payroll_batch",
    entityId: String(batch.id),
    action: "ONLINE_CALLBACK",
    targetPayerId: batch.employerPayerId,
    oldValueJson: { status: batch.status },
    newValueJson: { status: updated.status, result: payload.result },
    ipAddress: req.ip,
  });

  return sendOk(res, {
    batchId: updated.id,
    status: updated.status,
    officialReceiptNo: updated.officialReceiptNo,
  });
});

spgRouter.get("/batches", async (req: AuthedRequest, res) => {
  const query = spgBatchesQuerySchema.parse(req.query);
  const employer = await requirePortalEmployer(req, res, query.employerPayerId);
  if (!employer) return;

  const rows = await prisma.spgPayrollBatch.findMany({
    where: {
      employerPayerId: query.employerPayerId,
      ...(query.month ? { month: query.month } : {}),
      ...(query.year ? { year: query.year } : {}),
      ...(query.status ? { status: query.status } : {}),
      ...(query.paymentChannel ? { paymentChannel: query.paymentChannel } : {}),
    },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      referenceNo: true,
      month: true,
      year: true,
      paymentChannel: true,
      status: true,
      totalAmount: true,
      rowCount: true,
      submittedAt: true,
      paidAt: true,
      officialReceiptNo: true,
      createdAt: true,
    },
  });

  return sendOk(res, rows);
});

spgRouter.get("/batches/:batchId", async (req: AuthedRequest, res) => {
  const batchId = Number(req.params.batchId);
  if (!Number.isFinite(batchId)) return sendError(res, 400, "VALIDATION_ERROR", "Invalid batch id");
  const batch = await prisma.spgPayrollBatch.findUnique({
    where: { id: batchId },
    include: {
      lines: {
        orderBy: { id: "asc" },
      },
      statusHistory: {
        orderBy: { changedAt: "asc" },
      },
      receipt: true,
      employer: {
        select: { id: true, displayName: true, payerCode: true, identityNo: true, email: true },
      },
    },
  });
  if (!batch) return sendError(res, 404, "NOT_FOUND", "SPG batch not found");

  const employer = await requirePortalEmployer(req, res, batch.employerPayerId);
  if (!employer) return;

  const duplicateSummary = {
    duplicateInFileCount: batch.lines.filter((x) => x.isDuplicateInFile).length,
    duplicateInMonthBatchCount: batch.lines.filter((x) => x.isDuplicateInMonthBatch).length,
  };

  return sendOk(res, { ...batch, duplicateSummary });
});

spgRouter.get("/batches/:batchId/receipt", async (req: AuthedRequest, res) => {
  const batchId = Number(req.params.batchId);
  if (!Number.isFinite(batchId)) return sendError(res, 400, "VALIDATION_ERROR", "Invalid batch id");
  const batch = await prisma.spgPayrollBatch.findUnique({
    where: { id: batchId },
    include: { lines: true, receipt: true, employer: { select: { displayName: true, payerCode: true, identityNo: true } } },
  });
  if (!batch) return sendError(res, 404, "NOT_FOUND", "SPG batch not found");
  const employer = await requirePortalEmployer(req, res, batch.employerPayerId);
  if (!employer) return;

  if (batch.status !== SpgPayrollBatchStatus.paid_success) {
    return sendError(res, 400, "VALIDATION_ERROR", "Official receipt is only available for paid_success batches");
  }

  return sendOk(res, {
    batchId: batch.id,
    referenceNo: batch.referenceNo,
    receiptNo: batch.receipt?.receiptNo || batch.officialReceiptNo,
    employerName: batch.employer.displayName,
    employerCode: batch.employer.payerCode,
    employerIdentityNo: batch.employer.identityNo,
    month: batch.month,
    year: batch.year,
    paymentChannel: batch.paymentChannel,
    totalAmount: Number(batch.totalAmount),
    rowCount: batch.rowCount,
    paidAt: batch.paidAt?.toISOString() ?? null,
    issuedAt: batch.receipt?.issuedAt?.toISOString() ?? null,
    lines: batch.lines.map((x) => ({
      id: x.id,
      employeeName: x.employeeName,
      employeeIdentityNo: x.employeeIdentityNo,
      amount: Number(x.amount),
    })),
  });
});

spgRouter.get("/admin/pending-batches", async (req: AuthedRequest, res) => {
  if (!req.auth) return sendError(res, 401, "UNAUTHORIZED", "Authentication required");
  const user = await prisma.user.findUnique({ where: { id: req.auth.userId }, select: { role: true } });
  if (!user || !hasRole(user.role, ["penyelia", "eksekutif pemprosesan", "admin"])) {
    return sendError(res, 403, "FORBIDDEN", "You do not have permission");
  }

  const rows = await prisma.spgPayrollBatch.findMany({
    where: { status: SpgPayrollBatchStatus.pending_payment },
    orderBy: { submittedAt: "desc" },
    include: {
      employer: { select: { id: true, displayName: true, payerCode: true } },
    },
  });
  return sendOk(res, rows);
});

spgRouter.get("/admin/batches/:batchId", async (req: AuthedRequest, res) => {
  if (!req.auth) return sendError(res, 401, "UNAUTHORIZED", "Authentication required");
  const user = await prisma.user.findUnique({ where: { id: req.auth.userId }, select: { role: true } });
  if (!user || !hasRole(user.role, ["penyelia", "eksekutif pemprosesan", "admin"])) {
    return sendError(res, 403, "FORBIDDEN", "You do not have permission");
  }

  const batchId = Number(req.params.batchId);
  if (!Number.isFinite(batchId)) return sendError(res, 400, "VALIDATION_ERROR", "Invalid batch id");

  const batch = await prisma.spgPayrollBatch.findUnique({
    where: { id: batchId },
    include: {
      lines: {
        orderBy: { id: "asc" },
      },
      statusHistory: {
        orderBy: { changedAt: "asc" },
      },
      receipt: true,
      employer: {
        select: { id: true, displayName: true, payerCode: true, identityNo: true, email: true },
      },
    },
  });
  if (!batch) return sendError(res, 404, "NOT_FOUND", "SPG batch not found");

  const duplicateSummary = {
    duplicateInFileCount: batch.lines.filter((x) => x.isDuplicateInFile).length,
    duplicateInMonthBatchCount: batch.lines.filter((x) => x.isDuplicateInMonthBatch).length,
  };

  return sendOk(res, { ...batch, duplicateSummary });
});

spgRouter.post("/admin/batches/:batchId/approve", async (req: AuthedRequest, res) => {
  if (!req.auth) return sendError(res, 401, "UNAUTHORIZED", "Authentication required");
  const user = await prisma.user.findUnique({ where: { id: req.auth.userId }, select: { role: true } });
  if (!user || !hasRole(user.role, ["penyelia", "eksekutif pemprosesan", "admin"])) {
    return sendError(res, 403, "FORBIDDEN", "You do not have permission");
  }

  const batchId = Number(req.params.batchId);
  if (!Number.isFinite(batchId)) return sendError(res, 400, "VALIDATION_ERROR", "Invalid batch id");
  const batch = await prisma.spgPayrollBatch.findUnique({ where: { id: batchId } });
  if (!batch) return sendError(res, 404, "NOT_FOUND", "SPG batch not found");
  if (batch.status !== SpgPayrollBatchStatus.pending_payment) {
    return sendError(res, 400, "VALIDATION_ERROR", "Only pending_payment batch can be approved");
  }
  const payload = spgAdminDecisionSchema.parse(req.body ?? {});

  const updated = await prisma.$transaction(async (tx) => {
    const receiptNo = batch.officialReceiptNo || buildSpgReceiptNo();
    const row = await tx.spgPayrollBatch.update({
      where: { id: batchId },
      data: {
        status: SpgPayrollBatchStatus.paid_success,
        paidAt: new Date(),
        officialReceiptNo: receiptNo,
      },
    });
    await tx.spgPayrollReceipt.upsert({
      where: { batchId },
      update: { receiptNo, issuedAt: new Date() },
      create: { batchId, receiptNo, issuedAt: new Date() },
    });
    await tx.spgPayrollStatusHistory.create({
      data: {
        batchId,
        oldStatus: batch.status,
        newStatus: SpgPayrollBatchStatus.paid_success,
        changedBy: req.auth?.userId,
        reason: payload.reason || "Approved by admin verification",
      },
    });
    return row;
  });

  await writeAuditLog({
    entityName: "spg_payroll_batch",
    entityId: String(batchId),
    action: "ADMIN_APPROVE",
    targetPayerId: batch.employerPayerId,
    oldValueJson: { status: batch.status },
    newValueJson: { status: updated.status },
    performedBy: req.auth.userId,
    ipAddress: req.ip,
  });

  return sendOk(res, {
    batchId: updated.id,
    status: updated.status,
    officialReceiptNo: updated.officialReceiptNo,
  });
});

spgRouter.post("/admin/batches/:batchId/reject", async (req: AuthedRequest, res) => {
  if (!req.auth) return sendError(res, 401, "UNAUTHORIZED", "Authentication required");
  const user = await prisma.user.findUnique({ where: { id: req.auth.userId }, select: { role: true } });
  if (!user || !hasRole(user.role, ["penyelia", "eksekutif pemprosesan", "admin"])) {
    return sendError(res, 403, "FORBIDDEN", "You do not have permission");
  }

  const batchId = Number(req.params.batchId);
  if (!Number.isFinite(batchId)) return sendError(res, 400, "VALIDATION_ERROR", "Invalid batch id");
  const batch = await prisma.spgPayrollBatch.findUnique({ where: { id: batchId } });
  if (!batch) return sendError(res, 404, "NOT_FOUND", "SPG batch not found");
  const payload = spgAdminDecisionSchema.parse(req.body ?? {});

  const updated = await prisma.$transaction(async (tx) => {
    const row = await tx.spgPayrollBatch.update({
      where: { id: batchId },
      data: {
        status: SpgPayrollBatchStatus.paid_failed,
        paidAt: null,
      },
    });
    await tx.spgPayrollStatusHistory.create({
      data: {
        batchId,
        oldStatus: batch.status,
        newStatus: SpgPayrollBatchStatus.paid_failed,
        changedBy: req.auth?.userId,
        reason: payload.reason || "Rejected by admin verification",
      },
    });
    return row;
  });

  await writeAuditLog({
    entityName: "spg_payroll_batch",
    entityId: String(batchId),
    action: "ADMIN_REJECT",
    targetPayerId: batch.employerPayerId,
    oldValueJson: { status: batch.status },
    newValueJson: { status: updated.status },
    performedBy: req.auth.userId,
    ipAddress: req.ip,
  });

  return sendOk(res, { batchId: updated.id, status: updated.status });
});

// Legacy SPG employee endpoints (admin/internal)
spgRouter.get("/employers/:payerId/employees", async (req, res) => {
  const payerId = Number(req.params.payerId);
  const employer = await prisma.payerProfile.findUnique({ where: { id: payerId } });
  if (!employer || employer.payerType !== "majikan_spg") {
    return sendError(res, 404, "NOT_FOUND", "SPG employer not found");
  }

  const rows = await prisma.spgEmployee.findMany({
    where: { employerPayerId: payerId },
    orderBy: { createdAt: "desc" },
  });
  return sendOk(res, rows);
});

spgRouter.post("/employers/:payerId/employees", async (req: AuthedRequest, res) => {
  const payerId = Number(req.params.payerId);
  const input = spgEmployeeInputSchema.parse(req.body);
  const employer = await prisma.payerProfile.findUnique({ where: { id: payerId } });
  if (!employer || employer.payerType !== "majikan_spg") {
    return sendError(res, 404, "NOT_FOUND", "SPG employer not found");
  }

  const employee = await prisma.spgEmployee.create({
    data: {
      employerPayerId: payerId,
      employeeIdentityNo: input.employeeIdentityNo,
      employeeName: input.employeeName,
      employeeEmail: input.employeeEmail,
      employeePhone: input.employeePhone,
      deductionAmount: input.deductionAmount,
      employmentStatus: input.employmentStatus,
    },
  });

  const duplicateCase = await detectSpgEmployeeDuplicate({
    employeeId: employee.id,
    detectedBy: req.auth?.userId,
    source: "manual",
  });

  await writeAuditLog({
    entityName: "spg_employee",
    entityId: String(employee.id),
    action: "CREATE",
    targetPayerId: payerId,
    newValueJson: employee,
    performedBy: req.auth?.userId,
    ipAddress: req.ip,
  });

  return sendOk(res, { employee, duplicateCase });
});

spgRouter.post("/employers/:payerId/employees/import", async (req: AuthedRequest, res) => {
  const payerId = Number(req.params.payerId);
  const input = spgEmployeeImportSchema.parse(req.body);

  const employer = await prisma.payerProfile.findUnique({ where: { id: payerId } });
  if (!employer || employer.payerType !== "majikan_spg") {
    return sendError(res, 404, "NOT_FOUND", "SPG employer not found");
  }

  const created = [];
  const duplicateCases = [];
  for (const row of input.employees) {
    const employee = await prisma.spgEmployee.create({
      data: {
        employerPayerId: payerId,
        employeeIdentityNo: row.employeeIdentityNo,
        employeeName: row.employeeName,
        employeeEmail: row.employeeEmail,
        employeePhone: row.employeePhone,
        deductionAmount: row.deductionAmount,
        employmentStatus: row.employmentStatus,
      },
    });
    created.push(employee);
    const dup = await detectSpgEmployeeDuplicate({
      employeeId: employee.id,
      detectedBy: req.auth?.userId,
      source: "spg_import",
    });
    if (dup) duplicateCases.push(dup);
  }

  await writeAuditLog({
    entityName: "spg_employee_import",
    entityId: String(payerId),
    action: "IMPORT",
    targetPayerId: payerId,
    newValueJson: { imported: created.length, duplicateCases: duplicateCases.length },
    performedBy: req.auth?.userId,
    ipAddress: req.ip,
  });

  return sendOk(res, { imported: created.length, duplicateCases: duplicateCases.length, rows: created });
});

spgRouter.put("/employees/:id", async (req: AuthedRequest, res) => {
  const id = Number(req.params.id);
  const input = spgEmployeeInputSchema.partial().parse(req.body);
  const existing = await prisma.spgEmployee.findUnique({ where: { id } });
  if (!existing) return sendError(res, 404, "NOT_FOUND", "SPG employee not found");

  const updated = await prisma.spgEmployee.update({
    where: { id },
    data: {
      ...(input.employeeIdentityNo !== undefined ? { employeeIdentityNo: input.employeeIdentityNo } : {}),
      ...(input.employeeName !== undefined ? { employeeName: input.employeeName } : {}),
      ...(input.employeeEmail !== undefined ? { employeeEmail: input.employeeEmail } : {}),
      ...(input.employeePhone !== undefined ? { employeePhone: input.employeePhone } : {}),
      ...(input.deductionAmount !== undefined ? { deductionAmount: input.deductionAmount } : {}),
      ...(input.employmentStatus !== undefined ? { employmentStatus: input.employmentStatus } : {}),
    },
  });

  await writeAuditLog({
    entityName: "spg_employee",
    entityId: String(updated.id),
    action: "UPDATE",
    targetPayerId: updated.employerPayerId,
    oldValueJson: existing,
    newValueJson: updated,
    performedBy: req.auth?.userId,
    ipAddress: req.ip,
  });

  return sendOk(res, updated);
});

spgRouter.delete("/batches/:batchId/slip-file", async (req: AuthedRequest, res) => {
  const batchId = Number(req.params.batchId);
  if (!Number.isFinite(batchId)) return sendError(res, 400, "VALIDATION_ERROR", "Invalid batch id");
  const batch = await prisma.spgPayrollBatch.findUnique({ where: { id: batchId } });
  if (!batch) return sendError(res, 404, "NOT_FOUND", "SPG batch not found");
  if (!batch.supportingSlipUrl) return sendOk(res, { success: true });

  const employer = await requirePortalEmployer(req, res, batch.employerPayerId);
  if (!employer) return;

  const filePath = path.join(env.uploadDir, path.basename(batch.supportingSlipUrl));
  try {
    fs.unlinkSync(filePath);
  } catch {
    // no-op
  }
  await prisma.spgPayrollBatch.update({
    where: { id: batchId },
    data: { supportingSlipUrl: null },
  });
  return sendOk(res, { success: true });
});




