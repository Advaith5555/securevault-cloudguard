# Render deployment — SecureVault CloudGuard backend

This page documents how the API was deployed for a **portfolio / learning** demonstration. **This is not a production-hardened or commercially supported deployment.** Expect **cold starts**, **demo credentials**, and **manual operational steps**.

---

## Live service

- **Base URL:** `https://securevault-api-5t61.onrender.com`
- **Stack:** Render **Web Service** (Docker image from `backend/Dockerfile`) + **Render PostgreSQL**

Smoke tests confirmed:

- **`GET /health`** — OK  
- **`GET /health/db`** — OK when wired to Render Postgres (`DATABASE_URL` set in Render)  
- **`POST /api/v1/auth/login`** — OK with seeded **demo admin** user (same account model as local seed migration)

---

## Database and migrations

The live database is **Render PostgreSQL**. Schema and demo users were applied **manually**:

1. `backend/internal/database/migrations/001_init.sql`
2. `backend/internal/database/migrations/002_seed_users.sql`

**How:** In the Render dashboard, use the Postgres instance’s tooling to obtain a **temporary external connection path** only when needed (typically labeled along the lines of **External Database URL**), then run **`psql`** (or equivalent) locally **without committing or pasting credentials into this repo**. Revoke or rotate dashboard credentials if you accidentally expose them.

**Do not** copy live connection strings into documentation, screenshots, or chat logs tied to this project.

Environment variables **`DATABASE_URL`** and **`JWT_SECRET`** for the Web Service were configured **only inside Render’s environment/secret UI**—not checked into Git.

---

## Why Render instead of Google Cloud Run (for this milestone)

GCP **Cloud Run** remains a **documented alternative** in [`cloud-run-deployment.md`](cloud-run-deployment.md). For the account used while building this portfolio project, **enabling billable GCP APIs was not feasible**, so **Render** was chosen to ship a live HTTPS endpoint with managed Postgres quickly and without that blocker.

Choosing Render here does **not** deprecate the Cloud Run write-up—it is simply the path that matched constraints at deployment time.

---

## Honest limitations

- **Not “production ready”** — no SLAs assumed, no full security audit, demo users and simple RBAC only.  
- **No frontend** is deployed alongside this README.  
- **Free/low-cost tiers** may **spin down** the web service after idle periods; first request after sleep can be slow.  
- **Secrets** (`JWT_SECRET`, DB URL) must stay in the platform dashboard—never hardcoded in docs or commits.

---

## Related documentation

| Doc | Topic |
|-----|--------|
| [`cloud-run-deployment.md`](cloud-run-deployment.md) | Optional GCP Cloud Run path |
| [`environment-variables.md`](environment-variables.md) | What `DATABASE_URL`, `JWT_SECRET`, etc. mean |
