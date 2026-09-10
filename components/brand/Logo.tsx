import Link from "next/link";

import { cn } from "@/lib/utils";

interface LogoMarkProps {
  className?: string;
  /** Unique gradient id when several marks render on one page. */
  idSuffix?: string;
}

/**
 * DataForge AI mark - a forged data prism.
 * The hexagon is the "forge", the stacked bars are data, and the orbiting
 * node is the intelligence layer processing it.
 */
export function LogoMark({ className, idSuffix = "default" }: LogoMarkProps) {
  const gradient = `df-mark-${idSuffix}`;
  const glow = `df-glow-${idSuffix}`;

  return (
    <svg
      viewBox="0 0 40 40"
      fill="none"
      className={cn("h-9 w-9", className)}
      aria-hidden="true"
      focusable="false"
    >
      <defs>
        <linearGradient id={gradient} x1="4" y1="2" x2="36" y2="38" gradientUnits="userSpaceOnUse">
          <stop stopColor="#22D3EE" />
          <stop offset="0.55" stopColor="#8B5CF6" />
          <stop offset="1" stopColor="#F472B6" />
        </linearGradient>
        <linearGradient id={glow} x1="10" y1="10" x2="30" y2="30" gradientUnits="userSpaceOnUse">
          <stop stopColor="#22D3EE" stopOpacity="0.25" />
          <stop offset="1" stopColor="#8B5CF6" stopOpacity="0.05" />
        </linearGradient>
      </defs>

      {/* Forge hexagon */}
      <path
        d="M20 2.4 34.6 10.9v17.1L20 36.6 5.4 28.1V10.9L20 2.4Z"
        fill={`url(#${glow})`}
        stroke={`url(#${gradient})`}
        strokeWidth="1.8"
        strokeLinejoin="round"
      />

      {/* Data bars */}
      <rect x="13.6" y="20.4" width="3.1" height="7.2" rx="1.55" fill={`url(#${gradient})`} />
      <rect x="18.5" y="16.2" width="3.1" height="11.4" rx="1.55" fill={`url(#${gradient})`} opacity="0.85" />
      <rect x="23.4" y="12.4" width="3.1" height="15.2" rx="1.55" fill={`url(#${gradient})`} opacity="0.7" />

      {/* Intelligence node */}
      <circle cx="25" cy="9.4" r="2.6" fill="#05070D" stroke={`url(#${gradient})`} strokeWidth="1.6" />
      <circle cx="25" cy="9.4" r="0.9" fill="#22D3EE" />
    </svg>
  );
}

interface LogoProps {
  href?: string;
  className?: string;
  compact?: boolean;
  idSuffix?: string;
}

export function Logo({ href = "/", className, compact, idSuffix }: LogoProps) {
  const content = (
    <span className={cn("group inline-flex items-center gap-2.5", className)}>
      <span className="relative">
        <span className="absolute inset-0 -z-10 rounded-xl bg-brand-violet/25 blur-lg transition-opacity duration-500 group-hover:opacity-100 md:opacity-60" />
        <LogoMark idSuffix={idSuffix} className={compact ? "h-8 w-8" : "h-9 w-9"} />
      </span>
      {!compact ? (
        <span className="flex flex-col leading-none">
          <span className="text-[15px] font-semibold tracking-[0.16em] text-ink">DATAFORGE</span>
          <span className="mt-1 text-[10px] font-semibold tracking-[0.44em] text-transparent bg-clip-text bg-[linear-gradient(90deg,#22D3EE,#8B5CF6,#F472B6)]">
            AI
          </span>
        </span>
      ) : null}
    </span>
  );

  if (!href) return content;

  return (
    <Link href={href} aria-label="DataForge AI home" className="inline-flex">
      {content}
    </Link>
  );
}
