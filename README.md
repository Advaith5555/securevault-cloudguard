# SecureVault CloudGuard

Cloud-native portfolio project oriented toward secrets access, RBAC, audit logging, and risk scanning for Cloud Engineer / DevSecOps roles.

## Current status

**Phase 8 — Dashboard summary API:** **`GET /api/v1/dashboard/summary`** returns aggregate counts (secrets by environment, open risk findings by level) plus the five most recent audit log entries. It is intended for a **future** web dashboard; **no frontend is in this repo yet.**

Phase 7 risk scanning, Phase 6 audit logging, and Phase 5 secret registry behaviors are unchanged.

**Not implemented yet:** policy engine APIs, frontend dashboard UI, OpenAPI/Swagger, CI/CD, and cloud (GCP) deployment.

## Role permission matrix (planned product shape)

| Role | Intended access |
|------|-----------------|
| **Admin** | Full platform control (planned). |
| **Developer** | Limited secret access (planned). |
| **Viewer** | Metadata-only access (planned). |

The secret registry, risk list, dashboard summary, and audit log list (admin-only) map to this direction where applicable.

## Repository layout

- `docker-compose.yml` — local PostgreSQL only
- `backend/` — Go HTTP API (`cmd/api` entrypoint), `database/sql` + `lib/pq`, auth and RBAC helpers, migrations under `internal/database/migrations/`

## Quick start

See `backend/README.md` for Docker Compose, migrations, seed data, `go run ./cmd/api`, and `curl` examples.
