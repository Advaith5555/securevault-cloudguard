# SecureVault CloudGuard

Cloud-native portfolio project oriented toward secrets access, RBAC, audit logging, and risk scanning for Cloud Engineer / DevSecOps roles.

## Current status

**Phase 7 — Risk scanner:** Admins can run **`POST /api/v1/risks/scan`** to evaluate registered secrets using **metadata only** (owner, service, environment, timestamps, expiry). Results are stored in **`risk_findings`**; previous rows are cleared each run. **Plaintext secret values are never analyzed or exposed.** All authenticated roles may **`GET /api/v1/risks`**; only admins may trigger a scan. Scan completion is recorded in audit logs (`risk_scan_executed`).

Phase 6 audit logging and Phase 5 secret registry behaviors are unchanged.

**Not implemented yet:** policy engine APIs, frontend, OpenAPI/Swagger, CI/CD, and cloud (GCP) deployment.

## Role permission matrix (planned product shape)

| Role | Intended access |
|------|-----------------|
| **Admin** | Full platform control (planned). |
| **Developer** | Limited secret access (planned). |
| **Viewer** | Metadata-only access (planned). |

The secret registry, audit log list (admin-only), and risk list (all roles) align with this direction; risk scan execution is admin-only.

## Repository layout

- `docker-compose.yml` — local PostgreSQL only
- `backend/` — Go HTTP API (`cmd/api` entrypoint), `database/sql` + `lib/pq`, auth and RBAC helpers, migrations under `internal/database/migrations/`

## Quick start

See `backend/README.md` for Docker Compose, migrations, seed data, `go run ./cmd/api`, and `curl` examples.
