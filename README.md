# SecureVault CloudGuard

A cloud-native secrets access, RBAC, audit logging, and risk scanning backend built with **Go**, **Gin**, **PostgreSQL**, **Docker Compose**, **JWT**, **OpenAPI**, **GitHub Actions**, and a **Dockerfile** for the API.

This is a **portfolio / learning project** I built step by step. **It is not a production product** and **is not represented as production-ready**. The **backend** is deployed on **Render** and uses **Render PostgreSQL**: **`https://securevault-api-5t61.onrender.com`** ([`docs/render-deployment.md`](docs/render-deployment.md)). The **Next.js** dashboard source lives in **`frontend/`** and is **deployed on Vercel** at **`https://securevault-cloudguard.vercel.app`**. In that deployment, **`NEXT_PUBLIC_API_BASE_URL`** is set to the Render API URL so the app’s `/__upstream` rewrites reach the live backend.

## Project status

- **Backend MVP:** Runnable locally (Docker Compose + `go run`)—see [`backend/README.md`](backend/README.md)—or **`docker build`**. **Live demo API:** [`https://securevault-api-5t61.onrender.com`](https://securevault-api-5t61.onrender.com) on **Render** with **Render PostgreSQL** (portfolio / learning tier only; details in [`docs/render-deployment.md`](docs/render-deployment.md)).
- **Docker image:** `backend/Dockerfile` builds **`securevault-api`**.
- **Live database (Render demo):** **Render PostgreSQL**; **`001_init.sql`** and **`002_seed_users.sql`** were applied manually using the dashboard’s external DB access (**no connection strings in this repo**).
- **Frontend:** **Next.js + TypeScript + Tailwind** in [`frontend/`](frontend/). **Deployed on Vercel:** [`https://securevault-cloudguard.vercel.app`](https://securevault-cloudguard.vercel.app). The live app uses **`NEXT_PUBLIC_API_BASE_URL`** pointed at **`https://securevault-api-5t61.onrender.com`** (see [`frontend/README.md`](frontend/README.md)). You can still run the UI locally with `npm run dev`.
- **GCP / Cloud Run:** Documented as a **future or alternative path** in [`docs/cloud-run-deployment.md`](docs/cloud-run-deployment.md)—that GCP project needed **billing to enable APIs**, so Render was chosen for the current live API milestone.
- **Google Secret Manager:** Planned as a cloud improvement; **not** wired into the codebase today (`secret_ref` and simulated access are educational).
- **Final review / interview prep:** Markdown in [`docs/project-review/`](docs/project-review/) (checklist, talking points, Q&A, roadmap)—see **Final review package** below.

## Why I built this

I built SecureVault CloudGuard to get hands-on with **cloud-style backend engineering**: how APIs separate **authentication** from **authorization**, how **IAM-style RBAC** might map onto HTTP routes, and how **DevSecOps-minded** touches—**audit trails**, **risk signals over metadata**, and **clear API contracts**—fit together. I wanted something I could run locally, reason about in interviews, and honestly describe as **student-built but serious**, not corporate marketing.

## Cloud DevSecOps alignment

Topics this project practices in a small, local setting:

- **GCP / Cloud Run deployment planning** — optional guide when billing/API access is available; **Render** is what runs the current live demo ([`docs/render-deployment.md`](docs/render-deployment.md)).
- **IAM-style RBAC** — JWT claims + middleware: admin / developer / viewer with different route access.
- **Secret Manager–style design** — metadata + `secret_ref` in the model; real secret values are not returned; cloud secret store is the natural extension.
- **Cloud security governance** — thinking in terms of who can create secrets, who can “access” (simulated), and what gets logged.
- **Audit logging** — persist security-relevant actions to `audit_logs` (login, secret lifecycle, risk scan).
- **Risk scanner** — rule-based findings from **metadata only** (no plaintext secrets).
- **API documentation** — OpenAPI 3 spec for clients and tools.
- **CI checks** — format, vet, test, build, spec file present on every push/PR to `main`.
- **Docker + PostgreSQL** — local database via Compose; production would move to managed SQL.

## Features implemented

- [x] Go + Gin API
- [x] **`Dockerfile`** for the backend (`backend/Dockerfile` → image **`securevault-api`**)
- [x] PostgreSQL using Docker Compose
- [x] JWT authentication
- [x] Admin / Developer / Viewer RBAC
- [x] Secret metadata registry (`secret_ref`; no plaintext in list/detail)
- [x] Controlled **simulated** secret access endpoint (demo response only)
- [x] Audit logging (Postgres)
- [x] Risk scanner (metadata-only rules; persisted findings)
- [x] Dashboard summary API (counts + recent audit rows)
- [x] OpenAPI documentation (`backend/docs/openapi.yaml`)
- [x] **Live backend on Render** (HTTPS demo—not production SLA)
- [x] Cloud Run deployment **documentation** (**alternative/future path**; not used for current live demo)
- [x] **Next.js dashboard** — [`frontend/`](frontend/) App Router UI; **deployed on Vercel** ([`https://securevault-cloudguard.vercel.app`](https://securevault-cloudguard.vercel.app)) with **`NEXT_PUBLIC_API_BASE_URL`** targeting the Render API; routes include **`/dashboard`**, **`/secrets`**, **`/risks`**, and **`/audit-logs`** (plus **`/login`**). **Smoke checks done:** admin **login** and **dashboard** page against the live stack; **secrets**, **risks**, and **audit logs** pages are **available** in the deployed app (audit list remains **admin-only** on the API).

## Not implemented yet / honest limitations

- **Portfolio hosting only:** Vercel + Render are **demo / learning** setups—**not** production SLAs, hardening guarantees, or cost-optimized operations. Token storage in the UI remains **`localStorage`** for MVP simplicity.
- **Hosted Render instance** is a **portfolio smoke-test tier**: possible **cold starts**, **demo users**, **not** audited for production workloads.
- No **Google Secret Manager** integration in code.
- No **production SSO / OAuth** (email + password demo users only—even on Render, until you replace them).
- **GCP Cloud Run:** not deployed for this milestone (APIs required **billing** on the GCP project used); [**`docs/cloud-run-deployment.md`**](docs/cloud-run-deployment.md) stays the reference for later.
- No **policy engine** beyond **role-based** route checks (no per-resource policy API).
- No **automated** Docker deploy pipeline in GitHub Actions.
- Locally you still rely on **Docker Compose** Postgres unless you repoint **`DATABASE_URL`** yourself.

## Architecture summary

```mermaid
flowchart TB
  Client([User / API client])
  API[Go Gin API]
  DB[(PostgreSQL)]
  JWT[JWT auth]
  RBAC[RBAC middleware]
  Audit[(Audit logs)]
  Risk[Risk scanner]
  OAS[OpenAPI spec]
  GH[GitHub]
  CI[GitHub Actions CI]

  Client --> API
  API --> DB
  API --> JWT
  API --> RBAC
  API --> Audit
  API --> Risk
  API -. spec only .-> OAS
  GH --> CI
```

## Tech stack

| Area | Choice |
|------|--------|
| **Backend** | Go 1.22+, Gin |
| **Database** | PostgreSQL (local Docker Compose; **Render Postgres** for the live demo) |
| **Deployed API** | [Render Web Service](https://securevault-api-5t61.onrender.com) + **Render PostgreSQL** ([`docs/render-deployment.md`](docs/render-deployment.md)) — portfolio demo, not production |
| **Deployed dashboard** | [Vercel](https://securevault-cloudguard.vercel.app) — Next.js frontend; **`NEXT_PUBLIC_API_BASE_URL`** → Render API ([`frontend/README.md`](frontend/README.md)) |
| **Auth** | JWT (HS256), bcrypt password hashes |
| **DevOps** | Docker Compose, Docker image (`backend/Dockerfile`), GitHub Actions CI |
| **Docs** | OpenAPI 3.0.3 (`backend/docs/openapi.yaml`), Markdown in `docs/` ([**Render**](docs/render-deployment.md), [**Cloud Run**](docs/cloud-run-deployment.md) notes) |
| **Frontend (source)** | Next.js 15 App Router in [`frontend/`](frontend/) — local dev + Vercel deploy; **`NEXT_PUBLIC_API_BASE_URL`** for `next.config` rewrites to the Go API |
| **GCP (alternative)** | Cloud Run guide when billing/APIs are enabled—see **`docs/cloud-run-deployment.md`** |

## API overview

Base URLs:

- **Local:** `http://localhost:8080`
- **Render (portfolio demo API + Render Postgres):** `https://securevault-api-5t61.onrender.com`
- **Vercel (portfolio demo UI):** `https://securevault-cloudguard.vercel.app` — configured with **`NEXT_PUBLIC_API_BASE_URL=https://securevault-api-5t61.onrender.com`** so browser calls proxy to the Render backend (not production-grade hosting).

| Path | Role |
|------|------|
| `GET /health` | Public |
| `GET /health/db` | Public |
| `POST /api/v1/auth/login` | Public |
| `GET /api/v1/auth/me` | Authenticated |
| `GET /api/v1/secrets` | Authenticated (list metadata) |
| `POST /api/v1/secrets` | **Admin** (create) |
| `GET /api/v1/secrets/{id}` | Authenticated |
| `PUT /api/v1/secrets/{id}` | **Admin** |
| `DELETE /api/v1/secrets/{id}` | **Admin** |
| `POST /api/v1/secrets/{id}/access` | **Admin / Developer** (simulated access) |
| `GET /api/v1/audit-logs` | **Admin** |
| `GET /api/v1/risks` | Authenticated |
| `POST /api/v1/risks/scan` | **Admin** |
| `GET /api/v1/dashboard/summary` | Authenticated |

RBAC probe routes under `/api/v1/rbac/*` and full request/response schemas are in **[`backend/docs/openapi.yaml`](backend/docs/openapi.yaml)** (import into Swagger Editor / Postman; the app does not serve Swagger UI).

## Local setup

1. **Clone** this repository.
2. Start **Docker Desktop** (or equivalent) so Compose can run.
3. From the repo root:

   ```bash
   docker compose up -d
   ```

4. Run **migrations** (schema + seed users):

   ```bash
   docker exec -i securevault-postgres psql -U securevault_user -d securevault_db < backend/internal/database/migrations/001_init.sql
   docker exec -i securevault-postgres psql -U securevault_user -d securevault_db < backend/internal/database/migrations/002_seed_users.sql
   ```

5. Start the API:

   ```bash
   cd backend
   go mod tidy
   go run ./cmd/api
   ```

Environment variables: see [`.env.example`](.env.example) and [`docs/environment-variables.md`](docs/environment-variables.md). More backend detail: [`backend/README.md`](backend/README.md).

**Optional local dashboard:** from [`frontend/`](frontend/), copy [`frontend/.env.example`](frontend/.env.example) to `.env.local`, then `npm install` and `npm run dev` (details in [`frontend/README.md`](frontend/README.md)).

## Screenshots

Screenshot files are **not committed** to this repository yet. Placeholders for assets to add later:

- [ ] Login (`/login`)
- [ ] Dashboard summary (`/dashboard`)
- [ ] Secrets registry (`/secrets`)
- [ ] Risk findings (`/risks`)
- [ ] Audit logs (`/audit-logs`, admin-only data from the API)

## Demo users

| Name | Email | Password | Role |
|------|-------|----------|------|
| Admin User | admin@securevault.local | `Admin@123` | admin |
| Developer User | developer@securevault.local | `Dev@123` | developer |
| Viewer User | viewer@securevault.local | `Viewer@123` | viewer |

**These accounts are seeded locally and on Render for demos only—not for production reuse.** Prefer rotating them if you extend the deployed instance.

### Render demo (HTTPS)

After cold start, sanity checks (**no secrets pasted here**):

```bash
curl -s https://securevault-api-5t61.onrender.com/health
curl -s https://securevault-api-5t61.onrender.com/health/db
curl -s -X POST https://securevault-api-5t61.onrender.com/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@securevault.local","password":"Admin@123"}'
```

## Quick API test commands (localhost)

```bash
export TOKEN=$(curl -s -X POST http://localhost:8080/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@securevault.local","password":"Admin@123"}' \
  | python3 -c "import sys,json; print(json.load(sys.stdin)['token'])")

curl -s http://localhost:8080/health

# Create secret metadata (admin)
curl -s -X POST http://localhost:8080/api/v1/secrets \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"name":"demo-key","environment":"dev","owner":"me","service":"api","secret_ref":"local/demo/demo-key"}'

# Risk scan (admin)
curl -s -X POST http://localhost:8080/api/v1/risks/scan \
  -H "Authorization: Bearer $TOKEN"

# Audit logs (admin)
curl -s "http://localhost:8080/api/v1/audit-logs?limit=5" \
  -H "Authorization: Bearer $TOKEN"

# Dashboard summary
curl -s http://localhost:8080/api/v1/dashboard/summary \
  -H "Authorization: Bearer $TOKEN"
```

## Security design (as implemented)

- **Passwords:** Stored as **bcrypt** hashes in Postgres (demo users from seed migration).
- **JWT:** Stateless bearer tokens for API access after login.
- **RBAC:** Middleware enforces **admin / developer / viewer** differences on routes (not a full enterprise IAM product).
- **Secrets:** Only **metadata** and **`secret_ref`** are stored and returned in normal CRUD; **plaintext secret values are not exposed**; the access route returns a **simulated** payload for learning.
- **Audit logs:** Persist actions like login and secret mutations for investigation-style practice.
- **Risk scanner:** Evaluates **metadata only** (e.g. missing owner, prod without owner); no secret material.
- **Configuration:** Local dev uses `.env` / `.env.example` (**never commit** real secrets). The **Render** service uses **`DATABASE_URL`** and **`JWT_SECRET`** configured **only** in Render’s dashboard ([`docs/render-deployment.md`](docs/render-deployment.md)). A stricter setup would mirror **Secret Manager–style** secret stores for clouds other than local demos.

## Continuous integration

Workflow: **[`.github/workflows/ci.yml`](.github/workflows/ci.yml)** (runs on push and PRs to **`main`**).

Checks:

- **`gofmt`** (must be clean)
- **`go vet ./...`**
- **`go test ./...`**
- **`go build`** for `./cmd/api`
- **OpenAPI file exists:** `backend/docs/openapi.yaml`

No database service in CI, no image publish, no deploy.

## Documentation links

| Resource | Description |
|----------|-------------|
| [`backend/docs/openapi.yaml`](backend/docs/openapi.yaml) | Full OpenAPI contract |
| [`frontend/README.md`](frontend/README.md) | Next.js dashboard: Vercel URL, `NEXT_PUBLIC_API_BASE_URL`, local dev, demo users |
| [`docs/architecture.md`](docs/architecture.md) | Local vs planned GCP diagrams |
| [`docs/environment-variables.md`](docs/environment-variables.md) | Env vars & safety notes |
| [`docs/render-deployment.md`](docs/render-deployment.md) | Live **Render** deployment (portfolio demo HTTPS + Postgres migrations) |
| [`docs/cloud-run-deployment.md`](docs/cloud-run-deployment.md) | Optional **GCP Cloud Run** walkthrough (alternative when billing/APIs enabled) |

## Final review package

These documents are for **self-review**, **interview preparation**, and **planning improvements**—not part of the running API:

| Doc | Purpose |
|-----|---------|
| [`docs/project-review/final-checklist.md`](docs/project-review/final-checklist.md) | Pre-demo / pre-share checklist (local, API, security, docs, CI) |
| [`docs/project-review/interview-notes.md`](docs/project-review/interview-notes.md) | Timed explanations and themes in first person |
| [`docs/project-review/interview-questions.md`](docs/project-review/interview-questions.md) | Fifteen likely Q&A answers tied to this repo |
| [`docs/project-review/future-roadmap.md`](docs/project-review/future-roadmap.md) | Short / medium / long backlog |

## How I would explain this in an interview

> “SecureVault CloudGuard is a **cloud-security-focused backend** I built to practice **secret metadata**, **JWT auth**, **RBAC middleware**, **audit trails**, and a **metadata-only risk scanner**—honest about **simulated secret access**. I ran it locally with **Postgres via Docker Compose**, put the API on **Render with Render Postgres** for a **portfolio HTTPS demo**, and kept **GCP Cloud Run** documented as a **future or alternative path** when **billing/API access** wasn’t the right fit. The **Next.js dashboard** is on **Vercel**, calling the Render API via **`NEXT_PUBLIC_API_BASE_URL`**—still **not production**, but a concrete end-to-end demo.”

## What I learned

- Go module layout and a small **clean architecture** split (handlers, services, repositories).
- Deploying **Go + Dockerfile** behind **HTTPS** on **Render** and wiring **managed Postgres** (portfolio demo tier).
- **Gin** routing, JSON binding, and middleware chains.
- **PostgreSQL** schema + SQL migrations with `database/sql`.
- **Docker Compose** for a dev database.
- **JWT** issuance/validation and **bcrypt** for passwords.
- **RBAC** enforcement at the HTTP layer.
- **Audit logging** that does not break the main flow on insert failure (MVP choice).
- **Risk rules** over metadata and persisting findings.
- **OpenAPI** as the contract for tools and teammates.
- **Next.js + Tailwind** dashboard wiring (summary and list endpoints, RBAC-aware audit handling) and a **Vercel** deploy that proxies to the Render API via **`NEXT_PUBLIC_API_BASE_URL`**.
- **GitHub Actions** for repeatable quality gates.
- Reading **Cloud Run / Artifact Registry** docs and turning them into a **checklist** for future me.

## Future improvements

- **Expand the dashboard** (secret CRUD flows, httpOnly cookie auth, richer charts from live metrics only).
- **Google Secret Manager** (and Cloud SQL) integrated for real cloud secrets and DB connectivity.
- **Terraform** (or IaC of choice) for reproducible infra.
- **Policy engine** beyond fixed roles (e.g. environment-scoped rules).
- **Unit and integration tests** (including DB-backed tests where appropriate).
- **GitHub Actions** pipeline to **build/push** Docker images (no deploy unless you add it).
- **Cloud Monitoring**–style alerts and stricter uptime practices if this ever moves beyond portfolio demos.

## License

**License to be added** (e.g. MIT)—this repo does not yet include a `LICENSE` file.
