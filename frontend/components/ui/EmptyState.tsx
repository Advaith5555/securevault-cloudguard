interface EmptyStateProps {
  title: string;
  description?: string;
}

export function EmptyState({ title, description }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-slate-700 bg-slate-900/40 px-8 py-16 text-center">
      <div className="mb-3 h-12 w-12 rounded-lg border border-slate-700 bg-slate-800/60" />
      <p className="text-sm font-medium text-slate-200">{title}</p>
      {description ? (
        <p className="mt-2 max-w-md text-sm text-slate-400">{description}</p>
      ) : null}
    </div>
  );
}
