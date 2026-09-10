"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowRight, Menu, X } from "lucide-react";

import { Logo } from "@/components/brand/Logo";
import { Button } from "@/components/ui/Button";
import { NAV_LINKS } from "@/lib/constants";
import { cn } from "@/lib/utils";

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <header
      className={cn(
        "fixed inset-x-0 top-0 z-50 transition-all duration-500 ease-premium",
        scrolled ? "border-b border-white/[0.06] bg-base/80 backdrop-blur-xl" : "bg-transparent",
      )}
    >
      <nav className="mx-auto flex h-[72px] max-w-[1360px] items-center justify-between gap-6 px-5 lg:px-8">
        <Logo />

        <div className="hidden items-center gap-1 lg:flex">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="rounded-lg px-3.5 py-2 text-[13.5px] text-ink-muted transition-colors duration-300 hover:bg-white/[0.05] hover:text-ink"
            >
              {link.label}
            </Link>
          ))}
        </div>

        <div className="hidden items-center gap-2.5 lg:flex">
          <Button variant="ghost" size="sm" href="/dashboard">
            Sign In
          </Button>
          <Button size="sm" href="/dashboard" iconRight={<ArrowRight className="h-4 w-4" />}>
            Launch Analyzer
          </Button>
        </div>

        <button
          onClick={() => setOpen((value) => !value)}
          aria-label={open ? "Close menu" : "Open menu"}
          className="rounded-xl border border-white/10 p-2.5 text-ink-muted transition-colors hover:text-ink lg:hidden"
        >
          {open ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
        </button>
      </nav>

      <AnimatePresence>
        {open ? (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.25 }}
            className="border-t border-white/[0.06] bg-base/95 px-5 pb-6 pt-4 backdrop-blur-xl lg:hidden"
          >
            <div className="flex flex-col gap-1">
              {NAV_LINKS.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setOpen(false)}
                  className="rounded-lg px-3 py-3 text-[15px] text-ink-muted transition-colors hover:bg-white/[0.05] hover:text-ink"
                >
                  {link.label}
                </Link>
              ))}
            </div>
            <div className="mt-4 flex flex-col gap-2.5">
              <Button variant="secondary" href="/dashboard">
                Sign In
              </Button>
              <Button href="/dashboard" iconRight={<ArrowRight className="h-4 w-4" />}>
                Launch Analyzer
              </Button>
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </header>
  );
}
