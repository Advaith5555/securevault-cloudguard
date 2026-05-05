interface SecurityPostureProps {
  highRisks: number;
}

export function SecurityPosture({ highRisks }: SecurityPostureProps) {
  const unstable = highRisks > 0;

  return (
    <section
      className={`mt-10 rounded-xl border px-5 py-4 ${
        unstable
          ? "border-amber-500/35 bg-amber-950/25"
          : "border-emerald-500/30 bg-emerald-950/20"
      }`}
    >
      <h2 className="text-sm font-semibold text-slate-100">
        Security posture snapshot
      </h2>
      <p className="mt-2 text-sm leading-relaxed text-slate-300">
        {unstable ? (
          <>
            <span className="font-medium text-amber-200">
              Attention required:
            </span>{" "}
            The backend reports{" "}
            <span className="font-semibold tabular-nums text-amber-100">
              {highRisks}
            </span>{" "}
            high-severity risk finding
            {highRisks === 1 ? "" : "s"}. Pair registry cleanup with ownership
            and expiry reviews.
          </>
        ) : (
          <>
            <span className="font-medium text-emerald-200">Stable baseline:</span>{" "}
            No high-severity findings are reported right now. Continue periodic
            scans and audit reviews to keep posture honest.
          </>
        )}
      </p>
    </section>
  );
}
