# SecureVault CloudGuard

Cloud-native portfolio project oriented toward secrets access, RBAC, audit logging, and risk scanning for Cloud Engineer / DevSecOps roles.

## Current status

**Phase 4 — RBAC middleware:** JWT auth from Phase 3 is unchanged. The API adds `RequireRoles` middleware and `/api/v1/rbac/*` test routes to verify admin, developer, and viewer access. There is still no secret registry API, policy engine, audit logging pipeline, risk scanner, frontend, CI/CD, or cloud deployment in this repo.

## Role permission matrix (planned product shape)

| Role | Intended access |
|------|-----------------|
| **Admin** | Full platform control (planned). |
| **Developer** | Limited secret access (planned). |
| **Viewer** | Metadata-only access (planned). |

Today, only the RBAC test routes enforce these roles; resource APIs are not implemented yet.

## Repository layout

- `docker-compose.yml` — local PostgreSQL only
- `backend/` — Go HTTP API (`cmd/api` entrypoint), `database/sql` + `lib/pq`, auth and RBAC helpers, migrations under `internal/database/migrations/`

## Planned (later phases)

- Secrets registry and access APIs with RBAC enforcement
- Policy engine APIs
- Audit logging
- Risk / misconfiguration scanning integrations
- Frontend and operational tooling

## Quick start

See `backend/README.md` for Docker Compose, migrations, seed data, `go run ./cmd/api`, and `curl` examples.
