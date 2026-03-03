import { Router } from "express";

import { detectSpgEmployeeDuplicate } from "../services/duplicates.js";
import { prisma } from "../prisma.js";
import type { AuthedRequest } from "../types.js";
import { writeAuditLog } from "../utils/payer.js";
import { sendError, sendOk } from "../utils/responses.js";
import { duplicateCaseListQuerySchema } from "./schemas.js";

export const duplicatesRouter = Router();

duplicatesRouter.get("/cases", async (req, res) => {
  const q = duplicateCaseListQuerySchema.parse(req.query);
  const where = q.status ? { status: q.status } : {};

  const [rows, total] = await Promise.all([
    prisma.duplicateCase.findMany({
      where,
      include: {
        detectedByUser: { select: { id: true, name: true, role: true } },
        matches: {
          include: {
            candidatePayer: { select: { id: true, payerCode: true, displayName: true, identityNo: true } },
            matchedSpgEmployee: true,
          },
        },
      },
      orderBy: { detectedAt: "desc" },
      skip: (q.page - 1) * q.limit,
      take: q.limit,
    }),
    prisma.duplicateCase.count({ where }),
  ]);

  return sendOk(res, rows, { page: q.page, limit: q.limit, total });
});

duplicatesRouter.get("/cases/:id", async (req, res) => {
  const id = Number(req.params.id);
  const row = await prisma.duplicateCase.findUnique({
    where: { id },
    include: {
      detectedByUser: { select: { id: true, name: true, role: true } },
      matches: {
        include: {
          candidatePayer: {
            include: {
              individual: true,
              addresses: true,
            },
          },
          matchedSpgEmployee: true,
        },
      },
    },
  });
  if (!row) return sendError(res, 404, "NOT_FOUND", "Duplicate case not found");
  return sendOk(res, row);
});

duplicatesRouter.post("/detect/spg-employee/:employeeId", async (req: AuthedRequest, res) => {
  const employeeId = Number(req.params.employeeId);
  const employee = await prisma.spgEmployee.findUnique({ where: { id: employeeId } });
  if (!employee) return sendError(res, 404, "NOT_FOUND", "SPG employee not found");

  const duplicateCase = await detectSpgEmployeeDuplicate({
    employeeId,
    detectedBy: req.auth?.userId,
    source: "manual",
  });

  if (!duplicateCase) {
    return sendOk(res, { detected: false, message: "No duplicate candidate found" });
  }

  await writeAuditLog({
    entityName: "duplicate_case",
    entityId: String(duplicateCase.id),
    action: "DETECT",
    newValueJson: duplicateCase,
    performedBy: req.auth?.userId,
    ipAddress: req.ip,
  });

  return sendOk(res, { detected: true, case: duplicateCase });
});

duplicatesRouter.post("/cases/:id/reject", async (req: AuthedRequest, res) => {
  const id = Number(req.params.id);
  const row = await prisma.duplicateCase.findUnique({ where: { id } });
  if (!row) return sendError(res, 404, "NOT_FOUND", "Duplicate case not found");

  const notes = typeof req.body?.notes === "string" ? req.body.notes : undefined;
  const updated = await prisma.duplicateCase.update({
    where: { id },
    data: {
      status: "rejected",
      notes: notes ?? row.notes,
    },
  });

  await writeAuditLog({
    entityName: "duplicate_case",
    entityId: String(updated.id),
    action: "REJECT",
    oldValueJson: row,
    newValueJson: updated,
    performedBy: req.auth?.userId,
    ipAddress: req.ip,
  });

  return sendOk(res, updated);
});
