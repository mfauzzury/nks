import pkg from "@prisma/client";
const { ReconciliationMatchStatus } = pkg;
import type { ReconciliationMatchStatus as ReconciliationMatchStatusType } from "@prisma/client";
import { Decimal } from "@prisma/client/runtime/library";
import { prisma } from "../prisma.js";

const DATE_TOLERANCE_DAYS = 3;
/** Wider tolerance for variance detection: same IC but amount differs (GuestPayment may have been seeded earlier) */
const VARIANCE_DATE_TOLERANCE_DAYS = 90;

// PSP → GuestPayment | JAN, BANK → BankStatement
const SOURCES_USE_GUEST_PAYMENT = ["PSP"];
const SOURCES_USE_BANK_STATEMENT = ["SPG", "BANK"]; // SPG=JAN, BANK=Bank Islam/Maybank

function normalizeIc(ic: string | null): string {
  if (!ic) return "";
  return ic.replace(/\D/g, "").slice(0, 14);
}

function normalizeAmount(amount: number | Decimal): number {
  return typeof amount === "number" ? amount : Number(amount);
}

function normalizeRef(ref: string | null): string {
  if (!ref) return "";
  return ref.trim().replace(/\s+/g, "");
}

function dateWithinTolerance(d1: Date, d2: Date, days: number): boolean {
  const ms = Math.abs(d1.getTime() - d2.getTime());
  return ms <= days * 24 * 60 * 60 * 1000;
}

export interface ReconciliationRunResult {
  matched: number;
  unmatched: number;
  mismatch: number;
  duplicate: number;
}

function useBankStatement(categoryCode: string | null): boolean {
  return SOURCES_USE_BANK_STATEMENT.includes(categoryCode ?? "");
}

function useGuestPayment(categoryCode: string | null): boolean {
  return SOURCES_USE_GUEST_PAYMENT.includes(categoryCode ?? "");
}

// -----------------------------------------------------------------------------
// In-memory lookup structures (preloaded once per run)
// -----------------------------------------------------------------------------

interface GuestPaymentRow {
  id: number;
  receiptNo: string;
  guestName: string;
  identityNo: string | null;
  amount: Decimal;
  paidAt: Date;
}

interface GuestPaymentLookup {
  byReceiptNo: Map<string, GuestPaymentRow[]>;
  byAmount: Map<string, GuestPaymentRow[]>;
  byIc: Map<string, GuestPaymentRow[]>;
  all: GuestPaymentRow[];
}

function buildGuestPaymentLookup(payments: GuestPaymentRow[]): GuestPaymentLookup {
  const byReceiptNo = new Map<string, GuestPaymentRow[]>();
  const byAmount = new Map<string, GuestPaymentRow[]>();
  const byIc = new Map<string, GuestPaymentRow[]>();

  for (const p of payments) {
    const key = normalizeRef(p.receiptNo);
    if (key) {
      const arr = byReceiptNo.get(key) ?? [];
      arr.push(p);
      byReceiptNo.set(key, arr);
    }
    const amtKey = normalizeAmount(p.amount).toFixed(2);
    const amtArr = byAmount.get(amtKey) ?? [];
    amtArr.push(p);
    byAmount.set(amtKey, amtArr);

    const ic = normalizeIc(p.identityNo);
    if (ic) {
      const icArr = byIc.get(ic) ?? [];
      icArr.push(p);
      byIc.set(ic, icArr);
    }
  }

  return { byReceiptNo, byAmount, byIc, all: payments };
}

function matchAgainstGuestPaymentInMemory(
  st: { payerIc: string | null; payerName: string | null; sourceTxRef: string | null; amount: Decimal; txDate: Date },
  lookup: GuestPaymentLookup,
): { id: number; receiptNo: string } | null {
  const payerIc = normalizeIc(st.payerIc);
  const amount = normalizeAmount(st.amount);
  const txDate = st.txDate;

  if (payerIc) {
    const candidates = lookup.byIc.get(payerIc) ?? [];
    for (const gp of candidates) {
      if (
        Math.abs(normalizeAmount(gp.amount) - amount) < 0.01 &&
        dateWithinTolerance(txDate, gp.paidAt, DATE_TOLERANCE_DAYS)
      ) {
        return { id: gp.id, receiptNo: gp.receiptNo };
      }
    }
  }

  if (st.sourceTxRef) {
    const key = normalizeRef(st.sourceTxRef);
    const byRef = lookup.byReceiptNo.get(key);
    if (byRef) {
      for (const gp of byRef) {
        if (Math.abs(normalizeAmount(gp.amount) - amount) < 0.01) {
          return { id: gp.id, receiptNo: gp.receiptNo };
        }
      }
    }
  }

  const amtCandidates = lookup.byAmount.get(amount.toFixed(2)) ?? [];
  for (const gp of amtCandidates) {
    if (dateWithinTolerance(txDate, gp.paidAt, DATE_TOLERANCE_DAYS)) {
      const gpIc = normalizeIc(gp.identityNo);
      const stIc = normalizeIc(st.payerIc);
      if (gpIc && stIc && gpIc === stIc) {
        return { id: gp.id, receiptNo: gp.receiptNo };
      }
      if (
        st.payerName &&
        gp.guestName &&
        st.payerName.toLowerCase().includes(gp.guestName.toLowerCase().slice(0, 10))
      ) {
        return { id: gp.id, receiptNo: gp.receiptNo };
      }
    }
  }

  return null;
}

function detectVarianceAgainstGuestPaymentInMemory(
  st: { payerIc: string | null; payerName: string | null; amount: Decimal; txDate: Date },
  lookup: GuestPaymentLookup,
): { id: number; receiptNo: string } | null {
  const payerIc = normalizeIc(st.payerIc);
  const amount = normalizeAmount(st.amount);
  const txDate = st.txDate;
  if (!payerIc) return null;

  const candidates = lookup.byIc.get(payerIc) ?? [];
  for (const gp of candidates) {
    const gpAmount = normalizeAmount(gp.amount);
    if (
      dateWithinTolerance(txDate, gp.paidAt, VARIANCE_DATE_TOLERANCE_DAYS) &&
      Math.abs(gpAmount - amount) >= 0.01
    ) {
      return { id: gp.id, receiptNo: gp.receiptNo };
    }
  }
  return null;
}

// -----------------------------------------------------------------------------
// Bank statement in-memory lookup
// -----------------------------------------------------------------------------

interface BankStatementRow {
  id: number;
  paymentReference: string | null;
  approvalCode: string | null;
  chequeNo: string | null;
  amount: Decimal;
  valueDate: Date;
}

interface BankStatementLookup {
  byPaymentRef: Map<string, BankStatementRow[]>;
  byApprovalCode: Map<string, BankStatementRow[]>;
  byChequeNo: Map<string, BankStatementRow[]>;
  byAmount: Map<string, BankStatementRow[]>;
}

function buildBankStatementLookup(rows: BankStatementRow[]): BankStatementLookup {
  const byPaymentRef = new Map<string, BankStatementRow[]>();
  const byApprovalCode = new Map<string, BankStatementRow[]>();
  const byChequeNo = new Map<string, BankStatementRow[]>();
  const byAmount = new Map<string, BankStatementRow[]>();

  for (const r of rows) {
    const ref = normalizeRef(r.paymentReference);
    if (ref) {
      const arr = byPaymentRef.get(ref) ?? [];
      arr.push(r);
      byPaymentRef.set(ref, arr);
    }
    const approval = normalizeRef(r.approvalCode);
    if (approval) {
      const arr = byApprovalCode.get(approval) ?? [];
      arr.push(r);
      byApprovalCode.set(approval, arr);
    }
    if (r.chequeNo) {
      const arr = byChequeNo.get(r.chequeNo) ?? [];
      arr.push(r);
      byChequeNo.set(r.chequeNo, arr);
    }
    const amtKey = normalizeAmount(r.amount).toFixed(2);
    const amtArr = byAmount.get(amtKey) ?? [];
    amtArr.push(r);
    byAmount.set(amtKey, amtArr);
  }
  return { byPaymentRef, byApprovalCode, byChequeNo, byAmount };
}

function matchAgainstBankStatementInMemory(
  st: { sourceTxRef: string | null; amount: Decimal; txDate: Date },
  lookup: BankStatementLookup,
): { id: number; matchRule: string } | null {
  const amount = normalizeAmount(st.amount);
  const txDate = st.txDate;
  const sourceTxRef = normalizeRef(st.sourceTxRef);
  const amtKey = amount.toFixed(2);

  if (sourceTxRef) {
    const byRef = lookup.byPaymentRef.get(sourceTxRef);
    if (byRef) {
      for (const bt of byRef) {
        if (Math.abs(normalizeAmount(bt.amount) - amount) < 0.01) {
          return { id: bt.id, matchRule: "PAYMENT_REFERENCE" };
        }
      }
    }
    const byApproval = lookup.byApprovalCode.get(sourceTxRef);
    if (byApproval) {
      for (const bt of byApproval) {
        if (Math.abs(normalizeAmount(bt.amount) - amount) < 0.01) {
          return { id: bt.id, matchRule: "APPROVAL_CODE" };
        }
      }
    }
    if (sourceTxRef.length === 6 && /^\d{6}$/.test(sourceTxRef)) {
      const byCheque = lookup.byChequeNo.get(sourceTxRef);
      if (byCheque) {
        for (const bt of byCheque) {
          if (Math.abs(normalizeAmount(bt.amount) - amount) < 0.01) {
            return { id: bt.id, matchRule: "CHEQUE_NO" };
          }
        }
      }
    }
  }

  const minDate = new Date(txDate.getTime() - DATE_TOLERANCE_DAYS * 24 * 60 * 60 * 1000);
  const maxDate = new Date(txDate.getTime() + DATE_TOLERANCE_DAYS * 24 * 60 * 60 * 1000);
  const amtCandidates = lookup.byAmount.get(amtKey) ?? [];
  for (const bt of amtCandidates) {
    if (
      bt.valueDate >= minDate &&
      bt.valueDate <= maxDate &&
      dateWithinTolerance(txDate, bt.valueDate, DATE_TOLERANCE_DAYS)
    ) {
      return { id: bt.id, matchRule: "DATE_AMOUNT" };
    }
  }

  return null;
}

// -----------------------------------------------------------------------------
// Main reconciliation
// -----------------------------------------------------------------------------

export async function runReconciliation(
  fileId: number,
  createdBy: string,
  options?: { rerun?: boolean },
): Promise<{ success: boolean; result: ReconciliationRunResult; error?: string }> {
  const file = await prisma.integrationFile.findUnique({
    where: { id: fileId },
    include: { source: { include: { category: true } } },
  });

  if (!file) {
    return { success: false, result: { matched: 0, unmatched: 0, mismatch: 0, duplicate: 0 }, error: "File not found" };
  }

  if (file.processingStatus !== "SUCCESS") {
    return {
      success: false,
      result: { matched: 0, unmatched: 0, mismatch: 0, duplicate: 0 },
      error: "File must be successfully processed before reconciliation",
    };
  }

  const stagingTxs = await prisma.integrationStagingTx.findMany({
    where: { fileId },
    orderBy: { id: "asc" },
  });

  if (options?.rerun && stagingTxs.length > 0) {
    const stagingIds = stagingTxs.map((s) => s.id);
    await prisma.reconciliationResult.deleteMany({ where: { stagingTxId: { in: stagingIds } } });
  }

  if (stagingTxs.length === 0) {
    return {
      success: false,
      result: { matched: 0, unmatched: 0, mismatch: 0, duplicate: 0 },
      error: "No staging transactions to reconcile",
    };
  }

  const categoryCode = file.source?.category?.code ?? null;

  // Preload existing reconciliation results (single query)
  const existingResults = await prisma.reconciliationResult.findMany({
    where: { stagingTxId: { in: stagingTxs.map((s) => s.id) } },
    select: { stagingTxId: true, matchStatus: true },
  });
  const existingByStagingId = new Map(existingResults.map((r) => [r.stagingTxId, r.matchStatus]));

  const result: ReconciliationRunResult = { matched: 0, unmatched: 0, mismatch: 0, duplicate: 0 };

  // Staging rows to process (no existing result)
  const toProcess = stagingTxs.filter((st) => !existingByStagingId.has(st.id));

  if (toProcess.length === 0) {
    for (const st of stagingTxs) {
      const status = existingByStagingId.get(st.id);
      if (status === ReconciliationMatchStatus.MATCHED) result.matched++;
      else if (status === ReconciliationMatchStatus.UNMATCHED) result.unmatched++;
      else if (status === ReconciliationMatchStatus.MISMATCH) result.mismatch++;
      else if (status === ReconciliationMatchStatus.DUPLICATE) result.duplicate++;
    }
    await prisma.integrationFileEvent.create({
      data: {
        fileId,
        eventType: "RECONCILED",
        eventStatus: "SUCCESS",
        eventMessage: `Reconciliation: ${result.matched} matched, ${result.unmatched} unmatched`,
        createdBy,
      },
    });
    return { success: true, result };
  }

  let guestPaymentLookup: GuestPaymentLookup | null = null;
  let bankStatementLookup: BankStatementLookup | null = null;

  if (useBankStatement(categoryCode)) {
    const count = await prisma.bankStatementTransaction.count();
    if (count === 0) {
      return {
        success: false,
        result: { matched: 0, unmatched: 0, mismatch: 0, duplicate: 0 },
        error: "No bank statement data available. Please import bank statement first.",
      };
    }
    const rows = await prisma.bankStatementTransaction.findMany({
      select: { id: true, paymentReference: true, approvalCode: true, chequeNo: true, amount: true, valueDate: true },
    });
    bankStatementLookup = buildBankStatementLookup(rows);
  } else {
    const minDate = new Date(
      Math.min(...toProcess.map((s) => s.txDate.getTime())) - VARIANCE_DATE_TOLERANCE_DAYS * 24 * 60 * 60 * 1000,
    );
    const maxDate = new Date(
      Math.max(...toProcess.map((s) => s.txDate.getTime())) + VARIANCE_DATE_TOLERANCE_DAYS * 24 * 60 * 60 * 1000,
    );
    const payments = await prisma.guestPayment.findMany({
      where: {
        status: "success",
        paidAt: { gte: minDate, lte: maxDate },
      },
      select: { id: true, receiptNo: true, guestName: true, identityNo: true, amount: true, paidAt: true },
    });
    guestPaymentLookup = buildGuestPaymentLookup(payments);
  }

  const toCreate: Array<{
    stagingTxId: number;
    internalTxId: string | null;
    matchStatus: ReconciliationMatchStatusType;
    matchRule: string | null;
    confidenceScore: number | null;
  }> = [];

  for (const st of toProcess) {
    if (st.stagingStatus === "DUPLICATE") {
      toCreate.push({
        stagingTxId: st.id,
        internalTxId: null,
        matchStatus: ReconciliationMatchStatus.DUPLICATE,
        matchRule: "STAGING_DUPLICATE",
        confidenceScore: null,
      });
      result.duplicate++;
      continue;
    }

    let matchStatus: ReconciliationMatchStatusType;
    let matchRule: string | null = null;
    let internalTxId: string | null = null;

    if (useBankStatement(categoryCode)) {
      const match = bankStatementLookup ? matchAgainstBankStatementInMemory(st, bankStatementLookup) : null;
      matchStatus = match ? ReconciliationMatchStatus.MATCHED : ReconciliationMatchStatus.UNMATCHED;
      matchRule = match?.matchRule ?? null;
      internalTxId = match ? `BankStatementTransaction-${match.id}` : null;
    } else {
      const match = guestPaymentLookup
        ? matchAgainstGuestPaymentInMemory(st, guestPaymentLookup)
        : null;
      if (match) {
        matchStatus = ReconciliationMatchStatus.MATCHED;
        matchRule = "IC_AMOUNT_DATE";
        internalTxId = `GuestPayment-${match.id}`;
      } else {
        const variance = guestPaymentLookup
          ? detectVarianceAgainstGuestPaymentInMemory(st, guestPaymentLookup)
          : null;
        if (variance) {
          matchStatus = ReconciliationMatchStatus.MISMATCH;
          matchRule = "AMOUNT_VARIANCE";
          internalTxId = `GuestPayment-${variance.id}`;
        } else {
          matchStatus = ReconciliationMatchStatus.UNMATCHED;
        }
      }
    }

    const confidenceScore = matchStatus === ReconciliationMatchStatus.MATCHED ? 95 : null;
    toCreate.push({
      stagingTxId: st.id,
      internalTxId,
      matchStatus,
      matchRule,
      confidenceScore,
    });

    if (matchStatus === ReconciliationMatchStatus.MATCHED) result.matched++;
    else if (matchStatus === ReconciliationMatchStatus.UNMATCHED) result.unmatched++;
    else if (matchStatus === ReconciliationMatchStatus.MISMATCH) result.mismatch++;
  }

  for (const existing of existingResults) {
    const status = existing.matchStatus;
    if (status === ReconciliationMatchStatus.MATCHED) result.matched++;
    else if (status === ReconciliationMatchStatus.UNMATCHED) result.unmatched++;
    else if (status === ReconciliationMatchStatus.MISMATCH) result.mismatch++;
    else if (status === ReconciliationMatchStatus.DUPLICATE) result.duplicate++;
  }

  // Batch insert (chunks of 500 to avoid query size limits)
  const BATCH_SIZE = 500;
  for (let i = 0; i < toCreate.length; i += BATCH_SIZE) {
    const batch = toCreate.slice(i, i + BATCH_SIZE);
    await prisma.reconciliationResult.createMany({
      data: batch.map((r) => ({
        stagingTxId: r.stagingTxId,
        internalTxId: r.internalTxId,
        matchStatus: r.matchStatus,
        matchRule: r.matchRule,
        confidenceScore: r.confidenceScore,
      })),
    });
  }

  const eventParts = [
    `${result.matched} matched`,
    `${result.unmatched} unmatched`,
    result.mismatch > 0 ? `${result.mismatch} variance` : null,
    result.duplicate > 0 ? `${result.duplicate} duplicate` : null,
  ].filter(Boolean);
  await prisma.integrationFileEvent.create({
    data: {
      fileId,
      eventType: "RECONCILED",
      eventStatus: "SUCCESS",
      eventMessage: `Reconciliation: ${eventParts.join(", ")}`,
      createdBy,
    },
  });

  return { success: true, result };
}


