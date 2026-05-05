# SecureVault CloudGuard — Backend

Go API with Gin, PostgreSQL, health checks, JWT authentication (demo users), Phase 4 RBAC through Phase 8 dashboard summary, and Phase 9 OpenAPI specification (`backend/docs/openapi.yaml`). Swagger UI is not served by the binary; import the YAML into Swagger Editor, Postman, or Insomnia.

The backend is also validated in **GitHub Actions** on pushes and PRs to `main` (`gofmt`, `go vet`, `go test`, `go build`, OpenAPI file present)—see the root **Continuous integration** section.

## Cloud Deployment Notes

The API is a good fit to run as a **stateless HTTP container** on **Google Cloud Run**, with **Cloud SQL** replacing Docker Compose Postgres for production-style setups. Optional step-by-step guidance (Artifact Registry, `gcloud run deploy`, cleanup) is in **[../docs/cloud-run-deployment.md](../docs/cloud-run-deployment.md)**. Architecture context: **[../docs/architecture.md](../docs/architecture.md)**; env vars and secrets: **[../docs/environment-variables.md](../docs/environment-variables.md)**.

This repo **does not ship** a `Dockerfile` yet—the deployment doc explains that you add one before `docker build`. **Local development** still assumes **Docker Compose** for PostgreSQL (`docker-compose.yml` at the repo root).

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
