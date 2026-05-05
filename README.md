# SecureVault CloudGuard

A cloud-native secrets access, RBAC, audit logging, and risk scanning backend built with **Go**, **Gin**, **PostgreSQL**, **Docker Compose**, **JWT**, **OpenAPI**, and **GitHub Actions**.

This is a **portfolio / learning project** I built step by step. It is **not** a deployed product serving real organizations, and there is **no hosted Cloud Run URL** in this README.

## Project status

- **Backend MVP:** Feature set below is implemented and runnable locally with Docker Compose Postgres.
- **Frontend:** Not built yet (no dashboard UI in this repo).
- **Cloud Run:** Documented step-by-step in [`docs/cloud-run-deployment.md`](docs/cloud-run-deployment.md)—I have **not** claimed a live deployment unless you complete those steps yourself in your own GCP account.
- **Google Secret Manager:** Planned as a cloud improvement; **not** wired into the codebase today (`secret_ref` and simulated access are educational).
- **Final review / interview prep:** Markdown in [`docs/project-review/`](docs/project-review/) (checklist, talking points, Q&A, roadmap)—see **Final review package** below.

## Why I built this

I built SecureVault CloudGuard to get hands-on with **cloud-style backend engineering**: how APIs separate **authentication** from **authorization**, how **IAM-style RBAC** might map onto HTTP routes, and how **DevSecOps-minded** touches—**audit trails**, **risk signals over metadata**, and **clear API contracts**—fit together. I wanted something I could run locally, reason about in interviews, and honestly describe as **student-built but serious**, not corporate marketing.

## Cloud DevSecOps alignment

Topics this project practices in a small, local setting:

- **GCP / Cloud Run deployment planning** — optional guide; Artifact Registry, Cloud SQL, Secret Manager called out as next steps.
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
- [x] PostgreSQL using Docker Compose
- [x] JWT authentication
- [x] Admin / Developer / Viewer RBAC
- [x] Secret metadata registry (`secret_ref`; no plaintext in list/detail)
- [x] Controlled **simulated** secret access endpoint (demo response only)
- [x] Audit logging (Postgres)
- [x] Risk scanner (metadata-only rules; persisted findings)
- [x] Dashboard summary API (counts + recent audit rows)
- [x] OpenAPI documentation (`backend/docs/openapi.yaml`)
- [x] GitHub Actions CI
- [x] Cloud Run deployment **documentation** (not automated deploy)

## Not implemented yet / honest limitations

- No **frontend** dashboard yet.
- No **Google Secret Manager** integration in code.
- No **production SSO / OAuth** (email + password demo users only).
- No **live Cloud Run URL** from this project as-shipped.
- No **policy engine** beyond **role-based** route checks (no per-resource policy API).
- No **automated** Docker build + push + deploy pipeline in GitHub Actions.
- **Local demo database** only unless you deploy Postgres (e.g. Cloud SQL) and run migrations yourself.

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
| **Database** | PostgreSQL (local via Docker Compose) |
| **Auth** | JWT (HS256), bcrypt password hashes |
| **DevOps** | Docker Compose, GitHub Actions CI |
| **Docs** | OpenAPI 3.0.3 (`backend/docs/openapi.yaml`), Markdown in `docs/` |
| **Planned cloud** | Cloud Run, Artifact Registry, Cloud SQL, Secret Manager (see `docs/`) |

## API overview

Base URL (local): `http://localhost:8080`

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

## Demo users

| Name | Email | Password | Role |
|------|-------|----------|------|
| Admin User | admin@securevault.local | `Admin@123` | admin |
| Developer User | developer@securevault.local | `Dev@123` | developer |
| Viewer User | viewer@securevault.local | `Viewer@123` | viewer |

**These credentials are for local development only.** Do not reuse them in any real environment.

## Quick API test commands

```bash
# Login as admin and capture token
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
- **Configuration:** Local dev uses env vars from `.env` (never commit real secrets); in cloud, **`JWT_SECRET` and `DATABASE_URL` belong in Secret Manager** (see [`docs/environment-variables.md`](docs/environment-variables.md)).

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
| [`docs/architecture.md`](docs/architecture.md) | Local vs planned GCP diagrams |
| [`docs/environment-variables.md`](docs/environment-variables.md) | Env vars & safety notes |
| [`docs/cloud-run-deployment.md`](docs/cloud-run-deployment.md) | Optional Cloud Run walkthrough |

## Final review package

These documents are for **self-review**, **interview preparation**, and **planning improvements**—not part of the running API:

| Doc | Purpose |
|-----|---------|
| [`docs/project-review/final-checklist.md`](docs/project-review/final-checklist.md) | Pre-demo / pre-share checklist (local, API, security, docs, CI) |
| [`docs/project-review/interview-notes.md`](docs/project-review/interview-notes.md) | Timed explanations and themes in first person |
| [`docs/project-review/interview-questions.md`](docs/project-review/interview-questions.md) | Fifteen likely Q&A answers tied to this repo |
| [`docs/project-review/future-roadmap.md`](docs/project-review/future-roadmap.md) | Short / medium / long backlog |

## How I would explain this in an interview

> “SecureVault CloudGuard is a **cloud-security-focused backend** I built to learn how systems handle **secret metadata**, **JWT auth**, **role-based route access**, **audit trails**, and **lightweight risk checks**—all without pretending the secret *values* live in this API. I used **Go and Gin**, **Postgres**, and **Docker Compose** locally, added **OpenAPI** and **GitHub Actions CI**, and wrote **deployment notes for Cloud Run** so I understand what would change in a real cloud account. It’s a **portfolio piece**: honest about what’s simulated and what would come next, like a **frontend** and **Secret Manager**.”

## What I learned

- Go module layout and a small **clean architecture** split (handlers, services, repositories).
- **Gin** routing, JSON binding, and middleware chains.
- **PostgreSQL** schema + SQL migrations with `database/sql`.
- **Docker Compose** for a dev database.
- **JWT** issuance/validation and **bcrypt** for passwords.
- **RBAC** enforcement at the HTTP layer.
- **Audit logging** that does not break the main flow on insert failure (MVP choice).
- **Risk rules** over metadata and persisting findings.
- **OpenAPI** as the contract for tools and teammates.
- **GitHub Actions** for repeatable quality gates.
- Reading **Cloud Run / Artifact Registry** docs and turning them into a **checklist** for future me.

## Future improvements

- **Next.js** (or similar) dashboard consuming the summary + list APIs.
- **Google Secret Manager** (and Cloud SQL) integrated for real cloud secrets and DB connectivity.
- **Terraform** (or IaC of choice) for reproducible infra.
- **Policy engine** beyond fixed roles (e.g. environment-scoped rules).
- **Unit and integration tests** (including DB-backed tests where appropriate).
- **Dockerfile + CI pipeline** to build/push images (still no deploy until you choose).
- **Cloud Monitoring** alerts and uptime checks once something is actually hosted.

## License

**License to be added** (e.g. MIT)—this repo does not yet include a `LICENSE` file.
