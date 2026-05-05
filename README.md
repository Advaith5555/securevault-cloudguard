# SecureVault CloudGuard

Cloud-native portfolio project oriented toward secrets access, RBAC, audit logging, and risk scanning for Cloud Engineer / DevSecOps roles.

## Current status

**Phase 5 — Secret Registry APIs:** The API stores secret **metadata** and a **`secret_ref`** (for example `local/demo/payment-api-key` or a future GCP secret path). List, get, create, update, and delete operate on metadata only. **Plaintext secret values are never returned** from these routes. `POST /api/v1/secrets/:id/access` marks `last_accessed_at` and returns a **safe demo payload** (simulated access) without exposing real secret material. RBAC applies: admin-only create/update/delete; admin and developer may call access; viewer may read metadata only.

Still **planned** for later phases: policy engine APIs, audit logging, risk scanner, frontend, OpenAPI/Swagger, CI/CD, and cloud (GCP) deployment.

## Role permission matrix (planned product shape)

| Role | Intended access |
|------|-----------------|
| **Admin** | Full platform control (planned). |
| **Developer** | Limited secret access (planned). |
| **Viewer** | Metadata-only access (planned). |

Phase 5 maps to this shape for the secret registry: viewer can list/get metadata; developer adds simulated access; admin can manage records.

## Repository layout

- `docker-compose.yml` — local PostgreSQL only
- `backend/` — Go HTTP API (`cmd/api` entrypoint), `database/sql` + `lib/pq`, auth and RBAC helpers, migrations under `internal/database/migrations/`

## Quick start

See `backend/README.md` for Docker Compose, migrations, seed data, `go run ./cmd/api`, and `curl` examples.
