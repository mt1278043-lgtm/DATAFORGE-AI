import "server-only";

import { SYSTEM_PROMPT, contextToPrompt, type DatasetContext } from "@/lib/ai/context";

const OPENAI_URL = "https://api.openai.com/v1/chat/completions";
const DEFAULT_MODEL = "gpt-4o-mini";
const TIMEOUT_MS = 25_000;

/** True when a server-side OpenAI key is configured. */
export function hasOpenAiKey(): boolean {
  return Boolean(process.env.OPENAI_API_KEY && process.env.OPENAI_API_KEY.trim().length > 10);
}

export interface OpenAiTurn {
  role: "user" | "assistant";
  content: string;
}

export class OpenAiError extends Error {
  readonly status: number;

  constructor(message: string, status = 500) {
    super(message);
    this.name = "OpenAiError";
    this.status = status;
  }
}

/**
 * Calls the OpenAI Chat Completions API from the server.
 * The API key never leaves this module - it is read from `process.env` inside
 * a route handler and is never bundled into client code.
 */
export async function askOpenAi(
  question: string,
  context: DatasetContext,
  history: OpenAiTurn[] = [],
): Promise<string> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) throw new OpenAiError("No API key configured", 501);

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), TIMEOUT_MS);

  try {
    const response = await fetch(OPENAI_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      signal: controller.signal,
      body: JSON.stringify({
        model: process.env.OPENAI_MODEL || DEFAULT_MODEL,
        temperature: 0.3,
        max_tokens: 700,
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          { role: "system", content: contextToPrompt(context) },
          ...history.slice(-8),
          { role: "user", content: question },
        ],
      }),
    });

    if (!response.ok) {
      const status = response.status;
      const message =
        status === 401
          ? "The configured OpenAI API key was rejected."
          : status === 429
            ? "OpenAI rate limit reached."
            : "The AI provider returned an error.";
      throw new OpenAiError(message, status);
    }

    const payload = (await response.json()) as {
      choices?: { message?: { content?: string } }[];
    };
    const content = payload.choices?.[0]?.message?.content?.trim();
    if (!content) throw new OpenAiError("The AI provider returned an empty response.", 502);
    return content;
  } catch (error) {
    if (error instanceof OpenAiError) throw error;
    if (error instanceof Error && error.name === "AbortError") {
      throw new OpenAiError("The AI provider timed out.", 504);
    }
    throw new OpenAiError("Could not reach the AI provider.", 502);
  } finally {
    clearTimeout(timeout);
  }
}
