interface SecurityPostureProps {
  highRisks: number;
  mediumRisks: number;
  lowRisks: number;
}

const LEVELS = [
  { label: "High", emoji: "🔴", cls: "text-rose-300" },
  { label: "Medium", emoji: "🟡", cls: "text-amber-200" },
  { label: "Low", emoji: "🟢", cls: "text-emerald-300" },
] as const;

export function SecurityPosture({
  highRisks,
  mediumRisks,
  lowRisks,
}: SecurityPostureProps) {
  const counts = { High: highRisks, Medium: mediumRisks, Low: lowRisks };
  const total = highRisks + mediumRisks + lowRisks;

  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-5 shadow-sm">
      <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
        Security Posture
      </p>
      {total === 0 ? (
        <p className="mt-4 text-sm text-emerald-300">
          ✓ No findings — posture is clean.
        </p>
      ) : (
        <ul className="mt-4 space-y-3">
          {LEVELS.map(({ label, emoji, cls }) => (
            <li key={label} className="flex items-center justify-between">
              <span className="flex items-center gap-2 text-sm text-slate-300">
                <span aria-hidden="true">{emoji}</span>
                {label}
              </span>
              <span className={`text-sm font-semibold tabular-nums ${cls}`}>
                {counts[label]}
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
