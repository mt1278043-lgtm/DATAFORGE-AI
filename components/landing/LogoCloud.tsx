"use client";

import { motion } from "framer-motion";

/**
 * Fictional customer marks. These are invented names for a product demo -
 * no real company branding is used.
 */
const COMPANIES = [
  "NORTHWIND",
  "VECTORLY",
  "ORBIT LABS",
  "HELIXPAY",
  "CADENCE",
  "MERIDIAN",
  "QUANTUMLEAF",
];

export function LogoCloud() {
  return (
    <section className="relative border-y border-white/[0.05] py-10">
      <div className="mx-auto max-w-[1360px] px-5 lg:px-8">
        <p className="text-center text-[11px] uppercase tracking-[0.24em] text-ink-faint">
          Trusted by data teams at
        </p>
        <div className="mask-fade-r mt-6 flex flex-wrap items-center justify-center gap-x-10 gap-y-5">
          {COMPANIES.map((company, index) => (
            <motion.span
              key={company}
              initial={{ opacity: 0, y: 8 }}
              whileInView={{ opacity: 0.55, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.06 }}
              className="text-[13px] font-semibold tracking-[0.24em] text-ink-muted transition-opacity duration-500 hover:opacity-100"
            >
              {company}
            </motion.span>
          ))}
        </div>
      </div>
    </section>
  );
}
