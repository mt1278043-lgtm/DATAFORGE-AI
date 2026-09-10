import { cn } from "@/lib/utils";

export function Spinner({ className }: { className?: string }) {
  return (
    <span
      className={cn(
        "inline-block h-4 w-4 animate-spin rounded-full border-2 border-white/15 border-t-brand-cyan",
        className,
      )}
      role="status"
      aria-label="Loading"
    />
  );
}
