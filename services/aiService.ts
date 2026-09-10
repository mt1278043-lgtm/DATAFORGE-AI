import { buildDatasetContext, type DatasetContext } from "@/lib/ai/context";
import { answerFromContext, suggestFollowUps } from "@/lib/ai/demoEngine";
import type { AiChatResponse, ChatMessage, Dataset } from "@/types";
import type { AiStatusResponse } from "@/app/api/ai/status/route";

/**
 * Client-facing AI abstraction.
 *
 * The UI only ever talks to this module, so swapping OpenAI for another
 * provider (or a real RAG backend) is a single-file change.
 */

const CHAT_ENDPOINT = "/api/ai/chat";
const STATUS_ENDPOINT = "/api/ai/status";

export async function fetchAiStatus(): Promise<AiStatusResponse> {
  try {
    const response = await fetch(STATUS_ENDPOINT, { cache: "no-store" });
    if (!response.ok) throw new Error("status");
    return (await response.json()) as AiStatusResponse;
  } catch {
    return { mode: "demo", online: true, model: null, label: "Demo AI Engine" };
  }
}

export interface AskOptions {
  question: string;
  dataset: Dataset;
  history?: ChatMessage[];
}

/**
 * Sends a question to the server route. If the network call fails for any
 * reason the deterministic demo engine answers locally, so the assistant is
 * never dead in the water.
 */
export async function askDataForge({ question, dataset, history = [] }: AskOptions): Promise<AiChatResponse> {
  const context: DatasetContext = buildDatasetContext(dataset);

  try {
    const response = await fetch(CHAT_ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        question,
        context,
        history: history
          .filter((m) => m.role !== "system")
          .slice(-8)
          .map((m) => ({ role: m.role as "user" | "assistant", content: m.content })),
      }),
    });

    if (!response.ok) throw new Error(`Request failed: ${response.status}`);
    return (await response.json()) as AiChatResponse;
  } catch {
    return {
      message: answerFromContext(question, context),
      mode: "demo",
      suggestions: suggestFollowUps(context),
    };
  }
}

/** Builds the greeting shown when the assistant opens. */
export function assistantGreeting(dataset: Dataset, mode: "openai" | "demo"): string {
  return [
    `I have profiled **${dataset.meta.name}** - ${dataset.rowCount.toLocaleString()} rows across ${dataset.columnCount} columns.`,
    "",
    "Ask me anything about it: trends, anomalies, top performers, data quality, or what to do next.",
    mode === "demo"
      ? "\nDemo mode: answers are computed locally from your dataset profile."
      : "",
  ]
    .filter(Boolean)
    .join("\n");
}
