# API Server — Express + Prisma + MySQL (matches root package.json workspaces)
FROM node:22-alpine

WORKDIR /app

# Prisma client on Alpine
RUN apk add --no-cache openssl

# Copy root + all workspace package.json first so npm ci matches package-lock (workspaces: apps/*)
COPY package.json package-lock.json ./
COPY apps/admin-web/package.json ./apps/admin-web/
COPY apps/api-server/package.json ./apps/api-server/

# Install (retries help with ECONNRESET on flaky networks)
RUN npm config set fetch-retries 5 && npm config set fetch-timeout 120000 && npm ci

# Copy api-server source after deps layer (better cache)
COPY apps/api-server ./apps/api-server

WORKDIR /app/apps/api-server

# Prisma generate needs DATABASE_URL in env; placeholder only (no DB connection during build)
ENV DATABASE_URL="mysql://root:rootpass@localhost:3306/corrad_xpress"
# Generate into apps/api-server/node_modules/.prisma (schema output path); npm workspaces
# can otherwise leave the stub in api-server while client is generated at repo root.
RUN npm exec prisma generate
RUN npm run build

# Uploads directory (matches docker-compose volume and UPLOAD_DIR)
RUN mkdir -p uploads

ENV NODE_ENV=production
EXPOSE 4000

# Wait for MySQL, push schema, seed, start. Jika gagal sambung, ralat sebenar akan keluar dalam log.
CMD ["sh", "-c", "until npx prisma db push 2>&1; do echo 'Waiting for MySQL (sahkan DATABASE_URL dan kebolehcapaian dari container)...'; sleep 5; done && (cd /app && npm run db:seed) && node dist/server.js"]
