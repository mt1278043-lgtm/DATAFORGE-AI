import { NextResponse } from "next/server";
import { z } from "zod";

import { datasetContextSchema } from "@/lib/ai/context";
import { answerFromContext, suggestFollowUps } from "@/lib/ai/demoEngine";
import { OpenAiError, askOpenAi, hasOpenAiKey } from "@/lib/ai/openai";
import type { AiChatResponse } from "@/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const requestSchema = z.object({
  question: z.string().min(1).max(2000),
  context: datasetContextSchema,
  history: z
    .array(z.object({ role: z.enum(["user", "assistant"]), content: z.string().max(4000) }))
    .max(12)
    .optional(),
});

/**
 * POST /api/ai/chat
 *
 * Server-side AI entry point. When `OPENAI_API_KEY` is present the question is
 * forwarded to OpenAI with a compact dataset profile; otherwise the request is
 * answered by the deterministic demo engine. The key is never exposed to the
 * browser, and the raw dataset never leaves the client.
 */
export async function POST(request: Request): Promise<NextResponse<AiChatResponse>> {
  let payload: unknown;

  try {
    payload = await request.json();
  } catch {
    return NextResponse.json(
      { message: "That request could not be read. Please try again.", mode: "demo" },
      { status: 400 },
    );
  }

  const parsed = requestSchema.safeParse(payload);
  if (!parsed.success) {
    return NextResponse.json(
      { message: "That request was missing dataset context. Reload the page and try again.", mode: "demo" },
      { status: 422 },
    );
  }

  const { question, context, history } = parsed.data;

  if (!hasOpenAiKey()) {
    return NextResponse.json({
      message: answerFromContext(question, context),
      mode: "demo",
      suggestions: suggestFollowUps(context),
    });
  }

  try {
    const message = await askOpenAi(question, context, history ?? []);
    return NextResponse.json({ message, mode: "openai", suggestions: suggestFollowUps(context) });
  } catch (error) {
    // Never surface provider internals - degrade gracefully to demo mode.
    const note =
      error instanceof OpenAiError
        ? `${error.message} Answering from the local analysis engine instead.`
        : "The AI provider is unavailable. Answering from the local analysis engine instead.";

    return NextResponse.json({
      message: `${answerFromContext(question, context)}\n\n${note}`,
      mode: "demo",
      suggestions: suggestFollowUps(context),
    });
  }
}
