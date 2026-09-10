"use client";

import type { ReactNode } from "react";
import { motion } from "framer-motion";
import { Check } from "lucide-react";

import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";

interface ShowcaseProps {
  id: string;
  eyebrow: string;
  title: string;
  description: string;
  bullets: string[];
  visual: ReactNode;
  reversed?: boolean;
  cta?: { label: string; href: string };
}

/** Alternating product-story section used three times on the landing page. */
export function Showcase({
  id,
  eyebrow,
  title,
  description,
  bullets,
  visual,
  reversed,
  cta,
}: ShowcaseProps) {
  return (
    <section id={id} className="relative py-20 sm:py-24">
      <div
        className={cn(
          "mx-auto grid max-w-[1360px] items-center gap-12 px-5 lg:grid-cols-2 lg:gap-16 lg:px-8",
        )}
      >
        <motion.div
          initial={{ opacity: 0, x: reversed ? 26 : -26 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          className={cn(reversed && "lg:order-2")}
        >
          <p className="eyebrow mb-4">{eyebrow}</p>
          <h2 className="text-balance text-[30px] font-semibold leading-[1.12] tracking-[-0.035em] text-ink sm:text-[38px]">
            {title}
          </h2>
          <p className="mt-4 max-w-lg text-[15px] leading-relaxed text-ink-muted">{description}</p>

          <ul className="mt-7 space-y-3">
            {bullets.map((bullet) => (
              <li key={bullet} className="flex items-start gap-3">
                <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-md border border-brand-cyan/25 bg-brand-cyan/10 text-brand-cyan">
                  <Check className="h-3 w-3" />
                </span>
                <span className="text-[14px] leading-relaxed text-ink-muted">{bullet}</span>
              </li>
            ))}
          </ul>

          {cta ? (
            <Button href={cta.href} variant="secondary" className="mt-8">
              {cta.label}
            </Button>
          ) : null}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 26 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.75, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
          className={cn("relative", reversed && "lg:order-1")}
        >
          {visual}
        </motion.div>
      </div>
    </section>
  );
}
