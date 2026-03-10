# Build stage — API server only (matches npm workspaces + lockfile)
FROM node:22-alpine AS builder

WORKDIR /app

# Prisma on Alpine needs OpenSSL
RUN apk add --no-cache openssl

# Copy root and all workspace package.json so npm ci matches lockfile (workspaces: apps/*)
COPY package.json package-lock.json* ./
COPY apps/api-server/package.json ./apps/api-server/
COPY apps/admin-web/package.json ./apps/admin-web/

# Install all dependencies (including dev for build)
RUN npm ci

# Copy api-server source and prisma schema
COPY apps/api-server ./apps/api-server

# Generate Prisma client and build API (generate must match api-server node_modules — see schema output)
WORKDIR /app/apps/api-server
RUN npm exec prisma generate
RUN npm run build

# Production stage
FROM node:22-alpine AS runner

WORKDIR /app

RUN apk add --no-cache openssl

# Copy package files (all workspaces — required for lockfile/consistency if re-running npm)
COPY package.json package-lock.json* ./
COPY apps/api-server/package.json ./apps/api-server/
COPY apps/admin-web/package.json ./apps/admin-web/

# Copy production node_modules from builder (Prisma client already generated)
COPY --from=builder /app/node_modules ./node_modules
RUN npm prune --omit=dev
# After prune, ensure api-server resolves generated client (not stub) — overlay .prisma from builder
RUN mkdir -p ./apps/api-server/node_modules
COPY --from=builder /app/apps/api-server/node_modules/.prisma ./apps/api-server/node_modules/.prisma

# Copy built API and Prisma schema (for migrations at runtime if needed)
COPY --from=builder /app/apps/api-server/dist ./apps/api-server/dist
COPY --from=builder /app/apps/api-server/prisma ./apps/api-server/prisma

WORKDIR /app/apps/api-server

ENV NODE_ENV=production
EXPOSE 4000

CMD ["node", "dist/server.js"]
