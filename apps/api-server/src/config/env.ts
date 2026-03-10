import dotenv from "dotenv";
import path from "node:path";

dotenv.config();

const rootDir = process.cwd();
const configuredCorsOrigins = (process.env.CORS_ORIGIN ?? "http://localhost:5173,http://127.0.0.1:5173")
  .split(",")
  .map((value) => value.trim())
  .filter(Boolean);
const defaultPortalOrigins = [
  "http://localhost:3000",
  "http://127.0.0.1:3000",
  "http://localhost:5173",
  "http://127.0.0.1:5173",
  "http://localhost:5174",
  "http://127.0.0.1:5174",
];
const corsOrigins = Array.from(new Set([...configuredCorsOrigins, ...defaultPortalOrigins]));

export const env = {
  nodeEnv: process.env.NODE_ENV ?? "development",
  port: Number(process.env.PORT ?? 4000),
  corsOrigins,
  sessionSecret: process.env.SESSION_SECRET ?? "change-me",
  sessionTtlHours: Number(process.env.SESSION_TTL_HOURS ?? 24),
  cookieName: process.env.COOKIE_NAME ?? "cms_session",
  csrfCookieName: process.env.CSRF_COOKIE_NAME ?? "cms_csrf",
  uploadDir: path.resolve(rootDir, process.env.UPLOAD_DIR ?? "uploads"),
  maxUploadBytes: Number(process.env.MAX_UPLOAD_MB ?? 5) * 1024 * 1024,
  openaiApiKey: process.env.OPENAI_API_KEY ?? "",
  openaiModel: process.env.OPENAI_MODEL ?? "gpt-4o-mini",
  /** PGP decryption password for JAN encrypted files (fallback if IntegrationConfig not set) */
  janPgpPassword: process.env.JAN_PGP_PASSWORD ?? "",
};

export const isProduction = env.nodeEnv === "production";
