import { Fragment } from "react";
import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

/**
 * Minimal markdown renderer for assistant answers.
 * Supports **bold**, _italic_, `code`, bullet lists and paragraphs - enough
 * for analyst prose without pulling in a full markdown dependency.
 */
function renderInline(text: string, keyPrefix: string): ReactNode[] {
  const nodes: ReactNode[] = [];
  const pattern = /(\*\*[^*]+\*\*|(?<![A-Za-z0-9_])_[^_\n]+_(?![A-Za-z0-9_])|`[^`]+`)/g;
  let lastIndex = 0;
  let match: RegExpExecArray | null;
  let index = 0;

  while ((match = pattern.exec(text)) !== null) {
    if (match.index > lastIndex) nodes.push(text.slice(lastIndex, match.index));
    const token = match[0];
    const key = `${keyPrefix}-${index}`;
    index += 1;

    if (token.startsWith("**")) {
      nodes.push(
        <strong key={key} className="font-semibold text-ink">
          {token.slice(2, -2)}
        </strong>,
      );
    } else if (token.startsWith("`")) {
      nodes.push(
        <code
          key={key}
          className="rounded border border-white/10 bg-white/[0.06] px-1 py-0.5 font-mono text-[12px] text-brand-cyan"
        >
          {token.slice(1, -1)}
        </code>,
      );
    } else {
      nodes.push(
        <em key={key} className="text-ink-faint">
          {token.slice(1, -1)}
        </em>,
      );
    }
    lastIndex = pattern.lastIndex;
  }

  if (lastIndex < text.length) nodes.push(text.slice(lastIndex));
  return nodes;
}

export function RichText({ content, className }: { content: string; className?: string }) {
  const blocks = content.split("\n");

  return (
    <div className={cn("space-y-2 text-[13.5px] leading-relaxed text-ink-muted", className)}>
      {blocks.map((line, index) => {
        const trimmed = line.trim();
        if (trimmed === "") return <Fragment key={index} />;

        if (trimmed.startsWith("- ")) {
          return (
            <div key={index} className="flex gap-2.5 pl-1">
              <span className="mt-[7px] h-1 w-1 shrink-0 rounded-full bg-brand-cyan" />
              <p>{renderInline(trimmed.slice(2), `b${index}`)}</p>
            </div>
          );
        }

        if (/^\d+\.\s/.test(trimmed)) {
          const [, number, rest] = trimmed.match(/^(\d+)\.\s(.*)$/) ?? [];
          return (
            <div key={index} className="flex gap-2.5">
              <span className="text-[12px] font-semibold text-brand-purple">{number}.</span>
              <p>{renderInline(rest ?? "", `n${index}`)}</p>
            </div>
          );
        }

        return <p key={index}>{renderInline(trimmed, `p${index}`)}</p>;
      })}
    </div>
  );
}
