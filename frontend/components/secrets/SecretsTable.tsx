"use client";

import { useMemo, useState } from "react";
import type { Secret } from "@/lib/types";
import { Badge } from "@/components/ui/Badge";
import { EmptyState } from "@/components/ui/EmptyState";
import { TableShell } from "@/components/ui/TableShell";
import { formatDate } from "@/lib/format";

interface SecretsTableProps {
  secrets: Secret[];
}

export function SecretsTable({ secrets }: SecretsTableProps) {
  const [q, setQ] = useState("");
  const [env, setEnv] = useState<"all" | "dev" | "staging" | "prod">("all");

  const filtered = useMemo(() => {
    const needle = q.trim().toLowerCase();
    return secrets.filter((s) => {
      if (env !== "all" && s.environment !== env) return false;
      if (!needle) return true;
      const hay =
        `${s.name} ${s.owner} ${s.service} ${s.environment} ${s.secret_ref}`.toLowerCase();
      return hay.includes(needle);
    });
  }, [secrets, q, env]);

  if (secrets.length === 0) {
    return (
      <EmptyState
        title="No secrets in registry"
        description="Authenticate and ensure the backend has seeded metadata. Plaintext secret values never appear here—only references and stewardship fields."
      />
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-end">
        <div className="flex-1 min-w-[200px]">
          <label htmlFor="secret-search" className="sr-only">
            Search secrets
          </label>
          <input
            id="secret-search"
            type="search"
            placeholder="Search name, owner, service, environment, secret ref…"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-100 placeholder:text-slate-600 focus:border-cyan-500/50 focus:outline-none focus:ring-1 focus:ring-cyan-500/40"
          />
        </div>
        <div>
          <label htmlFor="env-filter" className="mr-2 text-xs text-slate-500">
            Environment
          </label>
          <select
            id="env-filter"
            value={env}
            onChange={(e) =>
              setEnv(e.target.value as typeof env)
            }
            className="rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-200"
          >
            <option value="all">All</option>
            <option value="dev">Dev</option>
            <option value="staging">Staging</option>
            <option value="prod">Production</option>
          </select>
        </div>
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          title="No matching secrets"
          description="Try clearing filters—metadata is masked to safe fields only."
        />
      ) : (
        <TableShell>
          <table className="min-w-[800px] w-full text-left text-sm">
            <thead className="border-b border-slate-800 bg-slate-900/80 text-xs uppercase tracking-wide text-slate-500">
              <tr>
                <th className="px-4 py-3 font-medium">Name</th>
                <th className="px-4 py-3 font-medium">Environment</th>
                <th className="px-4 py-3 font-medium">Owner</th>
                <th className="px-4 py-3 font-medium">Service</th>
                <th className="px-4 py-3 font-medium">Secret ref</th>
                <th className="px-4 py-3 font-medium">Last accessed</th>
                <th className="px-4 py-3 font-medium">Created</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {filtered.map((s) => (
                <tr key={s.id} className="hover:bg-slate-900/50">
                  <td className="px-4 py-3 font-medium text-slate-200">
                    {s.name}
                  </td>
                  <td className="px-4 py-3">
                    <Badge kind="environment" value={s.environment} />
                  </td>
                  <td className="px-4 py-3 text-slate-300">
                    {s.owner || "—"}
                  </td>
                  <td className="px-4 py-3 text-slate-300">
                    {s.service || "—"}
                  </td>
                  <td className="max-w-[200px] truncate px-4 py-3 font-mono text-xs text-cyan-200/90">
                    {s.secret_ref}
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 text-slate-400">
                    {formatDate(s.last_accessed_at ?? undefined)}
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 text-slate-500">
                    {formatDate(s.created_at)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </TableShell>
      )}

      <p className="text-xs text-slate-500">
        Plaintext secret values are not exposed. This dashboard displays
        metadata and references only.
      </p>
    </div>
  );
}
