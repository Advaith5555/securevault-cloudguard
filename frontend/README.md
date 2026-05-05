# SecureVault CloudGuard — Dashboard (frontend)

A **Next.js (App Router)** dashboard for SecureVault CloudGuard: it consumes the existing Go API to surface **dashboard summary**, **secret metadata**, **risk findings**, and **audit trails** where RBAC allows.

This is a **portfolio / learning** UI: dark theme, responsive shell, and honest limitations called out below.

## Tech stack

- **Next.js 15** (App Router)
- **React 19**
- **TypeScript**
- **Tailwind CSS**

## Backend API base URL

The UI calls the API through a **same-origin proxy** (`/__upstream/...` → Next `rewrites`) so the browser avoids CORS against the Go host.

Set the upstream target with:

- **`NEXT_PUBLIC_API_BASE_URL`** — see [`./.env.example`](./.env.example).  
  Default in code / config when unset: **`http://localhost:8080`** (matches a typical local API).

For the public demo API, the example file points at the Render deployment URL (no extra “deployment” links are added in the app).

## Local setup

From this directory:

```bash
npm install
cp .env.example .env.local   # optional: adjust NEXT_PUBLIC_API_BASE_URL
npm run dev
```

Open `http://localhost:3000`.

Scripts:

- `npm run dev` — development server
- `npm run build` — production build
- `npm run start` — serve `next build` output
- `npm run lint` — ESLint (Next.js rules)

## Environment variable

| Variable | Purpose |
|----------|---------|
| `NEXT_PUBLIC_API_BASE_URL` | Base URL of the Go API (no trailing slash required). Used by `next.config.ts` rewrites; also exported as `configuredApiBaseUrl` in `lib/api.ts` for clarity. |

## Demo users

Seeded in the backend (local and demo environments):

| Role | Email | Password |
|------|-------|----------|
| Admin | `admin@securevault.local` | `Admin@123` |
| Developer | `developer@securevault.local` | `Dev@123` |
| Viewer | `viewer@securevault.local` | `Viewer@123` |

## Pages

| Route | Behavior |
|-------|----------|
| `/` | Redirects to `/dashboard` when a token exists, otherwise `/login`. |
| `/login` | Email/password sign-in; stores JWT + user in **localStorage** (MVP). |
| `/dashboard` | `GET /api/v1/dashboard/summary` — stat cards, posture note, recent audit snippet. |
| `/secrets` | `GET /api/v1/secrets` — searchable metadata table (no plaintext values). |
| `/risks` | `GET /api/v1/risks` — filterable findings. |
| `/audit-logs` | `GET /api/v1/audit-logs` — **admin-only**; friendly message on **403** for other roles. |

## Limitations (intentional for this phase)

- **Token in `localStorage`** — convenient for demos; production would move toward **httpOnly cookies** + CSRF strategy.
- **No create/edit/delete secret UI** — listing and read-only insights only.
- **Backend must be reachable** — otherwise pages show error states (try the health endpoints or check `NEXT_PUBLIC_API_BASE_URL`).
- **Audit logs page** — **admin-only** on the API; developers and viewers see the restricted-access card instead of a crash.
- **Not deployed** as part of this README — run locally or host when you are ready.

## Code map

- `app/` — routes and global styles
- `components/` — shell, tables, shared UI
- `lib/api.ts` — `apiFetch`, domain calls, `ApiError`
- `lib/auth.ts` — localStorage session helpers
- `lib/types.ts` — JSON shapes aligned with OpenAPI field names
