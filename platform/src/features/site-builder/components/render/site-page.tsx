"use client";

import { BlockRenderer } from "@/features/site-builder/components/render/block-renderer";
import type { Block } from "@/features/site-builder/blocks";
import type { SiteRenderData } from "@/features/site-builder/site";

/**
 * Blokkene på en side. Siden har alltid én h1: overskriften i en hero som
 * står først, ellers sidetittelen (skjult for øyet, men lest av skjermlesere).
 */
export function SitePageBlocks({ data, blocks }: { data: SiteRenderData; blocks: Block[] }) {
  const visible = blocks.filter((block) => !block.hidden || data.mode === "editor");
  const heroFirst = visible[0]?.type === "hero";
  return (
    <>
      {heroFirst ? null : <h1 className="sr-only">{data.page?.title ?? data.project.name}</h1>}
      {visible.map((block, index) => (
        <div key={block.id} data-hidden-block={block.hidden ? "true" : undefined} className={block.hidden ? "opacity-40" : undefined}>
          <BlockRenderer block={block} data={data} isFirst={index === 0} />
        </div>
      ))}
    </>
  );
}
