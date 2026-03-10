import fs from "node:fs";
import path from "node:path";

import bcrypt from "bcryptjs";
import { Router } from "express";
import multer from "multer";

import { env, isProduction } from "../config/env.js";
import { loginRateLimit } from "../middleware/rate-limit.js";
import { prisma } from "../prisma.js";
import type { AuthedRequest } from "../types.js";
import { randomToken, signToken } from "../utils/crypto.js";
import { sendError, sendOk } from "../utils/responses.js";
import { loginSchema } from "./schemas.js";

const avatarStorage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, env.uploadDir),
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, `avatar-${Date.now()}${ext}`);
  },
});

const avatarUpload = multer({
  storage: avatarStorage,
  limits: { fileSize: 2 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    if (!["image/png", "image/jpeg", "image/webp", "image/gif"].includes(file.mimetype)) {
      cb(new Error("Only image files are allowed"));
      return;
    }
    cb(null, true);
  },
});

export const authRouter = Router();
export const authPublicRouter = Router();

authPublicRouter.post("/login", loginRateLimit, async (req, res) => {
  const payload = loginSchema.parse(req.body);

  const user = await prisma.user.findUnique({ where: { email: payload.email } });
  if (!user) {
    return sendError(res, 401, "INVALID_CREDENTIALS", "Invalid email or password");
  }

  const validPassword = await bcrypt.compare(payload.password, user.passwordHash);
  if (!validPassword) {
    return sendError(res, 401, "INVALID_CREDENTIALS", "Invalid email or password");
  }

  const rawToken = randomToken();
  const tokenHash = signToken(rawToken);
  const expiresAt = new Date(Date.now() + env.sessionTtlHours * 60 * 60 * 1000);

  await prisma.session.create({
    data: {
      userId: user.id,
      tokenHash,
      expiresAt,
    },
  });

  res.cookie(env.cookieName, rawToken, {
    httpOnly: true,
    sameSite: "lax",
    secure: isProduction,
    path: "/",
    expires: expiresAt,
  });

  return sendOk(res, {
    user: await userPayloadWithPermissions(user),
  });
});

authRouter.post("/logout", async (req, res) => {
  const rawToken = req.cookies?.[env.cookieName];
  if (rawToken) {
    const tokenHash = signToken(rawToken);
    await prisma.session.deleteMany({ where: { tokenHash } });
  }

  res.clearCookie(env.cookieName, { path: "/" });
  return sendOk(res, { success: true });
});

async function userPayloadWithPermissions(
  user: { id: number; email: string; name: string; photoUrl: string | null; role: string },
) {
  const roleRecord = await prisma.role.findUnique({ where: { name: user.role } });
  let permissions: string[] = [];
  if (roleRecord?.permissions) {
    try {
      permissions = JSON.parse(roleRecord.permissions) as string[];
    } catch {
      /* ignore */
    }
  }
  // Admin role gets all known permissions if not in Role table
  if (user.role === "admin" && permissions.length === 0) {
    permissions = [
      "pembayar.view", "pembayar.create", "pembayar.edit", "pembayar.delete",
      "spg.view", "spg.create", "spg.edit",
      "kaunter.view", "kaunter.create", "kaunter.reconcile",
      "zakat.view", "zakat.create", "zakat.edit", "zakat.delete",
      "posts.view", "posts.create", "posts.edit", "posts.delete",
      "pages.view", "pages.create", "pages.edit", "pages.delete",
      "media.view", "media.upload", "media.delete",
      "users.view", "users.create", "users.edit", "users.delete",
      "roles.view", "roles.create", "roles.edit", "roles.delete",
      "settings.view", "settings.edit",
      "menus.view", "menus.edit",
      "integration.view", "integration.upload", "integration.process",
      "integration.reconcile", "integration.exceptions", "integration.reports",
      "development.view",
    ];
  }
  return {
    id: user.id,
    email: user.email,
    name: user.name,
    photoUrl: user.photoUrl,
    role: user.role,
    permissions,
  };
}

authRouter.get("/me", async (req: AuthedRequest, res) => {
  if (!req.auth) {
    return sendError(res, 401, "UNAUTHORIZED", "Authentication required");
  }

  const user = await prisma.user.findUnique({ where: { id: req.auth.userId } });
  if (!user) {
    return sendError(res, 401, "UNAUTHORIZED", "User not found");
  }

  return sendOk(res, {
    user: await userPayloadWithPermissions(user),
    csrfToken: req.csrfTokenValue ?? req.cookies?.[env.csrfCookieName] ?? "",
  });
});

authRouter.put("/me", async (req: AuthedRequest, res) => {
  if (!req.auth) {
    return sendError(res, 401, "UNAUTHORIZED", "Authentication required");
  }

  const { name, email } = req.body;
  const data: Record<string, string> = {};
  if (name) data.name = name;
  if (email) data.email = email;

  const user = await prisma.user.update({
    where: { id: req.auth.userId },
    data,
  });

  return sendOk(res, { user: await userPayloadWithPermissions(user) });
});

authRouter.post("/password", async (req: AuthedRequest, res) => {
  if (!req.auth) {
    return sendError(res, 401, "UNAUTHORIZED", "Authentication required");
  }

  const { currentPassword, newPassword } = req.body;
  if (!currentPassword || !newPassword) {
    return sendError(res, 400, "VALIDATION_ERROR", "Current password and new password are required");
  }

  const user = await prisma.user.findUnique({ where: { id: req.auth.userId } });
  if (!user) {
    return sendError(res, 401, "UNAUTHORIZED", "User not found");
  }

  const valid = await bcrypt.compare(currentPassword, user.passwordHash);
  if (!valid) {
    return sendError(res, 400, "INVALID_PASSWORD", "Current password is incorrect");
  }

  const passwordHash = await bcrypt.hash(newPassword, 10);
  await prisma.user.update({
    where: { id: req.auth.userId },
    data: { passwordHash },
  });

  return sendOk(res, { message: "Password changed successfully" });
});

authRouter.post("/avatar", avatarUpload.single("file"), async (req: AuthedRequest, res) => {
  if (!req.auth) {
    return sendError(res, 401, "UNAUTHORIZED", "Authentication required");
  }

  const file = req.file;
  if (!file) {
    return sendError(res, 400, "FILE_REQUIRED", "No file uploaded");
  }

  // Remove old avatar file if exists
  const existing = await prisma.user.findUnique({ where: { id: req.auth.userId } });
  if (existing?.photoUrl) {
    const oldPath = path.join(env.uploadDir, path.basename(existing.photoUrl));
    try { fs.unlinkSync(oldPath); } catch { /* noop */ }
  }

  const photoUrl = `/uploads/${file.filename}`;
  const user = await prisma.user.update({
    where: { id: req.auth.userId },
    data: { photoUrl },
  });

  return sendOk(res, { user: await userPayloadWithPermissions(user) });
});

authRouter.delete("/avatar", async (req: AuthedRequest, res) => {
  if (!req.auth) {
    return sendError(res, 401, "UNAUTHORIZED", "Authentication required");
  }

  const existing = await prisma.user.findUnique({ where: { id: req.auth.userId } });
  if (existing?.photoUrl) {
    const oldPath = path.join(env.uploadDir, path.basename(existing.photoUrl));
    try { fs.unlinkSync(oldPath); } catch { /* noop */ }
  }

  const user = await prisma.user.update({
    where: { id: req.auth.userId },
    data: { photoUrl: null },
  });

  return sendOk(res, { user: await userPayloadWithPermissions(user) });
});
