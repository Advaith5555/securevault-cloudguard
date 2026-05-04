# SecureVault CloudGuard

Cloud-native portfolio project oriented toward secrets access, RBAC, audit logging, and risk scanning for Cloud Engineer / DevSecOps roles.

## Current status

**Phase 2 — PostgreSQL and connectivity:** The Go API connects to PostgreSQL (local dev via Docker Compose). Initial SQL migrations define stub schema tables; there are no auth flows, secrets APIs, RBAC enforcement, dashboards, CI/CD pipelines, or cloud deployment in this repo yet.

## Repository layout

- `docker-compose.yml` — local PostgreSQL only
- `backend/` — Go HTTP API (`cmd/api` entrypoint), `database/sql` + `lib/pq`, migration SQL under `internal/database/migrations/`

## Planned (later phases)

- Authentication and authorization (RBAC)
- Secrets access patterns and safe handling
- Audit logging
- Risk / misconfiguration scanning integrations
- Frontend and operational tooling

## Quick start

See `backend/README.md` for Docker Compose, running migrations, `go run ./cmd/api`, and `curl` examples.
