import type { AuditLog } from "@/lib/types";
import { timeAgo } from "@/lib/format";

interface LastScanProps {
  logs: AuditLog[];
}

const SCAN_ACTIONS = new Set(["risk_scan_completed", "risk_scan_executed"]);

export function LastScan({ logs }: LastScanProps) {
  const lastScan = logs.find((l) => SCAN_ACTIONS.has(l.action));

  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-5 shadow-sm">
      <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
        Last Security Scan
      </p>
      {lastScan ? (
        <>
          <p className="mt-4 text-2xl font-semibold text-slate-50">
            {timeAgo(lastScan.created_at)}
          </p>
          <p className="mt-1 font-mono text-xs text-slate-500">
            {lastScan.action}
          </p>
        </>
      ) : (
        <p className="mt-4 text-sm text-slate-500">No scans recorded</p>
      )}
    </div>
  );
}
