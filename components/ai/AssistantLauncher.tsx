"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Sparkles } from "lucide-react";

import { AssistantPanel } from "@/components/ai/AssistantPanel";

/** Floating "Ask DataForge" entry point, present on every dashboard page. */
export function AssistantLauncher() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <AnimatePresence>
        {!open ? (
          <motion.button
            initial={{ opacity: 0, scale: 0.85, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 12 }}
            transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
            onClick={() => setOpen(true)}
            className="group fixed bottom-5 right-5 z-[90] flex items-center gap-2.5 rounded-full border border-white/12 bg-[linear-gradient(110deg,#22D3EE_0%,#8B5CF6_55%,#C084FC_100%)] px-4 py-3 text-[13.5px] font-medium text-white shadow-glow transition-transform duration-300 hover:scale-[1.03] active:scale-95 sm:px-5"
            aria-label="Ask DataForge AI"
          >
            <span className="absolute inset-0 -z-10 rounded-full bg-brand-violet/40 blur-xl transition-opacity duration-500 group-hover:opacity-90" />
            <Sparkles className="h-4 w-4" />
            <span className="hidden sm:inline">Ask DataForge</span>
          </motion.button>
        ) : null}
      </AnimatePresence>

      <AssistantPanel open={open} onClose={() => setOpen(false)} />
    </>
  );
}
