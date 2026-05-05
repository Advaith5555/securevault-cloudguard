# SecureVault CloudGuard — Backend

Go API with Gin, PostgreSQL, health checks, JWT authentication (demo users), Phase 4 RBAC through Phase 8 dashboard summary, Phase 9 OpenAPI (`backend/docs/openapi.yaml`), and a **multi-stage Dockerfile** for container runs. Swagger UI is not served by the binary; import the YAML into Swagger Editor, Postman, or Insomnia.

The backend is also validated in **GitHub Actions** on pushes and PRs to `main` (`gofmt`, `go vet`, `go test`, `go build`, OpenAPI file present)—see the root **Continuous integration** section. Automated tests are **unit-only** in `internal/auth` and **do not require PostgreSQL** (see [Unit tests](#unit-tests) below).

## Cloud Deployment Notes

The API is a good fit to run as a **stateless HTTP container** on **Google Cloud Run**, with **Cloud SQL** replacing Docker Compose Postgres for production-style setups. Optional step-by-step guidance (Artifact Registry, `gcloud run deploy`, cleanup) is in **[../docs/cloud-run-deployment.md](../docs/cloud-run-deployment.md)**. Architecture context: **[../docs/architecture.md](../docs/architecture.md)**; env vars and secrets: **[../docs/environment-variables.md](../docs/environment-variables.md)**.

A multi-stage **`Dockerfile`** lives in this directory for building the **`securevault-api`** image. [**Running backend with Docker**](#running-backend-with-docker) covers local use; **[`../docs/cloud-run-deployment.md`](../docs/cloud-run-deployment.md)** describes pushing that image for optional Cloud Run deploy. **Local development** can still use **`go run`** and **Docker Compose** for PostgreSQL at the repo root.

## Prerequisites

- Go 1.22+
- Docker (for local Postgres)

## PostgreSQL (Docker Compose)

From the repository root:

```bash
docker compose up -d
```

## Schema migration

From this `backend/` directory (after Postgres is up):

```bash
psql "postgres://securevault_user:securevault_password@localhost:5433/securevault_db?sslmode=disable" -f internal/database/migrations/001_init.sql
```

## Phase 3 — seed demo users

From the repository root:

```bash
docker exec -i securevault-postgres psql -U securevault_user -d securevault_db < backend/internal/database/migrations/002_seed_users.sql
```

## Run the API

From this `backend/` directory:

```bash
go mod tidy
go run ./cmd/api
```

The server listens on port `8080` by default (override with `PORT`). Set `DATABASE_URL` and `JWT_SECRET` as needed (see root `.env.example`).

## Unit tests

From this `backend/` directory:

```bash
go test ./...
```

These are **unit tests** for **password checks**, **JWT issue/validate**, **role validation**, and **`RequireRoles`** middleware (see `internal/auth/*_test.go`). They use **no database** and need **no environment variables**—suitable for CI and local runs without Docker Postgres.

## Running backend with Docker

Build the image from the **repository root** (build context is `./backend`):

```bash
docker build -t securevault-api ./backend
```

With **Postgres already running** via Docker Compose on your host (mapped to host port **5433**), run the API container pointed at the host:

```bash
docker run --rm \
  --env DATABASE_URL="postgres://securevault_user:securevault_password@host.docker.internal:5433/securevault_db?sslmode=disable" \
  --env JWT_SECRET="development-secret-key" \
  --env APP_ENV="development" \
  -p 8080:8080 \
  securevault-api
```

**`host.docker.internal`** lets the container reach services bound on your **host** machine. Because Compose exposes Postgres as **`localhost:5433`**, the URL uses **`host.docker.internal:5433`** from inside the app container.

This pattern is for **local development only** (Docker Desktop on macOS/Windows supports `host.docker.internal` by default; on some Linux setups you may need **`--add-host=host.docker.internal:host-gateway`** on `docker run` or another host address). **Do not** rely on `localhost` inside the container to mean “Postgres on my laptop.”

## Test

```bash
curl http://localhost:8080/health
curl http://localhost:8080/health/db
```

### Auth (Phase 3)

Login:

```bash
curl -X POST http://localhost:8080/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@securevault.local","password":"Admin@123"}'
```

Call `/me` with the token from the login response:

```bash
curl http://localhost:8080/api/v1/auth/me \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### RBAC (Phase 4)

Log in as each user and substitute `YOUR_TOKEN` with the returned JWT.

Login as admin:

```bash
curl -X POST http://localhost:8080/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@securevault.local","password":"Admin@123"}'
```

Login as developer:

```bash
curl -X POST http://localhost:8080/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"developer@securevault.local","password":"Dev@123"}'
```

Login as viewer:

```bash
curl -X POST http://localhost:8080/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"viewer@securevault.local","password":"Viewer@123"}'
```

**Admin** — can hit all three checks:

```bash
curl http://localhost:8080/api/v1/rbac/admin-check -H "Authorization: Bearer YOUR_TOKEN"
curl http://localhost:8080/api/v1/rbac/developer-check -H "Authorization: Bearer YOUR_TOKEN"
curl http://localhost:8080/api/v1/rbac/viewer-check -H "Authorization: Bearer YOUR_TOKEN"
```

**Developer** — forbidden on `admin-check` (`403`), allowed on `developer-check` and `viewer-check`:

```bash
curl http://localhost:8080/api/v1/rbac/admin-check -H "Authorization: Bearer YOUR_TOKEN"
curl http://localhost:8080/api/v1/rbac/developer-check -H "Authorization: Bearer YOUR_TOKEN"
curl http://localhost:8080/api/v1/rbac/viewer-check -H "Authorization: Bearer YOUR_TOKEN"
```

**Viewer** — forbidden on `admin-check` and `developer-check`, allowed on `viewer-check`:

```bash
curl http://localhost:8080/api/v1/rbac/admin-check -H "Authorization: Bearer YOUR_TOKEN"
curl http://localhost:8080/api/v1/rbac/developer-check -H "Authorization: Bearer YOUR_TOKEN"
curl http://localhost:8080/api/v1/rbac/viewer-check -H "Authorization: Bearer YOUR_TOKEN"
```

### Secret Registry (Phase 5)

`environment` must be `dev`, `staging`, or `prod` (matches the database check constraint).

Admin login token (reuse `$ADMIN_TOKEN` in the curls below):

```bash
ADMIN_TOKEN=$(curl -s -X POST http://localhost:8080/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@securevault.local","password":"Admin@123"}' \
  | python3 -c "import sys, json; print(json.load(sys.stdin)['token'])")
```

Create a secret:

```bash
curl -X POST http://localhost:8080/api/v1/secrets \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "payment-api-key",
    "environment": "dev",
    "owner": "payments-team",
    "service": "payment-service",
    "secret_ref": "local/demo/payment-api-key"
  }'
```

List secrets:

```bash
curl http://localhost:8080/api/v1/secrets \
  -H "Authorization: Bearer $ADMIN_TOKEN"
```

Replace `SECRET_ID` with an `id` from the create or list response. Access secret (simulated response; plaintext values are not returned):

```bash
curl -X POST http://localhost:8080/api/v1/secrets/SECRET_ID/access \
  -H "Authorization: Bearer $ADMIN_TOKEN"
```

**Developer token:** log in as `developer@securevault.local` / `Dev@123`. The developer can list secrets and call `POST .../access`, but receives `403 forbidden` when creating a secret (`POST /api/v1/secrets`).

**Viewer token:** log in as `viewer@securevault.local` / `Viewer@123`. The viewer can list secrets (`GET /api/v1/secrets`), but receives `403 forbidden` on `POST .../access` and `POST /api/v1/secrets`.

### Audit logs (Phase 6)

Successful and failed login attempts generate audit rows (`action` `login`). Secret create/update/delete and simulated access are logged (`secret_*` actions). Entries describe **who did what**; they **do not** store plaintext secret values.

After logging in and performing secret actions:

```bash
ADMIN_TOKEN=$(curl -s -X POST http://localhost:8080/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@securevault.local","password":"Admin@123"}' \
  | python3 -c "import sys, json; print(json.load(sys.stdin)['token'])")

curl http://localhost:8080/api/v1/audit-logs \
  -H "Authorization: Bearer $ADMIN_TOKEN"
```

Optional limit (invalid or out-of-range values fall back to a default of 50 rows in the repository):

```bash
curl "http://localhost:8080/api/v1/audit-logs?limit=10" \
  -H "Authorization: Bearer $ADMIN_TOKEN"
```

Developer must be forbidden:

```bash
DEV_TOKEN=$(curl -s -X POST http://localhost:8080/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"developer@securevault.local","password":"Dev@123"}' \
  | python3 -c "import sys, json; print(json.load(sys.stdin)['token'])")

curl http://localhost:8080/api/v1/audit-logs \
  -H "Authorization: Bearer $DEV_TOKEN"
```

Expected:

```json
{"error":"forbidden"}
```

### Risk scanner (Phase 7)

The scanner reads **registered secret metadata only** (no plaintext values). Each run **clears** `risk_findings` and inserts fresh rows. Ordering on `GET /api/v1/risks` is **high**, then **medium**, then **low**, then **`created_at` DESC**.

Admin token:

```bash
ADMIN_TOKEN=$(curl -s -X POST http://localhost:8080/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@securevault.local","password":"Admin@123"}' \
  | python3 -c "import sys, json; print(json.load(sys.stdin)['token'])")
```

Create a risky test secret:

```bash
curl -X POST http://localhost:8080/api/v1/secrets \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "prod-orphan-secret",
    "environment": "prod",
    "owner": "",
    "service": "",
    "secret_ref": "local/demo/prod-orphan-secret"
  }'
```

Run risk scan:

```bash
curl -X POST http://localhost:8080/api/v1/risks/scan \
  -H "Authorization: Bearer $ADMIN_TOKEN"
```

List risks:

```bash
curl http://localhost:8080/api/v1/risks \
  -H "Authorization: Bearer $ADMIN_TOKEN"
```

Developer can list risks but cannot scan:

```bash
DEV_TOKEN=$(curl -s -X POST http://localhost:8080/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"developer@securevault.local","password":"Dev@123"}' \
  | python3 -c "import sys, json; print(json.load(sys.stdin)['token'])")

curl http://localhost:8080/api/v1/risks \
  -H "Authorization: Bearer $DEV_TOKEN"

curl -X POST http://localhost:8080/api/v1/risks/scan \
  -H "Authorization: Bearer $DEV_TOKEN"
```

Expected:

```json
{"error":"forbidden"}
```

Check audit logs for the scan:

```bash
curl "http://localhost:8080/api/v1/audit-logs?limit=5" \
  -H "Authorization: Bearer $ADMIN_TOKEN"
```

### Dashboard summary (Phase 8)

Aggregates secret counts by environment, risk counts by level, and the **5 most recent** audit log entries (same shape as `/api/v1/audit-logs`). Any authenticated role may call it.

```bash
ADMIN_TOKEN=$(curl -s -X POST http://localhost:8080/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@securevault.local","password":"Admin@123"}' \
  | python3 -c "import sys, json; print(json.load(sys.stdin)['token'])")

curl http://localhost:8080/api/v1/dashboard/summary \
  -H "Authorization: Bearer $ADMIN_TOKEN"
```

**Developer** and **viewer** tokens also work for this endpoint (substitute tokens from logging in as `developer@securevault.local` / `viewer@securevault.local`).

## API Documentation

OpenAPI **3.0.3** for this backend lives at **`backend/docs/openapi.yaml`**. Import it into [Swagger Editor](https://editor.swagger.io), Postman, or Insomnia to explore requests and schemas. **The API does not currently serve Swagger UI** (kept minimal for this MVP).

**Try Swagger Editor:**

1. Open https://editor.swagger.io  
2. **File → Clear editor**, then paste the contents of `backend/docs/openapi.yaml` (or use **File → Import file** after cloning the repo).  
3. With the backend running locally (`go run ./cmd/api`), execute requests against **http://localhost:8080** (set the **Authorize** Bearer token using a JWT from `POST /api/v1/auth/login`).

Validate the YAML: load it in Swagger Editor (it reports parsing errors immediately) or use any OpenAPI 3 linter you prefer.

Environment variables: see the root `.env.example`.
