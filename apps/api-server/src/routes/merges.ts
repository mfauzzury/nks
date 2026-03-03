import { Router } from "express";

import { prisma } from "../prisma.js";
import type { AuthedRequest } from "../types.js";
import { requireRole, writeAuditLog } from "../utils/payer.js";
import { sendError, sendOk } from "../utils/responses.js";
import { mergeExecuteSchema } from "./schemas.js";

export const mergesRouter = Router();

mergesRouter.post("/execute", async (req: AuthedRequest, res) => {
  const actor = await requireRole(req.auth?.userId, ["eksekutif pemprosesan", "penyelia"], res);
  if (!actor) return;

  const input = mergeExecuteSchema.parse(req.body);
  if (input.masterPayerId === input.mergedPayerId) {
    return sendError(res, 400, "VALIDATION_ERROR", "Master and merged payer must be different");
  }

  const [master, merged] = await Promise.all([
    prisma.payerProfile.findUnique({ where: { id: input.masterPayerId } }),
    prisma.payerProfile.findUnique({ where: { id: input.mergedPayerId } }),
  ]);
  if (!master || !merged) return sendError(res, 404, "NOT_FOUND", "Payer not found");
  if (merged.status === "merged") return sendError(res, 409, "ALREADY_MERGED", "Merged payer already merged");

  const result = await prisma.$transaction(async (tx) => {
    await tx.spgEmployee.updateMany({
      where: { linkedIndividualPayerId: merged.id },
      data: { linkedIndividualPayerId: master.id },
    });

    await tx.payerProfile.update({
      where: { id: merged.id },
      data: {
        status: "merged",
        mergedIntoPayerId: master.id,
      },
    });

    const merge = await tx.mergeExecution.create({
      data: {
        masterPayerId: master.id,
        mergedPayerId: merged.id,
        executedBy: actor.id,
        conflictResolutionJson: JSON.parse(JSON.stringify(input.conflictResolution)),
        summaryJson: {
          action: "merged_profile",
          mergedInto: master.id,
          mergedFrom: merged.id,
        },
      },
    });

    if (input.duplicateCaseId) {
      await tx.duplicateCase.update({
        where: { id: input.duplicateCaseId },
        data: { status: "merged" },
      });
    }

    return merge;
  });

  await writeAuditLog({
    entityName: "merge_execution",
    entityId: String(result.id),
    action: "EXECUTE",
    targetPayerId: master.id,
    newValueJson: result,
    performedBy: actor.id,
    ipAddress: req.ip,
  });

  return sendOk(res, result);
});
