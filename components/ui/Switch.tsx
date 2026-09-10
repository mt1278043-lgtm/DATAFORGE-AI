"use client";

import { cn } from "@/lib/utils";

interface SwitchProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label?: string;
  description?: string;
  disabled?: boolean;
}

export function Switch({ checked, onChange, label, description, disabled }: SwitchProps) {
  return (
    <div className="flex items-start justify-between gap-6">
      {label ? (
        <div className="min-w-0">
          <p className="text-[13.5px] font-medium text-ink">{label}</p>
          {description ? (
            <p className="mt-0.5 text-[12.5px] leading-relaxed text-ink-muted">{description}</p>
          ) : null}
        </div>
      ) : null}
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        aria-label={label}
        disabled={disabled}
        onClick={() => onChange(!checked)}
        className={cn(
          "relative h-6 w-11 shrink-0 rounded-full border transition-all duration-300",
          checked
            ? "border-transparent bg-[linear-gradient(90deg,#22D3EE,#8B5CF6)]"
            : "border-white/10 bg-white/[0.07]",
          disabled && "cursor-not-allowed opacity-50",
        )}
      >
        <span
          className={cn(
            "absolute top-1/2 h-4.5 w-4.5 -translate-y-1/2 rounded-full bg-white shadow-sm transition-all duration-300",
            checked ? "left-[calc(100%-1.25rem)]" : "left-1",
          )}
          style={{ height: "1.125rem", width: "1.125rem" }}
        />
      </button>
    </div>
  );
}
