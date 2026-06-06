import type { AuditLog } from "@/lib/types";
import { actionLabel, timeAgo } from "@/lib/format";
import { EmptyState } from "@/components/ui/EmptyState";

interface RecentAuditLogsProps {
  logs: AuditLog[];
}

export function RecentAuditLogs({ logs }: RecentAuditLogsProps) {
  const recent = logs.slice(0, 5);

  return (
    <section>
      <div className="mb-3">
        <h2 className="text-sm font-semibold text-slate-200">
          Recent Activity
        </h2>
        <p className="mt-0.5 text-xs text-slate-500">
          Latest events from the backend summary.
        </p>
      </div>

      {recent.length === 0 ? (
        <EmptyState
          title="No recent activity"
          description="Events will appear here after logins, secret operations, and security scans."
        />
      ) : (
        <ul className="space-y-2">
          {recent.map((log) => (
            <li
              key={log.id}
              className="flex items-center justify-between rounded-lg border border-slate-800 bg-slate-900/40 px-4 py-3"
            >
              <span className="flex items-center gap-2 text-sm text-slate-300">
                <span className="text-slate-600" aria-hidden="true">
                  •
                </span>
                {actionLabel(log.action)}
              </span>
              <span className="ml-4 shrink-0 whitespace-nowrap text-xs text-slate-500">
                {timeAgo(log.created_at)}
              </span>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
