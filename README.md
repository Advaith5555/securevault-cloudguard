# SecureVault CloudGuard

Cloud-native portfolio project oriented toward secrets access, RBAC, audit logging, and risk scanning for Cloud Engineer / DevSecOps roles.

## Current status

**Phase 9 — OpenAPI documentation:** Machine-readable API description is maintained at **`backend/docs/openapi.yaml`** (OpenAPI 3.0.3): health, auth, RBAC probes, secrets, audit logs, risk scan/list, and dashboard summary. **Swagger UI is not served by the application**—import the spec into [Swagger Editor](https://editor.swagger.io), Postman, or Insomnia and point requests at **`http://localhost:8080`** when the API is running locally.

Prior phases remain in place for the Gin backend (secrets metadata and `secret_ref` only—no plaintext values in simulated access responses), audit logging, risk scanning, and dashboard summary.

**Still planned:** policy engine APIs, frontend, CI/CD, and cloud deployment (for example GCP/Cloud Run).

## Role permission matrix (planned product shape)

| Role | Intended access |
|------|-----------------|
| **Admin** | Full platform control (planned). |
| **Developer** | Limited secret access (planned). |
| **Viewer** | Metadata-only access (planned). |

The secret registry, risk list, dashboard summary, and audit log list (admin-only) map to this direction where applicable.

## Repository layout

- `docker-compose.yml` — local PostgreSQL only
- `backend/` — Go HTTP API (`cmd/api` entrypoint), `database/sql` + `lib/pq`, auth and RBAC helpers, migrations under `internal/database/migrations/`, OpenAPI spec under `backend/docs/`

## Quick start

See `backend/README.md` for Docker Compose, migrations, seed data, `go run ./cmd/api`, `curl` examples, and OpenAPI workflow.
