"use client";

import { motion } from "framer-motion";
import { Check, Sparkles } from "lucide-react";

import { Button } from "@/components/ui/Button";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { cn } from "@/lib/utils";

interface Plan {
  name: string;
  price: string;
  cadence: string;
  description: string;
  features: string[];
  cta: string;
  featured?: boolean;
}

const PLANS: Plan[] = [
  {
    name: "Starter",
    price: "$0",
    cadence: "forever",
    description: "Everything you need to analyse a dataset end to end.",
    features: [
      "Unlimited CSV and Excel uploads",
      "Full column profiling and statistics",
      "Analytics workspace with 5 chart types",
      "Data quality scoring and cleaning",
      "Local AI insight engine",
    ],
    cta: "Launch Analyzer",
  },
  {
    name: "Scale",
    price: "$49",
    cadence: "per user / month",
    description: "For teams shipping decisions from data every week.",
    features: [
      "Everything in Starter",
      "OpenAI-powered assistant and narratives",
      "Saved datasets and shared workspaces",
      "Scheduled reports and exports",
      "Forecasting with confidence intervals",
      "Priority support",
    ],
    cta: "Start free trial",
    featured: true,
  },
  {
    name: "Enterprise",
    price: "Custom",
    cadence: "annual",
    description: "Governance, scale and deployment on your terms.",
    features: [
      "Everything in Scale",
      "SSO, audit logs and role-based access",
      "Self-hosted or private cloud",
      "Custom model endpoints",
      "Dedicated solutions architect",
    ],
    cta: "Talk to sales",
  },
];

export function Pricing() {
  return (
    <section id="pricing" className="relative py-24 sm:py-32">
      <div className="mx-auto max-w-[1360px] px-5 lg:px-8">
        <SectionHeading
          align="center"
          eyebrow="Pricing"
          title="Start free. Scale when the data does."
          description="Every analytical feature works without an API key. Paid plans add collaboration, persistence and hosted AI."
        />

        <div className="mt-14 grid gap-5 lg:grid-cols-3">
          {PLANS.map((plan, index) => (
            <motion.article
              key={plan.name}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{ duration: 0.6, delay: index * 0.1, ease: [0.22, 1, 0.36, 1] }}
              className={cn(
                "glass-strong relative flex flex-col overflow-hidden p-7",
                plan.featured && "edge-highlight lg:-my-4 lg:py-11",
              )}
            >
              {plan.featured ? (
                <>
                  <div className="pointer-events-none absolute -right-24 -top-24 h-56 w-56 rounded-full bg-brand-violet/20 blur-3xl" />
                  <span className="mb-5 inline-flex w-fit items-center gap-1.5 rounded-full bg-[linear-gradient(110deg,#22D3EE,#8B5CF6)] px-3 py-1 text-[10.5px] font-semibold uppercase tracking-[0.14em] text-white">
                    <Sparkles className="h-3 w-3" />
                    Most popular
                  </span>
                </>
              ) : null}

              <h3 className="relative text-[15px] font-semibold tracking-[-0.01em] text-ink">
                {plan.name}
              </h3>
              <div className="relative mt-4 flex items-end gap-2">
                <span className="text-[40px] font-semibold leading-none tracking-[-0.04em] text-ink">
                  {plan.price}
                </span>
                <span className="mb-1 text-[12.5px] text-ink-faint">{plan.cadence}</span>
              </div>
              <p className="relative mt-3 text-[13.5px] leading-relaxed text-ink-muted">
                {plan.description}
              </p>

              <ul className="relative mt-7 flex-1 space-y-3">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-2.5">
                    <span className="mt-0.5 flex h-4.5 w-4.5 shrink-0 items-center justify-center rounded border border-brand-cyan/25 bg-brand-cyan/10 text-brand-cyan"
                      style={{ height: "1.125rem", width: "1.125rem" }}>
                      <Check className="h-2.5 w-2.5" />
                    </span>
                    <span className="text-[13px] leading-relaxed text-ink-muted">{feature}</span>
                  </li>
                ))}
              </ul>

              <Button
                href="/dashboard"
                variant={plan.featured ? "primary" : "secondary"}
                className="relative mt-8 w-full"
              >
                {plan.cta}
              </Button>
            </motion.article>
          ))}
        </div>

        <p className="mt-8 text-center text-[12.5px] text-ink-faint">
          Prices shown are illustrative for this product demo.
        </p>
      </div>
    </section>
  );
}
