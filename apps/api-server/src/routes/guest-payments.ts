import { Router } from "express";
import { GuestPaymentSource } from "@prisma/client";

import { prisma } from "../prisma.js";
import { sendError, sendOk } from "../utils/responses.js";
import { guestPaymentCreateSchema } from "./schemas.js";

export const guestPaymentsRouter = Router();

function buildReceiptNo() {
  const rand = Math.floor(Math.random() * 9000) + 1000;
  return `GRCPT-${Date.now()}-${rand}`;
}

function normalizeIdentityNo(identityNo: string) {
  return identityNo.replace(/[^A-Za-z0-9]/g, "").toUpperCase();
}

function identityVariants(identityNo: string) {
  const normalized = normalizeIdentityNo(identityNo);
  const variants = new Set<string>([identityNo.trim(), normalized]);
  if (/^\d{12}$/.test(normalized)) {
    variants.add(`${normalized.slice(0, 6)}-${normalized.slice(6, 8)}-${normalized.slice(8)}`);
  }
  return Array.from(variants).filter(Boolean);
}

async function detectExistingIndividualAccount(identityNo: string) {
  const variants = identityVariants(identityNo);
  const payer = await prisma.payerProfile.findFirst({
    where: {
      payerType: "individu",
      status: { not: "merged" },
      OR: [
        { identityNo: { in: variants } },
        { individual: { mykadOrPassport: { in: variants } } },
      ],
    },
    select: { id: true, payerCode: true, displayName: true },
  });
  return payer;
}

guestPaymentsRouter.post("/", async (req, res) => {
  const input = guestPaymentCreateSchema.parse(req.body);
  const normalizedIdentity = normalizeIdentityNo(input.identityNo);

  const row = await prisma.guestPayment.create({
    data: {
      receiptNo: buildReceiptNo(),
      guestName: input.guestName,
      identityNo: normalizedIdentity,
      email: input.email,
      amount: input.amount,
      paymentMethod: `${input.paymentMethod} | Tahun ${input.financialYear}`,
      status: "success",
      source: GuestPaymentSource.ONLINE_GUEST,
    },
  });

  const previousCount = await prisma.guestPayment.count({
    where: {
      identityNo: normalizedIdentity,
      id: { not: row.id },
      status: "success",
    },
  });
  const existingPayer = await detectExistingIndividualAccount(normalizedIdentity);

  return sendOk(res, {
    id: row.id,
    receiptNo: row.receiptNo,
    status: row.status,
    previousTransactionCount: previousCount,
    hasExistingIndividualAccount: Boolean(existingPayer),
    existingPayer: existingPayer
      ? {
          payerCode: existingPayer.payerCode,
          displayName: existingPayer.displayName,
        }
      : null,
  });
});

guestPaymentsRouter.get("/by-identity/:identityNo", async (req, res) => {
  const identityNo = String(req.params.identityNo || "").trim();
  if (!identityNo) return sendError(res, 400, "VALIDATION_ERROR", "Identity number is required");

  const variants = identityVariants(identityNo);
  const payments = await prisma.guestPayment.findMany({
    where: {
      identityNo: { in: variants },
      status: "success",
    },
    orderBy: { paidAt: "desc" },
    take: 100,
  });

  const totalAmount = payments.reduce((sum, row) => sum + Number(row.amount), 0);
  const latestPaidAt = payments[0]?.paidAt?.toISOString() ?? null;

  return sendOk(res, {
    identityNo: normalizeIdentityNo(identityNo),
    totalTransactions: payments.length,
    totalAmount,
    latestPaidAt,
    transactions: payments.map((row) => ({
      id: row.id,
      receiptNo: row.receiptNo,
      guestName: row.guestName,
      identityNo: row.identityNo,
      amount: row.amount.toString(),
      paymentMethod: row.paymentMethod,
      status: row.status,
      paidAt: row.paidAt.toISOString(),
    })),
  });
});

guestPaymentsRouter.get("/:id", async (req, res) => {
  const id = Number(req.params.id);
  const row = await prisma.guestPayment.findUnique({ where: { id } });
  if (!row) return sendError(res, 404, "NOT_FOUND", "Receipt not found");

  const previousCount = await prisma.guestPayment.count({
    where: {
      identityNo: row.identityNo,
      id: { not: row.id },
      status: "success",
    },
  });
  const isCorporate = row.source === "CORPORATE_DIRECT";
  const existingPayer = isCorporate ? null : await detectExistingIndividualAccount(row.identityNo);

  return sendOk(res, {
    id: row.id,
    receiptNo: row.receiptNo,
    guestName: row.guestName,
    identityNo: row.identityNo,
    email: row.email,
    amount: row.amount.toString(),
    paymentMethod: row.paymentMethod,
    status: row.status,
    source: row.source,
    paidAt: row.paidAt.toISOString(),
    previousTransactionCount: isCorporate ? 0 : previousCount,
    hasExistingIndividualAccount: Boolean(existingPayer),
    existingPayer: existingPayer
      ? {
          payerCode: existingPayer.payerCode,
          displayName: existingPayer.displayName,
        }
      : null,
  });
});
