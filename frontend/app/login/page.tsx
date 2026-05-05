"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { login, normalizeUser, ApiError } from "@/lib/api";
import { isAuthenticated, saveSession } from "@/lib/auth";

const DEMO = [
  {
    label: "Admin",
    email: "admin@securevault.local",
    password: "Admin@123",
    hint: "Full registry + audit visibility",
  },
  {
    label: "Developer",
    email: "developer@securevault.local",
    password: "Dev@123",
    hint: "Metadata + risks; audit list is admin-only upstream",
  },
  {
    label: "Viewer",
    email: "viewer@securevault.local",
    password: "Viewer@123",
    hint: "Read-only summaries and lists",
  },
] as const;

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isAuthenticated()) {
      router.replace("/dashboard");
    }
  }, [router]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await login(email.trim(), password);
      saveSession(res.token, normalizeUser(res.user));
      router.replace("/dashboard");
      router.refresh();
    } catch (err) {
      const msg =
        err instanceof ApiError
          ? err.message
          : err instanceof Error
            ? err.message
            : "Sign-in failed";
      setError(msg);
    } finally {
      setLoading(false);
    }
  }

  function fillDemo(d: (typeof DEMO)[number]) {
    setEmail(d.email);
    setPassword(d.password);
    setError(null);
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <div className="mx-auto flex min-h-screen max-w-6xl flex-col lg:flex-row">
        <div className="flex flex-1 flex-col justify-center border-b border-slate-800 px-6 py-12 lg:border-b-0 lg:border-r lg:px-12">
          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-cyan-400/90">
            SecureVault CloudGuard
          </p>
          <h1 className="mt-4 text-3xl font-semibold tracking-tight text-slate-50 sm:text-4xl">
            Sign in to your security workspace
          </h1>
          <p className="mt-4 max-w-md text-sm leading-relaxed text-slate-400">
            Cloud-security dashboard for secret metadata, RBAC, audit trails,
            and risk visibility—built for learning and controlled demos.
          </p>
          <ul className="mt-8 space-y-3 text-sm text-slate-500">
            <li className="flex gap-2">
              <span className="text-cyan-500/80">•</span>
              JWT session stored locally for this MVP (upgrade path: httpOnly
              cookies).
            </li>
            <li className="flex gap-2">
              <span className="text-cyan-500/80">•</span>
              API calls proxy through Next rewrites to avoid browser CORS
              friction.
            </li>
          </ul>
        </div>

        <div className="flex flex-1 flex-col justify-center px-6 py-12 lg:px-12">
          <div className="mx-auto w-full max-w-md space-y-8">
            <form
              onSubmit={onSubmit}
              className="space-y-5 rounded-xl border border-slate-800 bg-slate-900/50 p-6 shadow-xl"
            >
              <div>
                <label
                  htmlFor="email"
                  className="text-xs font-medium uppercase tracking-wide text-slate-500"
                >
                  Email
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="username"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="mt-2 w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-100 focus:border-cyan-500/50 focus:outline-none focus:ring-1 focus:ring-cyan-500/40"
                />
              </div>
              <div>
                <label
                  htmlFor="password"
                  className="text-xs font-medium uppercase tracking-wide text-slate-500"
                >
                  Password
                </label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="mt-2 w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-100 focus:border-cyan-500/50 focus:outline-none focus:ring-1 focus:ring-cyan-500/40"
                />
              </div>

              {error ? (
                <div
                  className="rounded-md border border-rose-500/40 bg-rose-950/40 px-3 py-2 text-sm text-rose-100"
                  role="alert"
                >
                  {error}
                </div>
              ) : null}

              <button
                type="submit"
                disabled={loading}
                className="flex w-full items-center justify-center rounded-lg bg-cyan-600 px-4 py-2.5 text-sm font-semibold text-slate-950 hover:bg-cyan-500 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading ? "Signing in…" : "Sign in"}
              </button>
            </form>

            <div className="rounded-xl border border-slate-800 bg-slate-900/30 p-5">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                Demo users
              </p>
              <p className="mt-2 text-xs text-slate-500">
                Tap a card to autofill credentials. Passwords are demo-only.
              </p>
              <div className="mt-4 space-y-3">
                {DEMO.map((d) => (
                  <button
                    key={d.email}
                    type="button"
                    onClick={() => fillDemo(d)}
                    className="w-full rounded-lg border border-slate-800 bg-slate-950/60 px-4 py-3 text-left text-sm transition hover:border-cyan-500/30 hover:bg-slate-900"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-medium text-slate-200">
                        {d.label}
                      </span>
                      <span className="text-[10px] uppercase text-slate-500">
                        Autofill
                      </span>
                    </div>
                    <p className="mt-1 font-mono text-xs text-cyan-200/80">
                      {d.email}
                    </p>
                    <p className="mt-2 text-xs text-slate-500">{d.hint}</p>
                  </button>
                ))}
              </div>
            </div>

            <p className="text-center text-xs text-slate-600">
              Need the raw API? See the OpenAPI spec shipped with the backend
              repository.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
