import { Prisma } from "@prisma/client";
import { Router } from "express";

import { prisma } from "../prisma.js";
import { uniquePostSlug } from "../utils/slug.js";
import { sendError, sendOk } from "../utils/responses.js";
import { listQuerySchema, postInputSchema } from "./schemas.js";

export const postsRouter = Router();

postsRouter.get("/", async (req, res) => {
  const query = listQuerySchema.parse(req.query);
  const where: Prisma.PostWhereInput = {
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
    prisma.post.count({ where }),
    prisma.post.findMany({
      where,
      skip: (query.page - 1) * query.limit,
      take: query.limit,
      orderBy: { [query.sortBy]: query.sortDir },
      include: { featuredImage: true, categories: true },
    }),
  ]);

  return sendOk(res, rows, {
    page: query.page,
    limit: query.limit,
    total,
    totalPages: Math.ceil(total / query.limit),
  });
});

postsRouter.post("/", async (req, res) => {
  const payload = postInputSchema.parse(req.body);
  const slug = await uniquePostSlug(payload.title, payload.slug);

  const record = await prisma.post.create({
    data: {
      title: payload.title,
      slug,
      excerpt: payload.excerpt,
      content: payload.content,
      status: payload.status,
      featuredImageId: payload.featuredImageId ?? null,
      publishedAt: payload.status === "published" ? new Date() : null,
      ...(payload.categoryIds ? { categories: { connect: payload.categoryIds.map((cid) => ({ id: cid })) } } : {}),
    },
    include: { featuredImage: true, categories: true },
  });

  return sendOk(res, record);
});

postsRouter.get("/:id", async (req, res) => {
  const id = Number(req.params.id);
  const record = await prisma.post.findUnique({ where: { id }, include: { featuredImage: true, categories: true } });
  if (!record) return sendError(res, 404, "NOT_FOUND", "Post not found");
  return sendOk(res, record);
});

postsRouter.put("/:id", async (req, res) => {
  const id = Number(req.params.id);
  const existing = await prisma.post.findUnique({ where: { id } });
  if (!existing) return sendError(res, 404, "NOT_FOUND", "Post not found");

  const payload = postInputSchema.parse(req.body);
  const slug = await uniquePostSlug(payload.title, payload.slug, id);

  const record = await prisma.post.update({
    where: { id },
    data: {
      title: payload.title,
      slug,
      excerpt: payload.excerpt,
      content: payload.content,
      status: payload.status,
      featuredImageId: payload.featuredImageId ?? null,
      publishedAt: payload.status === "published" ? existing.publishedAt ?? new Date() : null,
      ...(payload.categoryIds !== undefined ? { categories: { set: payload.categoryIds.map((cid) => ({ id: cid })) } } : {}),
    },
    include: { featuredImage: true, categories: true },
  });

  return sendOk(res, record);
});

postsRouter.delete("/:id", async (req, res) => {
  const id = Number(req.params.id);
  await prisma.post.delete({ where: { id } }).catch(() => null);
  return sendOk(res, { success: true });
});
