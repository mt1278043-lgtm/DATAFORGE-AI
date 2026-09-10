"use client";

import { useEffect, useState } from "react";

import { fetchAiStatus } from "@/services/aiService";
import type { AiStatusResponse } from "@/app/api/ai/status/route";

const FALLBACK: AiStatusResponse = {
  mode: "demo",
  online: true,
  model: null,
  label: "Demo AI Engine",
};

/**
 * Reads the AI engine status once per mount.
 * The API key itself never reaches the browser - only the resulting mode.
 */
export function useAiStatus() {
  const [status, setStatus] = useState<AiStatusResponse>(FALLBACK);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    fetchAiStatus()
      .then((result) => {
        if (active) setStatus(result);
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  return { status, loading, isDemoAi: status.mode === "demo" };
}
