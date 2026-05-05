type Severity = "neutral" | "info" | "warn" | "danger";

const severityRing: Record<Severity, string> = {
  neutral: "border-slate-800",
  info: "border-cyan-500/25",
  warn: "border-amber-500/25",
  danger: "border-rose-500/30",
};

interface StatCardProps {
  title: string;
  value: string | number;
  description?: string;
  severity?: Severity;
}

export function StatCard({
  title,
  value,
  description,
  severity = "neutral",
}: StatCardProps) {
  return (
    <div
      className={`rounded-xl border bg-slate-900/60 p-5 shadow-sm ${severityRing[severity]}`}
    >
      <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
        {title}
      </p>
      <p className="mt-2 text-3xl font-semibold tabular-nums text-slate-50">
        {value}
      </p>
      {description ? (
        <p className="mt-2 text-xs text-slate-400">{description}</p>
      ) : null}
    </div>
  );
}
