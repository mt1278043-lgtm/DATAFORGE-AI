"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  MessageCircle,
  Send,
  Lightbulb,
  X,
  ChevronDown,
  Sparkles,
} from "lucide-react";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

interface Suggestion {
  icon: React.ReactNode;
  title: string;
  description: string;
  prompt: string;
}

const SUGGESTED_PROMPTS: Suggestion[] = [
  {
    icon: <Sparkles className="w-4 h-4" />,
    title: "Find Anomalies",
    description: "Detect unusual patterns in data",
    prompt: "What anomalies or outliers have you detected in this dataset?",
  },
  {
    icon: <Sparkles className="w-4 h-4" />,
    title: "Top Insights",
    description: "Key findings from analysis",
    prompt: "What are the top 3 insights from this data?",
  },
  {
    icon: <Sparkles className="w-4 h-4" />,
    title: "Correlations",
    description: "Variable relationships",
    prompt: "Which variables are most strongly correlated?",
  },
  {
    icon: <Sparkles className="w-4 h-4" />,
    title: "Recommendations",
    description: "Actionable next steps",
    prompt: "What actions would you recommend based on this data?",
  },
];

export function DataCopilot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      role: "assistant",
      content:
        "Hi! I'm your Data Copilot. I can help you analyze your dataset, find insights, and answer questions about your data. What would you like to explore?",
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSendMessage = async () => {
    if (!input.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: input,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    // Simulate AI response
    setTimeout(() => {
      const responses = [
        "Based on the data analysis, I've identified several key patterns that might interest you.",
        "I've analyzed your dataset and found some interesting correlations between variables.",
        "Your data shows strong trends in this area. Would you like me to dive deeper?",
        "I can see clear opportunities for improvement in this metric.",
      ];

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: responses[Math.floor(Math.random() * responses.length)],
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, assistantMessage]);
      setIsLoading(false);
    }, 1000);
  };

  const handleSuggestedPrompt = (prompt: string) => {
    setInput(prompt);
  };

  return (
    <>
      {/* Floating Button */}
      <motion.button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-8 right-8 z-30 p-4 rounded-full bg-gradient-to-br from-brand-cyan to-brand-purple text-white shadow-lg hover:shadow-xl transition"
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
      >
        <MessageCircle className="w-6 h-6" />
      </motion.button>

      {/* Chat Panel */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40 lg:hidden"
            />

            {/* Chat Window */}
            <motion.div
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.95 }}
              className="fixed bottom-24 right-8 w-96 max-w-[calc(100vw-32px)] h-[600px] rounded-2xl bg-gradient-to-b from-base-100 to-base border border-white/10 shadow-2xl z-50 flex flex-col overflow-hidden"
            >
              {/* Header */}
              <div className="bg-gradient-to-r from-brand-cyan/20 to-brand-purple/20 backdrop-blur-lg border-b border-white/10 px-6 py-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full bg-brand-cyan animate-pulse" />
                  <div>
                    <h3 className="font-semibold text-white">Data Copilot</h3>
                    <p className="text-xs text-ink-muted">Online & ready to help</p>
                  </div>
                </div>
                <button
                  onClick={() => setIsOpen(false)}
                  className="text-ink-muted hover:text-white transition"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto space-y-4 p-6 scroll-smooth">
                {messages.map((msg) => (
                  <motion.div
                    key={msg.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                  >
                    <div
                      className={`max-w-xs px-4 py-2 rounded-lg ${
                        msg.role === "user"
                          ? "bg-brand-cyan/20 text-white"
                          : "bg-white/10 text-ink-muted"
                      }`}
                    >
                      <p className="text-sm leading-relaxed">{msg.content}</p>
                    </div>
                  </motion.div>
                ))}

                {isLoading && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex justify-start"
                  >
                    <div className="bg-white/10 text-ink-muted px-4 py-2 rounded-lg">
                      <div className="flex gap-2">
                        {[0, 1, 2].map((i) => (
                          <motion.div
                            key={i}
                            className="w-2 h-2 rounded-full bg-brand-cyan"
                            animate={{ y: [0, -8, 0] }}
                            transition={{
                              duration: 1,
                              delay: i * 0.2,
                              repeat: Infinity,
                            }}
                          />
                        ))}
                      </div>
                    </div>
                  </motion.div>
                )}
              </div>

              {/* Suggestions (shown when no messages) */}
              {messages.length === 1 && !isLoading && (
                <div className="px-6 py-4 space-y-3 border-t border-white/10">
                  <p className="text-xs text-ink-faint font-semibold uppercase">
                    Suggested Prompts
                  </p>
                  <div className="space-y-2">
                    {SUGGESTED_PROMPTS.map((suggestion, idx) => (
                      <motion.button
                        key={idx}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: idx * 0.05 }}
                        onClick={() => handleSuggestedPrompt(suggestion.prompt)}
                        className="w-full text-left p-2 rounded-lg bg-white/5 hover:bg-white/10 transition"
                      >
                        <div className="flex items-start gap-2">
                          <span className="text-brand-cyan mt-0.5">{suggestion.icon}</span>
                          <div>
                            <p className="text-xs font-semibold text-white">
                              {suggestion.title}
                            </p>
                            <p className="text-xs text-ink-muted line-clamp-1">
                              {suggestion.description}
                            </p>
                          </div>
                        </div>
                      </motion.button>
                    ))}
                  </div>
                </div>
              )}

              {/* Input */}
              <div className="border-t border-white/10 px-6 py-4 space-y-3">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyPress={(e) => {
                      if (e.key === "Enter") handleSendMessage();
                    }}
                    placeholder="Ask about your data..."
                    className="flex-1 px-3 py-2 rounded-lg bg-white/10 border border-white/20 text-white placeholder-ink-muted focus:outline-none focus:border-brand-cyan text-sm"
                  />
                  <button
                    onClick={handleSendMessage}
                    disabled={!input.trim() || isLoading}
                    className="p-2 rounded-lg bg-brand-cyan/20 hover:bg-brand-cyan/30 text-brand-cyan disabled:opacity-50 disabled:cursor-not-allowed transition"
                  >
                    <Send className="w-4 h-4" />
                  </button>
                </div>
                <p className="text-xs text-ink-faint text-center">
                  Powered by AI • Press Enter to send
                </p>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
