import type { Response } from "express";

import { prisma } from "../prisma.js";
import { sendError } from "./responses.js";

export function generatePayerCode() {
  const rand = Math.floor(Math.random() * 900000) + 100000;
  return `PYR-${Date.now()}-${rand}`;
}

export async function getCurrentUser(reqUserId?: number) {
  if (!reqUserId) return null;
  return prisma.user.findUnique({
    where: { id: reqUserId },
    select: { id: true, role: true, name: true, email: true },
  });
}

export function normalizeRole(role: string) {
  return role.trim().toLowerCase();
}

export function hasRole(role: string, allowed: string[]) {
  const current = normalizeRole(role);
  return current === "admin" || allowed.map(normalizeRole).includes(current);
}

export async function requireRole(
  reqUserId: number | undefined,
  allowed: string[],
  res: Response,
) {
  const user = await getCurrentUser(reqUserId);
  if (!user) {
    sendError(res, 401, "UNAUTHORIZED", "Authentication required");
    return null;
  }
  if (!hasRole(user.role, allowed)) {
    sendError(res, 403, "FORBIDDEN", "You do not have permission");
    return null;
  }
  return user;
}

export async function writeAuditLog(input: {
  entityName: string;
  entityId: string;
  action: string;
  targetPayerId?: number | null;
  oldValueJson?: unknown;
  newValueJson?: unknown;
  performedBy?: number;
  ipAddress?: string;
}) {
  await prisma.auditLogProfile.create({
    data: {
      entityName: input.entityName,
      entityId: input.entityId,
      action: input.action,
      targetPayerId: input.targetPayerId ?? null,
      oldValueJson: input.oldValueJson === undefined ? undefined : JSON.stringify(input.oldValueJson),
      newValueJson: input.newValueJson === undefined ? undefined : JSON.stringify(input.newValueJson),
      performedBy: input.performedBy ?? null,
      ipAddress: input.ipAddress ?? null,
    },
  });
}
