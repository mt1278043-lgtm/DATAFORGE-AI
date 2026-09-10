"use client";

import { useId } from "react";

import { cn } from "@/lib/utils";

interface SparklineProps {
  data: number[];
  className?: string;
  tone?: "cyan" | "violet" | "pink" | "success" | "danger";
  height?: number;
}

const TONES = {
  cyan: ["#22D3EE", "#38BDF8"],
  violet: ["#8B5CF6", "#A855F7"],
  pink: ["#F472B6", "#C084FC"],
  success: ["#34D399", "#22D3EE"],
  danger: ["#FB7185", "#F472B6"],
};

/**
 * Lightweight inline sparkline drawn with a single SVG path -
 * far cheaper than mounting a full chart inside every KPI card.
 */
export function Sparkline({ data, className, tone = "cyan", height = 40 }: SparklineProps) {
  const id = useId().replace(/:/g, "");
  const points = data.filter((value) => Number.isFinite(value));

  if (points.length < 2) {
    return <div className={cn("w-full", className)} style={{ height }} />;
  }

  const width = 100;
  const min = Math.min(...points);
  const max = Math.max(...points);
  const range = max - min || 1;

  const coords = points.map((value, index) => {
    const x = (index / (points.length - 1)) * width;
    const y = height - ((value - min) / range) * (height - 6) - 3;
    return [x, y] as const;
  });

  const line = coords
    .map(([x, y], index) => `${index === 0 ? "M" : "L"}${x.toFixed(2)},${y.toFixed(2)}`)
    .join(" ");
  const area = `${line} L${width},${height} L0,${height} Z`;
  const [from, to] = TONES[tone];

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      preserveAspectRatio="none"
      className={cn("w-full", className)}
      style={{ height }}
      aria-hidden
    >
      <defs>
        <linearGradient id={`spark-line-${id}`} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor={from} />
          <stop offset="100%" stopColor={to} />
        </linearGradient>
        <linearGradient id={`spark-area-${id}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={from} stopOpacity="0.28" />
          <stop offset="100%" stopColor={from} stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={area} fill={`url(#spark-area-${id})`} />
      <path
        d={line}
        fill="none"
        stroke={`url(#spark-line-${id})`}
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
        vectorEffect="non-scaling-stroke"
      />
    </svg>
  );
}
