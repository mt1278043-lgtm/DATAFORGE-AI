"use client";

import { motion } from "framer-motion";

import { cn } from "@/lib/utils";

interface ProgressProps {
  value: number;
  className?: string;
  tone?: "brand" | "success" | "warning" | "danger";
  showLabel?: boolean;
  height?: "sm" | "md";
}

const TONES = {
  brand: "bg-[linear-gradient(90deg,#22D3EE,#8B5CF6,#F472B6)]",
  success: "bg-[linear-gradient(90deg,#34D399,#22D3EE)]",
  warning: "bg-[linear-gradient(90deg,#FBBF24,#F472B6)]",
  danger: "bg-[linear-gradient(90deg,#FB7185,#F472B6)]",
};

export function Progress({
  value,
  className,
  tone = "brand",
  showLabel,
  height = "md",
}: ProgressProps) {
  const clamped = Math.max(0, Math.min(100, value));

  return (
    <div className={cn("w-full", className)}>
      <div
        className={cn(
          "relative w-full overflow-hidden rounded-full bg-white/[0.06]",
          height === "sm" ? "h-1.5" : "h-2.5",
        )}
        role="progressbar"
        aria-valuenow={Math.round(clamped)}
        aria-valuemin={0}
        aria-valuemax={100}
      >
        <motion.div
          className={cn("h-full rounded-full", TONES[tone])}
          initial={{ width: 0 }}
          animate={{ width: `${clamped}%` }}
          transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
        />
      </div>
      {showLabel ? (
        <div className="mt-1.5 flex justify-between text-[11px] text-ink-faint">
          <span>0%</span>
          <span className="text-ink-muted">{clamped.toFixed(1)}%</span>
          <span>100%</span>
        </div>
      ) : null}
    </div>
  );
}

interface RingProps {
  value: number;
  size?: number;
  stroke?: number;
  label?: string;
  sublabel?: string;
}

/** Circular score indicator used on the Data Quality page. */
export function ProgressRing({ value, size = 176, stroke = 12, label, sublabel }: RingProps) {
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const clamped = Math.max(0, Math.min(100, value));
  const offset = circumference - (clamped / 100) * circumference;

  return (
    <div className="relative inline-flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <defs>
          <linearGradient id="ring-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#22D3EE" />
            <stop offset="55%" stopColor="#8B5CF6" />
            <stop offset="100%" stopColor="#F472B6" />
          </linearGradient>
        </defs>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="rgba(255,255,255,0.07)"
          strokeWidth={stroke}
        />
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="url(#ring-gradient)"
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 1.4, ease: [0.22, 1, 0.36, 1] }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-3xl font-semibold tracking-[-0.02em] text-ink">{label}</span>
        {sublabel ? (
          <span className="mt-1 text-[11px] uppercase tracking-[0.18em] text-ink-faint">{sublabel}</span>
        ) : null}
      </div>
    </div>
  );
}
