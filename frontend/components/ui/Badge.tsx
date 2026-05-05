import type { Role } from "@/lib/types";

type BadgeKind = "role" | "risk" | "environment" | "status";

interface BadgeProps {
  kind: BadgeKind;
  value: string;
  className?: string;
}

const roleTone: Record<Role | string, string> = {
  admin:
    "bg-violet-500/15 text-violet-300 ring-1 ring-inset ring-violet-500/35",
  developer: "bg-sky-500/15 text-sky-300 ring-1 ring-inset ring-sky-500/35",
  viewer: "bg-slate-500/15 text-slate-300 ring-1 ring-inset ring-slate-500/40",
};

const riskTone: Record<string, string> = {
  high: "bg-rose-500/15 text-rose-300 ring-1 ring-inset ring-rose-500/40",
  medium:
    "bg-amber-500/15 text-amber-200 ring-1 ring-inset ring-amber-500/35",
  low: "bg-emerald-500/15 text-emerald-300 ring-1 ring-inset ring-emerald-500/35",
};

const envTone: Record<string, string> = {
  dev: "bg-cyan-500/15 text-cyan-200 ring-1 ring-inset ring-cyan-500/35",
  staging:
    "bg-violet-500/15 text-violet-200 ring-1 ring-inset ring-violet-500/35",
  prod: "bg-rose-500/15 text-rose-200 ring-1 ring-inset ring-rose-500/35",
};

const statusTone: Record<string, string> = {
  success:
    "bg-emerald-500/15 text-emerald-300 ring-1 ring-inset ring-emerald-500/35",
  denied: "bg-amber-500/15 text-amber-200 ring-1 ring-inset ring-amber-500/35",
  failed: "bg-rose-500/15 text-rose-300 ring-1 ring-inset ring-rose-500/40",
};

function toneFor(kind: BadgeKind, value: string): string {
  const v = value.toLowerCase();
  switch (kind) {
    case "role":
      return roleTone[v] ?? roleTone.viewer;
    case "risk":
      return riskTone[v] ?? "bg-slate-500/15 text-slate-300 ring-1 ring-slate-500/30";
    case "environment":
      return envTone[v] ?? "bg-slate-500/15 text-slate-300 ring-1 ring-slate-500/30";
    case "status":
      return statusTone[v] ?? "bg-slate-500/15 text-slate-300 ring-1 ring-slate-500/30";
    default:
      return "bg-slate-500/15 text-slate-300";
  }
}

export function Badge({ kind, value, className = "" }: BadgeProps) {
  const label = value;
  return (
    <span
      className={`inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium capitalize ${toneFor(kind, value)} ${className}`}
    >
      {label}
    </span>
  );
}
