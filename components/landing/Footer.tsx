import Link from "next/link";

import { Logo } from "@/components/brand/Logo";
import { APP_NAME } from "@/lib/constants";

const COLUMNS = [
  {
    title: "Product",
    links: [
      { label: "Overview", href: "/dashboard" },
      { label: "Analytics", href: "/dashboard/analytics" },
      { label: "AI Insights", href: "/dashboard/insights" },
      { label: "Predictions", href: "/dashboard/predictions" },
    ],
  },
  {
    title: "Platform",
    links: [
      { label: "Data Quality", href: "/dashboard/quality" },
      { label: "Data Cleaning", href: "/dashboard/cleaning" },
      { label: "Reports", href: "/dashboard/reports" },
      { label: "Settings", href: "/dashboard/settings" },
    ],
  },
  {
    title: "Company",
    links: [
      { label: "Features", href: "/#features" },
      { label: "Pricing", href: "/#pricing" },
      { label: "Documentation", href: "/#product" },
      { label: "Contact", href: "/#pricing" },
    ],
  },
];

export function Footer() {
  return (
    <footer className="relative border-t border-white/[0.06] py-14">
      <div className="mx-auto max-w-[1360px] px-5 lg:px-8">
        <div className="grid gap-10 lg:grid-cols-[1.4fr_repeat(3,1fr)]">
          <div>
            <Logo idSuffix="footer" />
            <p className="mt-5 max-w-xs text-[13px] leading-relaxed text-ink-muted">
              The analytics workspace that turns raw files into decisions - profiling, insights,
              forecasting and reporting in one place.
            </p>
            <div className="mt-6 inline-flex items-center gap-2 rounded-full border border-white/[0.08] bg-white/[0.03] px-3 py-1.5 text-[11.5px] text-ink-muted">
              <span className="h-1.5 w-1.5 rounded-full bg-success" />
              All systems operational
            </div>
          </div>

          {COLUMNS.map((column) => (
            <div key={column.title}>
              <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-ink-faint">
                {column.title}
              </p>
              <ul className="mt-4 space-y-2.5">
                {column.links.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="text-[13px] text-ink-muted transition-colors duration-300 hover:text-ink"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-white/[0.06] pt-7 sm:flex-row">
          <p className="text-[12px] text-ink-faint">
            &copy; {new Date().getFullYear()} {APP_NAME}. Built as a product demonstration.
          </p>
          <div className="flex items-center gap-5 text-[12px] text-ink-faint">
            <span className="transition-colors hover:text-ink-muted">Privacy</span>
            <span className="transition-colors hover:text-ink-muted">Terms</span>
            <span className="transition-colors hover:text-ink-muted">Security</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
