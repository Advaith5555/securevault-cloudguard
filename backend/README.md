# SecureVault CloudGuard — Backend

Go API with Gin, PostgreSQL connectivity, and health endpoints.

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
psql "postgres://securevault_user:securevault_password@localhost:5432/securevault_db?sslmode=disable" -f internal/database/migrations/001_init.sql
```

## Run the API

From this `backend/` directory:

```bash
go mod tidy
go run ./cmd/api
```

The server listens on port `8080` by default (override with `PORT`). Set `DATABASE_URL` if it differs from `.env.example`.

## Test

```bash
curl http://localhost:8080/health
curl http://localhost:8080/health/db
```

Environment variables: see the root `.env.example`.
