# SecureVault CloudGuard — Dashboard (frontend)

A **Next.js (App Router)** dashboard for SecureVault CloudGuard: it consumes the existing Go API to surface **dashboard summary**, **secret metadata**, **risk findings**, and **audit trails** where RBAC allows.

This is a **portfolio / learning** UI: dark theme, responsive shell, and honest limits below. **It is not represented as production-ready.**

## Deployed dashboard (portfolio)

The dashboard is deployed on **Vercel**:

- **Live UI:** https://securevault-cloudguard.vercel.app  
- **Backend it calls:** https://securevault-api-5t61.onrender.com (**Render**, with **Render PostgreSQL** behind the API)

The Vercel project sets **`NEXT_PUBLIC_API_BASE_URL=https://securevault-api-5t61.onrender.com`**. Next.js **`next.config`** rewrites `/__upstream/...` to that host so the browser talks same-origin while the SPA runs on Vercel.

**Smoke-tested on the live stack (manual):**

- Admin **login** succeeded.
- **Dashboard** (`/dashboard`) loaded using the dashboard summary API.

The following frontend routes are **available** in the deployed app (audit data remains **admin-only** on the API):

- **`/secrets`** — secret metadata list  
- **`/risks`** — risk findings  
- **`/audit-logs`** — full audit trail when the JWT role is **admin**; otherwise the UI shows an access-restricted message instead of failing.

Local development still works beside this deploy (`npm run dev`).

**GCP Cloud Run:** an **alternative / future** deployment path for the API is documented in the repo at [`docs/cloud-run-deployment.md`](../docs/cloud-run-deployment.md); the live stack described here uses **Render**, not Cloud Run.

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

For the **Vercel** deployment, this variable targets **`https://securevault-api-5t61.onrender.com`**. For local dev, point it at your API (for example the same Render URL or `http://localhost:8080`).

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
| `NEXT_PUBLIC_API_BASE_URL` | Base URL of the Go API (no trailing slash required). Used by `next.config.ts` rewrites; also exported as `configuredApiBaseUrl` in `lib/api.ts` for clarity. On **Vercel**, set this to **`https://securevault-api-5t61.onrender.com`** for the current portfolio backend. |

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

## Screenshots

No screenshot files are committed to the repository yet. Placeholders:

- [ ] Login (`/login`)
- [ ] Dashboard (`/dashboard`)
- [ ] Secrets (`/secrets`)
- [ ] Risks (`/risks`)
- [ ] Audit logs (`/audit-logs`)

## Limitations (intentional for this phase)

- **Portfolio hosting only** — the Vercel + Render pair is for **demos and learning**, not production SLAs or full security hardening.
- **Token in `localStorage`** — convenient for demos; a stricter design would use **httpOnly cookies** and related controls.
- **No create/edit/delete secret UI** — listing and read-only insights only.
- **Backend must be reachable** — otherwise pages show error states (check `NEXT_PUBLIC_API_BASE_URL` and API health).
- **Audit logs page** — **admin-only** on the API; non-admins see the restricted-access card instead of a crash.

## Code map

- `app/` — routes and global styles
- `components/` — shell, tables, shared UI
- `lib/api.ts` — `apiFetch`, domain calls, `ApiError`
- `lib/auth.ts` — localStorage session helpers
- `lib/types.ts` — JSON shapes aligned with OpenAPI field names
