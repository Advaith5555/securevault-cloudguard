# SecureVault CloudGuard — Backend

Go API with Gin, PostgreSQL, health checks, JWT authentication (demo users), and Phase 4 RBAC middleware (test routes).

## Prerequisites

- Go 1.22+
- Docker (for local Postgres)

## PostgreSQL (Docker Compose)

From the repository root:

```bash
docker compose up -d
```

## Schema migration

From this `backend/` directory (after Postgres is up):

```bash
psql "postgres://securevault_user:securevault_password@localhost:5433/securevault_db?sslmode=disable" -f internal/database/migrations/001_init.sql
```

## Phase 3 — seed demo users

From the repository root:

```bash
docker exec -i securevault-postgres psql -U securevault_user -d securevault_db < backend/internal/database/migrations/002_seed_users.sql
```

## Run the API

From this `backend/` directory:

```bash
go mod tidy
go run ./cmd/api
```

The server listens on port `8080` by default (override with `PORT`). Set `DATABASE_URL` and `JWT_SECRET` as needed (see root `.env.example`).

## Test

```bash
curl http://localhost:8080/health
curl http://localhost:8080/health/db
```

### Auth (Phase 3)

Login:

```bash
curl -X POST http://localhost:8080/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@securevault.local","password":"Admin@123"}'
```

Call `/me` with the token from the login response:

```bash
curl http://localhost:8080/api/v1/auth/me \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### RBAC (Phase 4)

Log in as each user and substitute `YOUR_TOKEN` with the returned JWT.

Login as admin:

```bash
curl -X POST http://localhost:8080/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@securevault.local","password":"Admin@123"}'
```

Login as developer:

```bash
curl -X POST http://localhost:8080/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"developer@securevault.local","password":"Dev@123"}'
```

Login as viewer:

```bash
curl -X POST http://localhost:8080/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"viewer@securevault.local","password":"Viewer@123"}'
```

**Admin** — can hit all three checks:

```bash
curl http://localhost:8080/api/v1/rbac/admin-check -H "Authorization: Bearer YOUR_TOKEN"
curl http://localhost:8080/api/v1/rbac/developer-check -H "Authorization: Bearer YOUR_TOKEN"
curl http://localhost:8080/api/v1/rbac/viewer-check -H "Authorization: Bearer YOUR_TOKEN"
```

**Developer** — forbidden on `admin-check` (`403`), allowed on `developer-check` and `viewer-check`:

```bash
curl http://localhost:8080/api/v1/rbac/admin-check -H "Authorization: Bearer YOUR_TOKEN"
curl http://localhost:8080/api/v1/rbac/developer-check -H "Authorization: Bearer YOUR_TOKEN"
curl http://localhost:8080/api/v1/rbac/viewer-check -H "Authorization: Bearer YOUR_TOKEN"
```

**Viewer** — forbidden on `admin-check` and `developer-check`, allowed on `viewer-check`:

```bash
curl http://localhost:8080/api/v1/rbac/admin-check -H "Authorization: Bearer YOUR_TOKEN"
curl http://localhost:8080/api/v1/rbac/developer-check -H "Authorization: Bearer YOUR_TOKEN"
curl http://localhost:8080/api/v1/rbac/viewer-check -H "Authorization: Bearer YOUR_TOKEN"
```

Environment variables: see the root `.env.example`.
