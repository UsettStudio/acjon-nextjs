"use client";

/* eslint-disable @next/next/no-img-element -- Bildene er ferdige WebP-varianter fra Storage med srcSet. */

import { ArrowRightIcon } from "lucide-react";
import type { ReactNode } from "react";

import { siteImage, type SiteAsset } from "@/features/site-builder/assets";
import { cn } from "@/lib/utils";

/**
 * Bakgrunnen til en seksjon.
 *   default  sidens bakgrunn
 *   muted    en svak tone (Klassisk: grå, Nordisk: hovedfargen blandet inn i bakgrunnen)
 *   brand    hovedfargen, med tekst i fargen som gir best kontrast
 */
export type SectionTone = "default" | "muted" | "brand";

export function sectionToneClass(tone: SectionTone): string | undefined {
  switch (tone) {
    case "muted":
      return "bg-black/[0.03] nordic:bg-[var(--site-tint)]";
    case "brand":
      // Overtitler og knapper på fargen bruker tekstfargen for fargen (--site-eyebrow).
      return "bg-[var(--site-primary)] text-[var(--site-primary-foreground)] [--site-eyebrow:var(--site-primary-foreground)]";
    default:
      return undefined;
  }
}

/** Seksjon for én blokk. id-en gjør at knapper og menyen kan lenke til blokken (#id). */
export function BlockSection({
  id,
  children,
  className,
  headingId,
  tone = "default",
  flushMobile = false,
  compact = false,
}: {
  id: string;
  children: ReactNode;
  className?: string;
  headingId?: string;
  tone?: SectionTone;
  /** Nesten uten marg på mobil, for innhold som trenger hele bredden (boligvelgeren). */
  flushMobile?: boolean;
  /** Mindre luft, for en blokk med bare en knapp. */
  compact?: boolean;
}) {
  return (
    <section
      id={id}
      data-block-id={id}
      aria-labelledby={headingId}
      className={cn(
        "scroll-mt-24",
        compact ? "py-6 lg:py-8" : "py-12 lg:py-16",
        // Nordisk: luften rundt en vanlig seksjon er marg, så to slike etter hverandre får én luke, ikke to.
        // Seksjoner med farge har luften inne i fargen.
        tone !== "default"
          ? "nordic:py-20 lg:nordic:py-28"
          : compact
            ? "nordic:my-10 nordic:py-0 lg:nordic:my-12 lg:nordic:py-0"
            : "nordic:my-20 nordic:scroll-mt-32 nordic:py-0 lg:nordic:my-28 lg:nordic:py-0",
        sectionToneClass(tone),
        className,
      )}
    >
      {/* Samme bredde og marg som toppen og bunnteksten, så alt står på linje. */}
      <div className={cn("mx-auto w-full max-w-6xl", flushMobile ? "px-1 sm:px-6" : "px-4 sm:px-6")}>{children}</div>
    </section>
  );
}

/** Kort overtittel med store bokstaver over en overskrift, for eksempel «Boligene». */
export function Eyebrow({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <p
      className={cn(
        "site-eyebrow mb-2 text-sm font-semibold tracking-wide text-[var(--site-eyebrow,var(--site-primary-text))] uppercase",
        "nordic:mb-4 nordic:text-xs nordic:font-normal nordic:tracking-[0.22em]",
        className,
      )}
    >
      {children}
    </p>
  );
}

export function BlockHeading({ id, children, className }: { id: string; children: ReactNode; className?: string }) {
  return (
    <h2
      id={id}
      className={cn(
        "site-heading mb-6 text-2xl font-semibold tracking-tight text-balance sm:text-3xl",
        "nordic:mb-10 nordic:text-3xl nordic:leading-tight nordic:font-light nordic:tracking-normal sm:nordic:text-4xl",
        className,
      )}
    >
      {children}
    </h2>
  );
}

/** Overtittel og overskrift for en blokk. Ingenting vises når begge er tomme. */
export function BlockTitle({
  id,
  eyebrow,
  heading,
  className,
}: {
  id: string;
  eyebrow?: string;
  heading?: string;
  className?: string;
}) {
  if (!eyebrow && !heading) {
    return null;
  }
  return (
    <div className={className}>
      {eyebrow ? <Eyebrow className={heading ? undefined : "mb-6 nordic:mb-8"}>{eyebrow}</Eyebrow> : null}
      {heading ? <BlockHeading id={id}>{heading}</BlockHeading> : null}
    </div>
  );
}

export function SiteImage({
  asset,
  sizes,
  className,
  alt,
  priority = false,
}: {
  asset: SiteAsset;
  sizes: string;
  className?: string;
  alt?: string;
  priority?: boolean;
}) {
  const { src, srcSet } = siteImage(asset);
  return (
    <img
      src={src}
      srcSet={srcSet}
      sizes={sizes}
      alt={alt ?? asset.alt ?? ""}
      width={asset.width ?? undefined}
      height={asset.height ?? undefined}
      loading={priority ? "eager" : "lazy"}
      fetchPriority={priority ? "high" : undefined}
      decoding="async"
      className={className}
    />
  );
}

const BUTTON_BASE = cn(
  "inline-flex items-center justify-center gap-2 px-5 py-3 text-base font-semibold transition-opacity hover:opacity-90 focus-visible:outline-2 focus-visible:outline-offset-2",
  "nordic:gap-4 nordic:px-7 nordic:py-4 nordic:text-xs nordic:font-medium nordic:tracking-[0.2em] nordic:uppercase",
);

/**
 * primary    hovedfargen
 * secondary  ramme i hovedfargen
 * inverted   hvit, for bilder og fargede flater
 * outline    ramme i tekstfargen, for fargede flater
 */
export type SiteButtonVariant = "primary" | "secondary" | "inverted" | "outline";

export function siteButtonClass(variant: SiteButtonVariant = "primary"): string {
  return cn(
    BUTTON_BASE,
    "rounded-[var(--site-radius)]",
    variant === "primary" && "bg-[var(--site-primary)] text-[var(--site-primary-foreground)] focus-visible:outline-[var(--site-primary)]",
    variant === "secondary" &&
      "border-2 border-[var(--site-primary)] text-[var(--site-primary-text)] focus-visible:outline-[var(--site-primary)] nordic:border",
    variant === "inverted" && "bg-white text-neutral-900 focus-visible:outline-white",
    variant === "outline" && "border-2 border-current focus-visible:outline-current nordic:border",
  );
}

export function SiteLinkButton({
  href,
  external,
  variant = "primary",
  arrow = false,
  children,
  className,
}: {
  href: string;
  external: boolean;
  variant?: SiteButtonVariant;
  /** Pil etter teksten i designstilen Nordisk. */
  arrow?: boolean;
  children: ReactNode;
  className?: string;
}) {
  return (
    <a
      href={href}
      className={cn(siteButtonClass(variant), className)}
      target={external ? "_blank" : undefined}
      rel={external ? "noopener noreferrer" : undefined}
    >
      {children}
      {arrow ? <ArrowRightIcon className="hidden size-4 shrink-0 nordic:block" aria-hidden="true" /> : null}
    </a>
  );
}

/** Ikon i en tynn sirkel, brukt i Nordisk for nøkkeltall, fremdrift og nærområdet. */
export function IconCircle({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <span
      className={cn("flex size-12 shrink-0 items-center justify-center rounded-full border border-current/25 [&_svg]:size-5 [&_svg]:stroke-[1.25]", className)}
      aria-hidden="true"
    >
      {children}
    </span>
  );
}

/** Tekst i editoren der en blokk mangler innhold. Vises aldri på den publiserte siden. */
export function EditorHint({ children }: { children: ReactNode }) {
  return (
    <p className="rounded-md border border-dashed border-current/30 px-4 py-6 text-center text-sm opacity-70" data-editor-hint>
      {children}
    </p>
  );
}
