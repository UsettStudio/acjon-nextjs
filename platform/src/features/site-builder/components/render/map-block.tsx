"use client";

import "maplibre-gl/dist/maplibre-gl.css";

import {
  BabyIcon,
  Building2Icon,
  BusIcon,
  CoffeeIcon,
  DumbbellIcon,
  MapPinIcon,
  SchoolIcon,
  ShoppingBasketIcon,
  StethoscopeIcon,
  TrainFrontIcon,
  TreesIcon,
  WavesIcon,
  type LucideIcon,
} from "lucide-react";
import type { Map as MapLibreMap } from "maplibre-gl";
import { useTranslations } from "next-intl";
import { useEffect, useRef, useState } from "react";

import { KARTVERKET_ATTRIBUTION, KARTVERKET_TILE_URL } from "@/features/projects/kartverket";
import type { RenderBlockProps } from "@/features/site-builder/components/render/content-blocks";
import { BlockSection, BlockTitle, EditorHint, IconCircle, SiteLinkButton } from "@/features/site-builder/components/render/primitives";
import { projectAddress } from "@/features/site-builder/site";
import { cn } from "@/lib/utils";

/**
 * Kart med prosjektets plassering (Kartverket) og en liste over nærområdet.
 * MapLibre lastes først når kartet nærmer seg skjermen, så det ikke forsinker
 * resten av siden. Uten WebGL vises adressen og en lenke til kart i stedet.
 */
function SiteMap({ lat, lng, zoom, label, className }: { lat: number; lng: number; zoom: number; label: string; className?: string }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) {
      return;
    }
    let cancelled = false;
    let map: MapLibreMap | null = null;
    const observer = new IntersectionObserver(
      (entries) => {
        if (!entries.some((entry) => entry.isIntersecting)) {
          return;
        }
        observer.disconnect();
        void (async () => {
          try {
            const maplibre = await import("maplibre-gl");
            if (cancelled) {
              return;
            }
            maplibre.setWorkerUrl(`/vendor/maplibre-gl-worker-${maplibre.getVersion()}.mjs`);
            map = new maplibre.Map({
              container,
              style: {
                version: 8,
                sources: {
                  topo: { type: "raster", tiles: [KARTVERKET_TILE_URL], tileSize: 256, maxzoom: 18, attribution: KARTVERKET_ATTRIBUTION },
                },
                layers: [{ id: "topo", type: "raster", source: "topo" }],
              },
              center: [lng, lat],
              zoom,
              cooperativeGestures: true,
            });
            map.getCanvas().setAttribute("aria-label", label);
            map.addControl(new maplibre.NavigationControl({ showCompass: false }), "top-right");
            new maplibre.Marker({ color: getComputedStyle(container).getPropertyValue("--site-primary").trim() || "#1F3A5F" })
              .setLngLat([lng, lat])
              .addTo(map);
          } catch (error) {
            console.warn("Kartet kunne ikke vises", error);
            if (!cancelled) {
              setFailed(true);
            }
          }
        })();
      },
      { rootMargin: "200px" },
    );
    observer.observe(container);
    return () => {
      cancelled = true;
      observer.disconnect();
      map?.remove();
    };
  }, [lat, lng, zoom, label]);

  if (failed) {
    return null;
  }
  return <div ref={containerRef} className={cn("h-80 w-full overflow-hidden rounded-[var(--site-radius)] bg-black/5 sm:h-96", className)} />;
}

/** Ikon for et sted i nærområdet, gjettet fra kategorien og navnet. */
function placeIcon(place: { name: string; category: string }): LucideIcon {
  const text = `${place.category} ${place.name}`.toLowerCase();
  const rules: [RegExp, LucideIcon][] = [
    [/t-bane|tbane|bane|tog|trikk|metro|tram|train|tunnelbana|spårvagn|pendeltåg/, TrainFrontIcon],
    [/buss|bus|holdeplass|kollektiv|hållplats/, BusIcon],
    [/barnehage|kindergarten|förskola|nursery/, BabyIcon],
    [/skole|skola|school|universitet|university|høgskole/, SchoolIcon],
    [/butikk|dagligvare|matbutikk|kjøpesenter|senter|shop|store|butik|supermarked|mall/, ShoppingBasketIcon],
    [/park|skog|marka|tur|natur|grønt|forest|nature|trees/, TreesIcon],
    [/sjø|strand|bad|fjord|hav|vann|beach|sea|lake|harbour|havn/, WavesIcon],
    [/trening|gym|idrett|sport|svømme|träning/, DumbbellIcon],
    [/lege|legevakt|sykehus|apotek|helse|doctor|hospital|pharmacy|vårdcentral/, StethoscopeIcon],
    [/kafé|kafe|café|cafe|restaurant|spisested|bakeri/, CoffeeIcon],
    [/sentrum|bykjerne|city|centre|center|centrum/, Building2Icon],
  ];
  return rules.find(([pattern]) => pattern.test(text))?.[1] ?? MapPinIcon;
}

export function MapBlock({ block, data }: RenderBlockProps<"map">) {
  const t = useTranslations("site.map");
  const tEditor = useTranslations("site.editor");
  const headingId = `${block.id}-heading`;
  const { props } = block;
  const lat = props.use_project_location ? data.project.lat : props.lat;
  const lng = props.use_project_location ? data.project.lng : props.lng;
  const address = projectAddress(data.project);
  const places = props.places.filter((place) => place.name);

  if ((lat === null || lng === null) && places.length === 0) {
    return data.mode !== "published" ? (
      <BlockSection id={block.id}>
        <EditorHint>{tEditor("emptyMap")}</EditorHint>
      </BlockSection>
    ) : null;
  }

  const hasLocation = lat !== null && lng !== null;
  const mapUrl = hasLocation ? `https://www.openstreetmap.org/?mlat=${lat}&mlon=${lng}#map=${props.zoom}/${lat}/${lng}` : null;

  if (data.theme.style === "nordic") {
    // Nordisk: på hovedfargen, med adressen stort, nærområdet som liste og kartet under.
    return (
      <BlockSection id={block.id} headingId={props.heading ? headingId : undefined} tone="brand">
        <div className="grid gap-12 lg:grid-cols-12 lg:gap-16">
          <div className="lg:col-span-5">
            <BlockTitle id={headingId} eyebrow={props.eyebrow} heading={props.heading} />
            {address ? <p className="site-heading text-2xl leading-snug font-light tracking-[0.06em] uppercase sm:text-3xl">{address}</p> : null}
            {mapUrl ? (
              <SiteLinkButton href={mapUrl} external variant="outline" arrow className="mt-10">
                {t("openMap")}
              </SiteLinkButton>
            ) : null}
          </div>
          {places.length > 0 ? (
            <div className="lg:col-span-7">
              <h3 className="sr-only">{t("nearby")}</h3>
              <ul className="border-b border-current/30">
                {places.map((place, index) => {
                  const Icon = placeIcon(place);
                  return (
                    <li key={index} className="flex items-center gap-5 border-t border-current/30 py-4">
                      <IconCircle className="border-current/40">
                        <Icon />
                      </IconCircle>
                      <span className="min-w-0 flex-1">
                        <span className="block text-xs tracking-[0.2em] uppercase">{place.name}</span>
                        {place.category ? <span className="mt-1 block text-sm">{place.category}</span> : null}
                      </span>
                      {place.distance ? <span className="shrink-0 text-xl font-light tabular-nums sm:text-2xl">{place.distance}</span> : null}
                    </li>
                  );
                })}
              </ul>
            </div>
          ) : null}
        </div>
        {hasLocation ? (
          // Avrundet øverst til venstre: zoomknappene står øverst til høyre og navnet på kartet nederst til høyre.
          <div className="mt-14">
            <SiteMap lat={lat} lng={lng} zoom={props.zoom} label={t("label", { project: data.project.name })} className="rounded-tl-[4rem] lg:rounded-tl-[8rem]" />
          </div>
        ) : null}
      </BlockSection>
    );
  }

  return (
    <BlockSection id={block.id} headingId={props.heading ? headingId : undefined}>
      <BlockTitle id={headingId} eyebrow={props.eyebrow} heading={props.heading} />
      <div className="grid gap-8 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
        {lat !== null && lng !== null ? (
          <div className="grid gap-2">
            <SiteMap lat={lat} lng={lng} zoom={props.zoom} label={t("label", { project: data.project.name })} />
            <p className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm">
              <MapPinIcon className="size-4 text-[var(--site-primary)]" aria-hidden="true" />
              {address ? <span>{address}</span> : null}
              <a
                href={mapUrl ?? undefined}
                target="_blank"
                rel="noopener noreferrer"
                className="underline underline-offset-2"
              >
                {t("openMap")}
              </a>
            </p>
          </div>
        ) : null}
        {places.length > 0 ? (
          <div>
            <h3 className="site-heading mb-3 text-lg font-semibold">{t("nearby")}</h3>
            <ul className="divide-y divide-current/15">
              {places.map((place, index) => (
                <li key={index} className="flex items-baseline justify-between gap-4 py-2">
                  <span>
                    <span className="font-medium">{place.name}</span>
                    {place.category ? <span className="block text-sm opacity-70">{place.category}</span> : null}
                  </span>
                  {place.distance ? <span className="shrink-0 text-sm tabular-nums">{place.distance}</span> : null}
                </li>
              ))}
            </ul>
          </div>
        ) : null}
      </div>
    </BlockSection>
  );
}
