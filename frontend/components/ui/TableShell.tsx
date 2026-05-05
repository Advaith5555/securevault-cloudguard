import type { ReactNode } from "react";

interface TableShellProps {
  children: ReactNode;
  className?: string;
}

export function TableShell({ children, className = "" }: TableShellProps) {
  return (
    <div
      className={`overflow-x-auto rounded-xl border border-slate-800 bg-slate-900/40 ${className}`}
    >
      {children}
    </div>
  );
}
