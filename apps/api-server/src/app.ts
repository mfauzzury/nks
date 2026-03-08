import fs from "node:fs";

import cookieParser from "cookie-parser";
import cors from "cors";
import express from "express";

import { env } from "./config/env.js";
import { requireAuth } from "./middleware/auth.js";
import { issueCsrfCookie, requireCsrf } from "./middleware/csrf.js";
import { errorHandler, notFound } from "./middleware/error-handler.js";
import { authPublicRouter, authRouter } from "./routes/auth.js";
import { auditRouter } from "./routes/audit.js";
import { dashboardRouter } from "./routes/dashboard.js";
import { developmentRouter } from "./routes/development.js";
import { duplicatesRouter } from "./routes/duplicates.js";
import { guestPaymentsRouter } from "./routes/guest-payments.js";
import { healthRouter } from "./routes/health.js";
import { mergesRouter } from "./routes/merges.js";
import { mediaRouter } from "./routes/media.js";
import { pagesRouter } from "./routes/pages.js";
import { payersRouter } from "./routes/payers.js";
import { categoriesRouter } from "./routes/categories.js";
import { counterRouter } from "./routes/counter.js";
import { postsRouter } from "./routes/posts.js";
import { reconciliationRouter } from "./routes/reconciliation.js";
import { scheduledPaymentsRouter } from "./routes/scheduled-payments.js";
import { rolesRouter } from "./routes/roles.js";
import { settingsRouter } from "./routes/settings.js";
import { spgRouter } from "./routes/spg.js";
import { statusRouter } from "./routes/status.js";
import { usersRouter } from "./routes/users.js";
import { sendError } from "./utils/responses.js";

fs.mkdirSync(env.uploadDir, { recursive: true });

export const app = express();

app.use(
  cors({
    origin: env.corsOrigins,
    credentials: true,
  }),
);
app.use(express.json({ limit: "2mb" }));
app.use(cookieParser());
app.use(issueCsrfCookie);

app.use("/uploads", express.static(env.uploadDir));

app.use("/api", healthRouter);
app.use("/api/auth", authPublicRouter);

app.use((req, res, next) => {
  const isPublicSpgPortalRoute =
    (req.path === "/api/spg/template" && req.method === "GET") ||
    (req.path === "/api/spg/batches/preview" && req.method === "POST") ||
    (req.path === "/api/spg/batches/revalidate" && req.method === "POST") ||
    (req.path === "/api/spg/batches" && (req.method === "GET" || req.method === "POST")) ||
    (/^\/api\/spg\/batches\/\d+$/.test(req.path) && req.method === "GET") ||
    (/^\/api\/spg\/batches\/\d+\/receipt$/.test(req.path) && req.method === "GET") ||
    (/^\/api\/spg\/batches\/\d+\/pay\/online\/initiate$/.test(req.path) && req.method === "POST") ||
    (/^\/api\/spg\/batches\/\d+\/pay\/online\/callback$/.test(req.path) && req.method === "POST");
  const isPublicPortalWrite =
    (req.path === "/api/payers/individual" && req.method === "POST") ||
    (req.path === "/api/payers/corporate" && req.method === "POST") ||
    (req.path === "/api/payers/spg-employer" && req.method === "POST") ||
    (req.path === "/api/payers/update-request" && req.method === "POST") ||
    (req.path === "/api/payers/corporate-zakat" && req.method === "POST") ||
    (req.path === "/api/payers/login" && req.method === "POST") ||
    (req.path === "/api/guest-payments" && req.method === "POST") ||
    (req.path === "/api/scheduled-payments" && req.method === "POST");
  const isPublicGuestReceiptRead =
    req.path.startsWith("/api/guest-payments/") && req.method === "GET";
  const isPublicPortalProfileRead =
    req.path.startsWith("/api/payers/portal-profile/") && req.method === "GET";
  const isPublicScheduledPaymentRead =
    req.path.startsWith("/api/scheduled-payments/by-identity/") && req.method === "GET";

  if (req.path === "/api/health" || req.path === "/api/auth/login") {
    return next();
  }
  if (req.path === "/api/settings" && req.method === "GET") {
    return next();
  }
  if (req.path === "/api/settings/zakat-types" && req.method === "GET") {
    return next();
  }
  if (isPublicPortalWrite) {
    return next();
  }
  if (isPublicSpgPortalRoute) {
    return next();
  }
  if (isPublicGuestReceiptRead) {
    return next();
  }
  if (isPublicPortalProfileRead) {
    return next();
  }
  if (isPublicScheduledPaymentRead) {
    return next();
  }
  return requireAuth(req, res, next);
});

app.use((req, res, next) => {
  const isPublicSpgPortalRoute =
    (req.path === "/api/spg/template" && req.method === "GET") ||
    (req.path === "/api/spg/batches/preview" && req.method === "POST") ||
    (req.path === "/api/spg/batches/revalidate" && req.method === "POST") ||
    (req.path === "/api/spg/batches" && (req.method === "GET" || req.method === "POST")) ||
    (/^\/api\/spg\/batches\/\d+$/.test(req.path) && req.method === "GET") ||
    (/^\/api\/spg\/batches\/\d+\/receipt$/.test(req.path) && req.method === "GET") ||
    (/^\/api\/spg\/batches\/\d+\/pay\/online\/initiate$/.test(req.path) && req.method === "POST") ||
    (/^\/api\/spg\/batches\/\d+\/pay\/online\/callback$/.test(req.path) && req.method === "POST");
  const isPublicPortalWrite =
    (req.path === "/api/payers/individual" && req.method === "POST") ||
    (req.path === "/api/payers/corporate" && req.method === "POST") ||
    (req.path === "/api/payers/spg-employer" && req.method === "POST") ||
    (req.path === "/api/payers/update-request" && req.method === "POST") ||
    (req.path === "/api/payers/corporate-zakat" && req.method === "POST") ||
    (req.path === "/api/payers/login" && req.method === "POST") ||
    (req.path === "/api/guest-payments" && req.method === "POST") ||
    (req.path === "/api/scheduled-payments" && req.method === "POST");
  const isPublicPortalProfileRead =
    req.path.startsWith("/api/payers/portal-profile/") && req.method === "GET";

  if (!req.path.startsWith("/api") || req.path === "/api/auth/login" || isPublicPortalWrite || isPublicPortalProfileRead || isPublicSpgPortalRoute) return next();
  return requireCsrf(req, res, next);
});

app.use("/api/posts", postsRouter);
app.use("/api/categories", categoriesRouter);
app.use("/api/pages", pagesRouter);
app.use("/api/media", mediaRouter);
app.use("/api/settings", settingsRouter);
app.use("/api/users", usersRouter);
app.use("/api/roles", rolesRouter);
app.use("/api/dashboard", dashboardRouter);
app.use("/api/development", developmentRouter);
app.use("/api/payers", payersRouter);
app.use("/api/spg", spgRouter);
app.use("/api/counter", counterRouter);
app.use("/api/reconciliation", reconciliationRouter);
app.use("/api/duplicates", duplicatesRouter);
app.use("/api/merges", mergesRouter);
app.use("/api/status", statusRouter);
app.use("/api/audit", auditRouter);
app.use("/api/guest-payments", guestPaymentsRouter);
app.use("/api/scheduled-payments", scheduledPaymentsRouter);
app.use("/api/auth", authRouter);

app.use((req, res, next) => {
  if (req.path.startsWith("/api")) {
    return sendError(res, 404, "NOT_FOUND", "Resource not found");
  }
  return next();
});

app.use(notFound);
app.use(errorHandler);
