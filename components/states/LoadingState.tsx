"use client";

import { motion } from "framer-motion";
import { Loader2, Sparkles } from "lucide-react";

interface LoadingStateProps {
  title?: string;
  message?: string;
  progress?: number;
}

export function LoadingState({ title = "Loading", message, progress }: LoadingStateProps) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="flex items-center justify-center min-h-[400px] py-12"
    >
      <div className="text-center space-y-6">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          className="flex justify-center"
        >
          <Loader2 className="w-12 h-12 text-brand-cyan" />
        </motion.div>

        <div className="space-y-2">
          <h3 className="text-xl font-semibold text-white">{title}</h3>
          {message && <p className="text-sm text-ink-muted">{message}</p>}
        </div>

        {progress !== undefined && (
          <div className="max-w-xs space-y-2">
            <motion.div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-gradient-to-r from-brand-cyan to-brand-purple"
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.5 }}
              />
            </motion.div>
            <p className="text-xs text-ink-muted">{progress}%</p>
          </div>
        )}

        <div className="flex justify-center gap-1 pt-4">
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
  );
}

interface SkeletonProps {
  count?: number;
  height?: string;
  width?: string;
}

export function Skeleton({ count = 1, height = "h-4", width = "w-full" }: SkeletonProps) {
  return (
    <div className="space-y-3">
      {Array.from({ length: count }).map((_, i) => (
        <motion.div
          key={i}
          className={`${width} ${height} bg-white/10 rounded-lg overflow-hidden`}
          animate={{
            opacity: [0.5, 1, 0.5],
          }}
          transition={{
            duration: 1.5,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      ))}
    </div>
  );
}

interface LoadingCardProps {
  count?: number;
}

export function LoadingCard({ count = 3 }: LoadingCardProps) {
  return (
    <div className="space-y-4">
      {Array.from({ length: count }).map((_, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.1 }}
          className="glass p-6 space-y-4"
        >
          <Skeleton height="h-6" width="w-1/3" />
          <Skeleton count={2} height="h-4" />
          <div className="flex gap-2">
            <Skeleton height="h-8" width="w-24" />
            <Skeleton height="h-8" width="w-24" />
          </div>
        </motion.div>
      ))}
    </div>
  );
}
