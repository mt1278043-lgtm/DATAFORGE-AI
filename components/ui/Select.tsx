"use client";

import { ChevronDown } from "lucide-react";
import type { SelectHTMLAttributes } from "react";

import { cn } from "@/lib/utils";

export interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean;
}

interface SelectProps extends Omit<SelectHTMLAttributes<HTMLSelectElement>, "onChange" | "size"> {
  label?: string;
  options: SelectOption[];
  value: string;
  onChange: (value: string) => void;
  hint?: string;
  size?: "sm" | "md";
}

export function Select({
  label,
  options,
  value,
  onChange,
  hint,
  className,
  size = "md",
  ...props
}: SelectProps) {
  return (
    <label className={cn("block", className)}>
      {label ? (
        <span className="mb-1.5 block text-[11px] font-medium uppercase tracking-[0.14em] text-ink-faint">
          {label}
        </span>
      ) : null}
      <div className="relative">
        <select
          value={value}
          onChange={(event) => onChange(event.target.value)}
          className={cn(
            "w-full appearance-none rounded-xl border border-white/10 bg-white/[0.04] pr-9 text-ink",
            "transition-colors duration-300 hover:border-white/20 focus:border-brand-cyan/50 focus:outline-none",
            size === "sm" ? "h-9 pl-3 text-[13px]" : "h-11 pl-3.5 text-sm",
          )}
          {...props}
        >
          {options.length === 0 ? <option value="">No options available</option> : null}
          {options.map((option) => (
            <option
              key={option.value}
              value={option.value}
              disabled={option.disabled}
              className="bg-base-100 text-ink"
            >
              {option.label}
            </option>
          ))}
        </select>
        <ChevronDown
          className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-faint"
          aria-hidden
        />
      </div>
      {hint ? <span className="mt-1.5 block text-[11px] text-ink-faint">{hint}</span> : null}
    </label>
  );
}
