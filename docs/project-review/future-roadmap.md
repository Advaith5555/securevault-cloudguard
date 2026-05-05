# Future roadmap — SecureVault CloudGuard

Honest backlog for this repository. Nothing here is committed work—prioritize based on what you want to learn or show next.

## Short-term improvements

- **Unit tests** — Handlers and services with **mocks** or small **sqlmock**-style tests; focus on auth, RBAC wiring, and risk rule evaluation without needing a live DB everywhere.
- **Dockerfile hardening (optional)** — Non-root user, image scanning, smaller base—`backend/Dockerfile` already covers a basic multi-stage build.
- **Next.js dashboard** — Thin UI consuming **`GET /api/v1/dashboard/summary`**, secret list, risk list; keep auth as bearer token pasted or simple login form calling existing `/auth/login`.
- **Swagger UI** — Optional route or small static wrapper that serves **Swagger UI** pointed at **`/openapi.yaml`** or a copied spec—only if you accept the operational cost; many teams rely on hosted Swagger Editor instead.

## Medium-term improvements

- **Google Secret Manager integration** — Read application secrets (e.g. `JWT_SECRET`) and optionally bridge **vault-style** lookups for **`secret_ref`** in a guarded service account model (design carefully; keep audit trail).
- **Cloud SQL deployment** — Replace local Compose Postgres for a **staging** environment; run migrations via job or documented pipeline.
- **Cloud Run deployment** — Execute the steps in [`docs/cloud-run-deployment.md`](../cloud-run-deployment.md) in a **personal GCP project**, then iterate on IAM, concurrency, min instances if needed.
- **Terraform** (or alternate IaC) — Describe Artifact Registry repo, Cloud SQL, Cloud Run service, IAM bindings as code for repeatable teardown.
- **GitHub Actions Docker build** — Build and push images on **`main`** or tags; **still** optional whether you auto-deploy—keeping build-only avoids coupling to GCP credentials in CI initially.

## Advanced improvements

- **Policy engine** — Rules beyond static roles—e.g. environment + resource attributes evaluated per request—stored in DB or config.
- **Per-user / per-secret access control** — Grant matrix or ABAC-style claims; likely needs new tables and middleware design.
- **Approval workflow** — Request/approve access to specific `secret_ref` entries before simulated or real fetch.
- **Cloud Monitoring alerts** — SLO-style error rate, latency, and **uptime checks** against `/health` once hosted.
- **Security Command Center–style findings** — Aggregate risk + config issues across projects (requires GCP org setup and is far beyond current scope).
- **IaC scanning** — Run **Checkov**, **tfsec**, or similar on Terraform in CI for misconfiguration signals.
- **Container vulnerability scanning** — **Artifact Analysis** or third-party scan on images before deploy.

Revisit **audit durability** (queue, DLQ, alerts on insert failure) in parallel with any production path.
