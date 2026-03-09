import { Router } from "express";
import type { GuestPaymentSource } from "@prisma/client";

import { prisma } from "../prisma.js";
import { sendError, sendOk } from "../utils/responses.js";
import type { AuthedRequest } from "../types.js";
import {
  scheduledPaymentCreateSchema,
  scheduledPaymentsQuerySchema,
} from "./schemas.js";

export const scheduledPaymentsRouter = Router();

function buildScheduleRef() {
  const rand = Math.floor(Math.random() * 9000) + 1000;
  return `SCHED-${Date.now()}-${rand}`;
}

function buildReceiptNo() {
  const rand = Math.floor(Math.random() * 9000) + 1000;
  return `GRCPT-${Date.now()}-${rand}`;
}

function normalizeIdentityNo(identityNo: string) {
  return identityNo.replace(/[^A-Za-z0-9]/g, "").toUpperCase();
}

function computeNextChargeDate(from: Date, frequency: string): Date {
  const next = new Date(from);
  switch (frequency) {
    case "monthly":
      next.setMonth(next.getMonth() + 1);
      break;
    case "quarterly":
      next.setMonth(next.getMonth() + 3);
      break;
    case "yearly":
      next.setFullYear(next.getFullYear() + 1);
      break;
  }
  return next;
}

// POST / — Create scheduled payment + execute first instalment (public)
scheduledPaymentsRouter.post("/", async (req, res) => {
  try {
    const input = scheduledPaymentCreateSchema.parse(req.body);
    const normalizedIdentity = normalizeIdentityNo(input.identityNo);
    const scheduleRef = buildScheduleRef();
    const now = new Date();
    const nextChargeDate = computeNextChargeDate(now, input.frequency);

    const result = await prisma.$transaction(async (tx) => {
      // Create the schedule
      const schedule = await tx.scheduledPayment.create({
        data: {
          scheduleRef,
          payerName: input.payerName,
          identityNo: normalizedIdentity,
          email: input.email,
          zakatType: input.zakatType,
          financialYear: input.financialYear,
          amountPerInstalment: input.amountPerInstalment,
          totalInstalments: input.totalInstalments,
          completedInstalments: 1,
          frequency: input.frequency,
          cardTokenMock: `MOCK-${input.cardBrand}-****${input.cardLast4}`,
          cardLast4: input.cardLast4,
          cardBrand: input.cardBrand,
          source: input.source as GuestPaymentSource,
          collectionPoint: input.collectionPoint,
          nextChargeDate,
          status: "active",
        },
      });

      // Create first GuestPayment (immediate instalment)
      const payment = await tx.guestPayment.create({
        data: {
          receiptNo: buildReceiptNo(),
          guestName: input.payerName,
          identityNo: normalizedIdentity,
          email: input.email,
          amount: input.amountPerInstalment,
          paymentMethod: `CARD (${input.cardBrand}) | ${input.zakatType} | Tahun ${input.financialYear} | Jadual ${scheduleRef} Ansuran 1/${input.totalInstalments}`,
          status: "success",
          source: input.source as GuestPaymentSource,
        },
      });

      // Link execution
      await tx.scheduledPaymentExecution.create({
        data: {
          scheduledPaymentId: schedule.id,
          instalmentNo: 1,
          guestPaymentId: payment.id,
          amount: input.amountPerInstalment,
          status: "success",
        },
      });

      return { schedule, payment };
    });

    return sendOk(res, {
      id: result.schedule.id,
      scheduleRef: result.schedule.scheduleRef,
      status: result.schedule.status,
      totalInstalments: result.schedule.totalInstalments,
      completedInstalments: result.schedule.completedInstalments,
      amountPerInstalment: result.schedule.amountPerInstalment.toString(),
      frequency: result.schedule.frequency,
      nextChargeDate: result.schedule.nextChargeDate.toISOString(),
      firstPayment: {
        id: result.payment.id,
        receiptNo: result.payment.receiptNo,
      },
    });
  } catch (err: any) {
    if (err.name === "ZodError") {
      return sendError(res, 400, "VALIDATION_ERROR", "Invalid input", err.errors);
    }
    console.error("Error creating scheduled payment:", err);
    return sendError(res, 500, "SERVER_ERROR", "Failed to create scheduled payment");
  }
});

// GET /by-identity/:identityNo — List schedules for a payer (public)
scheduledPaymentsRouter.get("/by-identity/:identityNo", async (req, res) => {
  const identityNo = normalizeIdentityNo(String(req.params.identityNo || ""));
  if (!identityNo) return sendError(res, 400, "VALIDATION_ERROR", "Identity number is required");

  const schedules = await prisma.scheduledPayment.findMany({
    where: { identityNo },
    orderBy: { createdAt: "desc" },
    take: 50,
  });

  return sendOk(
    res,
    schedules.map((s) => ({
      id: s.id,
      scheduleRef: s.scheduleRef,
      zakatType: s.zakatType,
      amountPerInstalment: s.amountPerInstalment.toString(),
      totalInstalments: s.totalInstalments,
      completedInstalments: s.completedInstalments,
      frequency: s.frequency,
      status: s.status,
      nextChargeDate: s.nextChargeDate.toISOString(),
      createdAt: s.createdAt.toISOString(),
    })),
  );
});

// GET / — List all scheduled payments (admin)
scheduledPaymentsRouter.get("/", async (req, res) => {
  const query = scheduledPaymentsQuerySchema.parse(req.query);
  const where: any = {};
  if (query.status) where.status = query.status;
  if (query.q) {
    where.OR = [
      { payerName: { contains: query.q } },
      { identityNo: { contains: query.q } },
      { scheduleRef: { contains: query.q } },
    ];
  }

  const [rows, total] = await Promise.all([
    prisma.scheduledPayment.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (query.page - 1) * query.limit,
      take: query.limit,
    }),
    prisma.scheduledPayment.count({ where }),
  ]);

  return sendOk(
    res,
    rows.map((s) => ({
      id: s.id,
      scheduleRef: s.scheduleRef,
      payerName: s.payerName,
      identityNo: s.identityNo,
      zakatType: s.zakatType,
      amountPerInstalment: s.amountPerInstalment.toString(),
      totalInstalments: s.totalInstalments,
      completedInstalments: s.completedInstalments,
      frequency: s.frequency,
      cardBrand: s.cardBrand,
      cardLast4: s.cardLast4,
      source: s.source,
      status: s.status,
      nextChargeDate: s.nextChargeDate.toISOString(),
      createdAt: s.createdAt.toISOString(),
    })),
    { total, page: query.page, limit: query.limit },
  );
});

// GET /:id — Get detail with execution history (admin)
scheduledPaymentsRouter.get("/:id", async (req, res) => {
  const id = Number(req.params.id);
  if (!id) return sendError(res, 400, "VALIDATION_ERROR", "Invalid ID");

  const schedule = await prisma.scheduledPayment.findUnique({
    where: { id },
    include: {
      executions: {
        orderBy: { instalmentNo: "asc" },
      },
    },
  });
  if (!schedule) return sendError(res, 404, "NOT_FOUND", "Scheduled payment not found");

  // Fetch linked guest payments for receipt info
  const guestPaymentIds = schedule.executions.map((e) => e.guestPaymentId);
  const guestPayments = guestPaymentIds.length
    ? await prisma.guestPayment.findMany({
        where: { id: { in: guestPaymentIds } },
        select: { id: true, receiptNo: true, paidAt: true },
      })
    : [];
  const gpMap = new Map(guestPayments.map((gp) => [gp.id, gp]));

  return sendOk(res, {
    id: schedule.id,
    scheduleRef: schedule.scheduleRef,
    payerName: schedule.payerName,
    identityNo: schedule.identityNo,
    email: schedule.email,
    zakatType: schedule.zakatType,
    financialYear: schedule.financialYear,
    amountPerInstalment: schedule.amountPerInstalment.toString(),
    totalInstalments: schedule.totalInstalments,
    completedInstalments: schedule.completedInstalments,
    frequency: schedule.frequency,
    cardBrand: schedule.cardBrand,
    cardLast4: schedule.cardLast4,
    source: schedule.source,
    collectionPoint: schedule.collectionPoint,
    nextChargeDate: schedule.nextChargeDate.toISOString(),
    status: schedule.status,
    pausedReason: schedule.pausedReason,
    cancelledReason: schedule.cancelledReason,
    createdAt: schedule.createdAt.toISOString(),
    executions: schedule.executions.map((e) => {
      const gp = gpMap.get(e.guestPaymentId);
      return {
        id: e.id,
        instalmentNo: e.instalmentNo,
        amount: e.amount.toString(),
        chargedAt: e.chargedAt.toISOString(),
        status: e.status,
        failureReason: e.failureReason,
        receiptNo: gp?.receiptNo ?? null,
        paidAt: gp?.paidAt?.toISOString() ?? null,
      };
    }),
  });
});

// POST /:id/pause — Pause a schedule (admin)
scheduledPaymentsRouter.post("/:id/pause", async (req, res) => {
  const id = Number(req.params.id);
  const reason = req.body.reason || null;

  const schedule = await prisma.scheduledPayment.findUnique({ where: { id } });
  if (!schedule) return sendError(res, 404, "NOT_FOUND", "Scheduled payment not found");
  if (schedule.status !== "active") return sendError(res, 400, "INVALID_STATUS", "Only active schedules can be paused");

  const updated = await prisma.scheduledPayment.update({
    where: { id },
    data: { status: "paused", pausedReason: reason },
  });

  return sendOk(res, { id: updated.id, status: updated.status });
});

// POST /:id/resume — Resume a paused schedule (admin)
scheduledPaymentsRouter.post("/:id/resume", async (req, res) => {
  const id = Number(req.params.id);

  const schedule = await prisma.scheduledPayment.findUnique({ where: { id } });
  if (!schedule) return sendError(res, 404, "NOT_FOUND", "Scheduled payment not found");
  if (schedule.status !== "paused") return sendError(res, 400, "INVALID_STATUS", "Only paused schedules can be resumed");

  const updated = await prisma.scheduledPayment.update({
    where: { id },
    data: { status: "active", pausedReason: null },
  });

  return sendOk(res, { id: updated.id, status: updated.status });
});

// POST /:id/cancel — Cancel a schedule (admin)
scheduledPaymentsRouter.post("/:id/cancel", async (req, res) => {
  const id = Number(req.params.id);
  const authedReq = req as AuthedRequest;
  const reason = req.body.reason || null;

  const schedule = await prisma.scheduledPayment.findUnique({ where: { id } });
  if (!schedule) return sendError(res, 404, "NOT_FOUND", "Scheduled payment not found");
  if (schedule.status === "completed" || schedule.status === "cancelled") {
    return sendError(res, 400, "INVALID_STATUS", "Schedule is already completed or cancelled");
  }

  const updated = await prisma.scheduledPayment.update({
    where: { id },
    data: {
      status: "cancelled",
      cancelledReason: reason,
      cancelledBy: authedReq.auth?.userId ?? null,
    },
  });

  return sendOk(res, { id: updated.id, status: updated.status });
});

// POST /process-due — Process all due payments (admin/cron)
scheduledPaymentsRouter.post("/process-due", async (req, res) => {
  const now = new Date();

  const dueSchedules = await prisma.scheduledPayment.findMany({
    where: {
      status: "active",
      nextChargeDate: { lte: now },
    },
  });

  const results: Array<{ scheduleRef: string; instalmentNo: number; receiptNo: string; status: string }> = [];

  for (const schedule of dueSchedules) {
    try {
      const instalmentNo = schedule.completedInstalments + 1;
      const receiptNo = buildReceiptNo();

      await prisma.$transaction(async (tx) => {
        // Create GuestPayment for this instalment
        const payment = await tx.guestPayment.create({
          data: {
            receiptNo,
            guestName: schedule.payerName,
            identityNo: schedule.identityNo,
            email: schedule.email,
            amount: schedule.amountPerInstalment,
            paymentMethod: `CARD (${schedule.cardBrand}) | ${schedule.zakatType} | Tahun ${schedule.financialYear} | Jadual ${schedule.scheduleRef} Ansuran ${instalmentNo}/${schedule.totalInstalments}`,
            status: "success",
            source: schedule.source,
          },
        });

        // Create execution record
        await tx.scheduledPaymentExecution.create({
          data: {
            scheduledPaymentId: schedule.id,
            instalmentNo,
            guestPaymentId: payment.id,
            amount: schedule.amountPerInstalment,
            status: "success",
          },
        });

        // Update schedule
        const isCompleted = instalmentNo >= schedule.totalInstalments;
        await tx.scheduledPayment.update({
          where: { id: schedule.id },
          data: {
            completedInstalments: instalmentNo,
            status: isCompleted ? "completed" : "active",
            nextChargeDate: isCompleted
              ? schedule.nextChargeDate
              : computeNextChargeDate(schedule.nextChargeDate, schedule.frequency),
          },
        });
      });

      results.push({
        scheduleRef: schedule.scheduleRef,
        instalmentNo,
        receiptNo,
        status: "success",
      });
    } catch (err: any) {
      console.error(`Failed to process schedule ${schedule.scheduleRef}:`, err);
      results.push({
        scheduleRef: schedule.scheduleRef,
        instalmentNo: schedule.completedInstalments + 1,
        receiptNo: "",
        status: "failed",
      });
    }
  }

  return sendOk(res, {
    processedCount: results.length,
    results,
  });
});
