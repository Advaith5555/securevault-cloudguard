"use client";

import { useEffect, useState } from "react";
import { SecretsTable } from "@/components/secrets/SecretsTable";
import { ErrorState } from "@/components/ui/ErrorState";
import { LoadingState, TableSkeletonRows } from "@/components/ui/LoadingState";
import { ApiError, getSecrets } from "@/lib/api";
import type { Secret } from "@/lib/types";

export default function SecretsPage() {
  const [secrets, setSecrets] = useState<Secret[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function load() {
    setLoading(true);
    setError(null);
    try {
      const rows = await getSecrets();
      setSecrets(rows);
    } catch (err) {
      const msg =
        err instanceof ApiError
          ? err.message
          : err instanceof Error
            ? err.message
            : "Failed to load secrets";
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
        Central registry of managed secret metadata and ownership.
      </p>
      {loading ? (
        <>
          <LoadingState message="Fetching secret metadata…" />
          <TableSkeletonRows />
        </>
      ) : null}
      {error ? (
        <ErrorState message={error} onRetry={() => void load()} />
      ) : null}
      {secrets && !loading ? <SecretsTable secrets={secrets} /> : null}
    </div>
  );
}
