# SecureVault CloudGuard

Cloud-native portfolio project oriented toward secrets access, RBAC, audit logging, and risk scanning for Cloud Engineer / DevSecOps roles.

## Current status

**Phase 1 — Backend foundation:** A minimal Go API using Gin with configuration loading and a `/health` JSON endpoint. No authentication, secrets storage, database, frontend, or deployment tooling yet.

## Repository layout

- `backend/` — Go HTTP API (`cmd/api` entrypoint)

## Planned (later phases)

- Authentication and authorization (RBAC)
- Secrets access patterns and safe handling
- Audit logging
- Risk / misconfiguration scanning integrations
- API surface growth beyond health checks

## Quick start (Phase 1)

See `backend/README.md` for `go mod tidy`, `go run ./cmd/api`, and `curl` examples.
