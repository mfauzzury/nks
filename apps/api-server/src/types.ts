import type { PublishStatus } from "@prisma/client";
import type { Request } from "express";

export type ApiSuccess<T> = { data: T; meta?: Record<string, unknown> };
export type ApiError = { error: { code: string; message: string; details?: unknown } };

export type AuthSession = {
  userId: number;
  email: string;
  name: string;
};

export type PostInput = {
  title: string;
  slug?: string;
  excerpt?: string;
  content: string;
  status: PublishStatus;
  featuredImageId?: number | null;
};

export type PageInput = {
  title: string;
  slug?: string;
  content: string;
  status: PublishStatus;
};

export type MediaMeta = {
  id: number;
  filename: string;
  originalName: string;
  title: string | null;
  caption: string | null;
  description: string | null;
  mimeType: string;
  size: number;
  width: number | null;
  height: number | null;
  altText: string | null;
  path: string;
  url: string;
  createdAt: Date;
};

export type SettingsPayload = {
  siteTitle: string;
  tagline: string;
  titleFormat: string;
  metaDescription: string;
  siteIconUrl: string;
  sidebarLogoUrl: string;
  portalLogoUrl: string;
  faviconUrl: string;
  language: string;
  timezone: string;
  footerText: string;
};

export type AuthedRequest = Request & {
  auth?: AuthSession;
  csrfTokenValue?: string;
};
