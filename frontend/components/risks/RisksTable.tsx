"use client";

import { useMemo, useState } from "react";
import type { RiskFinding } from "@/lib/types";
import { Badge } from "@/components/ui/Badge";
import { EmptyState } from "@/components/ui/EmptyState";
import { TableShell } from "@/components/ui/TableShell";
import { formatDate, shortId } from "@/lib/format";

interface RisksTableProps {
  risks: RiskFinding[];
  onScan?: () => void;
}

export function RisksTable({ risks, onScan }: RisksTableProps) {
  const [q, setQ] = useState("");
  const [level, setLevel] = useState<"all" | "high" | "medium" | "low">(
    "all"
  );

  const hasHigh = risks.some((r) => r.risk_level === "high");

  const filtered = useMemo(() => {
    const needle = q.trim().toLowerCase();
    return risks.filter((r) => {
      if (level !== "all" && r.risk_level !== level) return false;
      if (!needle) return true;
      const hay =
        `${r.risk_type} ${r.description} ${r.recommendation} ${r.secret_id}`.toLowerCase();
      return hay.includes(needle);
    });
  }, [risks, q, level]);

  if (risks.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-slate-700 bg-slate-900/40 px-8 py-16 text-center">
        <div className="mb-3 h-12 w-12 rounded-lg border border-slate-700 bg-slate-800/60" />
        <p className="text-sm font-medium text-slate-200">
          No Active Risk Findings
        </p>
        <p className="mt-2 max-w-md text-sm text-slate-400">
          Run a metadata security scan to evaluate the current secret registry
          posture.
        </p>
        {onScan ? (
          <button
            onClick={onScan}
            className="mt-5 inline-flex items-center gap-2 rounded-lg bg-cyan-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-cyan-500"
          >
            Run Risk Scan
          </button>
        ) : null}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {hasHigh ? (
        <div className="rounded-lg border border-rose-500/35 bg-rose-950/25 px-4 py-3 text-sm text-rose-100">
          <span className="font-semibold">High risks present.</span> Prioritize
          production ownership, expiry, and access patterns surfaced below.
        </div>
      ) : null}

      <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-end">
        <div className="flex-1 min-w-[200px]">
          <label htmlFor="risk-search" className="sr-only">
            Search risks
          </label>
          <input
            id="risk-search"
            type="search"
            placeholder="Search type, description, recommendation, secret id…"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-100 placeholder:text-slate-600 focus:border-cyan-500/50 focus:outline-none focus:ring-1 focus:ring-cyan-500/40"
          />
        </div>
        <div>
          <label htmlFor="risk-level" className="mr-2 text-xs text-slate-500">
            Risk level
          </label>
          <select
            id="risk-level"
            value={level}
            onChange={(e) => setLevel(e.target.value as typeof level)}
            className="rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-200"
          >
            <option value="all">All</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>
        </div>
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          title="No matching findings"
          description="Adjust filters—the API already orders by severity."
        />
      ) : (
        <TableShell>
          <table className="min-w-[900px] w-full text-left text-sm">
            <thead className="border-b border-slate-800 bg-slate-900/80 text-xs uppercase tracking-wide text-slate-500">
              <tr>
                <th className="px-4 py-3 font-medium">Level</th>
                <th className="px-4 py-3 font-medium">Type</th>
                <th className="px-4 py-3 font-medium">Description</th>
                <th className="px-4 py-3 font-medium">Recommendation</th>
                <th className="px-4 py-3 font-medium">Secret ID</th>
                <th className="px-4 py-3 font-medium">Created</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {filtered.map((r) => (
                <tr key={r.id} className="hover:bg-slate-900/50">
                  <td className="px-4 py-3.5">
                    <Badge kind="risk" value={r.risk_level} />
                  </td>
                  <td className="px-4 py-3.5 font-mono text-xs font-medium text-slate-300">
                    {r.risk_type}
                  </td>
                  <td className="max-w-xs px-4 py-3.5 font-medium text-slate-200">
                    {r.description}
                  </td>
                  <td className="max-w-xs px-4 py-3.5 text-slate-400">
                    {r.recommendation}
                  </td>
                  <td className="px-4 py-3.5 font-mono text-xs text-slate-400">
                    {shortId(r.secret_id, 12)}
                  </td>
                  <td className="whitespace-nowrap px-4 py-3.5 text-slate-500">
                    {formatDate(r.created_at)}
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
