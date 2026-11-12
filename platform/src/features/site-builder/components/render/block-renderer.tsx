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
import {
  NordicGalleryBlock,
  NordicHeroBlock,
  NordicKeyFiguresBlock,
  NordicProgressBlock,
  NordicTextImageBlock,
} from "@/features/site-builder/components/render/nordic-blocks";
import { LeadFormBlock, SelectorBlock, UnitListBlock } from "@/features/site-builder/components/render/unit-blocks";
import type { SiteRenderData } from "@/features/site-builder/site";

/**
 * Blokken i designstilen til siden. Hero, tekst og bilde, galleri, nøkkeltall og
 * fremdrift er bygget annerledes i Nordisk. De andre blokkene er de samme, men
 * får typografien og fargene fra stilen (nordic:-klasser i komponentene).
 */
export function BlockRenderer({ block, data, isFirst }: { block: Block; data: SiteRenderData; isFirst: boolean }) {
  const nordic = data.theme.style === "nordic";
  switch (block.type) {
    case "hero":
      return nordic ? <NordicHeroBlock block={block} data={data} isFirst={isFirst} /> : <HeroBlock block={block} data={data} isFirst={isFirst} />;
    case "text":
      return <TextBlock block={block} data={data} isFirst={isFirst} />;
    case "text_image":
      return nordic ? (
        <NordicTextImageBlock block={block} data={data} isFirst={isFirst} />
      ) : (
        <TextImageBlock block={block} data={data} isFirst={isFirst} />
      );
    case "gallery":
      return nordic ? <NordicGalleryBlock block={block} data={data} isFirst={isFirst} /> : <GalleryBlock block={block} data={data} isFirst={isFirst} />;
    case "key_figures":
      return nordic ? (
        <NordicKeyFiguresBlock block={block} data={data} isFirst={isFirst} />
      ) : (
        <KeyFiguresBlock block={block} data={data} isFirst={isFirst} />
      );
    case "progress":
      return nordic ? <NordicProgressBlock block={block} data={data} isFirst={isFirst} /> : <ProgressBlock block={block} data={data} isFirst={isFirst} />;
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
