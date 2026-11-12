/**
 * Enkel tekstformatering i tekstblokkene, uten HTML:
 *
 *   ## Overskrift          ### Mindre overskrift
 *   - punkt                1. nummerert punkt
 *   **fet**  *kursiv*      [lenketekst](https://eksempel.no)
 *
 * Tom linje gir nytt avsnitt. Teksten blir React-elementer, aldri HTML, så
 * innholdet kan ikke kjøre skript. Lenker tillates bare til http(s), e-post,
 * telefon og adresser på samme side.
 */

import type { ReactNode } from "react";

export type RichBlock =
  | { type: "heading"; level: 3 | 4; text: string }
  | { type: "list"; ordered: boolean; items: string[] }
  | { type: "paragraph"; lines: string[] };

const SAFE_HREF = /^(https?:\/\/[^\s]+|mailto:[^\s]+|tel:[+0-9 ()-]+|\/[^\s]*|#[\w-]+)$/i;

export function isSafeHref(href: string): boolean {
  return SAFE_HREF.test(href);
}

export function parseRichText(source: string): RichBlock[] {
  const blocks: RichBlock[] = [];
  const chunks = source
    .replace(/\r\n?/g, "\n")
    .split(/\n{2,}/)
    .map((chunk) => chunk.trim())
    .filter(Boolean);
  for (const chunk of chunks) {
    const lines = chunk.split("\n").map((line) => line.trim());
    const first = lines[0] ?? "";
    if (lines.length === 1 && /^#{2,3}\s+\S/.test(first)) {
      const level = first.startsWith("###") ? 4 : 3;
      blocks.push({ type: "heading", level, text: first.replace(/^#{2,3}\s+/, "") });
      continue;
    }
    if (lines.every((line) => /^[-*]\s+\S/.test(line))) {
      blocks.push({ type: "list", ordered: false, items: lines.map((line) => line.replace(/^[-*]\s+/, "")) });
      continue;
    }
    if (lines.every((line) => /^\d+[.)]\s+\S/.test(line))) {
      blocks.push({ type: "list", ordered: true, items: lines.map((line) => line.replace(/^\d+[.)]\s+/, "")) });
      continue;
    }
    blocks.push({ type: "paragraph", lines });
  }
  return blocks;
}

const INLINE = /(\*\*[^*\n]+\*\*|\*[^*\s][^*\n]*\*|\[[^\]\n]+\]\([^)\s]+\))/g;

/** Fet, kursiv og lenker i én linje. */
export function renderInline(text: string, keyPrefix: string): ReactNode[] {
  const nodes: ReactNode[] = [];
  let last = 0;
  let index = 0;
  for (const match of text.matchAll(INLINE)) {
    const token = match[0];
    const start = match.index ?? 0;
    if (start > last) {
      nodes.push(text.slice(last, start));
    }
    const key = `${keyPrefix}-${index++}`;
    if (token.startsWith("**")) {
      nodes.push(<strong key={key}>{token.slice(2, -2)}</strong>);
    } else if (token.startsWith("[")) {
      const link = /^\[([^\]]+)\]\(([^)\s]+)\)$/.exec(token);
      const label = link?.[1] ?? token;
      const href = link?.[2] ?? "";
      if (isSafeHref(href)) {
        const external = /^https?:/i.test(href);
        nodes.push(
          <a key={key} href={href} rel={external ? "noopener noreferrer" : undefined} target={external ? "_blank" : undefined} className="underline underline-offset-2">
            {label}
          </a>,
        );
      } else {
        nodes.push(label);
      }
    } else {
      nodes.push(<em key={key}>{token.slice(1, -1)}</em>);
    }
    last = start + token.length;
  }
  if (last < text.length) {
    nodes.push(text.slice(last));
  }
  return nodes;
}

export function RichText({ source, className }: { source: string; className?: string }) {
  const blocks = parseRichText(source);
  if (blocks.length === 0) {
    return null;
  }
  return (
    <div className={className}>
      {blocks.map((block, index) => {
        const key = `r${index}`;
        switch (block.type) {
          case "heading":
            return block.level === 3 ? (
              <h3 key={key} className="site-heading mt-6 mb-2 text-xl font-semibold first:mt-0">
                {renderInline(block.text, key)}
              </h3>
            ) : (
              <h4 key={key} className="site-heading mt-5 mb-2 text-lg font-semibold first:mt-0">
                {renderInline(block.text, key)}
              </h4>
            );
          case "list": {
            const items = block.items.map((item, itemIndex) => <li key={`${key}-${itemIndex}`}>{renderInline(item, `${key}-${itemIndex}`)}</li>);
            return block.ordered ? (
              <ol key={key} className="mb-4 list-decimal space-y-1 pl-6">
                {items}
              </ol>
            ) : (
              <ul key={key} className="mb-4 list-disc space-y-1 pl-6">
                {items}
              </ul>
            );
          }
          case "paragraph":
            return (
              <p key={key} className="mb-4 leading-relaxed last:mb-0">
                {block.lines.flatMap((line, lineIndex) => [
                  ...(lineIndex > 0 ? [<br key={`${key}-br-${lineIndex}`} />] : []),
                  ...renderInline(line, `${key}-${lineIndex}`),
                ])}
              </p>
            );
        }
      })}
    </div>
  );
}
