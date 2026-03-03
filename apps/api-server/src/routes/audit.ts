import { Router } from "express";

import { prisma } from "../prisma.js";
import { sendOk } from "../utils/responses.js";

export const auditRouter = Router();

auditRouter.get("/profile/:payerId", async (req, res) => {
  const payerId = Number(req.params.payerId);
  const logs = await prisma.auditLogProfile.findMany({
    where: { targetPayerId: payerId },
    include: { performedByUser: { select: { id: true, name: true, role: true } } },
    orderBy: { performedAt: "desc" },
  });
  return sendOk(res, logs);
});
