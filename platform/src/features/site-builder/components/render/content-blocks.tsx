"use client";

import { CalendarDaysIcon, FileTextIcon, MailIcon, PhoneIcon, PlayIcon } from "lucide-react";
import { useFormatter, useNow, useTranslations } from "next-intl";
import { useState } from "react";

import { parseVideoUrl, type BlockOf, type BlockType } from "@/features/site-builder/blocks";
import { BlockHeading, BlockSection, EditorHint, SiteImage, SiteLinkButton } from "@/features/site-builder/components/render/primitives";
import { RichText } from "@/features/site-builder/rich-text";
import { resolveLink, type SiteRenderData } from "@/features/site-builder/site";
import { isPriceHidden } from "@/features/selector/model";
import { cn } from "@/lib/utils";

export type RenderBlockProps<T extends BlockType> = { block: BlockOf<T>; data: SiteRenderData; isFirst: boolean };
type BlockProps<T extends BlockType> = RenderBlockProps<T>;

const editing = (data: SiteRenderData) => data.mode !== "published";

// -----------------------------------------------------------------------------
// Hero
// -----------------------------------------------------------------------------

export function HeroBlock({ block, data, isFirst }: BlockProps<"hero">) {
  const { props } = block;
  const image = props.image_asset_id ? data.assets[props.image_asset_id] : undefined;
  const link = resolveLink(data, props.cta_link);
  const Heading = isFirst ? "h1" : "h2";
  const headingId = `${block.id}-heading`;
  return (
    <section
      id={block.id}
      data-block-id={block.id}
      aria-labelledby={headingId}
      className={cn(
        "relative isolate flex scroll-mt-24 items-end overflow-hidden",
        props.height === "medium" && "min-h-[22rem] sm:min-h-[26rem]",
        props.height === "large" && "min-h-[28rem] sm:min-h-[36rem]",
        props.height === "full" && "min-h-[calc(100svh-4rem)]",
        image ? "text-white" : "bg-[var(--site-primary)] text-[var(--site-primary-foreground)]",
      )}
    >
      {image ? (
        <>
          <SiteImage asset={image} sizes="100vw" priority={isFirst} alt="" className="absolute inset-0 -z-20 size-full object-cover" />
          <div className="absolute inset-0 -z-10 bg-black" style={{ opacity: props.overlay / 100 }} aria-hidden="true" />
        </>
      ) : null}
      <div className={cn("mx-auto w-full max-w-6xl px-4 py-12 sm:px-6 sm:py-16", props.align === "center" && "text-center")}>
        <div className={cn("max-w-3xl", props.align === "center" && "mx-auto")}>
          <Heading id={headingId} className="site-heading text-4xl font-semibold tracking-tight text-balance sm:text-5xl lg:text-6xl">
            {props.title || data.project.name}
          </Heading>
          {props.subtitle ? <p className="mt-4 text-lg text-pretty sm:text-xl">{props.subtitle}</p> : null}
          {props.cta_label && link ? (
            <SiteLinkButton href={link.href} external={link.external} variant="inverted" className="mt-8">
              {props.cta_label}
            </SiteLinkButton>
          ) : null}
        </div>
      </div>
    </section>
  );
}

// -----------------------------------------------------------------------------
// Tekst, og tekst med bilde
// -----------------------------------------------------------------------------

export function TextBlock({ block, data }: BlockProps<"text">) {
  const { props } = block;
  const tEditor = useTranslations("site.editor");
  const headingId = `${block.id}-heading`;
  if (!props.heading && !props.body) {
    return editing(data) ? (
      <BlockSection id={block.id}>
        <EditorHint>{tEditor("emptyText")}</EditorHint>
      </BlockSection>
    ) : null;
  }
  return (
    <BlockSection id={block.id} headingId={props.heading ? headingId : undefined}>
      <div className={cn(props.width === "narrow" ? "max-w-3xl" : "max-w-none")}>
        {props.heading ? <BlockHeading id={headingId}>{props.heading}</BlockHeading> : null}
        <RichText source={props.body} className="text-lg" />
      </div>
    </BlockSection>
  );
}

export function TextImageBlock({ block, data }: BlockProps<"text_image">) {
  const { props } = block;
  const image = props.image_asset_id ? data.assets[props.image_asset_id] : undefined;
  const headingId = `${block.id}-heading`;
  const t = useTranslations("site.editor");
  return (
    <BlockSection id={block.id} headingId={props.heading ? headingId : undefined}>
      <div className="grid items-center gap-8 lg:grid-cols-2 lg:gap-12">
        <div className={cn(props.image_position === "left" && "lg:order-2")}>
          {props.heading ? <BlockHeading id={headingId}>{props.heading}</BlockHeading> : null}
          <RichText source={props.body} className="text-lg" />
        </div>
        {image ? (
          <SiteImage asset={image} sizes="(min-width: 1024px) 36rem, 100vw" className="aspect-[4/3] w-full rounded-[var(--site-radius)] object-cover" />
        ) : editing(data) ? (
          <EditorHint>{t("missingImage")}</EditorHint>
        ) : null}
      </div>
    </BlockSection>
  );
}

// -----------------------------------------------------------------------------
// Bildegalleri
// -----------------------------------------------------------------------------

export function GalleryBlock({ block, data }: BlockProps<"gallery">) {
  const { props } = block;
  const t = useTranslations("site");
  const images = props.asset_ids.flatMap((id) => (data.assets[id] ? [data.assets[id]] : []));
  const headingId = `${block.id}-heading`;
  if (images.length === 0) {
    return editing(data) ? (
      <BlockSection id={block.id}>
        <EditorHint>{t("editor.emptyGallery")}</EditorHint>
      </BlockSection>
    ) : null;
  }
  return (
    <BlockSection id={block.id} headingId={props.heading ? headingId : undefined}>
      {props.heading ? <BlockHeading id={headingId}>{props.heading}</BlockHeading> : null}
      <ul
        className={cn(
          "grid grid-cols-1 gap-3 sm:grid-cols-2",
          props.columns === 3 && "lg:grid-cols-3",
          props.columns === 4 && "lg:grid-cols-4",
        )}
      >
        {images.map((image) => (
          <li key={image.id}>
            <a href={image.url} target="_blank" rel="noreferrer" aria-label={t("gallery.open", { name: image.alt ?? image.filename ?? "" })}>
              <SiteImage
                asset={image}
                sizes={`(min-width: 1024px) ${Math.round(72 / props.columns)}rem, (min-width: 640px) 50vw, 100vw`}
                className="aspect-[4/3] w-full rounded-[var(--site-radius)] object-cover transition-opacity hover:opacity-90"
              />
            </a>
          </li>
        ))}
      </ul>
    </BlockSection>
  );
}

// -----------------------------------------------------------------------------
// Nøkkeltall
// -----------------------------------------------------------------------------

export function KeyFiguresBlock({ block, data }: BlockProps<"key_figures">) {
  const t = useTranslations("site.keyFigures");
  const tEditor = useTranslations("site.editor");
  const format = useFormatter();
  const headingId = `${block.id}-heading`;
  const units = data.units;
  const number = (value: number) => format.number(value, { maximumFractionDigits: 1 });
  const range = (values: number[], unit = "") => {
    if (values.length === 0) {
      return null;
    }
    const min = Math.min(...values);
    const max = Math.max(...values);
    return `${number(min)}${min === max ? "" : `–${number(max)}`}${unit}`;
  };
  const items = block.props.items.flatMap((item) => {
    switch (item.source) {
      case "custom":
        return item.value || item.label ? [{ value: item.value, label: item.label }] : [];
      case "units_total":
        return units.length > 0 ? [{ value: String(units.length), label: t("unitsTotal") }] : [];
      case "available": {
        const available = units.filter((unit) => unit.status === "available").length;
        return units.length > 0 ? [{ value: String(available), label: t("available") }] : [];
      }
      case "size_range": {
        const value = range(units.flatMap((unit) => (unit.bra_i === null ? [] : [unit.bra_i])), " m²");
        return value ? [{ value, label: t("sizeRange") }] : [];
      }
      case "rooms_range": {
        const value = range(units.flatMap((unit) => (unit.rooms === null ? [] : [unit.rooms])));
        return value ? [{ value, label: t("roomsRange") }] : [];
      }
      case "price_from": {
        const prices = units.flatMap((unit) =>
          unit.price === null || unit.price_hidden || isPriceHidden(unit.status, data.project.showPriceOnSold) ? [] : [unit.price],
        );
        return prices.length > 0
          ? [{ value: format.number(Math.min(...prices), { style: "currency", currency: "NOK", maximumFractionDigits: 0 }), label: t("priceFrom") }]
          : [];
      }
    }
  });
  if (items.length === 0) {
    return editing(data) ? (
      <BlockSection id={block.id}>
        <EditorHint>{tEditor("emptyKeyFigures")}</EditorHint>
      </BlockSection>
    ) : null;
  }
  return (
    <BlockSection id={block.id} headingId={block.props.heading ? headingId : undefined} tone="muted">
      {block.props.heading ? <BlockHeading id={headingId}>{block.props.heading}</BlockHeading> : null}
      <dl className="grid grid-cols-2 gap-6 sm:grid-cols-4">
        {items.map((item, index) => (
          <div key={index} className="flex flex-col-reverse">
            <dt className="text-sm opacity-80">{item.label}</dt>
            <dd className="site-heading text-2xl font-semibold [overflow-wrap:anywhere] text-[var(--site-primary)] tabular-nums sm:text-3xl">{item.value}</dd>
          </div>
        ))}
      </dl>
    </BlockSection>
  );
}

// -----------------------------------------------------------------------------
// Fremdrift
// -----------------------------------------------------------------------------

export function ProgressBlock({ block, data }: BlockProps<"progress">) {
  const t = useTranslations("site");
  const format = useFormatter();
  const now = useNow();
  const today = now.toISOString().slice(0, 10);
  const headingId = `${block.id}-heading`;
  const items = block.props.use_project
    ? data.project.milestones.map((milestone) => ({
        label: milestone.label || (["planning", "sales_start", "construction_start", "move_in"].includes(milestone.key) ? t(`milestones.${milestone.key as "planning"}`) : ""),
        text: milestone.text || (milestone.date ? format.dateTime(new Date(`${milestone.date}T12:00:00`), { dateStyle: "long" }) : ""),
        done: milestone.date !== null && milestone.date <= today,
      }))
    : block.props.items;
  const visible = items.filter((item) => item.label || item.text);
  if (visible.length === 0) {
    return editing(data) ? (
      <BlockSection id={block.id}>
        <EditorHint>{t("editor.emptyProgress")}</EditorHint>
      </BlockSection>
    ) : null;
  }
  return (
    <BlockSection id={block.id} headingId={block.props.heading ? headingId : undefined}>
      {block.props.heading ? <BlockHeading id={headingId}>{block.props.heading}</BlockHeading> : null}
      <ol className="grid gap-6 sm:grid-cols-2 lg:grid-flow-col lg:grid-cols-none lg:auto-cols-fr">
        {visible.map((item, index) => (
          <li key={index} className="relative border-t-4 pt-4" style={{ borderColor: item.done ? "var(--site-primary)" : "color-mix(in srgb, currentColor 20%, transparent)" }}>
            <p className="text-sm font-medium opacity-80">{item.label}</p>
            <p className="site-heading mt-1 text-lg font-semibold">{item.text}</p>
            <span className="sr-only">{item.done ? t("progress.done") : t("progress.upcoming")}</span>
          </li>
        ))}
      </ol>
    </BlockSection>
  );
}

// -----------------------------------------------------------------------------
// Visninger
// -----------------------------------------------------------------------------

export function ViewingsBlock({ block, data }: BlockProps<"viewings">) {
  const t = useTranslations("site");
  const format = useFormatter();
  const now = useNow();
  const today = now.toISOString().slice(0, 10);
  const headingId = `${block.id}-heading`;
  const upcoming = block.props.items.filter((item) => item.date >= today).sort((a, b) => `${a.date}${a.start}`.localeCompare(`${b.date}${b.start}`));
  if (upcoming.length === 0 && !block.props.intro) {
    return editing(data) ? (
      <BlockSection id={block.id}>
        <EditorHint>{t("editor.emptyViewings")}</EditorHint>
      </BlockSection>
    ) : null;
  }
  return (
    <BlockSection id={block.id} headingId={block.props.heading ? headingId : undefined}>
      {block.props.heading ? <BlockHeading id={headingId}>{block.props.heading}</BlockHeading> : null}
      {block.props.intro ? <p className="mb-6 max-w-3xl text-lg">{block.props.intro}</p> : null}
      {upcoming.length > 0 ? (
        <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {upcoming.map((item, index) => (
            <li key={index} className="flex gap-3 rounded-[var(--site-radius)] border p-4" style={{ borderColor: "color-mix(in srgb, currentColor 15%, transparent)" }}>
              <CalendarDaysIcon className="mt-0.5 size-5 shrink-0 text-[var(--site-primary)]" aria-hidden="true" />
              <div>
                <p className="font-semibold">{format.dateTime(new Date(`${item.date}T12:00:00`), { weekday: "long", day: "numeric", month: "long" })}</p>
                <p>{item.end ? t("viewings.timeRange", { start: item.start, end: item.end }) : t("viewings.time", { start: item.start })}</p>
                {item.note ? <p className="mt-1 text-sm opacity-80">{item.note}</p> : null}
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <p className="opacity-80">{t("viewings.none")}</p>
      )}
    </BlockSection>
  );
}

// -----------------------------------------------------------------------------
// Kontaktpersoner
// -----------------------------------------------------------------------------

export function ContactsBlock({ block, data }: BlockProps<"contacts">) {
  const t = useTranslations("site");
  const headingId = `${block.id}-heading`;
  const contacts = block.props.use_project
    ? data.project.contacts.map((contact) => ({
        name: contact.name ?? "",
        title: contact.title ?? "",
        phone: contact.phone ?? "",
        email: contact.email ?? "",
        image: contact.image,
      }))
    : block.props.items.map((item) => ({ ...item, image: item.image_asset_id ? (data.assets[item.image_asset_id] ?? null) : null }));
  const visible = contacts.filter((contact) => contact.name);
  if (visible.length === 0) {
    return editing(data) ? (
      <BlockSection id={block.id}>
        <EditorHint>{t("editor.emptyContacts")}</EditorHint>
      </BlockSection>
    ) : null;
  }
  return (
    <BlockSection id={block.id} headingId={block.props.heading ? headingId : undefined} tone="muted">
      {block.props.heading ? <BlockHeading id={headingId}>{block.props.heading}</BlockHeading> : null}
      <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {visible.map((contact, index) => (
          <li key={index} className="flex gap-4">
            {contact.image ? (
              <SiteImage asset={contact.image} sizes="5rem" alt="" className="size-20 shrink-0 rounded-full object-cover" />
            ) : (
              <span className="flex size-20 shrink-0 items-center justify-center rounded-full bg-[var(--site-primary)] text-2xl font-semibold text-[var(--site-primary-foreground)]" aria-hidden="true">
                {contact.name.slice(0, 1)}
              </span>
            )}
            <div className="grid content-start gap-1">
              <p className="site-heading text-lg font-semibold">{contact.name}</p>
              {contact.title ? <p className="opacity-80">{contact.title}</p> : null}
              {contact.phone ? (
                <a href={`tel:${contact.phone.replace(/\s/g, "")}`} className="inline-flex items-center gap-2 underline-offset-2 hover:underline">
                  <PhoneIcon className="size-4" aria-hidden="true" />
                  <span className="sr-only">{t("contacts.phone")}</span>
                  {contact.phone}
                </a>
              ) : null}
              {contact.email ? (
                <a href={`mailto:${contact.email}`} className="inline-flex items-center gap-2 break-all underline-offset-2 hover:underline">
                  <MailIcon className="size-4 shrink-0" aria-hidden="true" />
                  <span className="sr-only">{t("contacts.email")}</span>
                  {contact.email}
                </a>
              ) : null}
            </div>
          </li>
        ))}
      </ul>
    </BlockSection>
  );
}

// -----------------------------------------------------------------------------
// Dokumenter og prospekt
// -----------------------------------------------------------------------------

export function DocumentsBlock({ block, data }: BlockProps<"documents">) {
  const t = useTranslations("site");
  const headingId = `${block.id}-heading`;
  const documents = block.props.asset_ids.flatMap((id) => (data.assets[id] ? [data.assets[id]] : []));
  if (documents.length === 0) {
    return editing(data) ? (
      <BlockSection id={block.id}>
        <EditorHint>{t("editor.emptyDocuments")}</EditorHint>
      </BlockSection>
    ) : null;
  }
  return (
    <BlockSection id={block.id} headingId={block.props.heading ? headingId : undefined}>
      {block.props.heading ? <BlockHeading id={headingId}>{block.props.heading}</BlockHeading> : null}
      <ul className="grid gap-2 sm:grid-cols-2">
        {documents.map((document) => (
          <li key={document.id}>
            <a
              href={document.url}
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-3 rounded-[var(--site-radius)] border p-4 font-medium hover:bg-black/[0.03]"
              style={{ borderColor: "color-mix(in srgb, currentColor 15%, transparent)" }}
            >
              <FileTextIcon className="size-6 shrink-0 text-[var(--site-primary)]" aria-hidden="true" />
              <span className="min-w-0 flex-1 truncate">{document.alt || document.filename || t("documents.untitled")}</span>
              <span className="text-xs uppercase opacity-70">{document.mime === "application/pdf" ? "PDF" : t("documents.image")}</span>
            </a>
          </li>
        ))}
      </ul>
    </BlockSection>
  );
}

// -----------------------------------------------------------------------------
// Video (lastes først når besøkeren starter den)
// -----------------------------------------------------------------------------

export function VideoBlock({ block, data }: BlockProps<"video">) {
  const t = useTranslations("site");
  const [playing, setPlaying] = useState(false);
  const headingId = `${block.id}-heading`;
  const video = block.props.url ? parseVideoUrl(block.props.url) : null;
  if (!video) {
    return editing(data) ? (
      <BlockSection id={block.id}>
        <EditorHint>{t("editor.emptyVideo")}</EditorHint>
      </BlockSection>
    ) : null;
  }
  const provider = video.provider === "youtube" ? "YouTube" : "Vimeo";
  const title = block.props.heading || block.props.caption || t("video.title");
  return (
    <BlockSection id={block.id} headingId={block.props.heading ? headingId : undefined}>
      {block.props.heading ? <BlockHeading id={headingId}>{block.props.heading}</BlockHeading> : null}
      <figure>
        <div className="relative aspect-video overflow-hidden rounded-[var(--site-radius)] bg-neutral-900">
          {playing ? (
            <iframe
              src={video.embedUrl}
              title={title}
              className="absolute inset-0 size-full"
              allow="autoplay; encrypted-media; picture-in-picture; fullscreen"
              allowFullScreen
              referrerPolicy="strict-origin-when-cross-origin"
            />
          ) : (
            <button
              type="button"
              onClick={() => setPlaying(true)}
              disabled={data.mode === "editor"}
              className="absolute inset-0 flex flex-col items-center justify-center gap-3 text-white"
            >
              <span className="flex size-16 items-center justify-center rounded-full bg-[var(--site-primary)] text-[var(--site-primary-foreground)]">
                <PlayIcon className="size-7" aria-hidden="true" />
              </span>
              <span className="font-semibold">{t("video.play", { provider })}</span>
              <span className="max-w-sm px-4 text-center text-sm opacity-80">{t("video.notice", { provider })}</span>
            </button>
          )}
        </div>
        {block.props.caption ? <figcaption className="mt-2 text-sm opacity-80">{block.props.caption}</figcaption> : null}
      </figure>
    </BlockSection>
  );
}

// -----------------------------------------------------------------------------
// Ofte stilte spørsmål
// -----------------------------------------------------------------------------

export function FaqBlock({ block, data }: BlockProps<"faq">) {
  const t = useTranslations("site.editor");
  const headingId = `${block.id}-heading`;
  const items = block.props.items.filter((item) => item.question && item.answer);
  if (items.length === 0) {
    return editing(data) ? (
      <BlockSection id={block.id}>
        <EditorHint>{t("emptyFaq")}</EditorHint>
      </BlockSection>
    ) : null;
  }
  return (
    <BlockSection id={block.id} headingId={block.props.heading ? headingId : undefined}>
      {block.props.heading ? <BlockHeading id={headingId}>{block.props.heading}</BlockHeading> : null}
      <div className="max-w-3xl divide-y border-y" style={{ borderColor: "color-mix(in srgb, currentColor 15%, transparent)" }}>
        {items.map((item, index) => (
          <details key={index} className="group py-4">
            <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-lg font-semibold [&::-webkit-details-marker]:hidden">
              {item.question}
              <span className="text-2xl leading-none transition-transform group-open:rotate-45" aria-hidden="true">
                +
              </span>
            </summary>
            <RichText source={item.answer} className="mt-3" />
          </details>
        ))}
      </div>
    </BlockSection>
  );
}

// -----------------------------------------------------------------------------
// Nyheter
// -----------------------------------------------------------------------------

export function NewsBlock({ block, data }: BlockProps<"news">) {
  const t = useTranslations("site.editor");
  const format = useFormatter();
  const headingId = `${block.id}-heading`;
  const items = block.props.items
    .filter((item) => item.title)
    .sort((a, b) => b.date.localeCompare(a.date));
  if (items.length === 0) {
    return editing(data) ? (
      <BlockSection id={block.id}>
        <EditorHint>{t("emptyNews")}</EditorHint>
      </BlockSection>
    ) : null;
  }
  return (
    <BlockSection id={block.id} headingId={block.props.heading ? headingId : undefined}>
      {block.props.heading ? <BlockHeading id={headingId}>{block.props.heading}</BlockHeading> : null}
      <ul className="grid gap-8 md:grid-cols-2">
        {items.map((item) => {
          const image = item.image_asset_id ? data.assets[item.image_asset_id] : undefined;
          return (
            <li key={item.id}>
              <article className="grid gap-3">
                {image ? <SiteImage asset={image} sizes="(min-width: 768px) 36rem, 100vw" className="aspect-[16/9] w-full rounded-[var(--site-radius)] object-cover" /> : null}
                {item.date ? (
                  <p className="text-sm opacity-80">
                    <time dateTime={item.date}>{format.dateTime(new Date(`${item.date}T12:00:00`), { dateStyle: "long" })}</time>
                  </p>
                ) : null}
                <h3 className="site-heading text-xl font-semibold">{item.title}</h3>
                <RichText source={item.body} />
              </article>
            </li>
          );
        })}
      </ul>
    </BlockSection>
  );
}

// -----------------------------------------------------------------------------
// Knapp
// -----------------------------------------------------------------------------

export function ButtonBlock({ block, data }: BlockProps<"button">) {
  const t = useTranslations("site.editor");
  const link = resolveLink(data, block.props.link);
  if (!block.props.label || !link) {
    return editing(data) ? (
      <BlockSection id={block.id} className="py-6 lg:py-8">
        <EditorHint>{t("emptyButton")}</EditorHint>
      </BlockSection>
    ) : null;
  }
  return (
    <BlockSection id={block.id} className="py-6 lg:py-8">
      <div className={cn("flex", block.props.align === "center" && "justify-center", block.props.align === "right" && "justify-end")}>
        <SiteLinkButton href={link.href} external={link.external} variant={block.props.style}>
          {block.props.label}
        </SiteLinkButton>
      </div>
    </BlockSection>
  );
}

// -----------------------------------------------------------------------------
// Innbygging (for eksempel 3D-visning)
// -----------------------------------------------------------------------------

export function EmbedBlock({ block, data }: BlockProps<"embed">) {
  const t = useTranslations("site");
  const headingId = `${block.id}-heading`;
  if (!block.props.url) {
    return editing(data) ? (
      <BlockSection id={block.id}>
        <EditorHint>{t("editor.emptyEmbed")}</EditorHint>
      </BlockSection>
    ) : null;
  }
  return (
    <BlockSection id={block.id} headingId={block.props.heading ? headingId : undefined}>
      {block.props.heading ? <BlockHeading id={headingId}>{block.props.heading}</BlockHeading> : null}
      <iframe
        src={block.props.url}
        title={block.props.title || block.props.heading || t("embed.fallbackTitle")}
        loading="lazy"
        className="w-full rounded-[var(--site-radius)] border-0 bg-black/5"
        style={{ height: block.props.height }}
        sandbox="allow-scripts allow-same-origin allow-popups allow-forms allow-presentation"
        allow="fullscreen; xr-spatial-tracking; gyroscope; accelerometer"
        referrerPolicy="strict-origin-when-cross-origin"
      />
    </BlockSection>
  );
}
