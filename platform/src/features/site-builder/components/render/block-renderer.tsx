"use client";

import type { Block } from "@/features/site-builder/blocks";
import {
  ButtonBlock,
  ContactsBlock,
  DocumentsBlock,
  EmbedBlock,
  FaqBlock,
  GalleryBlock,
  HeroBlock,
  KeyFiguresBlock,
  NewsBlock,
  ProgressBlock,
  TextBlock,
  TextImageBlock,
  VideoBlock,
  ViewingsBlock,
} from "@/features/site-builder/components/render/content-blocks";
import { MapBlock } from "@/features/site-builder/components/render/map-block";
import { LeadFormBlock, SelectorBlock, UnitListBlock } from "@/features/site-builder/components/render/unit-blocks";
import type { SiteRenderData } from "@/features/site-builder/site";

export function BlockRenderer({ block, data, isFirst }: { block: Block; data: SiteRenderData; isFirst: boolean }) {
  switch (block.type) {
    case "hero":
      return <HeroBlock block={block} data={data} isFirst={isFirst} />;
    case "text":
      return <TextBlock block={block} data={data} isFirst={isFirst} />;
    case "text_image":
      return <TextImageBlock block={block} data={data} isFirst={isFirst} />;
    case "gallery":
      return <GalleryBlock block={block} data={data} isFirst={isFirst} />;
    case "key_figures":
      return <KeyFiguresBlock block={block} data={data} isFirst={isFirst} />;
    case "progress":
      return <ProgressBlock block={block} data={data} isFirst={isFirst} />;
    case "selector":
      return <SelectorBlock block={block} data={data} isFirst={isFirst} />;
    case "unit_list":
      return <UnitListBlock block={block} data={data} isFirst={isFirst} />;
    case "map":
      return <MapBlock block={block} data={data} isFirst={isFirst} />;
    case "viewings":
      return <ViewingsBlock block={block} data={data} isFirst={isFirst} />;
    case "contacts":
      return <ContactsBlock block={block} data={data} isFirst={isFirst} />;
    case "lead_form":
      return <LeadFormBlock block={block} data={data} isFirst={isFirst} />;
    case "documents":
      return <DocumentsBlock block={block} data={data} isFirst={isFirst} />;
    case "video":
      return <VideoBlock block={block} data={data} isFirst={isFirst} />;
    case "faq":
      return <FaqBlock block={block} data={data} isFirst={isFirst} />;
    case "news":
      return <NewsBlock block={block} data={data} isFirst={isFirst} />;
    case "button":
      return <ButtonBlock block={block} data={data} isFirst={isFirst} />;
    case "embed":
      return <EmbedBlock block={block} data={data} isFirst={isFirst} />;
  }
}
