"use client";

import { motion } from "framer-motion";
import {
  BrainCircuit,
  FileBarChart,
  Gauge,
  LineChart,
  ShieldCheck,
  Sparkles,
  UploadCloud,
  Wand2,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

import { SectionHeading } from "@/components/ui/SectionHeading";
import { cn } from "@/lib/utils";

interface Feature {
  icon: LucideIcon;
  title: string;
  description: string;
  span?: boolean;
}

const FEATURES: Feature[] = [
  {
    icon: UploadCloud,
    title: "Instant data ingestion",
    description:
      "Drop a CSV or Excel file and DataForge parses, types and profiles every column in the browser - no upload queue, no waiting room.",
    span: true,
  },
  {
    icon: Gauge,
    title: "Real statistics",
    description:
      "Min, max, mean, median, missing values, duplicates, uniqueness and outliers - computed from your actual rows.",
  },
  {
    icon: LineChart,
    title: "Composable analytics",
    description: "Pick any X and Y, choose a chart type, and the workspace rebuilds itself instantly.",
  },
  {
    icon: Sparkles,
    title: "Insight engine",
    description:
      "Seven detectors scan for trends, anomalies, correlations, concentration and efficiency gaps.",
  },
  {
    icon: BrainCircuit,
    title: "Predictions",
    description: "Regression, classification and time-series forecasting with honest confidence bands.",
  },
  {
    icon: ShieldCheck,
    title: "Quality scoring",
    description:
      "A weighted score across completeness, uniqueness, validity and consistency - with fixes attached.",
    span: true,
  },
  {
    icon: Wand2,
    title: "One-pass cleaning",
    description: "Impute, deduplicate, trim and cap outliers, then compare before and after metrics.",
  },
  {
    icon: FileBarChart,
    title: "Executive reports",
    description: "Generate a board-ready narrative with KPIs, trends, anomalies and recommendations.",
  },
];

export function Features() {
  return (
    <section id="features" className="relative py-24 sm:py-32">
      <div className="mx-auto max-w-[1360px] px-5 lg:px-8">
        <SectionHeading
          align="center"
          eyebrow="Platform"
          title="Everything between a raw file and a decision"
          description="DataForge AI replaces the notebook, the BI tool and the deck with one workspace that explains itself."
        />

        <div className="mt-14 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <motion.article
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-80px" }}
                transition={{ duration: 0.55, delay: (index % 3) * 0.08, ease: [0.22, 1, 0.36, 1] }}
                className={cn(
                  "glass-strong glass-hover group relative overflow-hidden p-6",
                  feature.span && "lg:col-span-2",
                )}
              >
                <div className="pointer-events-none absolute -right-16 -top-16 h-40 w-40 rounded-full bg-brand-violet/[0.08] blur-3xl transition-all duration-700 group-hover:bg-brand-cyan/15" />
                <span className="relative flex h-11 w-11 items-center justify-center rounded-xl border border-white/10 bg-white/[0.04] text-brand-cyan transition-colors duration-500 group-hover:text-brand-purple">
                  <Icon className="h-5 w-5" />
                </span>
                <h3 className="relative mt-5 text-[16px] font-semibold tracking-[-0.01em] text-ink">
                  {feature.title}
                </h3>
                <p className="relative mt-2 max-w-lg text-[13.5px] leading-relaxed text-ink-muted">
                  {feature.description}
                </p>
              </motion.article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
