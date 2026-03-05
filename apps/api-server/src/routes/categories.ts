import { Prisma } from "@prisma/client";
import { Router } from "express";

import { prisma } from "../prisma.js";
import { uniqueCategorySlug } from "../utils/slug.js";
import { sendError, sendOk } from "../utils/responses.js";
import { listQuerySchema, categoryInputSchema } from "./schemas.js";

export const categoriesRouter = Router();

categoriesRouter.get("/", async (req, res) => {
  const query = listQuerySchema.parse(req.query);
  const where: Prisma.CategoryWhereInput = {
    ...(query.q
      ? {
          OR: [
            { name: { contains: query.q } },
            { slug: { contains: query.q } },
          ],
        }
      : {}),
  };

  const [total, rows] = await Promise.all([
    prisma.category.count({ where }),
    prisma.category.findMany({
      where,
      skip: (query.page - 1) * query.limit,
      take: query.limit,
      orderBy: { [query.sortBy]: query.sortDir },
      include: { _count: { select: { posts: true } } },
    }),
  ]);

  return sendOk(res, rows, {
    page: query.page,
    limit: query.limit,
    total,
    totalPages: Math.ceil(total / query.limit),
  });
});

categoriesRouter.post("/", async (req, res) => {
  const payload = categoryInputSchema.parse(req.body);
  const slug = await uniqueCategorySlug(payload.name, payload.slug);

  const record = await prisma.category.create({
    data: {
      name: payload.name,
      slug,
      description: payload.description ?? null,
    },
    include: { _count: { select: { posts: true } } },
  });

  return sendOk(res, record);
});

categoriesRouter.get("/:id", async (req, res) => {
  const id = Number(req.params.id);
  const record = await prisma.category.findUnique({
    where: { id },
    include: { _count: { select: { posts: true } } },
  });
  if (!record) return sendError(res, 404, "NOT_FOUND", "Category not found");
  return sendOk(res, record);
});

categoriesRouter.put("/:id", async (req, res) => {
  const id = Number(req.params.id);
  const existing = await prisma.category.findUnique({ where: { id } });
  if (!existing) return sendError(res, 404, "NOT_FOUND", "Category not found");

  const payload = categoryInputSchema.parse(req.body);
  const slug = await uniqueCategorySlug(payload.name, payload.slug, id);

  const record = await prisma.category.update({
    where: { id },
    data: {
      name: payload.name,
      slug,
      description: payload.description ?? null,
    },
    include: { _count: { select: { posts: true } } },
  });

  return sendOk(res, record);
});

categoriesRouter.delete("/:id", async (req, res) => {
  const id = Number(req.params.id);
  await prisma.category.delete({ where: { id } }).catch(() => null);
  return sendOk(res, { success: true });
});
