# Set DATABASE_URL dalam Coolify (API masih "empty string")

Jika log api-server tunjuk:
`The environment variable DATABASE_URL resolved to an empty string`

maka container **tidak menerima** nilai `DATABASE_URL`. Ikut langkah di bawah.

---

## 1. Buka Environment Variables untuk aplikasi ini

- Masuk **Coolify** → pilih **Application** (Compose) NKS ini.
- Cari bahagian **Environment Variables** / **Variables** / **Env** (nama mungkin berbeza mengikut versi).
- Pastikan anda set **Runtime** / **Deploy** env (bukan Build-time sahaja).

---

## 2. Tambah DATABASE_URL

- Klik **Add** / **Add Variable**.
- **Key:** `DATABASE_URL` (tepat begitu, huruf besar).
- **Value:** connection string MySQL, contoh:
  ```
  mysql://USER:PASSWORD@HOST:PORT/DATABASE
  ```
  Ganti:
  - **USER** — user MySQL
  - **PASSWORD** — kata laluan (jika ada `@` atau `#` guna encode: `@` → `%40`, `#` → `%23`)
  - **HOST** — IP atau hostname server MySQL (mesti boleh dicapai dari server Coolify; jangan guna `localhost` jika DB di mesin lain)
  - **PORT** — port MySQL (biasanya `3306` atau `4152`)
  - **DATABASE** — nama database

Contoh:
```
mysql://nks_user:Saya%40123@43.217.187.42:4152/nks_db
```

- Simpan variable.

---

## 3. Pastikan ia dipakai ketika deploy

- Untuk **Docker Compose**, Coolify biasanya baca env ini dan hantar ke `docker compose` via `--env-file`. Variable yang anda set untuk aplikasi akan dipakai untuk **semua service** dalam compose (termasuk api-server).
- Jika Coolify ada pilihan **"Apply to"** / **Service**, pilih **api-server** atau **All**.
- **Redeploy** aplikasi (supaya container api-server start semula dengan env baru).

---

## 4. Semak dalam log

Selepas redeploy, buka **Logs** container **api-server**:

- Jika DATABASE_URL **masih kosong**: Anda akan nampak mesej:
  `ERROR: DATABASE_URL is empty. Set it in Coolify → Application → Environment Variables (Runtime).`
- Jika DATABASE_URL **sudah sampai**: Anda akan nampak sama ada "Waiting for MySQL..." (sambungan gagal) atau Prisma/MySQL error lain (boleh semak host/firewall/kredensial).

---

## Perubahan dalam repo

- **docker-compose.yml**: `env_file: apps/api-server/.env` telah dibuang supaya semua env datang dari Coolify (fail `.env` tidak di-commit).
- **Dockerfile api-server**: Semakan awal ditambah — jika `DATABASE_URL` kosong, container keluar dengan mesej di atas (tanpa loop Prisma).
