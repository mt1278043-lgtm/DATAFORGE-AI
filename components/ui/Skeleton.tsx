import type { CSSProperties } from "react";

import { cn } from "@/lib/utils";

export function Skeleton({ className, style }: { className?: string; style?: CSSProperties }) {
  return (
    <div
      style={style}
      className={cn(
        "relative overflow-hidden rounded-lg bg-white/[0.05]",
        "after:absolute after:inset-0 after:-translate-x-full after:animate-shimmer",
        "after:bg-gradient-to-r after:from-transparent after:via-white/[0.08] after:to-transparent",
        className,
      )}
    />
  );
}

export function SkeletonCard() {
  return (
    <div className="glass-strong space-y-4 p-6">
      <Skeleton className="h-3 w-24" />
      <Skeleton className="h-8 w-36" />
      <Skeleton className="h-2 w-full" />
      <Skeleton className="h-2 w-2/3" />
    </div>
  );
}

export function SkeletonChart() {
  return (
    <div className="glass-strong space-y-4 p-6">
      <div className="flex items-center justify-between">
        <Skeleton className="h-4 w-40" />
        <Skeleton className="h-8 w-24" />
      </div>
      <div className="flex h-56 items-end gap-2">
        {[45, 70, 35, 85, 55, 92, 40, 66, 78, 50, 88, 62].map((height, index) => (
          <Skeleton key={index} className="flex-1" style={{ height: `${height}%` }} />
        ))}
      </div>
    </div>
  );
}

export function SkeletonTable({ rows = 6 }: { rows?: number }) {
  return (
    <div className="space-y-2">
      {Array.from({ length: rows }).map((_, index) => (
        <Skeleton key={index} className="h-11 w-full" />
      ))}
    </div>
  );
}
