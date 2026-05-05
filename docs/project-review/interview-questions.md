# Interview Q&A — SecureVault CloudGuard

Fifteen questions with **honest** answers tied to this repo. No company names.

---

### 1. Why did you build this?

I wanted a **single project** that combined things I was studying: **REST APIs in Go**, **Postgres**, **JWT auth**, **role-based routing**, **audit-style logging**, and a **tiny “security ops” slice** via a metadata risk scanner—all runnable on my laptop with **Docker Compose**.

---

### 2. Why Go?

**Simple deployment story**, fast compile, strong **standard library**, and **`database/sql`** let me stay close to SQL without an ORM. For a backend-focused portfolio piece, Go kept the code readable and the binary easy to reason about.

---

### 3. Why Gin?

Gin gives **routing**, **middleware**, and **JSON binding** with minimal ceremony. It’s widely used so examples and docs are easy to find, and it was enough for this scope without importing a heavier framework.

---

### 4. Why PostgreSQL?

Secrets, audit rows, and risk findings are **relational** data; Postgres handles **constraints** (e.g. roles, audit status enums in migrations) and **UUID** keys cleanly. It’s also what managed offerings like **Cloud SQL** mirror, which matches how I documented a future deploy path.

---

### 5. Why Docker Compose?

I needed **repeatable dev data**: anyone can `docker compose up`, run the SQL migrations, and hit the same schema. I’m **not** claiming that Compose is production—just that it’s the right **local** tradeoff for this project.

---

### 6. How does JWT work here?

On **login**, the server checks **bcrypt** against the stored hash, then signs a **JWT** (HS256) with `JWT_SECRET` containing **user id, email, role**. Protected routes read the **`Authorization: Bearer`** header, validate the signature and expiry, and stash claims in the Gin context for handlers and **RequireRoles**.

---

### 7. What is RBAC in this project?

**Role-based access control** at the **HTTP route** level: after authentication, middleware checks that the user’s **role** string is in an allowed list for that route group—e.g. only **admin** creates secrets, **admin + developer** hit simulated access, **viewer** can list metadata but not access. It’s **not** fine-grained ABAC or a policy engine.

---

### 8. Difference between authentication and authorization?

**Authentication** answers *who are you?*—here, login + JWT validation. **Authorization** answers *what may you do?*—here, RBAC middleware allowing or denying routes based on **role** after the token is valid.

---

### 9. Are you storing real secrets?

**No plaintext application secrets** in the API. The **secret registry** stores **metadata** and a **`secret_ref`** (a string that *points* to where a secret would live). The **access** endpoint returns a **fixed demo JSON** and does not reveal a real credential. In a real system, the runtime would talk to **Secret Manager** or similar—**not implemented** in this codebase.

---

### 10. How does audit logging work?

Handlers and auth call an **AuditService.Log** with structured fields (action, resource type, optional resource id, status, IP, message). The service **inserts** into **`audit_logs`**. Login success and failure, secret CRUD and simulated access, and risk scan completion are examples of logged actions.

---

### 11. How does the risk scanner work?

An **admin-only** route loads all secrets (metadata), applies **rules** in code—e.g. empty owner → medium, empty service → low, prod with no owner → high, older than 90 days → medium, past `expires_at` → high—builds a slice of findings, **deletes** previous rows in **`risk_findings`**, **inserts** new ones in a transaction, writes an **audit** row, and returns the list **ordered** by severity. **No secret values** are read or scored.

---

### 12. What happens if audit logging fails?

The **Log** method **does not return an error to the caller**: on insert failure it **logs to stderr** with the standard **log** package and the main request **continues**. That was an intentional MVP choice so a broken audit table doesn’t block login; I’d call out **tradeoffs** (silent loss of audit) in a real design review.

---

### 13. How would you deploy this to GCP?

At a high level: **container image** to **Artifact Registry**, **Cloud Run** service with env/secrets from **Secret Manager**, **Cloud SQL** for Postgres instead of Compose, connect with the **recommended connector / networking** pattern (not `localhost` from the container). This repo has a **written walkthrough** in `docs/cloud-run-deployment.md` including cleanup—**automation is not** in GitHub Actions yet.

---

### 14. What would you improve next?

**Short term:** **Unit tests**, **Swagger UI** or static contract hosting if you want browser-based exploration, **Docker image** CI build (push optional). **Medium term:** **Secret Manager**, **Cloud SQL**, **Terraform**, Artifact Registry automation. **Longer term:** **Policy engine**, richer **per-resource** auth, **monitoring** and **alerting**. I’d also revisit **audit reliability** (queue, retries, metrics).

---

### 15. What are the limitations?

**No frontend**, **no SSO**, **no production deploy** shipped with the repo, **no Secret Manager** in code, **no policy API** beyond roles, **CI** doesn’t run Postgres, **risk rules** are simple heuristics, and **simulated** secret access is **not** a vault integration. I describe it as a **learning backend**, not production-ready software.
