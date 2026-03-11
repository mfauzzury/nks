# Deploying Web + API on Coolify

This repo has **two services**: **admin-web** (SPA + nginx) and **api-server** (Express API). On Coolify you can run them as **one Compose stack** (recommended) or as **two separate resources**.

---

## Option 1: One Compose stack (recommended)

Both services run from a single Coolify application; they share a network and the web container can reach the API as `api-server:4000`.

### 1. Create the application

1. In Coolify: **Applications** → **+ Add** (or **New Resource**).
2. Choose **Docker Compose** (or **Compose**).
3. Connect your Git repo (e.g. GitHub/GitLab) and select this repository.
4. Set **Compose file path**: `docker-compose.yml` (root).
5. **Branch**: e.g. `main`.

### 2. Configure build for admin-web (web service)

Coolify will build both images from the compose file. Add a **build argument** for the web service:

- **Service**: `admin-web`
- **Build argument**:
  - **Name**: `VITE_API_BASE_URL`
  - **Value**: `https://nks.sena.my` (use your real domain)

So the SPA calls `https://nks.sena.my/api/...` and nginx proxies to the API.

### 3. Environment variables for api-server (API service)

On the **api-server** service set at least:

| Variable | Example | Notes |
|----------|---------|--------|
| `DATABASE_URL` | `mysql://user:pass@host:3306/dbname` | Your MySQL URL |
| `CORS_ORIGIN` | `https://nks.sena.my` | Must include the domain users use for the UI |
| `SESSION_SECRET` | (random string) | Use a strong secret in production |
| `ADMIN_EMAIL` | Admin login email | For first admin user |
| `ADMIN_PASSWORD` | Admin login password | Change after first login |

Add any others your API needs (e.g. `JAN_PGP_PASSWORD`, `UPLOAD_DIR`, etc.) — see `apps/api-server/.env.example` or repo env docs.

### 4. Attach the public domain to the **web** service

1. In the Coolify Compose application, open **Domains** / **FQDNs**.
2. Add domain: **`nks.sena.my`**.
3. **Important:** Attach this domain to the **admin-web** service (port **80**), **not** to api-server.

Coolify will terminate HTTPS and route traffic to the nginx container. Nginx serves the SPA and proxies `/api/` and `/uploads/` to `api-server:4000` inside the stack.

### 5. (Optional) Don’t expose the API publicly

If you only want the API reachable via the same-origin proxy (no direct `https://api.nks.sena.my`):

- Don’t attach a domain to **api-server**.
- Only **admin-web** has the domain; all API traffic goes through `https://nks.sena.my/api/...`.

### 6. Deploy

Trigger **Deploy** / **Redeploy**. Coolify will:

- Build `api-server` and `admin-web` from the repo.
- Run both containers on the same network.
- Expose only what you configured (domain → admin-web:80).

### 7. Verify

- **`https://nks.sena.my`** → Login / admin UI (SPA).
- **`https://nks.sena.my/api/health`** → API health JSON (proxied).
- Log in; session cookies work because everything is same-origin.

---

## Option 2: Two separate Coolify resources

If you create **two applications** (one per Dockerfile) instead of one Compose:

1. **API application**
   - Build: Dockerfile = `apps/api-server/Dockerfile`, context = repo root.
   - Set env (e.g. `DATABASE_URL`, `CORS_ORIGIN`, `SESSION_SECRET`, etc.).
   - Deploy; note the **internal URL** Coolify gives it (e.g. `https://api-xxx.coolify.internal` or an internal hostname and port).

2. **Web application**
   - Build: Dockerfile = `apps/admin-web/Dockerfile`, context = repo root.
   - Build arg: `VITE_API_BASE_URL` = `https://nks.sena.my`.
   - **Nginx upstream:** Coolify will **not** use the name `api-server`. You must point nginx at the API’s internal address:
     - Either **edit** `apps/admin-web/nginx-default.conf`: replace `api-server:4000` with the API’s **internal hostname:port** (e.g. `api-service-name:4000` or the URL Coolify shows for the API container).
     - Or use a **custom nginx config** in Coolify that sets the correct upstream.
   - Attach domain **`nks.sena.my`** to this web app (port 80).

3. **Networking**
   - Ensure both resources are on a **shared network** in Coolify (or that the web container can resolve the API hostname and port).

Option 1 avoids hostname/port configuration and is simpler.

---

## Summary

| What | Where |
|------|--------|
| **Web (SPA + nginx)** | Service **admin-web**; Dockerfile `apps/admin-web/Dockerfile`. |
| **API (Express)** | Service **api-server**; Dockerfile `apps/api-server/Dockerfile`. |
| **Public domain** | Attach **only** to **admin-web** (port 80). |
| **Build arg for web** | `VITE_API_BASE_URL=https://nks.sena.my` (your domain). |
| **API CORS** | `CORS_ORIGIN` must include `https://nks.sena.my`. |
| **Database** | Set `DATABASE_URL` (and any other env) on **api-server**. |

Using **one Docker Compose stack** in Coolify keeps both services on the same network so `api-server:4000` in nginx works without extra changes.
