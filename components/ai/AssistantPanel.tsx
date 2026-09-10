"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowUp, Eraser, Sparkles, X } from "lucide-react";

import { RichText } from "@/components/ai/RichText";
import { Logo } from "@/components/brand/Logo";
import { Badge } from "@/components/ui/Badge";
import { useAiStatus } from "@/hooks/useAiStatus";
import { useDataset } from "@/hooks/useDataset";
import { SUGGESTED_QUESTIONS } from "@/lib/constants";
import { cn, uid } from "@/lib/utils";
import { askDataForge, assistantGreeting } from "@/services/aiService";
import type { ChatMessage } from "@/types";

interface AssistantPanelProps {
  open: boolean;
  onClose: () => void;
}

/** Three-dot "AI is thinking" indicator. */
function ThinkingDots() {
  return (
    <div className="flex items-center gap-1.5 px-1 py-2">
      {[0, 1, 2].map((index) => (
        <motion.span
          key={index}
          className="h-1.5 w-1.5 rounded-full bg-brand-cyan"
          animate={{ opacity: [0.25, 1, 0.25], y: [0, -3, 0] }}
          transition={{ duration: 1.1, repeat: Infinity, delay: index * 0.16 }}
        />
      ))}
      <span className="ml-2 text-[12px] text-ink-faint">Analysing your dataset...</span>
    </div>
  );
}

export function AssistantPanel({ open, onClose }: AssistantPanelProps) {
  const { dataset } = useDataset();
  const { status } = useAiStatus();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [pending, setPending] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>([...SUGGESTED_QUESTIONS].slice(0, 4));
  const scrollRef = useRef<HTMLDivElement>(null);

  // Seed the greeting the first time the panel opens for a dataset.
  useEffect(() => {
    if (!open) return;
    setMessages((current) =>
      current.length > 0
        ? current
        : [
            {
              id: uid("msg"),
              role: "assistant",
              content: assistantGreeting(dataset, status.mode),
              createdAt: Date.now(),
              mode: status.mode,
            },
          ],
    );
  }, [open, dataset, status.mode]);

  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, pending]);

  const send = async (question: string) => {
    const trimmed = question.trim();
    if (!trimmed || pending) return;

    const userMessage: ChatMessage = {
      id: uid("msg"),
      role: "user",
      content: trimmed,
      createdAt: Date.now(),
    };

    setMessages((current) => [...current, userMessage]);
    setInput("");
    setPending(true);

    const response = await askDataForge({
      question: trimmed,
      dataset,
      history: [...messages, userMessage],
    });

    setMessages((current) => [
      ...current,
      {
        id: uid("msg"),
        role: "assistant",
        content: response.message,
        createdAt: Date.now(),
        mode: response.mode,
      },
    ]);
    if (response.suggestions?.length) setSuggestions(response.suggestions);
    setPending(false);
  };

  const reset = () => {
    setMessages([
      {
        id: uid("msg"),
        role: "assistant",
        content: assistantGreeting(dataset, status.mode),
        createdAt: Date.now(),
        mode: status.mode,
      },
    ]);
    setSuggestions([...SUGGESTED_QUESTIONS].slice(0, 4));
  };

  return (
    <AnimatePresence>
      {open ? (
        <>
          <motion.div
            className="fixed inset-0 z-[95] bg-base/60 backdrop-blur-sm sm:bg-transparent sm:backdrop-blur-0"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />
          <motion.aside
            initial={{ opacity: 0, y: 28, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.98 }}
            transition={{ duration: 0.34, ease: [0.22, 1, 0.36, 1] }}
            className="glass-strong fixed inset-x-3 bottom-3 top-16 bg-base-100/95 supports-[backdrop-filter]:bg-base-100/85 z-[96] flex flex-col overflow-hidden rounded-3xl sm:inset-auto sm:bottom-5 sm:right-5 sm:top-auto sm:h-[min(620px,calc(100vh-6rem))] sm:w-[420px]"
            role="dialog"
            aria-label="DataForge AI assistant"
          >
            <div className="pointer-events-none absolute inset-x-12 top-0 h-px bg-gradient-to-r from-transparent via-brand-cyan/60 to-transparent" />

            <header className="flex items-center justify-between gap-3 border-b border-white/[0.07] px-4 py-3.5">
              <div className="flex items-center gap-3">
                <Logo href="" compact idSuffix="assistant" />
                <div>
                  <p className="text-[13.5px] font-semibold text-ink">DataForge Assistant</p>
                  <p className="text-[11px] text-ink-faint">
                    {status.mode === "openai" ? `Powered by ${status.model}` : "Local analysis engine"}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-1.5">
                <button
                  onClick={reset}
                  aria-label="Clear conversation"
                  title="Clear conversation"
                  className="rounded-lg p-2 text-ink-faint transition-colors hover:bg-white/[0.06] hover:text-ink"
                >
                  <Eraser className="h-4 w-4" />
                </button>
                <button
                  onClick={onClose}
                  aria-label="Close assistant"
                  className="rounded-lg p-2 text-ink-faint transition-colors hover:bg-white/[0.06] hover:text-ink"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </header>

            <div ref={scrollRef} className="scroll-slim flex-1 space-y-4 overflow-y-auto px-4 py-4">
              {messages.map((message) => (
                <motion.div
                  key={message.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.28 }}
                  className={cn("flex", message.role === "user" ? "justify-end" : "justify-start")}
                >
                  {message.role === "user" ? (
                    <p className="max-w-[85%] rounded-2xl rounded-br-md border border-brand-violet/25 bg-brand-violet/15 px-3.5 py-2.5 text-[13.5px] leading-relaxed text-ink">
                      {message.content}
                    </p>
                  ) : (
                    <div className="max-w-[92%] rounded-2xl rounded-bl-md border border-white/[0.07] bg-white/[0.03] px-3.5 py-3">
                      <RichText content={message.content} />
                      {message.mode === "demo" ? (
                        <Badge tone="violet" className="mt-2.5 px-1.5 py-0.5 text-[10px]">
                          Demo engine
                        </Badge>
                      ) : null}
                    </div>
                  )}
                </motion.div>
              ))}

              {pending ? (
                <div className="rounded-2xl rounded-bl-md border border-white/[0.07] bg-white/[0.03] px-2.5">
                  <ThinkingDots />
                </div>
              ) : null}
            </div>

            {!pending ? (
              <div className="no-scrollbar flex gap-2 overflow-x-auto border-t border-white/[0.06] px-4 py-2.5">
                {suggestions.map((suggestion) => (
                  <button
                    key={suggestion}
                    onClick={() => send(suggestion)}
                    className="shrink-0 rounded-full border border-white/[0.09] bg-white/[0.03] px-3 py-1.5 text-[12px] text-ink-muted transition-colors hover:border-brand-cyan/35 hover:text-ink"
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            ) : null}

            <form
              onSubmit={(event) => {
                event.preventDefault();
                void send(input);
              }}
              className="flex items-end gap-2 border-t border-white/[0.07] p-3"
            >
              <div className="relative flex-1">
                <Sparkles className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-faint" />
                <input
                  value={input}
                  onChange={(event) => setInput(event.target.value)}
                  placeholder="Ask about your data..."
                  aria-label="Ask DataForge a question"
                  className="h-11 w-full rounded-xl border border-white/[0.09] bg-white/[0.04] pl-9 pr-3 text-[13.5px] text-ink placeholder:text-ink-faint focus:border-brand-cyan/45 focus:outline-none"
                />
              </div>
              <button
                type="submit"
                disabled={!input.trim() || pending}
                aria-label="Send question"
                className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[linear-gradient(120deg,#22D3EE,#8B5CF6)] text-white transition-opacity disabled:opacity-40"
              >
                <ArrowUp className="h-4 w-4" />
              </button>
            </form>
          </motion.aside>
        </>
      ) : null}
    </AnimatePresence>
  );
}
