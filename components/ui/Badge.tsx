import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

export type BadgeTone = "neutral" | "cyan" | "violet" | "pink" | "success" | "warning" | "danger";

const TONES: Record<BadgeTone, string> = {
  neutral: "border-white/10 bg-white/[0.05] text-ink-muted",
  cyan: "border-brand-cyan/25 bg-brand-cyan/10 text-brand-cyan",
  violet: "border-brand-violet/30 bg-brand-violet/10 text-brand-purple",
  pink: "border-brand-pink/30 bg-brand-pink/10 text-brand-pink",
  success: "border-success/25 bg-success/10 text-success",
  warning: "border-warning/25 bg-warning/10 text-warning",
  danger: "border-danger/25 bg-danger/10 text-danger",
};

interface BadgeProps {
  tone?: BadgeTone;
  children: ReactNode;
  className?: string;
  dot?: boolean;
  pulse?: boolean;
}

export function Badge({ tone = "neutral", children, className, dot, pulse }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-medium tracking-[0.01em] backdrop-blur",
        TONES[tone],
        className,
      )}
    >
      {dot ? (
        <span className="relative flex h-1.5 w-1.5">
          {pulse ? (
            <span className="absolute inline-flex h-full w-full animate-pulse-ring rounded-full bg-current opacity-70" />
          ) : null}
          <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-current" />
        </span>
      ) : null}
      {children}
    </span>
  );
}
