"use client";

import { useEffect, useState } from "react";
import { RisksTable } from "@/components/risks/RisksTable";
import { ErrorState } from "@/components/ui/ErrorState";
import { LoadingState, TableSkeletonRows } from "@/components/ui/LoadingState";
import { ApiError, getRisks } from "@/lib/api";
import type { RiskFinding } from "@/lib/types";

export default function RisksPage() {
  const [risks, setRisks] = useState<RiskFinding[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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

  useEffect(() => {
    void load();
  }, []);

  return (
    <div className="space-y-6">
      <p className="max-w-3xl text-sm text-slate-400">
        Findings are produced from metadata-only rules. Tune ownership,
        environments, and expiry in the registry to reduce noise over time.
      </p>
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
