"use client";

/* eslint-disable @next/next/no-img-element -- Bildene er ferdige WebP-varianter fra Storage med srcSet. */

import type { ReactNode } from "react";

import { siteImage, type SiteAsset } from "@/features/site-builder/assets";
import { cn } from "@/lib/utils";

/** Seksjon for én blokk. id-en gjør at knapper og menyen kan lenke til blokken (#id). */
export function BlockSection({
  id,
  children,
  className,
  headingId,
  tone = "default",
  flushMobile = false,
}: {
  id: string;
  children: ReactNode;
  className?: string;
  headingId?: string;
  tone?: "default" | "muted";
  /** Nesten uten marg på mobil, for innhold som trenger hele bredden (boligvelgeren). */
  flushMobile?: boolean;
}) {
  return (
    <section
      id={id}
      data-block-id={id}
      aria-labelledby={headingId}
      className={cn("scroll-mt-24 py-12 lg:py-16", tone === "muted" && "bg-black/[0.03]", className)}
    >
      {/* Samme bredde og marg som toppen og bunnteksten, så alt står på linje. */}
      <div className={cn("mx-auto w-full max-w-6xl", flushMobile ? "px-1 sm:px-6" : "px-4 sm:px-6")}>{children}</div>
    </section>
  );
}

export function BlockHeading({ id, children, className }: { id: string; children: ReactNode; className?: string }) {
  return (
    <h2 id={id} className={cn("site-heading mb-6 text-2xl font-semibold tracking-tight sm:text-3xl", className)}>
      {children}
    </h2>
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

const BUTTON_BASE =
  "inline-flex items-center justify-center gap-2 px-5 py-3 text-base font-semibold transition-opacity hover:opacity-90 focus-visible:outline-2 focus-visible:outline-offset-2";

export function siteButtonClass(variant: "primary" | "secondary" | "inverted" = "primary"): string {
  return cn(
    BUTTON_BASE,
    "rounded-[var(--site-radius)]",
    variant === "primary" && "bg-[var(--site-primary)] text-[var(--site-primary-foreground)] focus-visible:outline-[var(--site-primary)]",
    variant === "secondary" && "border-2 border-[var(--site-primary)] text-[var(--site-primary)] focus-visible:outline-[var(--site-primary)]",
    variant === "inverted" && "bg-white text-neutral-900 focus-visible:outline-white",
  );
}

export function SiteLinkButton({
  href,
  external,
  variant = "primary",
  children,
  className,
}: {
  href: string;
  external: boolean;
  variant?: "primary" | "secondary" | "inverted";
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
    </a>
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
