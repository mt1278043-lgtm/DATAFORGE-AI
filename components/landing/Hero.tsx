"use client";

import { motion } from "framer-motion";
import { ArrowRight, PlayCircle, Sparkles } from "lucide-react";

import { HeroVisual } from "@/components/landing/HeroVisual";
import { Button } from "@/components/ui/Button";
import { APP_DESCRIPTION } from "@/lib/constants";

const TRUST_STATS = [
  { value: "50K+", label: "Rows profiled per second" },
  { value: "12", label: "Built-in analysis engines" },
  { value: "94.8%", label: "Average quality score" },
  { value: "0", label: "Setup steps to start" },
];

export function Hero() {
  return (
    <section id="product" className="relative overflow-hidden pb-20 pt-32 sm:pt-40 lg:pb-28">
      <div className="pointer-events-none absolute inset-0 -z-10 grid-bg" aria-hidden />

      <div className="mx-auto grid max-w-[1360px] items-center gap-14 px-5 lg:grid-cols-[1.05fr_1fr] lg:gap-10 lg:px-8">
        {/* Copy ------------------------------------------------------------ */}
        <div>
          <motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            className="inline-flex items-center gap-2 rounded-full border border-white/[0.09] bg-white/[0.03] py-1.5 pl-1.5 pr-3.5 backdrop-blur"
          >
            <span className="inline-flex items-center gap-1.5 rounded-full bg-[linear-gradient(110deg,#22D3EE,#8B5CF6)] px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-white">
              <Sparkles className="h-3 w-3" />
              New
            </span>
            <span className="text-[12.5px] text-ink-muted">
              Automated insight engine now ships with forecasting
            </span>
          </motion.div>

          <motion.p
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.08 }}
            className="eyebrow mt-8"
          >
            AI-Powered Data Intelligence
          </motion.p>

          <motion.h1
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.14, ease: [0.22, 1, 0.36, 1] }}
            className="mt-4 text-balance font-display text-[42px] font-semibold leading-[1.05] tracking-[-0.04em] sm:text-[56px] lg:text-[64px]"
          >
            <span className="text-gradient">Turn Raw Data Into</span>
            <br />
            <span className="text-gradient-brand">Intelligent Decisions.</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.24 }}
            className="mt-6 max-w-xl text-[16px] leading-relaxed text-ink-muted sm:text-[17px]"
          >
            {APP_DESCRIPTION}
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.32 }}
            className="mt-9 flex flex-col gap-3 sm:flex-row sm:items-center"
          >
            <Button size="lg" href="/dashboard/datasets" iconRight={<ArrowRight className="h-4 w-4" />}>
              Analyze Your Data
            </Button>
            <Button
              size="lg"
              variant="outline"
              href="/dashboard"
              icon={<PlayCircle className="h-4 w-4" />}
            >
              Explore Demo
            </Button>
          </motion.div>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.7, delay: 0.42 }}
            className="mt-5 text-[12.5px] text-ink-faint"
          >
            No account, no API key, no setup required. Works fully offline in demo mode.
          </motion.p>

          {/* Trust stats */}
          <motion.dl
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.5 }}
            className="mt-12 grid max-w-xl grid-cols-2 gap-x-8 gap-y-6 border-t border-white/[0.06] pt-8 sm:grid-cols-4"
          >
            {TRUST_STATS.map((stat) => (
              <div key={stat.label}>
                <dt className="text-[22px] font-semibold tracking-[-0.02em] text-ink">{stat.value}</dt>
                <dd className="mt-1 text-[11.5px] leading-snug text-ink-faint">{stat.label}</dd>
              </div>
            ))}
          </motion.dl>
        </div>

        {/* Visual ---------------------------------------------------------- */}
        <div className="relative lg:pl-6">
          <HeroVisual />
        </div>
      </div>
    </section>
  );
}
