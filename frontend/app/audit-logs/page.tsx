"use client";

import { useEffect, useState } from "react";
import { AuditLogsTable } from "@/components/audit/AuditLogsTable";
import { ErrorState } from "@/components/ui/ErrorState";
import { LoadingState, TableSkeletonRows } from "@/components/ui/LoadingState";
import { ApiError, getAuditLogs } from "@/lib/api";
import { actionLabel, timeAgo } from "@/lib/format";
import type { AuditLog } from "@/lib/types";

export default function AuditLogsPage() {
  const [logs, setLogs] = useState<AuditLog[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [forbidden, setForbidden] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function load() {
    setLoading(true);
    setError(null);
    setForbidden(false);
    try {
      const rows = await getAuditLogs(100);
      setLogs(rows);
    } catch (err) {
      if (err instanceof ApiError && err.status === 403) {
        setForbidden(true);
        return;
      }
      const msg =
        err instanceof ApiError
          ? err.message
          : err instanceof Error
            ? err.message
            : "Failed to load audit logs";
      setError(msg);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void load();
  }, []);

  if (loading) {
    return (
      <div className="space-y-4">
        <LoadingState message="Requesting audit stream…" />
        <TableSkeletonRows />
      </div>
    );
  }

  if (forbidden) {
    return (
      <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-8 text-center shadow-inner">
        <p className="text-sm font-semibold text-slate-200">
          Restricted visibility
        </p>
        <p className="mx-auto mt-3 max-w-md text-sm text-slate-400">
          Audit logs are restricted to admin users.
        </p>
        <p className="mx-auto mt-4 max-w-lg text-xs text-slate-500">
          Developers and viewers still consume recent signals through the main
          dashboard summary, while the exhaustive feed stays gated for
          least-privilege review workflows.
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <ErrorState message={error} onRetry={() => void load()} />
    );
  }

  const latestLog = logs && logs.length > 0 ? logs[0] : null;

  return (
    <div className="space-y-6">
      {/* Summary header */}
      <div>
        <h2 className="text-sm font-semibold text-slate-200">
          Recent Security Activity
        </h2>
        <p className="mt-1 text-sm text-slate-400">
          Latest security and operational events across the platform.
        </p>
      </div>

      {/* Summary cards */}
      {logs ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-5 shadow-sm">
            <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
              Total Events
            </p>
            <p className="mt-2 text-3xl font-semibold tabular-nums text-slate-50">
              {logs.length}
            </p>
          </div>
          <div className="rounded-xl border border-cyan-500/25 bg-slate-900/60 p-5 shadow-sm">
            <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
              Latest Event
            </p>
            {latestLog ? (
              <>
                <p className="mt-2 truncate font-mono text-sm font-medium text-slate-100">
                  {latestLog.action}
                </p>
                <p className="mt-1 truncate text-xs text-slate-400">
                  {actionLabel(latestLog.action)}
                </p>
              </>
            ) : (
              <p className="mt-2 text-sm text-slate-500">—</p>
            )}
          </div>
          <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-5 shadow-sm">
            <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
              Last Activity
            </p>
            <p className="mt-2 text-2xl font-semibold text-slate-50">
              {latestLog ? timeAgo(latestLog.created_at) : "—"}
            </p>
          </div>
        </div>
      ) : null}

      <p className="max-w-3xl text-sm text-slate-400">
        Chronological record of authentication and registry activity.
      </p>
      {logs ? <AuditLogsTable logs={logs} /> : null}
    </div>
  );
}
