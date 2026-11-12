"use client";

import "maplibre-gl/dist/maplibre-gl.css";

import type { Map as MapLibreMap, Marker } from "maplibre-gl";
import { useEffect, useRef, useState } from "react";

import { KARTVERKET_ATTRIBUTION, KARTVERKET_TILE_URL } from "@/features/projects/kartverket";
import { cn } from "@/lib/utils";

export type LatLng = { lat: number; lng: number };

/** Hele Norge når prosjektet ikke har plassering ennå. */
const NORWAY_CENTER: [number, number] = [13.0, 64.5];
const NORWAY_ZOOM = 3.6;
const PROJECT_ZOOM = 15;

const round6 = (value: number) => Math.round(value * 1e6) / 1e6;

/**
 * Kart med flyttbar nål. Klikk i kartet eller dra nålen for å sette plasseringen.
 * MapLibre lastes først når kartet vises, så resten av siden ikke venter på det.
 * Uten WebGL vises en melding i stedet; koordinatene kan da skrives inn for hånd.
 */
export function LocationMap({
  value,
  onChange,
  label,
  unavailableText,
  className,
}: {
  value: LatLng | null;
  onChange: (value: LatLng) => void;
  label: string;
  unavailableText: string;
  className?: string;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<MapLibreMap | null>(null);
  const markerRef = useRef<Marker | null>(null);
  const onChangeRef = useRef(onChange);
  const valueRef = useRef(value);
  // Siste posisjon kartet selv rapporterte. Da flyttes ikke kartet når forelderen sender den tilbake.
  const reportedRef = useRef<LatLng | null>(null);
  const [ready, setReady] = useState(false);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    onChangeRef.current = onChange;
    valueRef.current = value;
  });

  useEffect(() => {
    let cancelled = false;
    let map: MapLibreMap | null = null;

    async function init() {
      try {
        const maplibre = await import("maplibre-gl");
        const container = containerRef.current;
        if (cancelled || !container) {
          return;
        }
        maplibre.setWorkerUrl(`/vendor/maplibre-gl-worker-${maplibre.getVersion()}.mjs`);
        const initial = valueRef.current;
        map = new maplibre.Map({
          container,
          style: {
            version: 8,
            sources: {
              topo: {
                type: "raster",
                tiles: [KARTVERKET_TILE_URL],
                tileSize: 256,
                maxzoom: 18,
                attribution: KARTVERKET_ATTRIBUTION,
              },
            },
            layers: [{ id: "topo", type: "raster", source: "topo" }],
          },
          center: initial ? [initial.lng, initial.lat] : NORWAY_CENTER,
          zoom: initial ? PROJECT_ZOOM : NORWAY_ZOOM,
          maxZoom: 19,
        });
        map.getCanvas().setAttribute("aria-label", label);
        map.addControl(new maplibre.NavigationControl({ showCompass: false }), "top-right");

        const marker = new maplibre.Marker({ draggable: true, color: "#0f766e" });
        const report = (position: { lat: number; lng: number }) => {
          const next = { lat: round6(position.lat), lng: round6(position.lng) };
          reportedRef.current = next;
          onChangeRef.current(next);
        };
        marker.on("dragend", () => report(marker.getLngLat()));
        const created = map;
        map.on("click", (event) => {
          marker.setLngLat(event.lngLat).addTo(created);
          report(event.lngLat);
        });
        if (initial) {
          marker.setLngLat([initial.lng, initial.lat]).addTo(map);
        }
        mapRef.current = map;
        markerRef.current = marker;
        setReady(true);
      } catch (error) {
        console.warn("Kartet kunne ikke vises", error);
        if (!cancelled) {
          setFailed(true);
        }
      }
    }

    void init();
    return () => {
      cancelled = true;
      map?.remove();
      mapRef.current = null;
      markerRef.current = null;
    };
  }, [label]);

  const lat = value?.lat ?? null;
  const lng = value?.lng ?? null;

  useEffect(() => {
    const map = mapRef.current;
    const marker = markerRef.current;
    if (!ready || !map || !marker) {
      return;
    }
    if (lat === null || lng === null) {
      marker.remove();
      return;
    }
    const reported = reportedRef.current;
    marker.setLngLat([lng, lat]).addTo(map);
    if (reported && reported.lat === lat && reported.lng === lng) {
      return;
    }
    map.easeTo({ center: [lng, lat], zoom: Math.max(map.getZoom(), PROJECT_ZOOM) });
  }, [ready, lat, lng]);

  if (failed) {
    return (
      <div className={cn("flex items-center justify-center rounded-md border bg-muted p-6 text-center text-sm text-muted-foreground", className)}>
        {unavailableText}
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      role="region"
      aria-label={label}
      className={cn("relative h-80 w-full overflow-hidden rounded-md border bg-muted", className)}
      data-testid="location-map"
    />
  );
}
