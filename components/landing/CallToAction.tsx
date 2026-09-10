"use client";

import { motion } from "framer-motion";
import { ArrowRight, PlayCircle } from "lucide-react";

import { Button } from "@/components/ui/Button";

export function CallToAction() {
  return (
    <section className="relative py-20 sm:py-28">
      <div className="mx-auto max-w-[1360px] px-5 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          className="glass-strong noise relative overflow-hidden rounded-[28px] px-6 py-14 text-center sm:px-14 sm:py-20"
        >
          <div
            className="pointer-events-none absolute inset-0 opacity-80"
            style={{
              background:
                "radial-gradient(40rem 22rem at 20% 0%, rgba(34,211,238,0.16), transparent 65%), radial-gradient(38rem 22rem at 85% 100%, rgba(139,92,246,0.22), transparent 65%)",
            }}
          />
          <div className="pointer-events-none absolute inset-x-24 top-0 h-px bg-gradient-to-r from-transparent via-brand-pink/60 to-transparent" />

          <p className="eyebrow relative mb-4">Ready when you are</p>
          <h2 className="relative mx-auto max-w-3xl text-balance text-[32px] font-semibold leading-[1.1] tracking-[-0.035em] sm:text-[44px]">
            <span className="text-gradient">Your next decision is already </span>
            <span className="text-gradient-brand">inside your data.</span>
          </h2>
          <p className="relative mx-auto mt-5 max-w-xl text-[15px] leading-relaxed text-ink-muted">
            Load a file and DataForge AI profiles it, scores its quality, surfaces the signals and
            writes the report - in seconds, in your browser.
          </p>

          <div className="relative mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Button size="lg" href="/dashboard/datasets" iconRight={<ArrowRight className="h-4 w-4" />}>
              Analyze Your Data
            </Button>
            <Button size="lg" variant="outline" href="/dashboard" icon={<PlayCircle className="h-4 w-4" />}>
              Explore Demo
            </Button>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
