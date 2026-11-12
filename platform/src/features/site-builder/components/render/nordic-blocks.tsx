"use client";

import {
  BanknoteIcon,
  BedDoubleIcon,
  CircleDotIcon,
  HardHatIcon,
  HouseIcon,
  KeyRoundIcon,
  LayersIcon,
  PencilRulerIcon,
  RulerIcon,
  SparklesIcon,
  SunIcon,
  TagIcon,
  CarIcon,
  type LucideIcon,
} from "lucide-react";
import { useTranslations } from "next-intl";

import type { KeyFigureSource } from "@/features/site-builder/blocks";
import {
  useHeroStatusText,
  useKeyFigureItems,
  useProgressItems,
  type RenderBlockProps,
} from "@/features/site-builder/components/render/content-blocks";
import { BlockSection, BlockTitle, EditorHint, IconCircle, SiteImage, SiteLinkButton } from "@/features/site-builder/components/render/primitives";
import { RichText } from "@/features/site-builder/rich-text";
import { projectAddress, resolveLink } from "@/features/site-builder/site";
import { cn } from "@/lib/utils";

/**
 * Blokkene som er bygget annerledes i designstilen Nordisk: store bilder kant
 * i kant, tynn skrift, små overtitler med store bokstaver, tynne skillelinjer og
 * ikoner i sirkler. Innholdet og feltene er de samme som i Klassisk.
 */

const editing = (mode: string) => mode !== "published";

// -----------------------------------------------------------------------------
// Hero
// -----------------------------------------------------------------------------

export function NordicHeroBlock({ block, data, isFirst }: RenderBlockProps<"hero">) {
  const { props } = block;
  const image = props.image_asset_id ? data.assets[props.image_asset_id] : undefined;
  const link = resolveLink(data, props.cta_link);
  const status = useHeroStatusText(block, data);
  const Heading = isFirst ? "h1" : "h2";
  const headingId = `${block.id}-heading`;
  const address = projectAddress(data.project);
  const center = props.align === "center";
  return (
    <section
      id={block.id}
      data-block-id={block.id}
      aria-labelledby={headingId}
      className={cn(
        "relative isolate flex scroll-mt-24 flex-col overflow-hidden",
        props.height === "medium" && "min-h-[26rem] sm:min-h-[32rem]",
        props.height === "large" && "min-h-[34rem] sm:min-h-[42rem]",
        // Som første blokk ligger menyen over heroen, så den fyller hele skjermen.
        props.height === "full" && (isFirst ? "min-h-svh" : "min-h-[calc(100svh-5rem)]"),
        image ? "text-white" : "bg-[var(--site-primary)] text-[var(--site-primary-foreground)]",
      )}
    >
      {image ? (
        <>
          <SiteImage asset={image} sizes="100vw" priority={isFirst} alt="" className="absolute inset-0 -z-20 size-full object-cover" />
          <div className="absolute inset-0 -z-10 bg-black" style={{ opacity: props.overlay / 100 }} aria-hidden="true" />
          {/* Mørkere øverst (menyen), i midten (teksten) og nederst (adressen): hvit tekst får nok kontrast også over lyse bilder. */}
          <div className="absolute inset-0 -z-10 bg-linear-to-b from-black/55 via-black/35 to-black/70" aria-hidden="true" />
        </>
      ) : null}
      <div className={cn("mx-auto flex w-full max-w-6xl flex-1 flex-col px-4 sm:px-6", isFirst ? "pt-24" : "pt-12")}>
        <div className={cn("flex flex-1 flex-col justify-center py-12 sm:py-16", center ? "items-center text-center" : "items-start")}>
          {props.eyebrow ? <p className="mb-6 text-xs tracking-[0.28em] uppercase">{props.eyebrow}</p> : null}
          <Heading id={headingId} className="site-heading max-w-4xl text-4xl leading-[1.1] font-light text-balance sm:text-6xl lg:text-7xl">
            {props.title || data.project.name}
          </Heading>
          {props.subtitle ? <p className="mt-6 max-w-2xl text-lg font-light text-pretty sm:text-xl">{props.subtitle}</p> : null}
          {status ? <p className="mt-8 text-2xl font-light sm:text-3xl">{status}</p> : null}
          {props.cta_label && link ? (
            <SiteLinkButton href={link.href} external={link.external} variant="inverted" className="mt-10">
              {props.cta_label}
            </SiteLinkButton>
          ) : null}
        </div>
        {address ? (
          <p className="flex flex-wrap justify-between gap-x-6 gap-y-1 border-t border-current/40 py-5 text-[0.6875rem] tracking-[0.24em] uppercase">
            <span>{data.project.name}</span>
            <span>{address}</span>
          </p>
        ) : null}
      </div>
    </section>
  );
}

// -----------------------------------------------------------------------------
// Tekst og bilde: bildet går helt ut til kanten, med ett stort avrundet hjørne
// -----------------------------------------------------------------------------

export function NordicTextImageBlock({ block, data }: RenderBlockProps<"text_image">) {
  const t = useTranslations("site.editor");
  const { props } = block;
  const image = props.image_asset_id ? data.assets[props.image_asset_id] : undefined;
  const headingId = `${block.id}-heading`;
  const imageLeft = props.image_position === "left";
  if (!image && !editing(data.mode)) {
    // Uten bilde vises bare teksten, ikke en tom flate der bildet skulle stått.
    return (
      <BlockSection id={block.id} headingId={props.heading ? headingId : undefined}>
        <div className="max-w-3xl">
          <BlockTitle id={headingId} eyebrow={props.eyebrow} heading={props.heading} />
          <RichText source={props.body} className="text-lg leading-relaxed" />
        </div>
      </BlockSection>
    );
  }
  return (
    <section id={block.id} data-block-id={block.id} aria-labelledby={props.heading ? headingId : undefined} className="grid scroll-mt-24 lg:grid-cols-2">
      <div className={cn("relative min-h-[20rem] sm:min-h-[28rem] lg:min-h-[40rem]", imageLeft ? "lg:order-1" : "lg:order-2")}>
        {image ? (
          <SiteImage
            asset={image}
            sizes="(min-width: 1024px) 50vw, 100vw"
            className={cn(
              "absolute inset-0 size-full object-cover",
              imageLeft ? "rounded-br-[4rem] lg:rounded-br-[9rem]" : "rounded-bl-[4rem] lg:rounded-bl-[9rem]",
            )}
          />
        ) : (
          <div className="absolute inset-4 flex items-center">
            <EditorHint>{t("missingImage")}</EditorHint>
          </div>
        )}
      </div>
      {/* Teksten står på linje med resten av siden (maks 72rem bred, midtstilt). */}
      <div
        className={cn(
          "flex items-center px-4 py-16 sm:px-6 lg:py-24",
          imageLeft ? "lg:order-2 lg:pr-[max(1.5rem,calc(50vw-36rem+1.5rem))] lg:pl-16" : "lg:order-1 lg:pr-16 lg:pl-[max(1.5rem,calc(50vw-36rem+1.5rem))]",
        )}
      >
        <div className="max-w-xl">
          <BlockTitle id={headingId} eyebrow={props.eyebrow} heading={props.heading} />
          <RichText source={props.body} className="text-lg leading-relaxed" />
        </div>
      </div>
    </section>
  );
}

// -----------------------------------------------------------------------------
// Nøkkeltall: liste med ikon, merkelapp og verdi
// -----------------------------------------------------------------------------

/** Ikon for et eget nøkkeltall, gjettet fra merkelappen («Soverom», «Parkering» …). */
function customFigureIcon(label: string): LucideIcon {
  const text = label.toLowerCase();
  if (/sov|bed/.test(text)) {
    return BedDoubleIcon;
  }
  if (/park|bil|garasje|car/.test(text)) {
    return CarIcon;
  }
  if (/uteplass|balkong|terrasse|hage|sol|outdoor|balcon|garden/.test(text)) {
    return SunIcon;
  }
  if (/etasje|etg|floor|vån/.test(text)) {
    return LayersIcon;
  }
  if (/pris|\bkr\b|kost|price/.test(text)) {
    return BanknoteIcon;
  }
  if (/m²|m2|areal|størrelse|bra|size|area|storlek/.test(text)) {
    return RulerIcon;
  }
  if (/bolig|enhet|leilighet|home|unit|bostad/.test(text)) {
    return HouseIcon;
  }
  return SparklesIcon;
}

const FIGURE_ICONS: Record<Exclude<KeyFigureSource, "custom">, LucideIcon> = {
  units_total: HouseIcon,
  available: KeyRoundIcon,
  size_range: RulerIcon,
  rooms_range: BedDoubleIcon,
  price_from: BanknoteIcon,
};

export function NordicKeyFiguresBlock({ block, data }: RenderBlockProps<"key_figures">) {
  const tEditor = useTranslations("site.editor");
  const headingId = `${block.id}-heading`;
  const items = useKeyFigureItems(block, data);
  if (items.length === 0) {
    return editing(data.mode) ? (
      <BlockSection id={block.id}>
        <EditorHint>{tEditor("emptyKeyFigures")}</EditorHint>
      </BlockSection>
    ) : null;
  }
  return (
    <BlockSection id={block.id} headingId={block.props.heading ? headingId : undefined}>
      <div className="grid gap-10 lg:grid-cols-12 lg:gap-16">
        <BlockTitle id={headingId} eyebrow={block.props.eyebrow} heading={block.props.heading} className="lg:col-span-5" />
        <dl className="border-b border-current/15 lg:col-span-7">
          {items.map((item, index) => {
            const Icon = item.source === "custom" ? customFigureIcon(item.label) : FIGURE_ICONS[item.source];
            return (
              <div key={index} className="flex items-center gap-5 border-t border-current/15 py-5">
                <IconCircle>
                  <Icon />
                </IconCircle>
                <dt className="min-w-0 flex-1 text-xs tracking-[0.2em] uppercase">{item.label}</dt>
                <dd className="site-heading text-right text-2xl font-light [overflow-wrap:anywhere] tabular-nums sm:text-3xl">{item.value}</dd>
              </div>
            );
          })}
        </dl>
      </div>
    </BlockSection>
  );
}

// -----------------------------------------------------------------------------
// Fremdrift: loddrett tidslinje på hovedfargen
// -----------------------------------------------------------------------------

const MILESTONE_ICONS: Record<string, LucideIcon> = {
  planning: PencilRulerIcon,
  sales_start: TagIcon,
  construction_start: HardHatIcon,
  move_in: KeyRoundIcon,
};

export function NordicProgressBlock({ block, data }: RenderBlockProps<"progress">) {
  const t = useTranslations("site");
  const headingId = `${block.id}-heading`;
  const items = useProgressItems(block, data);
  if (items.length === 0) {
    return editing(data.mode) ? (
      <BlockSection id={block.id}>
        <EditorHint>{t("editor.emptyProgress")}</EditorHint>
      </BlockSection>
    ) : null;
  }
  return (
    <BlockSection id={block.id} headingId={block.props.heading ? headingId : undefined} tone="muted">
      <div className="grid gap-10 lg:grid-cols-12 lg:gap-16">
        <BlockTitle id={headingId} eyebrow={block.props.eyebrow} heading={block.props.heading} className="lg:col-span-5" />
        <ol className="lg:col-span-7">
          {items.map((item, index) => {
            const Icon = (item.key && MILESTONE_ICONS[item.key]) || CircleDotIcon;
            const last = index === items.length - 1;
            return (
              <li key={index} className="relative flex gap-6 pb-10 last:pb-0">
                {/* Linjen mellom punktene. */}
                {last ? null : <span className="absolute top-14 bottom-0 left-7 w-px bg-[var(--site-primary-text)]/40" aria-hidden="true" />}
                <IconCircle className={cn("size-14 border-current/50 text-[var(--site-primary-text)]", item.done && "bg-current/10")}>
                  <Icon />
                </IconCircle>
                <div className="pt-2">
                  {item.text ? <p className="text-xs tracking-[0.22em] uppercase">{item.text}</p> : null}
                  <p className="site-heading mt-2 flex flex-wrap items-center gap-3 text-2xl font-light tracking-[0.06em] uppercase sm:text-3xl">
                    {item.label}
                    {item.current ? (
                      <span className="border border-current px-2 py-0.5 text-[0.625rem] font-normal tracking-[0.2em]">{t("progress.now")}</span>
                    ) : null}
                  </p>
                  <span className="sr-only">{item.done ? t("progress.done") : t("progress.upcoming")}</span>
                </div>
              </li>
            );
          })}
        </ol>
      </div>
    </BlockSection>
  );
}

// -----------------------------------------------------------------------------
// Bildegalleri: første bilde i full bredde, bildetekst under hvert bilde
// -----------------------------------------------------------------------------

export function NordicGalleryBlock({ block, data }: RenderBlockProps<"gallery">) {
  const t = useTranslations("site");
  const { props } = block;
  const images = props.asset_ids.flatMap((id) => (data.assets[id] ? [data.assets[id]] : []));
  const headingId = `${block.id}-heading`;
  if (images.length === 0) {
    return editing(data.mode) ? (
      <BlockSection id={block.id}>
        <EditorHint>{t("editor.emptyGallery")}</EditorHint>
      </BlockSection>
    ) : null;
  }
  // Med tre bilder eller flere får det første hele bredden.
  const featured = images.length >= 3;
  return (
    <BlockSection id={block.id} headingId={props.heading ? headingId : undefined}>
      <BlockTitle id={headingId} eyebrow={props.eyebrow} heading={props.heading} />
      <ul
        className={cn(
          "grid grid-cols-1 gap-x-6 gap-y-10 sm:grid-cols-2",
          props.columns === 3 && "lg:grid-cols-3",
          props.columns === 4 && "lg:grid-cols-4",
        )}
      >
        {images.map((image, index) => {
          const wide = featured && index === 0;
          const name = image.alt ?? image.filename ?? "";
          return (
            <li key={image.id} className={cn(wide && "sm:col-span-full")}>
              <figure>
                <a href={image.url} target="_blank" rel="noreferrer" aria-label={t("gallery.open", { name })} className="block overflow-hidden">
                  <SiteImage
                    asset={image}
                    alt=""
                    sizes={wide ? "(min-width: 1152px) 72rem, 100vw" : `(min-width: 1024px) ${Math.round(72 / props.columns)}rem, (min-width: 640px) 50vw, 100vw`}
                    className={cn("w-full object-cover transition-transform duration-500 hover:scale-[1.02]", wide ? "aspect-[16/9]" : "aspect-[4/3]")}
                  />
                </a>
                {image.alt ? <figcaption className="mt-3 text-[0.6875rem] tracking-[0.2em] uppercase">{image.alt}</figcaption> : null}
              </figure>
            </li>
          );
        })}
      </ul>
    </BlockSection>
  );
}
