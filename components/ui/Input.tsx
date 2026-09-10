"use client";

import type { InputHTMLAttributes, ReactNode } from "react";

import { cn } from "@/lib/utils";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  icon?: ReactNode;
  suffix?: ReactNode;
}

export function Input({ label, icon, suffix, className, ...props }: InputProps) {
  return (
    <label className={cn("block", className)}>
      {label ? (
        <span className="mb-1.5 block text-[11px] font-medium uppercase tracking-[0.14em] text-ink-faint">
          {label}
        </span>
      ) : null}
      <div className="relative flex items-center">
        {icon ? (
          <span className="pointer-events-none absolute left-3 text-ink-faint" aria-hidden>
            {icon}
          </span>
        ) : null}
        <input
          className={cn(
            "h-11 w-full rounded-xl border border-white/10 bg-white/[0.04] text-sm text-ink placeholder:text-ink-faint",
            "transition-colors duration-300 hover:border-white/20 focus:border-brand-cyan/50 focus:outline-none",
            icon ? "pl-9" : "pl-3.5",
            suffix ? "pr-16" : "pr-3.5",
          )}
          {...props}
        />
        {suffix ? <span className="absolute right-3 text-[11px] text-ink-faint">{suffix}</span> : null}
      </div>
    </label>
  );
}
