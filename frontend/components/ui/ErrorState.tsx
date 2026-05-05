interface ErrorStateProps {
  title?: string;
  message: string;
  onRetry?: () => void;
}

export function ErrorState({
  title = "Something went wrong",
  message,
  onRetry,
}: ErrorStateProps) {
  return (
    <div className="rounded-lg border border-rose-500/30 bg-rose-950/30 px-5 py-6">
      <p className="text-sm font-semibold text-rose-200">{title}</p>
      <p className="mt-2 text-sm text-rose-100/80">{message}</p>
      {onRetry ? (
        <button
          type="button"
          onClick={onRetry}
          className="mt-4 rounded-md bg-slate-100 px-3 py-1.5 text-sm font-medium text-slate-900 hover:bg-white"
        >
          Retry
        </button>
      ) : null}
    </div>
  );
}
