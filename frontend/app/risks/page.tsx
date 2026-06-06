"use client";

import { useEffect, useState } from "react";
import { RisksTable } from "@/components/risks/RisksTable";
import { ErrorState } from "@/components/ui/ErrorState";
import { LoadingState, TableSkeletonRows } from "@/components/ui/LoadingState";
import { ApiError, getRisks, runRiskScan } from "@/lib/api";
import type { RiskFinding } from "@/lib/types";

export default function RisksPage() {
  const [risks, setRisks] = useState<RiskFinding[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [scanning, setScanning] = useState(false);
  const [scanStatus, setScanStatus] = useState<"success" | "error" | null>(
    null
  );

  async function load() {
    setLoading(true);
    setError(null);
    try {
      const rows = await getRisks();
      setRisks(rows);
    } catch (err) {
      const msg =
        err instanceof ApiError
          ? err.message
          : err instanceof Error
            ? err.message
            : "Failed to load risks";
      setError(msg);
    } finally {
      setLoading(false);
    }
  }

  async function handleScan() {
    setScanning(true);
    setScanStatus(null);
    try {
      const result = await runRiskScan();
      setRisks(result.findings);
      setScanStatus("success");
    } catch {
      setScanStatus("error");
    } finally {
      setScanning(false);
    }
  }

  useEffect(() => {
    void load();
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="max-w-3xl text-sm text-slate-400">
          Findings are produced from metadata-only rules. Tune ownership,
          environments, and expiry in the registry to reduce noise over time.
        </p>
        <div className="flex flex-shrink-0 items-center gap-3">
          {scanStatus === "success" ? (
            <span className="text-sm text-emerald-400">
              Risk scan completed successfully.
            </span>
          ) : scanStatus === "error" ? (
            <span className="text-sm text-rose-400">Risk scan failed.</span>
          ) : null}
          <button
            onClick={() => void handleScan()}
            disabled={scanning || loading}
            className="inline-flex items-center gap-2 rounded-lg bg-cyan-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-cyan-500 disabled:cursor-not-allowed disabled:bg-slate-700 disabled:text-slate-400"
          >
            {scanning ? (
              <>
                <span className="inline-block h-3.5 w-3.5 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                Scanning…
              </>
            ) : (
              "Run Risk Scan"
            )}
          </button>
        </div>
      </div>

      {loading ? (
        <>
          <LoadingState message="Loading risk findings…" />
          <TableSkeletonRows />
        </>
      ) : null}
      {error ? (
        <ErrorState message={error} onRetry={() => void load()} />
      ) : null}
      {risks && !loading ? <RisksTable risks={risks} /> : null}
    </div>
  );
}
