import { Decimal } from "@prisma/client/runtime/library";
import OpenAI from "openai";

import { env } from "../config/env.js";
import { prisma } from "../prisma.js";

/** Wider window so AI can suggest matches when GuestPayment was seeded earlier */
const DATE_TOLERANCE_DAYS = 90;
const AMOUNT_TOLERANCE = 0.02;
const BATCH_SIZE = 10;
const MAX_CANDIDATES_PER_ROW = 15;
/** Same as apply-match: many-to-one allows linked total up to internalAmount * (1 + this) */
const APPLY_AMOUNT_TOLERANCE = 0.01;

function normalizeIc(ic: string | null): string {
  if (!ic) return "";
  return ic.replace(/\D/g, "").slice(0, 14);
}

function normalizeAmount(amount: number | Decimal): number {
  return typeof amount === "number" ? amount : Number(amount);
}

export interface AISuggestedMatch {
  reconResultId: number;
  stagingTxId: number;
  suggestedInternalTxId: string | null;
  suggestedReceiptNo: string | null;
  confidence: number;
  reason: string;
  /** Summary from GuestPayment/BankStatement for confident decision-making */
  suggestedInternalSummary?: {
    date: string;
    reference: string;
    amount: number;
  };
}

export interface AIAssistResult {
  suggestions: AISuggestedMatch[];
  processed: number;
  suggested: number;
}

export async function getAISuggestionsForUnmatched(
  fileId: number,
  limit = 50,
): Promise<{ success: boolean; data?: AIAssistResult; error?: string }> {
  const apiKey = env.openaiApiKey;
  if (!apiKey) {
    return { success: false, error: "OPENAI_API_KEY is not configured. AI Assist is disabled." };
  }

  const unmatchedResults = await prisma.reconciliationResult.findMany({
    where: {
      matchStatus: "UNMATCHED",
      stagingTx: { fileId },
    },
    include: { stagingTx: true },
    orderBy: { id: "asc" },
    take: limit,
  });

  if (unmatchedResults.length === 0) {
    return {
      success: true,
      data: { suggestions: [], processed: 0, suggested: 0 },
    };
  }

  const allSuggestions: AISuggestedMatch[] = [];
  const client = new OpenAI({ apiKey });

  for (let i = 0; i < unmatchedResults.length; i += BATCH_SIZE) {
    const batch = unmatchedResults.slice(i, i + BATCH_SIZE);

    const batchInputs = await Promise.all(
      batch.map(async (r) => {
        const amount = normalizeAmount(r.stagingTx.amount);
        const txDate = r.stagingTx.txDate ? new Date(r.stagingTx.txDate) : null;
        const minDate = txDate ? new Date(txDate.getTime() - DATE_TOLERANCE_DAYS * 24 * 60 * 60 * 1000) : null;
        const maxDate = txDate ? new Date(txDate.getTime() + DATE_TOLERANCE_DAYS * 24 * 60 * 60 * 1000) : null;

        const payerIc = normalizeIc(r.stagingTx.payerIc);
        let candidates = await prisma.guestPayment.findMany({
          where: {
            status: "success",
            amount: {
              gte: amount * (1 - AMOUNT_TOLERANCE),
              lte: amount * (1 + AMOUNT_TOLERANCE),
            },
            ...(minDate && maxDate
              ? { paidAt: { gte: minDate, lte: maxDate } }
              : {}),
          },
          orderBy: { paidAt: "desc" },
          take: MAX_CANDIDATES_PER_ROW * 2,
          select: {
            id: true,
            receiptNo: true,
            guestName: true,
            identityNo: true,
            amount: true,
            paidAt: true,
          },
        });
        // Fallback: if no candidates by amount+date, try by IC + amount (for AI-matchable rows with date outside window)
        if (candidates.length === 0 && payerIc) {
          const byIc = await prisma.guestPayment.findMany({
            where: {
              status: "success",
              amount: {
                gte: amount * (1 - AMOUNT_TOLERANCE),
                lte: amount * (1 + AMOUNT_TOLERANCE),
              },
            },
            orderBy: { paidAt: "desc" },
            take: 50,
            select: {
              id: true,
              receiptNo: true,
              guestName: true,
              identityNo: true,
              amount: true,
              paidAt: true,
            },
          });
          candidates = byIc.filter((c) => normalizeIc(c.identityNo) === payerIc).slice(0, MAX_CANDIDATES_PER_ROW * 2);
        }

        return {
          reconResultId: r.id,
          stagingTxId: r.stagingTxId,
          staging: {
            payerIc: r.stagingTx.payerIc ?? "",
            payerName: r.stagingTx.payerName ?? "",
            amount: amount,
            txDate: r.stagingTx.txDate ?? "",
            sourceTxRef: r.stagingTx.sourceTxRef ?? "",
          },
          candidates: candidates.map((c) => ({
            id: c.id,
            receiptNo: c.receiptNo,
            guestName: c.guestName,
            identityNo: c.identityNo,
            amount: normalizeAmount(c.amount),
            paidAt: c.paidAt.toISOString(),
          })),
        };
      }),
    );

    // Filter candidates by remaining amount (many-to-one) - single query for whole batch
    const allCandidateIds = [...new Set(batchInputs.flatMap((b) => b.candidates.map((c) => c.id)))];
    const internalTxIds = allCandidateIds.map((id) => `GuestPayment-${id}`);
    const alreadyLinked =
      internalTxIds.length > 0
        ? await prisma.reconciliationResult.findMany({
            where: {
              internalTxId: { in: internalTxIds },
              matchStatus: "MATCHED",
            },
            include: { stagingTx: { select: { amount: true } } },
          })
        : [];
    const linkedTotals = new Map<string, number>();
    for (const r of alreadyLinked) {
      if (r.internalTxId) {
        const cur = linkedTotals.get(r.internalTxId) ?? 0;
        linkedTotals.set(r.internalTxId, cur + Number(r.stagingTx.amount));
      }
    }

    const maxAllowedForAmount = (internalAmt: number) => internalAmt * (1 + APPLY_AMOUNT_TOLERANCE);
    for (const b of batchInputs) {
      const stagingAmount = b.staging.amount;
      b.candidates = b.candidates
        .filter((c) => {
          const internalAmt = c.amount;
          const linked = linkedTotals.get(`GuestPayment-${c.id}`) ?? 0;
          const remaining = maxAllowedForAmount(internalAmt) - linked;
          return remaining >= stagingAmount * (1 - 0.005);
        })
        .slice(0, MAX_CANDIDATES_PER_ROW);
    }

    const batchWithCandidates = batchInputs.filter((b) => b.candidates.length > 0);
    const batchNoCandidates = batchInputs.filter((b) => b.candidates.length === 0);

    for (const b of batchNoCandidates) {
      allSuggestions.push({
        reconResultId: b.reconResultId,
        stagingTxId: b.stagingTxId,
        suggestedInternalTxId: null,
        suggestedReceiptNo: null,
        confidence: 0,
        reason: "No candidates found for amount and date range.",
      });
    }

    if (batchWithCandidates.length > 0) {
      const systemPrompt = `You are an expert at matching external bank/PSP transaction records with internal payment records for a zakat (Islamic tax) collection system in Malaysia.

Given staging transactions (from external bank file) and candidate internal payments (GuestPayment), determine the best match for each staging transaction.

Match criteria (in order of importance):
1. IC/MyKad number (identityNo) - exact or normalized match (digits only)
2. Name similarity - Malaysian names may have spelling variations (e.g. Muhammad vs Mohd, Syafiq vs Shafiq)
3. Amount and date proximity
4. Reference number (sourceTxRef vs receiptNo)

Return ONLY valid JSON array. Each object:
{
  "reconResultId": number,
  "suggestedInternalTxId": "GuestPayment-{id}" or null,
  "confidence": 0.0 to 1.0,
  "reason": "brief explanation"
}

If no good match (confidence < 0.6), use null for suggestedInternalTxId. Be conservative - only suggest when reasonably confident.`;

      const userContent = JSON.stringify(
        batchWithCandidates.map((b) => ({
          reconResultId: b.reconResultId,
          staging: b.staging,
          candidates: b.candidates,
        })),
      );

      try {
        const completion = await client.chat.completions.create({
          model: env.openaiModel,
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: userContent },
          ],
          temperature: 0.1,
        });

        const content = completion.choices[0]?.message?.content?.trim() ?? "";
        if (!content) continue;

        const clean = content.replace(/```json\s*/g, "").replace(/```\s*/g, "").trim();
        const parsed = JSON.parse(clean) as Array<{
          reconResultId: number;
          suggestedInternalTxId: string | null;
          confidence: number;
          reason: string;
        }>;

        const candidateMap = new Map(
          batchWithCandidates.flatMap((b) =>
            b.candidates.map((c) => [
              `GuestPayment-${c.id}`,
              { receiptNo: c.receiptNo, amount: c.amount, paidAt: c.paidAt },
            ]),
          ),
        );

        for (const p of parsed) {
          const input = batchWithCandidates.find((b) => b.reconResultId === p.reconResultId);
          const candidate = p.suggestedInternalTxId ? candidateMap.get(p.suggestedInternalTxId) : null;
          const receiptNo = candidate?.receiptNo ?? null;
          allSuggestions.push({
            reconResultId: p.reconResultId,
            stagingTxId: input?.stagingTxId ?? 0,
            suggestedInternalTxId: p.suggestedInternalTxId,
            suggestedReceiptNo: receiptNo ?? null,
            confidence: typeof p.confidence === "number" ? Math.min(1, Math.max(0, p.confidence)) : 0,
            reason: p.reason ?? "",
            suggestedInternalSummary:
              candidate && receiptNo
                ? {
                    date: candidate.paidAt.slice(0, 10),
                    reference: receiptNo,
                    amount: candidate.amount,
                  }
                : undefined,
          });
        }
      } catch (e) {
        console.warn("[ai-reconciliation-assist] OpenAI batch failed:", e);
        for (const b of batchWithCandidates) {
          allSuggestions.push({
            reconResultId: b.reconResultId,
            stagingTxId: b.stagingTxId,
            suggestedInternalTxId: null,
            suggestedReceiptNo: null,
            confidence: 0,
            reason: "AI processing failed.",
          });
        }
      }
    }
  }

  const suggested = allSuggestions.filter((s) => s.suggestedInternalTxId && s.confidence >= 0.6).length;

  return {
    success: true,
    data: {
      suggestions: allSuggestions,
      processed: allSuggestions.length,
      suggested,
    },
  };
}
