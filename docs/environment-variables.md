# Environment variables

The Go API reads configuration from the process environment (see `backend/internal/config/config.go`). **Never commit a real `.env` file** with production credentials.

| Variable | Purpose | Local example | Cloud Run recommendation |
|----------|---------|---------------|---------------------------|
| `PORT` | HTTP listen port for the Gin server. | `8080` | Set to `8080` (or the port Cloud Run injects via `PORT`—Cloud Run sets `PORT` automatically; align your container to listen on that value). |
| `APP_ENV` | Logical environment label (for example `development` vs `production`). Used in responses like `/health`. | `development` | `production` (or `staging`) once you have a real deployment. |
| `DATABASE_URL` | Postgres connection string for `database/sql` + `lib/pq`. | `postgres://securevault_user:securevault_password@localhost:5433/securevault_db?sslmode=disable` (matches sample Docker Compose) | Point to **Cloud SQL** (or another managed Postgres) using the **Unix socket / Cloud SQL Auth Proxy / connector** pattern appropriate for Cloud Run. **Do not** use `localhost` inside the container to mean “my laptop’s Postgres.” |
| `JWT_SECRET` | HMAC key for signing and verifying JWTs. | Any long random string in dev; never use the sample default in production. | Store in **Secret Manager** and mount as a secret env var (for example `--set-secrets` on Cloud Run) instead of pasting into the console. |

## Security notes

- **`.env` must not be committed.** It is for local convenience only. Add `.env` to `.gitignore` if you create one locally.
- **`.env.example`** in the repo root documents **names and example shapes** only; replace values with your own.
- **`JWT_SECRET`** must be **long, random, and private**. If it leaks, anyone can forge tokens.
- **`DATABASE_URL` contains credentials.** Do not hardcode it in source, Dockerfiles, or public CI logs. Rotate credentials if exposed.
- **On Cloud Run**, prefer **Secret Manager** (or another approved secret store) for `JWT_SECRET` and database credentials, and use **IAM** to limit which service account can read them.
- After changing `JWT_SECRET`, existing JWTs become invalid—plan for user re-login.

## Related documentation

- [architecture.md](architecture.md) — local vs planned GCP layout  
- [cloud-run-deployment.md](cloud-run-deployment.md) — deploying the backend to Cloud Run (optional)
