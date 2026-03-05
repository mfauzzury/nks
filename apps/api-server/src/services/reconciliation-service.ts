import pkg from "@prisma/client";
const { ReconciliationMatchStatus } = pkg;
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

async function matchAgainstGuestPayment(
  st: { payerIc: string | null; payerName: string | null; sourceTxRef: string | null; amount: Decimal; txDate: Date },
): Promise<{ id: number; receiptNo: string } | null> {
  const payerIc = normalizeIc(st.payerIc);
  const amount = normalizeAmount(st.amount);
  const txDate = st.txDate;
  let match: { id: number; receiptNo: string } | null = null;

  if (payerIc) {
    const guestPayments = await prisma.guestPayment.findMany({
      where: { amount, status: "success" },
      orderBy: { paidAt: "desc" },
      take: 100,
    });
    for (const gp of guestPayments) {
      const gpIc = normalizeIc(gp.identityNo);
      if (gpIc && gpIc === payerIc && dateWithinTolerance(txDate, gp.paidAt, DATE_TOLERANCE_DAYS)) {
        match = { id: gp.id, receiptNo: gp.receiptNo };
        break;
      }
    }
  }

  if (!match && st.sourceTxRef) {
    const byRef = await prisma.guestPayment.findFirst({
      where: { receiptNo: st.sourceTxRef, status: "success" },
    });
    if (byRef && Math.abs(normalizeAmount(byRef.amount) - amount) < 0.01) {
      match = { id: byRef.id, receiptNo: byRef.receiptNo };
    }
  }

  if (!match) {
    const byAmountDate = await prisma.guestPayment.findMany({
      where: { amount, status: "success" },
      orderBy: { paidAt: "desc" },
      take: 50,
    });
    for (const gp of byAmountDate) {
      if (dateWithinTolerance(txDate, gp.paidAt, DATE_TOLERANCE_DAYS)) {
        const gpIc = normalizeIc(gp.identityNo);
        const stIc = normalizeIc(st.payerIc);
        if (gpIc && stIc && gpIc === stIc) {
          match = { id: gp.id, receiptNo: gp.receiptNo };
          break;
        }
        if (st.payerName && gp.guestName && st.payerName.toLowerCase().includes(gp.guestName.toLowerCase().slice(0, 10))) {
          match = { id: gp.id, receiptNo: gp.receiptNo };
          break;
        }
      }
    }
  }

  return match;
}

/** Detect variance: IC matches GuestPayment, date within tolerance, but amount differs. */
async function detectVarianceAgainstGuestPayment(
  st: { payerIc: string | null; payerName: string | null; amount: Decimal; txDate: Date },
): Promise<{ id: number; receiptNo: string } | null> {
  const payerIc = normalizeIc(st.payerIc);
  const amount = normalizeAmount(st.amount);
  const txDate = st.txDate;
  if (!payerIc) return null;

  const guestPayments = await prisma.guestPayment.findMany({
    where: { status: "success" },
    orderBy: { paidAt: "desc" },
    take: 100,
  });
  for (const gp of guestPayments) {
    const gpIc = normalizeIc(gp.identityNo);
    const gpAmount = normalizeAmount(gp.amount);
    if (gpIc && gpIc === payerIc && dateWithinTolerance(txDate, gp.paidAt, VARIANCE_DATE_TOLERANCE_DAYS)) {
      if (Math.abs(gpAmount - amount) >= 0.01) {
        return { id: gp.id, receiptNo: gp.receiptNo };
      }
      break;
    }
  }
  return null;
}

async function matchAgainstBankStatement(
  st: { sourceTxRef: string | null; amount: Decimal; txDate: Date },
): Promise<{ id: number; matchRule: string } | null> {
  const amount = normalizeAmount(st.amount);
  const txDate = st.txDate;
  const sourceTxRef = normalizeRef(st.sourceTxRef);
  let match: { id: number; matchRule: string } | null = null;

  if (sourceTxRef) {
    const byRef = await prisma.bankStatementTransaction.findFirst({
      where: { paymentReference: sourceTxRef, amount },
    });
    if (byRef && Math.abs(normalizeAmount(byRef.amount) - amount) < 0.01) {
      match = { id: byRef.id, matchRule: "PAYMENT_REFERENCE" };
    }
  }

  if (!match && sourceTxRef) {
    const byApproval = await prisma.bankStatementTransaction.findFirst({
      where: { approvalCode: sourceTxRef, amount },
    });
    if (byApproval && Math.abs(normalizeAmount(byApproval.amount) - amount) < 0.01) {
      match = { id: byApproval.id, matchRule: "APPROVAL_CODE" };
    }
  }

  if (!match && sourceTxRef && /^\d{6}$/.test(sourceTxRef)) {
    const byCheque = await prisma.bankStatementTransaction.findFirst({
      where: { chequeNo: sourceTxRef, amount },
    });
    if (byCheque && Math.abs(normalizeAmount(byCheque.amount) - amount) < 0.01) {
      match = { id: byCheque.id, matchRule: "CHEQUE_NO" };
    }
  }

  if (!match) {
    const byAmountDate = await prisma.bankStatementTransaction.findMany({
      where: {
        amount,
        valueDate: {
          gte: new Date(txDate.getTime() - DATE_TOLERANCE_DAYS * 24 * 60 * 60 * 1000),
          lte: new Date(txDate.getTime() + DATE_TOLERANCE_DAYS * 24 * 60 * 60 * 1000),
        },
      },
      orderBy: { valueDate: "desc" },
      take: 20,
    });
    for (const bt of byAmountDate) {
      if (dateWithinTolerance(txDate, bt.valueDate, DATE_TOLERANCE_DAYS) && Math.abs(normalizeAmount(bt.amount) - amount) < 0.01) {
        match = { id: bt.id, matchRule: "DATE_AMOUNT" };
        break;
      }
    }
  }

  return match;
}

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

  if (useBankStatement(categoryCode)) {
    const bankTxCount = await prisma.bankStatementTransaction.count();
    if (bankTxCount === 0) {
      return {
        success: false,
        result: { matched: 0, unmatched: 0, mismatch: 0, duplicate: 0 },
        error: "No bank statement data available. Please import bank statement first.",
      };
    }
  }

  const result: ReconciliationRunResult = { matched: 0, unmatched: 0, mismatch: 0, duplicate: 0 };

  for (const st of stagingTxs) {
    const existing = await prisma.reconciliationResult.findFirst({
      where: { stagingTxId: st.id },
    });
    if (existing) {
      switch (existing.matchStatus) {
        case ReconciliationMatchStatus.MATCHED:
          result.matched++;
          break;
        case ReconciliationMatchStatus.UNMATCHED:
          result.unmatched++;
          break;
        case ReconciliationMatchStatus.MISMATCH:
          result.mismatch++;
          break;
        case ReconciliationMatchStatus.DUPLICATE:
          result.duplicate++;
          break;
      }
      continue;
    }

    let matchStatus: ReconciliationMatchStatusType;
    let matchRule: string | null = null;
    let internalTxId: string | null = null;

    if (useBankStatement(categoryCode)) {
      const match = await matchAgainstBankStatement(st);
      matchStatus = match ? ReconciliationMatchStatus.MATCHED : ReconciliationMatchStatus.UNMATCHED;
      matchRule = match?.matchRule ?? null;
      internalTxId = match ? `BankStatementTransaction-${match.id}` : null;
    } else {
      const match = await matchAgainstGuestPayment(st);
      if (match) {
        matchStatus = ReconciliationMatchStatus.MATCHED;
        matchRule = "IC_AMOUNT_DATE";
        internalTxId = `GuestPayment-${match.id}`;
      } else {
        const variance = await detectVarianceAgainstGuestPayment(st);
        if (variance) {
          matchStatus = ReconciliationMatchStatus.MISMATCH;
          matchRule = "AMOUNT_VARIANCE";
          internalTxId = `GuestPayment-${variance.id}`;
        } else {
          matchStatus = ReconciliationMatchStatus.UNMATCHED;
          matchRule = null;
          internalTxId = null;
        }
      }
    }

    const confidenceScore = matchStatus === ReconciliationMatchStatus.MATCHED ? 95 : null;

    await prisma.reconciliationResult.create({
      data: {
        stagingTxId: st.id,
        internalTxId,
        matchStatus,
        matchRule,
        confidenceScore,
      },
    });

    switch (matchStatus) {
      case ReconciliationMatchStatus.MATCHED:
        result.matched++;
        break;
      case ReconciliationMatchStatus.UNMATCHED:
        result.unmatched++;
        break;
      case ReconciliationMatchStatus.MISMATCH:
        result.mismatch++;
        break;
      default:
        result.unmatched++;
    }
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


