"use client";

import "maplibre-gl/dist/maplibre-gl.css";

import { MapPinIcon } from "lucide-react";
import type { Map as MapLibreMap } from "maplibre-gl";
import { useTranslations } from "next-intl";
import { useEffect, useRef, useState } from "react";

import { KARTVERKET_ATTRIBUTION, KARTVERKET_TILE_URL } from "@/features/projects/kartverket";
import type { RenderBlockProps } from "@/features/site-builder/components/render/content-blocks";
import { BlockHeading, BlockSection, EditorHint } from "@/features/site-builder/components/render/primitives";

/**
 * Kart med prosjektets plassering (Kartverket) og en liste over nærområdet.
 * MapLibre lastes først når kartet nærmer seg skjermen, så det ikke forsinker
 * resten av siden. Uten WebGL vises adressen og en lenke til kart i stedet.
 */
function SiteMap({ lat, lng, zoom, label }: { lat: number; lng: number; zoom: number; label: string }) {
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
  return <div ref={containerRef} className="h-80 w-full overflow-hidden rounded-[var(--site-radius)] bg-black/5 sm:h-96" />;
}

export function MapBlock({ block, data }: RenderBlockProps<"map">) {
  const t = useTranslations("site.map");
  const tEditor = useTranslations("site.editor");
  const headingId = `${block.id}-heading`;
  const { props } = block;
  const lat = props.use_project_location ? data.project.lat : props.lat;
  const lng = props.use_project_location ? data.project.lng : props.lng;
  const address = [data.project.address, [data.project.postalCode, data.project.city].filter(Boolean).join(" ")].filter(Boolean).join(", ");
  const places = props.places.filter((place) => place.name);

  if ((lat === null || lng === null) && places.length === 0) {
    return data.mode !== "published" ? (
      <BlockSection id={block.id}>
        <EditorHint>{tEditor("emptyMap")}</EditorHint>
      </BlockSection>
    ) : null;
  }

  return (
    <BlockSection id={block.id} headingId={props.heading ? headingId : undefined}>
      {props.heading ? <BlockHeading id={headingId}>{props.heading}</BlockHeading> : null}
      <div className="grid gap-8 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
        {lat !== null && lng !== null ? (
          <div className="grid gap-2">
            <SiteMap lat={lat} lng={lng} zoom={props.zoom} label={t("label", { project: data.project.name })} />
            <p className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm">
              <MapPinIcon className="size-4 text-[var(--site-primary)]" aria-hidden="true" />
              {address ? <span>{address}</span> : null}
              <a
                href={`https://www.openstreetmap.org/?mlat=${lat}&mlon=${lng}#map=${props.zoom}/${lat}/${lng}`}
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
            <ul className="divide-y" style={{ borderColor: "color-mix(in srgb, currentColor 15%, transparent)" }}>
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
