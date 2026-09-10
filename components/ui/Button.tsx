"use client";

import { forwardRef } from "react";
import type { ButtonHTMLAttributes, ReactNode } from "react";
import Link from "next/link";
import { Loader2 } from "lucide-react";

import { cn } from "@/lib/utils";

export type ButtonVariant = "primary" | "secondary" | "ghost" | "outline" | "danger";
export type ButtonSize = "sm" | "md" | "lg" | "icon";

const VARIANTS: Record<ButtonVariant, string> = {
  primary:
    "text-white shadow-glow bg-[linear-gradient(110deg,#22D3EE_0%,#8B5CF6_52%,#C084FC_100%)] bg-[length:200%_100%] hover:bg-[position:100%_0] border border-white/10",
  secondary:
    "bg-white/[0.06] text-ink border border-white/10 hover:bg-white/[0.1] hover:border-white/20",
  outline:
    "bg-transparent text-ink border border-white/15 hover:border-brand-cyan/50 hover:bg-white/[0.04]",
  ghost: "bg-transparent text-ink-muted hover:text-ink hover:bg-white/[0.06] border border-transparent",
  danger: "bg-danger/15 text-danger border border-danger/30 hover:bg-danger/25",
};

const SIZES: Record<ButtonSize, string> = {
  sm: "h-9 px-3.5 text-[13px] gap-1.5 rounded-lg",
  md: "h-11 px-5 text-sm gap-2 rounded-xl",
  lg: "h-[52px] px-7 text-[15px] gap-2.5 rounded-xl",
  icon: "h-10 w-10 rounded-xl",
};

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  icon?: ReactNode;
  iconRight?: ReactNode;
  href?: string;
}

const baseClasses =
  "relative inline-flex select-none items-center justify-center font-medium tracking-[-0.01em] transition-all duration-300 ease-premium disabled:pointer-events-none disabled:opacity-50 active:scale-[0.98]";

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { className, variant = "primary", size = "md", loading, icon, iconRight, href, children, ...props },
  ref,
) {
  const classes = cn(baseClasses, VARIANTS[variant], SIZES[size], className);

  const content = (
    <>
      {loading ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden /> : icon}
      {children}
      {!loading && iconRight}
    </>
  );

  if (href) {
    return (
      <Link href={href} className={classes}>
        {content}
      </Link>
    );
  }

  return (
    <button ref={ref} className={classes} disabled={loading || props.disabled} {...props}>
      {content}
    </button>
  );
});
