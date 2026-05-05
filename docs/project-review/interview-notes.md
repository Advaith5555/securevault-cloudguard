# Interview notes — SecureVault CloudGuard

First-person, company-neutral talking points for this repository. Adjust wording to match how you actually speak.

## 60-second project explanation

“I built **SecureVault CloudGuard**, a **Go and Gin** REST API that practices **secret metadata registration**, **JWT login**, **role-based middleware**—admin, developer, viewer—and **audit logging** plus a **metadata-only risk scanner**. Postgres runs locally in **Docker Compose**. There is **no frontend** yet and **no real secret payload** in the API: list and detail return metadata and a `secret_ref`, and ‘access’ is a **small simulated response**. I also added **OpenAPI**, **GitHub Actions** for formatting and tests, and **Markdown notes** on how I’d eventually run it on **Cloud Run**—but I’m honest that I haven’t deployed it as part of this repo.”

## 2-minute project explanation

“SecureVault CloudGuard is my **portfolio backend** for cloud and security-themed API design. Users authenticate with email and password; passwords are **bcrypt** hashes in Postgres. Successful login returns a **JWT**, and Gin **middleware** checks the bearer token and optional **RequireRoles** for each route group.

“The **secrets** endpoints manage **records**—name, environment, owner, service, `secret_ref`, timestamps—not the actual credential string. That kept the scope realistic for learning and avoids leaking secrets in JSON.

“I added **audit logs** for things like login and secret create/update/delete and for the simulated access and risk scan paths. A **risk scan** wipes and refills **risk_findings** using simple rules on metadata—empty owner, prod without owner, age over ninety days, past `expires_at`, etc.

“There’s a **dashboard summary** endpoint aggregating counts and the last five audit rows. Documentation is **OpenAPI 3** plus architecture and Cloud Run **planning** docs. **CI** runs `gofmt`, `vet`, `test`, and `build` without a database. What’s **not** there: a UI, Google Secret Manager wiring, SSO, or an automated deploy pipeline.”

## Deep technical explanation

Walk through four layers if asked for detail:

1. **HTTP (Gin):** Routes under `/api/v1` for auth, RBAC test routes, secrets, audit logs, risks, dashboard. Public `/health` and `/health/db`. Middleware sets `user_id`, `email`, `role` from JWT claims.

2. **Services:** Business logic for secrets (including simulated access response), audit **Log** helper, risk **Scan** (load secrets, apply rules, transactionally replace findings, audit), dashboard **GetSummary** (counts + `ListAuditLogs(5)`).

3. **Repositories:** `database/sql` + `lib/pq` for users, secrets, audit rows, risk rows, and dashboard count queries.

4. **Data:** Migrations define tables; seed inserts demo users. No ORM—explicit SQL keeps the learning path clear.

If they ask about **transactions**: risk inserts use a transaction for multiple `INSERT`s; clear-all then insert is two steps at the repository level (document the tradeoff honestly if asked).

## How to explain architecture

“**Client → Gin → services → repositories → Postgres.** Auth is **JWT middleware** first, then **role middleware** on protected groups. **OpenAPI** lives as a file in the repo; the server doesn’t host Swagger UI. **GitHub Actions** validates the Go code and that the spec file exists—it doesn’t spin up Postgres.”

## How to explain security design

“I focused on **defense in depth at the API layer**: verify identity with **JWT**, then **authorize** with **RBAC**. Passwords never sit in plaintext in the DB. Secret **values** aren’t part of this MVP—the model is **metadata + reference string**, and the access route is **explicitly simulated** so I’m not faking a vault. **Audit** gives a trail for practice; in production I’d also think about **Secret Manager**, **TLS everywhere**, **rotation**, and **least-privilege DB users**—those aren’t all implemented here.”

## How to explain limitations honestly

“This isn’t production software. There’s **no UI**, **no SSO**, **no per-secret policy API**, **no real Secret Manager**, and **CI doesn’t integration-test the database**. Risk rules are **heuristic**. Audit failure is logged but **doesn’t fail the request**—a deliberate MVP choice so a broken audit insert doesn’t block login; I’d revisit that with a queue or metrics in a real system. **Cloud Run** is documented; I don’t pretend the repo ships a live URL.”

## How to explain cloud engineering relevance

“The project rehearses patterns you see around **managed services**: stateless HTTP service, external **managed Postgres**, **secrets** pulled from config or a secret store instead of baked into images. The **deployment doc** mentions **Artifact Registry**, **Cloud SQL**, **Secret Manager**, and **Logging** as the picture I’d grow into. Locally I use **Compose** so the footprint matches ‘small team dev’ without paying cloud cost while iterating.”
