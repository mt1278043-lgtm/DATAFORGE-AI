import { NextResponse } from "next/server";

import { hasOpenAiKey } from "@/lib/ai/openai";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export interface AiStatusResponse {
  mode: "openai" | "demo";
  online: boolean;
  model: string | null;
  label: string;
}

/**
 * GET /api/ai/status
 * Lets the UI show "AI Engine Online" vs. "Demo Mode" without ever shipping
 * the API key - only the boolean result of the check crosses the wire.
 */
export async function GET(): Promise<NextResponse<AiStatusResponse>> {
  const configured = hasOpenAiKey();

  return NextResponse.json({
    mode: configured ? "openai" : "demo",
    online: true,
    model: configured ? process.env.OPENAI_MODEL || "gpt-4o-mini" : null,
    label: configured ? "AI Engine Online" : "Demo AI Engine",
  });
}
