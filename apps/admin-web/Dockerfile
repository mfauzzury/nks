# Admin Web - Vue 3 + Vite
FROM node:22-alpine AS builder

WORKDIR /app

# Build arg for API URL (baked into client at build time)
ARG VITE_API_BASE_URL=http://localhost:4000
ENV VITE_API_BASE_URL=$VITE_API_BASE_URL

# Copy workspace files
COPY package.json package-lock.json ./
COPY apps/admin-web ./apps/admin-web

# Install and build (retries help with ECONNRESET on flaky networks)
RUN npm config set fetch-retries 5 && npm config set fetch-timeout 120000 && npm ci
RUN npm run build -w admin-web

# Production: serve with nginx
FROM nginx:alpine

# Copy built assets from builder
COPY --from=builder /app/apps/admin-web/dist /usr/share/nginx/html

# SPA fallback: serve index.html for all routes
RUN echo 'server { \
    listen 80; \
    root /usr/share/nginx/html; \
    index index.html; \
    location / { \
        try_files $uri $uri/ /index.html; \
    } \
}' > /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
