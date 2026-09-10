"use client";

import { useEffect } from "react";
import { AlertTriangle, RotateCcw } from "lucide-react";

import { Logo } from "@/components/brand/Logo";
import { Button } from "@/components/ui/Button";

/**
 * Global error boundary. Users never see a stack trace - only a calm
 * recovery path. The technical detail is logged to the console instead.
 */
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[DataForge]", error);
  }, [error]);

  return (
    <main className="relative flex min-h-screen flex-col items-center justify-center px-6 text-center">
      <div className="pointer-events-none absolute inset-0 -z-10 grid-bg opacity-60" aria-hidden />
      <Logo className="mb-10" />
      <span className="mb-6 flex h-14 w-14 items-center justify-center rounded-2xl border border-danger/25 bg-danger/[0.08] text-danger">
        <AlertTriangle className="h-6 w-6" />
      </span>
      <h1 className="text-3xl font-semibold tracking-[-0.03em] text-ink">Something went wrong</h1>
      <p className="mt-3 max-w-md text-[15px] leading-relaxed text-ink-muted">
        The view could not be rendered. Your data is untouched - try loading the page again, or
        return to the dashboard.
      </p>
      <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
        <Button onClick={reset} icon={<RotateCcw className="h-4 w-4" />}>
          Try again
        </Button>
        <Button href="/dashboard" variant="secondary">
          Back to dashboard
        </Button>
      </div>
      {error.digest ? (
        <p className="mt-6 font-mono text-[11px] text-ink-faint">Reference: {error.digest}</p>
      ) : null}
    </main>
  );
}
