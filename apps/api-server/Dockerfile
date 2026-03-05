# API Server - Express + Prisma + MySQL
FROM node:22-alpine

WORKDIR /app

# Copy workspace files
COPY package.json package-lock.json ./
COPY apps/api-server ./apps/api-server

# Install, generate Prisma, build (retries help with ECONNRESET on flaky networks)
RUN npm config set fetch-retries 5 && npm config set fetch-timeout 120000 && npm ci
WORKDIR /app/apps/api-server
# Prisma generate needs DATABASE_URL in env; use placeholder (no DB connection during build)
ENV DATABASE_URL="mysql://root:rootpass@localhost:3306/corrad_xpress"
RUN npx prisma generate
RUN npm run build

# Create uploads directory
RUN mkdir -p uploads

ENV NODE_ENV=production
EXPOSE 4000

# Wait for MySQL, push schema (no --accept-data-loss: never drop tables or delete data), seed, and start
CMD ["sh", "-c", "until npx prisma db push 2>/dev/null; do echo 'Waiting for MySQL...'; sleep 2; done && (cd /app && npm run db:seed) && node dist/server.js"]
