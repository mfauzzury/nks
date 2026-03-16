import { PublishStatus } from "@prisma/client";
import { Router } from "express";

import { prisma } from "../prisma.js";
import { sendError, sendOk } from "../utils/responses.js";
import { storefrontMenuSchema } from "./schemas.js";

export const publicRouter = Router();

function parseFrontPageId(value: string | undefined) {
  if (!value || value === "null") return null;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

function normalizeStorefrontMenuItems(input: Array<{ id?: string; label: string; href: string; parentId?: string | null; openInNewTab: boolean }>) {
  const withIds = input.map((item, index) => ({
    id: item.id?.trim() || `menu_${index + 1}`,
    label: item.label,
    href: item.href,
    parentId: item.parentId ?? null,
    openInNewTab: item.openInNewTab,
  }));
  const idSet = new Set(withIds.map((item) => item.id));
  return withIds.map((item) => ({
    ...item,
    parentId: item.parentId && idSet.has(item.parentId) && item.parentId !== item.id ? item.parentId : null,
  }));
}

publicRouter.get("/site", async (_req, res) => {
  const rows = await prisma.setting.findMany({
    where: {
      key: {
        in: [
          "siteTitle",
          "tagline",
          "webfrontTitle",
          "webfrontTagline",
          "metaDescription",
          "footerText",
          "siteIconUrl",
          "webfrontLogoUrl",
          "sidebarLogoUrl",
          "faviconUrl",
          "storefrontMenu",
        ],
      },
    },
  });
  const map = Object.fromEntries(rows.map((row) => [row.key, row.value])) as Record<string, string | undefined>;
  let storefrontMenu: Array<{ id: string; label: string; href: string; parentId: string | null; openInNewTab: boolean }> = [];
  if (map.storefrontMenu) {
    try {
      storefrontMenu = normalizeStorefrontMenuItems(storefrontMenuSchema.parse(JSON.parse(map.storefrontMenu)));
    } catch {
      storefrontMenu = [];
    }
  }

  return sendOk(res, {
    siteTitle: map.siteTitle ?? "",
    tagline: map.tagline ?? "",
    webfrontTitle: map.webfrontTitle ?? map.siteTitle ?? "",
    webfrontTagline: map.webfrontTagline ?? map.tagline ?? "",
    metaDescription: map.metaDescription ?? "",
    footerText: map.footerText ?? "",
    siteIconUrl: map.siteIconUrl ?? "",
    webfrontLogoUrl: map.webfrontLogoUrl ?? map.siteIconUrl ?? "",
    sidebarLogoUrl: map.sidebarLogoUrl ?? "",
    faviconUrl: map.faviconUrl ?? "",
    storefrontMenu,
  });
});

publicRouter.get("/pages/frontpage", async (_req, res) => {
  const status = PublishStatus.published;
  const setting = await prisma.setting.findUnique({ where: { key: "frontPageId" } });
  const frontPageId = parseFrontPageId(setting?.value);

  if (frontPageId !== null) {
    const selected = await prisma.page.findFirst({
      where: { id: frontPageId, status },
      include: { featuredImage: true },
    });
    if (selected) {
      return sendOk(res, selected, { source: "frontPageId" });
    }
  }

  const homeSlug = await prisma.page.findFirst({
    where: { slug: "home", status },
    include: { featuredImage: true },
  });
  if (homeSlug) {
    return sendOk(res, homeSlug, { source: "home-slug" });
  }

  const latest = await prisma.page.findFirst({
    where: { status },
    include: { featuredImage: true },
    orderBy: { updatedAt: "desc" },
  });
  if (latest) {
    return sendOk(res, latest, { source: "latest" });
  }

  return sendError(res, 404, "NOT_FOUND", "No published page yet");
});

publicRouter.get("/pages/:slug", async (req, res) => {
  const slug = String(req.params.slug || "").trim();
  if (!slug) return sendError(res, 404, "NOT_FOUND", "Page not found");

  const page = await prisma.page.findFirst({
    where: { slug, status: PublishStatus.published },
    include: { featuredImage: true },
  });

  if (!page) return sendError(res, 404, "NOT_FOUND", "Page not found");
  return sendOk(res, page);
});
