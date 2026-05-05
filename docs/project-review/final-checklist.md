# Final project checklist — SecureVault CloudGuard

Use this before demos, submissions, or sharing the repository. Check items as you verify them in your environment.

## Local setup checklist

- [ ] Docker engine is running; `docker compose up -d` from the repo root succeeds.
- [ ] Container `securevault-postgres` (or the name in your `docker-compose.yml`) is healthy.
- [ ] `001_init.sql` has been applied (schema includes `users`, `secrets`, `audit_logs`, `risk_findings`, etc.).
- [ ] `002_seed_users.sql` has been applied (demo users exist).
- [ ] From `backend/`, `go mod tidy` completes without errors.
- [ ] `go run ./cmd/api` starts the server (default port **8080** unless `PORT` is set).
- [ ] Optional: `.env` exists locally and is **not** tracked by git (`git status` clean for secrets).

## API test checklist

- [ ] `GET /health` returns JSON with `status: ok` and service name.
- [ ] `GET /health/db` returns `database: connected` when Postgres is up.
- [ ] `POST /api/v1/auth/login` with a valid demo user returns a `token` and user object.
- [ ] `GET /api/v1/auth/me` with `Authorization: Bearer <token>` returns `id`, `email`, `role`.
- [ ] **RBAC probes:** `GET /api/v1/rbac/admin-check` — admin **200**; developer and viewer **403**.
- [ ] **RBAC probes:** `GET /api/v1/rbac/developer-check` — admin and developer **200**; viewer **403**.
- [ ] **RBAC probes:** `GET /api/v1/rbac/viewer-check` — all three roles **200**.
- [ ] **Secrets:** Admin can `POST /api/v1/secrets`; developer/viewer get **403** on create.
- [ ] **Secrets:** All roles can `GET /api/v1/secrets` and `GET /api/v1/secrets/{id}` (metadata only; no plaintext secret values).
- [ ] **Secrets:** `POST /api/v1/secrets/{id}/access` — admin/developer **200** with simulated JSON; viewer **403**.
- [ ] **Audit:** After login and secret actions, `GET /api/v1/audit-logs` (admin) shows `login`, `secret_*`, and after a scan `risk_scan_executed` as applicable.
- [ ] **Risk:** Create a secret with empty `owner`/`service` in **prod** (see `backend/README.md` Phase 7 example); `POST /api/v1/risks/scan` (admin) produces findings for **missing owner**, **missing service**, **prod missing owner** (and other rules if data matches).
- [ ] **Dashboard:** `GET /api/v1/dashboard/summary` returns counts and `recent_audit_logs` (length ≤ 5).

## Security checklist

- [ ] No real production passwords or `JWT_SECRET` values are committed.
- [ ] `.env` is gitignored or absent from the index (verify with `git ls-files` / `git status`).
- [ ] README and docs do not claim **production readiness** or a **live Cloud Run URL** unless you actually deployed and choose to document your own URL separately.
- [ ] Documentation uses **demo credentials** only in the context of **local dev** and labels them as such.
- [ ] OpenAPI and Markdown do not document or example **plaintext application secret values** (only `secret_ref` and metadata).
- [ ] You can explain that **secret access is simulated** and **bcrypt + JWT** are used for users and API auth.

## Documentation checklist

- [ ] Root [`README.md`](../../README.md) reflects current scope (no frontend, no live deploy claim, limitations visible).
- [ ] [`backend/docs/openapi.yaml`](../../backend/docs/openapi.yaml) exists and matches the implemented routes you care about.
- [ ] [`docs/architecture.md`](../architecture.md), [`docs/environment-variables.md`](../environment-variables.md), [`docs/cloud-run-deployment.md`](../cloud-run-deployment.md) are present if you reference them.
- [ ] This `docs/project-review/` folder is linked from the root README **Final review package** section.

## GitHub quality checklist

- [ ] Latest workflow run for **SecureVault CloudGuard CI** on `main` (or your PR branch) is **green**.
- [ ] CI steps include: `gofmt` check, `go vet`, `go test`, `go build`, OpenAPI file existence.

## Before sharing checklist

- [ ] Re-read **limitations** in the root README (no SSO, no Secret Manager in code, no policy engine, etc.).
- [ ] No **fake screenshots**, **fake metrics**, or **placeholder production URLs** in the repo.
- [ ] You are comfortable saying this is a **student / portfolio** backend, not a shipping product.
- [ ] Optional: run through [`interview-questions.md`](interview-questions.md) once out loud.
