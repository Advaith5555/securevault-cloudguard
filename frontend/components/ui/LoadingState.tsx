interface LoadingStateProps {
  message?: string;
}

export function LoadingState({ message = "Loading…" }: LoadingStateProps) {
  return (
    <div
      className="w-full space-y-3 rounded-lg border border-slate-800 bg-slate-900/50 p-6"
      role="status"
      aria-busy="true"
    >
      <p className="text-sm text-slate-400">{message}</p>
      <div className="space-y-2">
        <div className="h-3 w-2/3 animate-pulse rounded bg-slate-800" />
        <div className="h-3 w-full animate-pulse rounded bg-slate-800/80" />
        <div className="h-3 w-5/6 animate-pulse rounded bg-slate-800/60" />
      </div>
    </div>
  );
}

export function TableSkeletonRows({ rows = 5 }: { rows?: number }) {
  return (
    <div className="space-y-2 p-4" role="status" aria-busy="true">
      {Array.from({ length: rows }).map((_, i) => (
        <div
          key={i}
          className="h-10 animate-pulse rounded bg-slate-800/70"
        />
      ))}
    </div>
  );
}
