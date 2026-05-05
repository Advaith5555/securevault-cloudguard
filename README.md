# SecureVault CloudGuard

Cloud-native portfolio project oriented toward secrets access, RBAC, audit logging, and risk scanning for Cloud Engineer / DevSecOps roles.

## Current status

**Phase 6 — Audit logging:** The API writes rows to **`audit_logs`** for security-relevant actions (for example login success/failure and secret lifecycle events from Phase 5). **Audit entries do not store plaintext secret values**—they record metadata such as actor, action, resource type, optional resource ID, IP address, status, and a short message. Admins may list recent logs via **`GET /api/v1/audit-logs`** (optional `limit` query param).

Phase 5 behavior is unchanged: secret registry APIs expose **metadata** and **`secret_ref`** only; simulated access stays non-revealing.

**Not implemented yet:** policy engine APIs, risk scanner, frontend, OpenAPI/Swagger, CI/CD, and cloud (GCP) deployment.

## Role permission matrix (planned product shape)

| Role | Intended access |
|------|-----------------|
| **Admin** | Full platform control (planned). |
| **Developer** | Limited secret access (planned). |
| **Viewer** | Metadata-only access (planned). |

The secret registry and audit list align with this: viewer can read secret metadata only; audit log viewing is admin-only.

## Repository layout

- `docker-compose.yml` — local PostgreSQL only
- `backend/` — Go HTTP API (`cmd/api` entrypoint), `database/sql` + `lib/pq`, auth and RBAC helpers, migrations under `internal/database/migrations/`

## Quick start

See `backend/README.md` for Docker Compose, migrations, seed data, `go run ./cmd/api`, and `curl` examples.
