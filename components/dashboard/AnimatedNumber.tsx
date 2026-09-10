"use client";

import { useCountUp } from "@/hooks/useCountUp";

interface AnimatedNumberProps {
  value: number;
  /** Formats the interpolated value on every frame. */
  format: (value: number) => string;
  duration?: number;
  delay?: number;
  className?: string;
}

/** Counts a KPI up from zero when the dashboard mounts. */
export function AnimatedNumber({
  value,
  format,
  duration = 1500,
  delay = 0,
  className,
}: AnimatedNumberProps) {
  const animated = useCountUp(value, { duration, delay });
  return (
    <span className={className} suppressHydrationWarning>
      {format(animated)}
    </span>
  );
}
