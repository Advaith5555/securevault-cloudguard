export function formatDate(value: string | null | undefined): string {
  if (value == null || value === "") return "—";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return value;
  return d.toLocaleString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function shortId(value: string | null | undefined, keep = 8): string {
  if (value == null || value === "") return "—";
  if (value.length <= keep + 4) return value;
  return `${value.slice(0, keep)}…`;
}

export function titleCase(value: string): string {
  if (!value) return "";
  return value
    .split(/[\s_-]+/)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
    .join(" ");
}

export function timeAgo(value: string | null | undefined): string {
  if (value == null || value === "") return "—";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "—";
  const seconds = Math.floor((Date.now() - d.getTime()) / 1000);
  if (seconds < 60) return "Just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes} minute${minutes === 1 ? "" : "s"} ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} hour${hours === 1 ? "" : "s"} ago`;
  const days = Math.floor(hours / 24);
  return `${days} day${days === 1 ? "" : "s"} ago`;
}

const ACTION_LABELS: Record<string, string> = {
  login: "Login",
  secret_created: "Secret metadata created",
  secret_updated: "Secret metadata updated",
  secret_deleted: "Secret metadata deleted",
  secret_accessed: "Secret access requested",
  risk_scan_completed: "Risk scan completed",
  risk_scan_executed: "Risk scan executed",
};

export function actionLabel(action: string): string {
  return ACTION_LABELS[action] ?? titleCase(action);
}
