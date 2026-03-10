# Option A — Same origin (`https://nks.sena.my`)

Browser opens **one origin**; nginx serves the SPA and proxies **`/api`** (and **`/uploads`**) to the API container.

## 1. Build admin-web with the public origin

So the SPA calls `https://nks.sena.my/api/...` (cookies + CSRF stay on that host).

**Docker build arg:**

```bash
docker build -f apps/admin-web/Dockerfile \
  --build-arg VITE_API_BASE_URL=https://nks.sena.my \
  -t admin-web .
```

**Coolify (admin-web resource)**  
Add build argument:

| Name                 | Value                 |
|----------------------|------------------------|
| `VITE_API_BASE_URL`  | `https://nks.sena.my` |

## 2. Nginx in admin-web proxies to the API

`apps/admin-web/nginx-default.conf` forwards:

- `/api/` → `http://api-server:4000` (same URI path)
- `/uploads/` → `http://api-server:4000`

**Requirement:** The **admin-web** container must resolve **`api-server`** (Docker Compose service name). On Coolify:

- Deploy API and admin-web in the **same stack/network**, **or**
- Edit `nginx-default.conf` and replace `api-server:4000` with the **internal hostname:port** Coolify gives the API (then rebuild admin-web).

## 3. API CORS

Set on the **API** service:

```env
CORS_ORIGIN=https://nks.sena.my
```

If you already have other origins, comma-separate:

```env
CORS_ORIGIN=http://localhost:5173,https://nks.sena.my
```

## 4. Public URL

- Attach **`https://nks.sena.my`** to the **admin-web** resource (the nginx container), **not** the API-only container.
- TLS is terminated by Coolify/reverse proxy in front of nginx; nginx listens on **80** inside the container.

## 5. Quick check

- Open `https://nks.sena.my` → login UI (SPA).
- Open `https://nks.sena.my/api/health` → JSON from API (proxied).
- After login, session cookies are set for `nks.sena.my` → same-origin requests include them.

## Local docker-compose

Compose file uses `VITE_API_BASE_URL=""` so the SPA uses **relative** `/api/...` on `http://localhost:5173`; nginx proxies to `api-server:4000`. No HTTPS locally unless you add a proxy.
