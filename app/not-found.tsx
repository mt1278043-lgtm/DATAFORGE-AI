import Link from "next/link";
import { ArrowLeft, Compass } from "lucide-react";

import { Logo } from "@/components/brand/Logo";
import { Button } from "@/components/ui/Button";

export default function NotFound() {
  return (
    <main className="relative flex min-h-screen flex-col items-center justify-center px-6 text-center">
      <div className="pointer-events-none absolute inset-0 -z-10 grid-bg opacity-60" aria-hidden />
      <Logo className="mb-10" />
      <span className="mb-6 flex h-14 w-14 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.03] text-brand-cyan">
        <Compass className="h-6 w-6" />
      </span>
      <p className="eyebrow mb-3">Error 404</p>
      <h1 className="text-4xl font-semibold tracking-[-0.03em] text-ink">This page does not exist</h1>
      <p className="mt-3 max-w-md text-[15px] leading-relaxed text-ink-muted">
        The page you are looking for may have been moved, or the link is out of date.
      </p>
      <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
        <Button href="/" icon={<ArrowLeft className="h-4 w-4" />}>
          Back to home
        </Button>
        <Button href="/dashboard" variant="secondary">
          Open the dashboard
        </Button>
      </div>
      <Link href="/dashboard/datasets" className="mt-6 text-[13px] text-ink-faint hover:text-ink">
        Or upload a dataset
      </Link>
    </main>
  );
}
