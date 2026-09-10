"use client";

import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import Link from "next/link";

const stages = [
  { label: "Raw Data", icon: "📊" },
  { label: "Engine", icon: "⚙️" },
  { label: "AI Analysis", icon: "🤖" },
  { label: "Insights", icon: "💡" },
  { label: "Decisions", icon: "✓" },
];

const metrics = [
  { label: "Data Quality", value: "94.8%" },
  { label: "Revenue Impact", value: "+18.7%" },
  { label: "AI Insights", value: "27" },
  { label: "Records", value: "12.4K" },
];

export function PremiumHero() {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-24 pb-12">
      <div className="absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-gradient-to-b from-brand-cyan/10 via-transparent to-brand-purple/5" />
      </div>

      <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="space-y-12">
          {/* Main heading */}
          <div className="text-center space-y-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-brand-cyan/30 bg-brand-cyan/10"
            >
              <div className="w-2 h-2 rounded-full bg-success animate-pulse" />
              <span className="text-sm text-brand-cyan font-medium">Intelligence Engine Online</span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-5xl sm:text-6xl lg:text-7xl font-bold tracking-tight"
            >
              <span className="text-gradient-brand">Turn Data Into Intelligence</span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-lg text-ink-muted max-w-2xl mx-auto"
            >
              Upload your dataset. Our AI analyzes patterns, detects anomalies, and delivers
              actionable intelligence—all in seconds.
            </motion.p>

            {/* CTA Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="flex flex-col sm:flex-row gap-4 justify-center pt-4"
            >
              <Link
                href="/dashboard"
                className="group relative inline-flex items-center justify-center px-8 py-4 rounded-lg font-semibold overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-brand-cyan to-brand-purple opacity-100" />
                <div className="absolute inset-0.5 bg-base rounded" />
                <div className="relative flex items-center gap-2 text-white">
                  Start Analyzing
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition" />
                </div>
              </Link>

              <button className="px-8 py-4 rounded-lg border border-white/20 bg-white/5 font-semibold text-white hover:bg-white/10 transition">
                Watch Demo
              </button>
            </motion.div>
          </div>

          {/* Data Pipeline Visualization */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="relative"
          >
            <div className="glass p-8 sm:p-12">
              {/* Pipeline stages */}
              <div className="flex items-center justify-between gap-4 mb-12">
                {stages.map((stage, idx) => (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.5 + idx * 0.1 }}
                    className="flex flex-col items-center gap-3 flex-1"
                  >
                    {/* Animated circle */}
                    <motion.div
                      animate={{ scale: [1, 1.1, 1] }}
                      transition={{ duration: 2, delay: 0.5 + idx * 0.2, repeat: Infinity }}
                      className="w-12 h-12 rounded-full bg-gradient-to-br from-brand-cyan to-brand-purple flex items-center justify-center text-xl"
                    >
                      {stage.icon}
                    </motion.div>

                    {/* Label */}
                    <span className="text-sm font-medium text-ink-muted text-center">
                      {stage.label}
                    </span>

                    {/* Arrow */}
                    {idx < stages.length - 1 && (
                      <motion.div
                        animate={{ x: [0, 4, 0] }}
                        transition={{ duration: 1.5, delay: 0.5 + idx * 0.2, repeat: Infinity }}
                        className="absolute left-1/2 text-brand-cyan mt-16"
                      >
                        <ArrowRight className="w-5 h-5" />
                      </motion.div>
                    )}
                  </motion.div>
                ))}
              </div>

              {/* Animated data flow visualization */}
              <div className="relative h-32 bg-white/5 rounded-lg border border-white/10 mb-8 overflow-hidden">
                {/* Animated particles */}
                {[...Array(5)].map((_, i) => (
                  <motion.div
                    key={i}
                    initial={{ x: -20, opacity: 0 }}
                    animate={{ x: "calc(100% + 20px)", opacity: 1 }}
                    transition={{
                      duration: 3,
                      delay: i * 0.6,
                      repeat: Infinity,
                      ease: "linear",
                    }}
                    className="absolute top-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-gradient-to-r from-brand-cyan to-brand-purple blur-sm"
                  />
                ))}
                <div className="absolute inset-0 flex items-center justify-center text-ink-muted text-sm">
                  Data flowing through intelligence engine
                </div>
              </div>

              {/* Metrics grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {metrics.map((metric, idx) => (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.7 + idx * 0.1 }}
                    className="text-center"
                  >
                    <div className="text-2xl sm:text-3xl font-bold text-brand-cyan">
                      {metric.value}
                    </div>
                    <div className="text-xs text-ink-muted mt-2">{metric.label}</div>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
