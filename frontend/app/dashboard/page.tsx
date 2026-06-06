"use client";

import { useEffect, useState } from "react";
import { EnvironmentDistribution } from "@/components/dashboard/EnvironmentDistribution";
import { LastScan } from "@/components/dashboard/LastScan";
import { RecentAuditLogs } from "@/components/dashboard/RecentAuditLogs";
import { SecurityPosture } from "@/components/dashboard/SecurityPosture";
import { SummaryCards } from "@/components/dashboard/SummaryCards";
import { EmptyState } from "@/components/ui/EmptyState";
import { ErrorState } from "@/components/ui/ErrorState";
import { LoadingState } from "@/components/ui/LoadingState";
import { ApiError, getDashboardSummary } from "@/lib/api";
import { getUser } from "@/lib/auth";
import type { DashboardSummary } from "@/lib/types";

export default function DashboardPage() {
  const user = getUser();
  const [data, setData] = useState<DashboardSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function load() {
    setLoading(true);
    setError(null);
    try {
      const summary = await getDashboardSummary();
      setData(summary);
    } catch (err) {
      const msg =
        err instanceof ApiError
          ? err.message
          : err instanceof Error
            ? err.message
            : "Failed to load summary";
      setError(msg);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void load();
  }, []);

  const isEmpty =
    data !== null &&
    data.total_secrets === 0 &&
    data.recent_audit_logs.length === 0;

  return (
    <div className="space-y-8">
      {user && user.role !== "admin" ? (
        <p className="rounded-lg border border-slate-800 bg-slate-900/40 px-4 py-3 text-sm text-slate-400">
          <span className="font-medium text-slate-300">
            {user.role === "developer" ? "Developer" : "Viewer"} workspace:
          </span>{" "}
          Counts and recent activity come from the same summary endpoint. Full
          audit exports stay on the{" "}
          <span className="text-slate-200">Audit logs</span> page for admins
          only.
        </p>
      ) : null}

      {loading ? <LoadingState message="Loading dashboard summary…" /> : null}
      {error ? (
        <ErrorState message={error} onRetry={() => void load()} />
      ) : null}

      {data && !loading ? (
        isEmpty ? (
          <EmptyState
            title="SecureVault is ready."
            description="Create secret metadata entries or run a security scan to populate your dashboard."
          />
        ) : (
          <>
            <SummaryCards data={data} />

            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              <SecurityPosture
                highRisks={data.high_risks}
                mediumRisks={data.medium_risks}
                lowRisks={data.low_risks}
              />
              <EnvironmentDistribution
                prod={data.prod_secrets}
                staging={data.staging_secrets}
                dev={data.dev_secrets}
              />
              <LastScan logs={data.recent_audit_logs} />
            </div>

            <RecentAuditLogs logs={data.recent_audit_logs} />
          </>
        )
      ) : null}
    </div>
  );
}
