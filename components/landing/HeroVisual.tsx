"use client";

import { motion } from "framer-motion";
import { Activity, ArrowUpRight, BrainCircuit, ShieldCheck } from "lucide-react";

import { cn } from "@/lib/utils";

/* Deterministic series so server and client render identically. */
const SERIES = [
  18, 24, 21, 30, 27, 36, 33, 44, 39, 52, 47, 61, 56, 70, 66, 79, 74, 88, 83, 96,
];
const BARS = [38, 62, 45, 78, 55, 88, 68, 94, 72, 58, 84, 66];

const WIDTH = 520;
const HEIGHT = 220;

function buildPath(values: number[], close: boolean): string {
  const max = Math.max(...values);
  const min = Math.min(...values);
  const range = max - min || 1;
  const points = values.map((value, index) => {
    const x = (index / (values.length - 1)) * WIDTH;
    const y = HEIGHT - ((value - min) / range) * (HEIGHT - 30) - 12;
    return [x, y] as const;
  });

  const line = points
    .map(([x, y], index) => `${index === 0 ? "M" : "L"}${x.toFixed(1)},${y.toFixed(1)}`)
    .join(" ");

  return close ? `${line} L${WIDTH},${HEIGHT} L0,${HEIGHT} Z` : line;
}

interface FloatingCardProps {
  className?: string;
  delay?: number;
  icon: React.ReactNode;
  label: string;
  value: string;
  change?: string;
  tone?: "cyan" | "violet" | "pink";
}

function FloatingKpi({ className, delay = 0, icon, label, value, change, tone = "cyan" }: FloatingCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16, scale: 0.94 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.7, delay, ease: [0.22, 1, 0.36, 1] }}
      className={cn("absolute z-20", className)}
    >
      <motion.div
        animate={{ y: [0, -9, 0] }}
        transition={{ duration: 7, repeat: Infinity, ease: "easeInOut", delay }}
        className="glass-strong flex items-center gap-3 rounded-2xl px-3.5 py-3 shadow-soft"
      >
        <span
          className={cn(
            "flex h-9 w-9 items-center justify-center rounded-xl border",
            tone === "cyan" && "border-brand-cyan/25 bg-brand-cyan/10 text-brand-cyan",
            tone === "violet" && "border-brand-violet/25 bg-brand-violet/10 text-brand-purple",
            tone === "pink" && "border-brand-pink/25 bg-brand-pink/10 text-brand-pink",
          )}
        >
          {icon}
        </span>
        <div className="leading-tight">
          <p className="text-[10px] uppercase tracking-[0.16em] text-ink-faint">{label}</p>
          <p className="mt-0.5 text-[15px] font-semibold tracking-[-0.01em] text-ink">{value}</p>
        </div>
        {change ? (
          <span className="ml-1 inline-flex items-center gap-0.5 rounded-full border border-success/20 bg-success/10 px-1.5 py-0.5 text-[10px] font-medium text-success">
            <ArrowUpRight className="h-2.5 w-2.5" />
            {change}
          </span>
        ) : null}
      </motion.div>
    </motion.div>
  );
}

/** The animated analytics console shown beside the hero copy. */
export function HeroVisual() {
  return (
    <div className="relative mx-auto w-full max-w-[600px]">
      {/* Ambient glow */}
      <div
        className="pointer-events-none absolute -inset-12 -z-10 opacity-70 blur-3xl"
        style={{
          background:
            "radial-gradient(24rem 18rem at 30% 20%, rgba(34,211,238,0.22), transparent 70%), radial-gradient(22rem 18rem at 75% 70%, rgba(139,92,246,0.28), transparent 70%)",
        }}
      />

      <motion.div
        initial={{ opacity: 0, y: 28, rotateX: 8 }}
        animate={{ opacity: 1, y: 0, rotateX: 0 }}
        transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
        className="glass-strong noise relative overflow-hidden rounded-3xl p-5 sm:p-6"
      >
        <div className="pointer-events-none absolute inset-x-16 top-0 h-px bg-gradient-to-r from-transparent via-brand-cyan/70 to-transparent" />

        {/* Console header */}
        <div className="mb-5 flex items-center justify-between">
          <div>
            <p className="text-[10px] uppercase tracking-[0.2em] text-ink-faint">Live workspace</p>
            <p className="mt-1 text-[15px] font-semibold tracking-[-0.01em] text-ink">
              Revenue Intelligence
            </p>
          </div>
          <span className="inline-flex items-center gap-1.5 rounded-full border border-success/25 bg-success/10 px-2.5 py-1 text-[11px] text-success">
            <span className="relative flex h-1.5 w-1.5">
              <span className="absolute inline-flex h-full w-full animate-pulse-ring rounded-full bg-success opacity-70" />
              <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-success" />
            </span>
            AI Engine Online
          </span>
        </div>

        {/* Area chart */}
        <div className="relative">
          <svg
            viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
            className="h-[190px] w-full sm:h-[220px]"
            preserveAspectRatio="none"
            aria-hidden
          >
            <defs>
              <linearGradient id="hero-line" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor="#22D3EE" />
                <stop offset="55%" stopColor="#8B5CF6" />
                <stop offset="100%" stopColor="#F472B6" />
              </linearGradient>
              <linearGradient id="hero-area" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#8B5CF6" stopOpacity="0.45" />
                <stop offset="60%" stopColor="#22D3EE" stopOpacity="0.12" />
                <stop offset="100%" stopColor="#22D3EE" stopOpacity="0" />
              </linearGradient>
            </defs>

            {[0, 1, 2, 3].map((line) => (
              <line
                key={line}
                x1="0"
                x2={WIDTH}
                y1={(HEIGHT / 4) * line + 10}
                y2={(HEIGHT / 4) * line + 10}
                stroke="rgba(255,255,255,0.05)"
                strokeDasharray="4 8"
              />
            ))}

            <motion.path
              d={buildPath(SERIES, true)}
              fill="url(#hero-area)"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 1.2, delay: 0.5 }}
            />
            <motion.path
              d={buildPath(SERIES, false)}
              fill="none"
              stroke="url(#hero-line)"
              strokeWidth="2.4"
              strokeLinecap="round"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 1.8, ease: [0.22, 1, 0.36, 1], delay: 0.25 }}
              vectorEffect="non-scaling-stroke"
            />
          </svg>

          {/* Scanning beam */}
          <motion.div
            className="pointer-events-none absolute inset-y-0 w-px bg-gradient-to-b from-transparent via-brand-cyan/70 to-transparent"
            animate={{ left: ["2%", "98%", "2%"] }}
            transition={{ duration: 9, repeat: Infinity, ease: "easeInOut" }}
          />
        </div>

        {/* Bars */}
        <div className="mt-5 flex h-16 items-end gap-1.5">
          {BARS.map((height, index) => (
            <motion.div
              key={index}
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: `${height}%`, opacity: 1 }}
              transition={{ duration: 0.7, delay: 0.6 + index * 0.045, ease: [0.22, 1, 0.36, 1] }}
              className="flex-1 rounded-t-[3px] bg-[linear-gradient(180deg,rgba(139,92,246,0.85),rgba(34,211,238,0.28))]"
            />
          ))}
        </div>

        {/* Footer stats */}
        <div className="mt-5 grid grid-cols-3 gap-3 border-t border-white/[0.06] pt-4">
          {[
            { label: "Rows analysed", value: "486,204" },
            { label: "Models run", value: "12" },
            { label: "Confidence", value: "94.8%" },
          ].map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 1 + index * 0.1 }}
            >
              <p className="text-[10px] uppercase tracking-[0.14em] text-ink-faint">{stat.label}</p>
              <p className="mt-1 text-[15px] font-semibold tabular-nums text-ink">{stat.value}</p>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Floating KPI cards */}
      <FloatingKpi
        className="-left-4 top-16 hidden sm:block lg:-left-14"
        delay={0.9}
        icon={<Activity className="h-4 w-4" />}
        label="Revenue"
        value="$248,420"
        change="18.7%"
        tone="cyan"
      />
      <FloatingKpi
        className="-left-8 bottom-28 hidden sm:block lg:-left-16"
        delay={1.15}
        icon={<BrainCircuit className="h-4 w-4" />}
        label="AI insights"
        value="7 signals"
        tone="violet"
      />
      <FloatingKpi
        className="-bottom-7 right-2 hidden sm:block lg:-right-10"
        delay={1.35}
        icon={<ShieldCheck className="h-4 w-4" />}
        label="Data quality"
        value="94.8%"
        tone="pink"
      />
    </div>
  );
}
