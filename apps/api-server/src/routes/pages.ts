import { Prisma } from "@prisma/client";
import { Router } from "express";

import { prisma } from "../prisma.js";
import { sendError, sendOk } from "../utils/responses.js";
import { uniquePageSlug } from "../utils/slug.js";
import { listQuerySchema, pageInputSchema } from "./schemas.js";

export const pagesRouter = Router();

pagesRouter.get("/", async (req, res) => {
  const query = listQuerySchema.parse(req.query);
  const where: Prisma.PageWhereInput = {
    ...(query.status ? { status: query.status } : {}),
    ...(query.q
      ? {
          OR: [
            { title: { contains: query.q } },
            { content: { contains: query.q } },
            { slug: { contains: query.q } },
          ],
        }
      : {}),
  };

  const [total, rows] = await Promise.all([
    prisma.page.count({ where }),
    prisma.page.findMany({
      where,
      include: { featuredImage: true },
      skip: (query.page - 1) * query.limit,
      take: query.limit,
      orderBy: { [query.sortBy]: query.sortDir },
    }),
  ]);

  return sendOk(res, rows, {
    page: query.page,
    limit: query.limit,
    total,
    totalPages: Math.ceil(total / query.limit),
  });
});

pagesRouter.post("/", async (req, res) => {
  const payload = pageInputSchema.parse(req.body);
  const slug = await uniquePageSlug(payload.title, payload.slug);

  const record = await prisma.page.create({
    data: {
      title: payload.title,
      slug,
      content: payload.content,
      status: payload.status,
      featuredImageId: payload.featuredImageId ?? null,
      publishedAt: payload.status === "published" ? new Date() : null,
    },
    include: { featuredImage: true },
  });

  return sendOk(res, record);
});

pagesRouter.get("/:id", async (req, res) => {
  const id = Number(req.params.id);
  const record = await prisma.page.findUnique({ where: { id }, include: { featuredImage: true } });
  if (!record) return sendError(res, 404, "NOT_FOUND", "Page not found");
  return sendOk(res, record);
});

pagesRouter.put("/:id", async (req, res) => {
  const id = Number(req.params.id);
  const existing = await prisma.page.findUnique({ where: { id } });
  if (!existing) return sendError(res, 404, "NOT_FOUND", "Page not found");

  const payload = pageInputSchema.parse(req.body);
  const slug = await uniquePageSlug(payload.title, payload.slug, id);

  const record = await prisma.page.update({
    where: { id },
    data: {
      title: payload.title,
      slug,
      content: payload.content,
      status: payload.status,
      featuredImageId: payload.featuredImageId ?? null,
      publishedAt: payload.status === "published" ? existing.publishedAt ?? new Date() : null,
    },
    include: { featuredImage: true },
  });

  return sendOk(res, record);
});

pagesRouter.delete("/:id", async (req, res) => {
  const id = Number(req.params.id);
  await prisma.page.delete({ where: { id } }).catch(() => null);
  return sendOk(res, { success: true });
});
