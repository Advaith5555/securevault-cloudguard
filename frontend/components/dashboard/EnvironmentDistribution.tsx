interface EnvironmentDistributionProps {
  prod: number;
  staging: number;
  dev: number;
}

const ROWS = [
  { label: "Production", key: "prod" as const, labelCls: "text-rose-300" },
  { label: "Staging", key: "staging" as const, labelCls: "text-violet-300" },
  { label: "Development", key: "dev" as const, labelCls: "text-cyan-300" },
];

export function EnvironmentDistribution({
  prod,
  staging,
  dev,
}: EnvironmentDistributionProps) {
  const counts = { prod, staging, dev };

  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-5 shadow-sm">
      <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
        Environment Distribution
      </p>
      <ul className="mt-4 space-y-3">
        {ROWS.map(({ label, key, labelCls }) => (
          <li key={key} className="flex items-center justify-between">
            <span className={`text-sm ${labelCls}`}>{label}</span>
            <span className="text-sm font-semibold tabular-nums text-slate-200">
              {counts[key]}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
