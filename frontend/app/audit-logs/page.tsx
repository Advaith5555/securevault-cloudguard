"use client";

import { useEffect, useState } from "react";
import { AuditLogsTable } from "@/components/audit/AuditLogsTable";
import { ErrorState } from "@/components/ui/ErrorState";
import { LoadingState, TableSkeletonRows } from "@/components/ui/LoadingState";
import { ApiError, getAuditLogs } from "@/lib/api";
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

  return (
    <div className="space-y-6">
      <p className="max-w-3xl text-sm text-slate-400">
        Immutable-style trail sourced from Postgres through the audit API.
        Filter locally for demos; authoritative retention policies live on the
        server.
      </p>
      {logs ? <AuditLogsTable logs={logs} /> : null}
    </div>
  );
}
