import { Router } from "express";

import { prisma } from "../prisma.js";
import type { AuthedRequest } from "../types.js";
import { requireRole, writeAuditLog } from "../utils/payer.js";
import { sendError, sendOk } from "../utils/responses.js";
import { payerBlacklistSchema, payerStatusChangeSchema } from "./schemas.js";

export const statusRouter = Router();

statusRouter.post("/:payerId/change", async (req: AuthedRequest, res) => {
  const actor = await requireRole(req.auth?.userId, ["eksekutif pemprosesan", "penyelia"], res);
  if (!actor) return;

  const payerId = Number(req.params.payerId);
  const input = payerStatusChangeSchema.parse(req.body);
  const existing = await prisma.payerProfile.findUnique({ where: { id: payerId } });
  if (!existing) return sendError(res, 404, "NOT_FOUND", "Payer not found");

  const updated = await prisma.$transaction(async (tx) => {
    const payer = await tx.payerProfile.update({
      where: { id: payerId },
      data: { status: input.status },
    });
    await tx.payerStatusHistory.create({
      data: {
        payerId,
        oldStatus: existing.status,
        newStatus: input.status,
        changedBy: actor.id,
        reason: input.reason,
      },
    });
    return payer;
  });

  await writeAuditLog({
    entityName: "payer_status",
    entityId: String(payerId),
    action: "CHANGE",
    targetPayerId: payerId,
    oldValueJson: { status: existing.status },
    newValueJson: { status: updated.status, reason: input.reason },
    performedBy: actor.id,
    ipAddress: req.ip,
  });

  return sendOk(res, updated);
});

statusRouter.post("/:payerId/blacklist", async (req: AuthedRequest, res) => {
  const actor = await requireRole(req.auth?.userId, ["penyelia"], res);
  if (!actor) return;

  const payerId = Number(req.params.payerId);
  const input = payerBlacklistSchema.parse(req.body);
  const existing = await prisma.payerProfile.findUnique({ where: { id: payerId } });
  if (!existing) return sendError(res, 404, "NOT_FOUND", "Payer not found");

  const updated = await prisma.$transaction(async (tx) => {
    const payer = await tx.payerProfile.update({
      where: { id: payerId },
      data: {
        isBlacklisted: true,
        blacklistReason: input.reason,
        blacklistFrom: input.fromDate ? new Date(input.fromDate) : null,
        blacklistTo: input.toDate ? new Date(input.toDate) : null,
      },
    });
    await tx.payerBlacklistHistory.create({
      data: {
        payerId,
        action: existing.isBlacklisted ? "update" : "add",
        reason: input.reason,
        fromDate: input.fromDate ? new Date(input.fromDate) : null,
        toDate: input.toDate ? new Date(input.toDate) : null,
        changedBy: actor.id,
      },
    });
    return payer;
  });

  await writeAuditLog({
    entityName: "payer_blacklist",
    entityId: String(payerId),
    action: "ADD_OR_UPDATE",
    targetPayerId: payerId,
    oldValueJson: existing,
    newValueJson: updated,
    performedBy: actor.id,
    ipAddress: req.ip,
  });

  return sendOk(res, updated);
});

statusRouter.delete("/:payerId/blacklist", async (req: AuthedRequest, res) => {
  const actor = await requireRole(req.auth?.userId, ["penyelia"], res);
  if (!actor) return;

  const payerId = Number(req.params.payerId);
  const existing = await prisma.payerProfile.findUnique({ where: { id: payerId } });
  if (!existing) return sendError(res, 404, "NOT_FOUND", "Payer not found");

  const updated = await prisma.$transaction(async (tx) => {
    const payer = await tx.payerProfile.update({
      where: { id: payerId },
      data: {
        isBlacklisted: false,
        blacklistReason: null,
        blacklistFrom: null,
        blacklistTo: null,
      },
    });
    await tx.payerBlacklistHistory.create({
      data: {
        payerId,
        action: "remove",
        changedBy: actor.id,
      },
    });
    return payer;
  });

  await writeAuditLog({
    entityName: "payer_blacklist",
    entityId: String(payerId),
    action: "REMOVE",
    targetPayerId: payerId,
    oldValueJson: existing,
    newValueJson: updated,
    performedBy: actor.id,
    ipAddress: req.ip,
  });

  return sendOk(res, updated);
});

statusRouter.get("/:payerId/history", async (req, res) => {
  const payerId = Number(req.params.payerId);
  const [statusHistory, blacklistHistory] = await Promise.all([
    prisma.payerStatusHistory.findMany({
      where: { payerId },
      orderBy: { changedAt: "desc" },
      include: { changedByUser: { select: { id: true, name: true, role: true } } },
    }),
    prisma.payerBlacklistHistory.findMany({
      where: { payerId },
      orderBy: { changedAt: "desc" },
      include: { changedByUser: { select: { id: true, name: true, role: true } } },
    }),
  ]);
  return sendOk(res, { statusHistory, blacklistHistory });
});
