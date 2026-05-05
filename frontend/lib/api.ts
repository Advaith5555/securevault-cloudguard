import type {
  AuditLog,
  DashboardSummary,
  LoginResponse,
  RiskFinding,
  Secret,
  User,
} from "./types";
import { getToken } from "./auth";

/** Matches `next.config.ts` upstream target. Browser traffic uses `/__upstream` rewrites. */
export const configuredApiBaseUrl =
  process.env.NEXT_PUBLIC_API_BASE_URL?.replace(/\/$/, "") ||
  "http://localhost:8080";

export class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
    public body?: unknown
  ) {
    super(message);
    this.name = "ApiError";
  }
}

/** Same-origin `/__upstream` rewrites to `configuredApiBaseUrl` (avoids browser CORS). */
function apiBase(): string {
  return "/__upstream";
}

export async function apiFetch<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const token = getToken();
  const headers = new Headers(options.headers);

  const isForm = options.body instanceof FormData;
  if (!isForm && !headers.has("Content-Type") && options.body != null) {
    headers.set("Content-Type", "application/json");
  }

  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  const res = await fetch(`${apiBase()}${path}`, {
    ...options,
    headers,
  });

  const text = await res.text();
  let data: unknown = undefined;
  if (text) {
    try {
      data = JSON.parse(text) as unknown;
    } catch {
      data = text;
    }
  }

  if (!res.ok) {
    const backendErr =
      typeof data === "object" &&
      data !== null &&
      "error" in data &&
      typeof (data as { error: unknown }).error === "string"
        ? (data as { error: string }).error
        : null;

    let message = backendErr ?? res.statusText ?? "Request failed";
    if (!backendErr) {
      if (res.status === 401) message = "Unauthorized";
      else if (res.status === 403) message = "Forbidden";
      else if (res.status >= 500) message = "Server error";
    }
    throw new ApiError(res.status, message, data);
  }

  return data as T;
}

export async function login(
  email: string,
  password: string
): Promise<LoginResponse> {
  return apiFetch<LoginResponse>("/api/v1/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });
}

export async function getDashboardSummary(): Promise<DashboardSummary> {
  return apiFetch<DashboardSummary>("/api/v1/dashboard/summary");
}

export async function getSecrets(): Promise<Secret[]> {
  return apiFetch<Secret[]>("/api/v1/secrets");
}

export async function getRisks(): Promise<RiskFinding[]> {
  return apiFetch<RiskFinding[]>("/api/v1/risks");
}

export async function getAuditLogs(limit = 50): Promise<AuditLog[]> {
  const q = limit > 0 ? `?limit=${encodeURIComponent(String(limit))}` : "";
  return apiFetch<AuditLog[]>(`/api/v1/audit-logs${q}`);
}

export function normalizeUser(loginUser: LoginResponse["user"]): User {
  return {
    id: loginUser.id,
    email: loginUser.email,
    role: loginUser.role,
    name: loginUser.name,
  };
}
