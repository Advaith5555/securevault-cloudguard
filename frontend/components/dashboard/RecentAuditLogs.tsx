import type { AuditLog } from "@/lib/types";
import { Badge } from "@/components/ui/Badge";
import { EmptyState } from "@/components/ui/EmptyState";
import { TableShell } from "@/components/ui/TableShell";
import { formatDate, shortId } from "@/lib/format";

interface RecentAuditLogsProps {
  logs: AuditLog[];
}

export function RecentAuditLogs({ logs }: RecentAuditLogsProps) {
  return (
    <section className="mt-10">
      <div className="mb-4">
        <h2 className="text-sm font-semibold text-slate-200">
          Recent audit activity
        </h2>
        <p className="mt-1 text-xs text-slate-500">
          Last five events from the backend summary (newest in API order).
        </p>
      </div>
      {logs.length === 0 ? (
        <EmptyState
          title="No recent audit rows"
          description="The summary API returned an empty recent list—try again after activity is recorded."
        />
      ) : (
        <TableShell>
          <table className="min-w-[640px] w-full text-left text-sm">
          <thead className="border-b border-slate-800 bg-slate-900/80 text-xs uppercase tracking-wide text-slate-500">
            <tr>
              <th className="px-4 py-3 font-medium">Action</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 font-medium">User</th>
              <th className="px-4 py-3 font-medium">Resource</th>
              <th className="px-4 py-3 font-medium">Message</th>
              <th className="px-4 py-3 font-medium">When</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800">
            {logs.map((row) => (
              <tr key={row.id} className="hover:bg-slate-900/50">
                <td className="px-4 py-3 font-mono text-xs text-slate-300">
                  {row.action}
                </td>
                <td className="px-4 py-3">
                  <Badge kind="status" value={row.status} />
                </td>
                <td className="px-4 py-3 text-slate-300">{row.user_email}</td>
                <td className="px-4 py-3 text-slate-400">
                  <span className="block text-xs text-slate-500">
                    {row.resource_type}
                  </span>
                  <span className="font-mono text-xs text-slate-300">
                    {row.resource_id ? shortId(row.resource_id, 10) : "—"}
                  </span>
                </td>
                <td className="max-w-xs truncate px-4 py-3 text-slate-400">
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
    </section>
  );
}
