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
