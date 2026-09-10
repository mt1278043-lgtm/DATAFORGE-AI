"use client";

import { useEffect, useRef, useState } from "react";

interface CountUpOptions {
  duration?: number;
  delay?: number;
  enabled?: boolean;
}

/**
 * Animates a number from 0 to `target` with an ease-out curve.
 * Respects `prefers-reduced-motion` by jumping straight to the value.
 */
export function useCountUp(target: number, options: CountUpOptions = {}): number {
  const { duration = 1400, delay = 0, enabled = true } = options;
  const [value, setValue] = useState(0);
  const frame = useRef<number | null>(null);

  useEffect(() => {
    if (!enabled || !Number.isFinite(target)) {
      setValue(target);
      return;
    }

    const reduced =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (reduced || duration <= 0) {
      setValue(target);
      return;
    }

    let start: number | null = null;
    let timeout: number | null = null;

    const step = (timestamp: number) => {
      if (start === null) start = timestamp;
      const progress = Math.min((timestamp - start) / duration, 1);
      const eased = 1 - (1 - progress) ** 3;
      setValue(target * eased);
      if (progress < 1) frame.current = window.requestAnimationFrame(step);
    };

    timeout = window.setTimeout(() => {
      frame.current = window.requestAnimationFrame(step);
    }, delay);

    return () => {
      if (frame.current) window.cancelAnimationFrame(frame.current);
      if (timeout) window.clearTimeout(timeout);
    };
  }, [target, duration, delay, enabled]);

  return value;
}
