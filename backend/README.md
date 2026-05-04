# SecureVault CloudGuard — Backend

Go API server (Phase 1: health check only).

## Run locally

From this `backend/` directory:

```bash
go mod tidy
go run ./cmd/api
```

The server listens on port `8080` by default (override with `PORT`).

Check health:

```bash
curl http://localhost:8080/health
```

Optional environment variables: see the root `.env.example` (`PORT`, `APP_ENV`).
