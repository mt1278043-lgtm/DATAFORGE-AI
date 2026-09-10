"use client";

import { useCallback, useEffect, useState } from "react";

import { safeJson } from "@/lib/utils";

/**
 * Persisted preference hook. Every access is wrapped so private-mode
 * browsers (where storage throws) never break the UI.
 */
export function useLocalStorage<T>(key: string, initialValue: T) {
  const [value, setValue] = useState<T>(initialValue);

  useEffect(() => {
    try {
      const stored = window.localStorage.getItem(key);
      if (stored !== null) setValue(safeJson<T>(stored, initialValue));
    } catch {
      /* storage unavailable - keep the in-memory default */
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);

  const update = useCallback(
    (next: T) => {
      setValue(next);
      try {
        window.localStorage.setItem(key, JSON.stringify(next));
      } catch {
        /* ignore quota / private mode errors */
      }
    },
    [key],
  );

  return [value, update] as const;
}
