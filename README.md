# SecureVault CloudGuard

Cloud-native portfolio project oriented toward secrets access, RBAC, audit logging, and risk scanning for Cloud Engineer / DevSecOps roles.

## Current status

**Phase 11 — Cloud Run documentation:** Optional **deployment guidance** for Google **Cloud Run**, **Artifact Registry**, **Cloud SQL**, **Secret Manager**, and related operations lives under **`docs/`**. This is **not** an automated deploy: **no Cloud Run service is created by this repo**, and **there is no maintained production URL** unless you run the steps yourself.

**Phase 10 — Continuous integration:** GitHub Actions runs **`SecureVault CloudGuard CI`** on **push** and **pull requests** to **`main`**: `go mod download`, **`gofmt`** (no drift), **`go vet`**, **`go test ./...`**, **`go build`** for `./cmd/api`, and a check that **`backend/docs/openapi.yaml`** exists. **No PostgreSQL service, no deployment, no secrets** in this workflow.

**Phase 9 — OpenAPI documentation:** Machine-readable API description is maintained at **`backend/docs/openapi.yaml`** (OpenAPI 3.0.3): health, auth, RBAC probes, secrets, audit logs, risk scan/list, and dashboard summary. **Swagger UI is not served by the application**—import the spec into [Swagger Editor](https://editor.swagger.io), Postman, or Insomnia and point requests at **`http://localhost:8080`** when the API is running locally.

Prior phases remain in place for the Gin backend (secrets metadata and `secret_ref` only—no plaintext values in simulated access responses), audit logging, risk scanning, and dashboard summary.

**Still planned:** policy engine APIs, frontend UI. **CI does not deploy.** **Cloud Run** is **documented** in Phase 11 but **not executed** for you.

## Documentation

| Doc | What it covers |
|-----|----------------|
| [docs/architecture.md](docs/architecture.md) | Overview, local vs planned GCP architecture (Mermaid diagrams), honest scope |
| [docs/environment-variables.md](docs/environment-variables.md) | `PORT`, `APP_ENV`, `DATABASE_URL`, `JWT_SECRET`, security notes |
| [docs/cloud-run-deployment.md](docs/cloud-run-deployment.md) | Step-by-step Cloud Run + Artifact Registry guide (optional; includes prerequisites and cleanup) |

Deploying to GCP is **your choice**: follow the guide only when you are ready; otherwise treat it as reference material only.

## Continuous integration

The workflow lives at **`.github/workflows/ci.yml`**. On every **push** or **pull request** targeting **`main`**, it validates the **backend** with Go **formatting**, **`go vet`**, **tests**, **build**, and confirms the **OpenAPI** file is present. It does **not** start Postgres, run integration tests against a database, build container images, or publish anywhere.

## Role permission matrix (planned product shape)

| Role | Intended access |
|------|-----------------|
| **Admin** | Full platform control (planned). |
| **Developer** | Limited secret access (planned). |
| **Viewer** | Metadata-only access (planned). |

The secret registry, risk list, dashboard summary, and audit log list (admin-only) map to this direction where applicable.

## Repository layout

- `.github/workflows/ci.yml` — GitHub Actions CI (backend formatting, vet, test, build; OpenAPI file check)
- `docs/` — Architecture, environment variables, optional **Cloud Run deployment** guide (not executed automatically)
- `docker-compose.yml` — local PostgreSQL only
- `backend/` — Go HTTP API (`cmd/api` entrypoint), `database/sql` + `lib/pq`, auth and RBAC helpers, migrations under `internal/database/migrations/`, OpenAPI spec under `backend/docs/`

## Quick start

See `backend/README.md` for Docker Compose, migrations, seed data, `go run ./cmd/api`, `curl` examples, OpenAPI workflow, CI checks, and deployment notes. Optional GCP steps: [docs/cloud-run-deployment.md](docs/cloud-run-deployment.md).
