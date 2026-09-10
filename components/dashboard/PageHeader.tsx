"use client";

import type { ReactNode } from "react";
import { motion } from "framer-motion";

interface PageHeaderProps {
  eyebrow?: string;
  title: ReactNode;
  description?: ReactNode;
  actions?: ReactNode;
}

export function PageHeader({ eyebrow, title, description, actions }: PageHeaderProps) {
  return (
    <motion.header
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      className="flex flex-wrap items-end justify-between gap-5"
    >
      <div className="min-w-0">
        {eyebrow ? <p className="eyebrow mb-2">{eyebrow}</p> : null}
        <h1 className="text-balance text-[26px] font-semibold tracking-[-0.03em] text-ink sm:text-[32px]">
          {title}
        </h1>
        {description ? (
          <p className="mt-2 max-w-2xl text-[14px] leading-relaxed text-ink-muted">{description}</p>
        ) : null}
      </div>
      {actions ? <div className="flex flex-wrap items-center gap-2.5">{actions}</div> : null}
    </motion.header>
  );
}
