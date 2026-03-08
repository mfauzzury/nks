# CMS Release Setup

This repository contains a CMS stack:
- `apps/api-server`: Express + Prisma + MySQL API
- `apps/admin-web`: Vue 3 + Vite admin panel

The root Next.js app is optional reference UI and is not required to run CMS.

## Clean Setup (Recommended)

Run from repo root:

```bash
npm run clean:all
npm run setup:cms
npm run dev:cms
```

What this does:
- Removes old build/cache/local state (`clean:all`)
- Installs dependencies
- Creates missing `.env` files from `.env.example`
- Generates Prisma client
- Pushes database schema
- Seeds default data
- Starts API + Admin in dev mode

## Local Development

Ensure MySQL is running and `DATABASE_URL` is set in `apps/api-server/.env`. After schema changes:

```bash
npm run db:push    # apply schema
npm run db:seed   # seed default data (roles, sources, etc.)
```

Optional env vars (in `apps/api-server/.env`):
- `SESSION_SECRET` – session signing key
- `ADMIN_EMAIL` / `ADMIN_PASSWORD` – admin credentials
- `JAN_PGP_PASSWORD` – PGP decryption password for JAN encrypted files (default: `nks-jan-dev-2025`)

**Generate JAN sample (1200 records, PGP encrypted):**
```bash
npm run generate:jan-sample
```
Output: `uploads/samples/jan-sample-1200.txt.gpg`. Upload via Admin → Integration → File Upload (source=JAN, fileType=Encrypted .txt).

## URLs

- API: `http://localhost:4000`
- Admin Web: `http://localhost:5173`

## Default Admin Login

From `apps/api-server/.env`:
- `ADMIN_EMAIL=admin@example.com`
- `ADMIN_PASSWORD=admin12345`

## Common Commands

```bash
npm run clean        # remove generated files, keep local DB/uploads/.env
npm run clean:all    # full reset including .env, DB, uploads
npm run setup:cms    # one-command CMS bootstrap
npm run dev:cms      # run api + admin
npm run build:cms    # build api + admin
```

## API Endpoints

- `POST /api/auth/login`
- `POST /api/auth/logout`
- `GET /api/auth/me`
- `GET /api/posts`
- `POST /api/posts`
- `GET /api/posts/:id`
- `PUT /api/posts/:id`
- `DELETE /api/posts/:id`
- `GET /api/pages`
- `POST /api/pages`
- `GET /api/pages/:id`
- `PUT /api/pages/:id`
- `DELETE /api/pages/:id`
- `GET /api/media`
- `POST /api/media/upload`
- `DELETE /api/media/:id`
- `GET /api/settings`
- `PUT /api/settings`
- `GET /api/dashboard/summary`
- `GET /api/health`
