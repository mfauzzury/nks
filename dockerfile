# Build stage
FROM node:20-alpine AS builder

WORKDIR /app

# Copy workspace and app package files
COPY package.json package-lock.json* ./
COPY apps/api-server/package.json ./apps/api-server/

# Install all dependencies (including dev for build)
RUN npm ci

# Copy api-server source and prisma schema
COPY apps/api-server ./apps/api-server

# Generate Prisma client and build API
WORKDIR /app/apps/api-server
RUN npx prisma generate
RUN npm run build

# Production stage
FROM node:20-alpine AS runner

WORKDIR /app

# Copy package files
COPY package.json package-lock.json* ./
COPY apps/api-server/package.json ./apps/api-server/

# Copy production node_modules from builder (Prisma client already generated)
COPY --from=builder /app/node_modules ./node_modules
RUN npm prune --production

# Copy built API and Prisma schema (for migrations at runtime if needed)
COPY --from=builder /app/apps/api-server/dist ./apps/api-server/dist
COPY --from=builder /app/apps/api-server/prisma ./apps/api-server/prisma

WORKDIR /app/apps/api-server

ENV NODE_ENV=production
EXPOSE 4000

CMD ["node", "dist/server.js"]
