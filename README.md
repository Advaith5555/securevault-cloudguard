# SecureVault CloudGuard

Cloud-native portfolio project oriented toward secrets access, RBAC, audit logging, and risk scanning for Cloud Engineer / DevSecOps roles.

## Current status

**Phase 3 — Authentication:** The Go API issues JWTs (HS256, 24-hour expiry) and exposes `POST /api/v1/auth/login` plus a JWT-protected `GET /api/v1/auth/me`, backed by demo users in PostgreSQL (bcrypt hashes). This is not a full product: there is no secret registry API, policy engine, dashboard UI, audit logging pipeline, risk scanner, CI/CD, or cloud deployment in the repo yet.

## Repository layout

- `docker-compose.yml` — local PostgreSQL only
- `backend/` — Go HTTP API (`cmd/api` entrypoint), `database/sql` + `lib/pq`, auth helpers, migrations under `internal/database/migrations/`

## Planned (later phases)

- RBAC enforcement across resource APIs
- Secrets access patterns and safe handling
- Audit logging
- Risk / misconfiguration scanning integrations
- Frontend and operational tooling

## Quick start

See `backend/README.md` for Docker Compose, migrations, seed data, `go run ./cmd/api`, and `curl` examples.

