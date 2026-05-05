"use client";

import { useMemo, useState } from "react";
import type { AuditLog } from "@/lib/types";
import { Badge } from "@/components/ui/Badge";
import { EmptyState } from "@/components/ui/EmptyState";
import { TableShell } from "@/components/ui/TableShell";
import { formatDate, shortId } from "@/lib/format";

interface AuditLogsTableProps {
  logs: AuditLog[];
}

export function AuditLogsTable({ logs }: AuditLogsTableProps) {
  const [q, setQ] = useState("");
  const [status, setStatus] = useState<
    "all" | "success" | "failed" | "denied"
  >("all");

  const filtered = useMemo(() => {
    const needle = q.trim().toLowerCase();
    return logs.filter((row) => {
      if (status !== "all" && row.status !== status) return false;
      if (!needle) return true;
      const hay =
        `${row.action} ${row.user_email} ${row.message} ${row.resource_type} ${row.resource_id ?? ""}`.toLowerCase();
      return hay.includes(needle);
    });
  }, [logs, q, status]);

  if (logs.length === 0) {
    return (
      <EmptyState
        title="No audit entries"
        description="Activity will appear after logins and protected API calls. Admins see the widest feed."
      />
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-end">
        <div className="flex-1 min-w-[200px]">
          <label htmlFor="audit-search" className="sr-only">
            Search audit logs
          </label>
          <input
            id="audit-search"
            type="search"
            placeholder="Search action, email, message, resource…"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-100 placeholder:text-slate-600 focus:border-cyan-500/50 focus:outline-none focus:ring-1 focus:ring-cyan-500/40"
          />
        </div>
        <div>
          <label htmlFor="audit-status" className="mr-2 text-xs text-slate-500">
            Status
          </label>
          <select
            id="audit-status"
            value={status}
            onChange={(e) => setStatus(e.target.value as typeof status)}
            className="rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-200"
          >
            <option value="all">All</option>
            <option value="success">Success</option>
            <option value="failed">Failed</option>
            <option value="denied">Denied</option>
          </select>
        </div>
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          title="No matching audit rows"
          description="Clear filters to see the full admin-visible history."
        />
      ) : (
        <TableShell>
          <table className="min-w-[960px] w-full text-left text-sm">
            <thead className="border-b border-slate-800 bg-slate-900/80 text-xs uppercase tracking-wide text-slate-500">
              <tr>
                <th className="px-4 py-3 font-medium">Action</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium">User email</th>
                <th className="px-4 py-3 font-medium">Resource type</th>
                <th className="px-4 py-3 font-medium">Resource ID</th>
                <th className="px-4 py-3 font-medium">Message</th>
                <th className="px-4 py-3 font-medium">Created</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {filtered.map((row) => (
                <tr key={row.id} className="hover:bg-slate-900/50">
                  <td className="px-4 py-3 font-mono text-xs text-slate-300">
                    {row.action}
                  </td>
                  <td className="px-4 py-3">
                    <Badge kind="status" value={row.status} />
                  </td>
                  <td className="px-4 py-3 text-slate-300">{row.user_email}</td>
                  <td className="px-4 py-3 text-slate-400">{row.resource_type}</td>
                  <td className="px-4 py-3 font-mono text-xs text-slate-500">
                    {row.resource_id ? shortId(row.resource_id, 12) : "—"}
                  </td>
                  <td className="max-w-sm px-4 py-3 text-slate-400">
                    {row.message}
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 text-slate-500">
                    {formatDate(row.created_at)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </TableShell>
      )}
    </div>
  );
}
