/** Presentation-layer formatters. Keep every number rendering in one place. */

const compact = new Intl.NumberFormat("en-US", { notation: "compact", maximumFractionDigits: 1 });
const standard = new Intl.NumberFormat("en-US", { maximumFractionDigits: 2 });
const integer = new Intl.NumberFormat("en-US", { maximumFractionDigits: 0 });

export function formatNumber(value: number | null | undefined, opts?: { compact?: boolean }): string {
  if (value === null || value === undefined || !Number.isFinite(value)) return "—";
  if (opts?.compact && Math.abs(value) >= 10_000) return compact.format(value);
  return Number.isInteger(value) ? integer.format(value) : standard.format(value);
}

export function formatCurrency(value: number | null | undefined, currency = "USD"): string {
  if (value === null || value === undefined || !Number.isFinite(value)) return "—";
  const abs = Math.abs(value);
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    notation: abs >= 1_000_000 ? "compact" : "standard",
    maximumFractionDigits: abs >= 1_000_000 ? 2 : 0,
  }).format(value);
}

export function formatPercent(value: number | null | undefined, decimals = 1): string {
  if (value === null || value === undefined || !Number.isFinite(value)) return "—";
  return `${value.toFixed(decimals)}%`;
}

export function formatDelta(value: number, decimals = 1): string {
  const sign = value > 0 ? "+" : "";
  return `${sign}${value.toFixed(decimals)}%`;
}

export function formatBytes(bytes: number): string {
  if (!Number.isFinite(bytes) || bytes <= 0) return "0 B";
  const units = ["B", "KB", "MB", "GB"];
  const i = Math.min(Math.floor(Math.log(bytes) / Math.log(1024)), units.length - 1);
  const value = bytes / 1024 ** i;
  return `${value.toFixed(value >= 100 || i === 0 ? 0 : 1)} ${units[i]}`;
}

export function formatDate(value: string | number | Date, withTime = false): string {
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return String(value);
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    ...(withTime ? { hour: "2-digit", minute: "2-digit" } : {}),
  });
}

export function formatRelativeTime(timestamp: number): string {
  const diff = Date.now() - timestamp;
  const minutes = Math.floor(diff / 60000);
  if (minutes < 1) return "just now";
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}

/** Renders a raw cell value for tables/tooltips without leaking `null`. */
export function formatCell(value: unknown): string {
  if (value === null || value === undefined || value === "") return "—";
  if (typeof value === "number") return formatNumber(value);
  if (typeof value === "boolean") return value ? "true" : "false";
  return String(value);
}

export function greetingForNow(date = new Date()): string {
  const hour = date.getHours();
  if (hour < 12) return "Good morning";
  if (hour < 18) return "Good afternoon";
  return "Good evening";
}
