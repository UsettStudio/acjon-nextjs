/**
 * SEO for publiserte prosjektsider: tittel, beskrivelse, kanonisk adresse,
 * Open Graph og strukturerte data (schema.org som JSON-LD).
 */

import type { Metadata } from "next";

import { fromPublicAsset, shareImageUrl } from "@/features/site-builder/assets";
import type { SiteRenderData } from "@/features/site-builder/site";
import type { PublicUnitDetail } from "@/features/selector/model";

const OG_LOCALE: Record<string, string> = { nb: "nb_NO", en: "en_GB", sv: "sv_SE" };

function truncate(value: string, max: number): string {
  const clean = value.replace(/\s+/g, " ").trim();
  return clean.length <= max ? clean : `${clean.slice(0, max - 1).trimEnd()}…`;
}

export function pageUrl(data: SiteRenderData): string {
  const page = data.page;
  return `${data.site.url}${!page || page.isHome ? "/" : `/${page.slug}`}`;
}

export function pageMetadata(data: SiteRenderData): Metadata {
  const page = data.page;
  const project = data.project.name;
  const title = page?.isHome ? (page.seoTitle ?? project) : `${page?.seoTitle ?? page?.title ?? ""} – ${project}`;
  const description = truncate(page?.seoDescription || data.seoDefaults.description || data.project.description || "", 160) || undefined;
  const ogAssetId = page?.ogAssetId ?? data.seoDefaults.og_asset_id;
  const heroImage = page?.blocks.find((block) => block.type === "hero" && block.props.image_asset_id);
  const imageId = ogAssetId ?? (heroImage?.type === "hero" ? heroImage.props.image_asset_id : null);
  const image = imageId ? data.assets[imageId] : undefined;
  const url = pageUrl(data);
  return {
    title: { absolute: title },
    description,
    alternates: { canonical: url },
    robots: data.mode === "published" ? { index: true, follow: true } : { index: false, follow: false },
    openGraph: {
      type: "website",
      url,
      siteName: project,
      title,
      description,
      locale: OG_LOCALE[data.organization.locale] ?? "nb_NO",
      images: image ? [{ url: shareImageUrl(image), width: image.width ?? undefined, height: image.height ?? undefined, alt: image.alt ?? "" }] : undefined,
    },
  };
}

export function unitMetadata(data: SiteRenderData, unit: PublicUnitDetail, statusLabel: string): Metadata {
  const title = `${unit.title ? `${unit.unit_number} – ${unit.title}` : unit.unit_number} – ${data.project.name}`;
  const description = truncate(unit.description || `${data.project.name}. ${statusLabel}.`, 160);
  const url = `${data.site.url}/bolig/${encodeURIComponent(unit.slug)}`;
  const image = unit.gallery[0] ?? unit.floor_plans[0];
  return {
    title: { absolute: title },
    description,
    alternates: { canonical: url },
    robots: { index: true, follow: true },
    openGraph: {
      type: "website",
      url,
      siteName: data.project.name,
      title,
      description,
      locale: OG_LOCALE[data.organization.locale] ?? "nb_NO",
      images: image ? [{ url: shareImageUrl(fromPublicAsset(image)) }] : undefined,
    },
  };
}

const AVAILABILITY: Record<string, string> = {
  available: "https://schema.org/InStock",
  reserved: "https://schema.org/LimitedAvailability",
  sold: "https://schema.org/SoldOut",
  upcoming: "https://schema.org/PreOrder",
};

function postalAddress(data: SiteRenderData) {
  const { address, postalCode, city } = data.project;
  return address || city
    ? { "@type": "PostalAddress", streetAddress: address ?? undefined, postalCode: postalCode ?? undefined, addressLocality: city ?? undefined, addressCountry: "NO" }
    : undefined;
}

/** Strukturerte data for en side: boligprosjektet på forsiden, og spørsmål og svar fra FAQ-blokker. */
export function pageStructuredData(data: SiteRenderData): object[] {
  const result: object[] = [];
  if (data.page?.isHome) {
    result.push({
      "@context": "https://schema.org",
      "@type": "ApartmentComplex",
      name: data.project.name,
      url: data.site.url,
      description: data.project.description ?? undefined,
      address: postalAddress(data),
      geo:
        data.project.lat !== null && data.project.lng !== null
          ? { "@type": "GeoCoordinates", latitude: data.project.lat, longitude: data.project.lng }
          : undefined,
      numberOfAccommodationUnits: data.units.length || undefined,
      numberOfAvailableAccommodationUnits: data.units.filter((unit) => unit.status === "available").length || undefined,
    });
  }
  const questions = (data.page?.blocks ?? []).flatMap((block) =>
    block.type === "faq" ? block.props.items.filter((item) => item.question && item.answer) : [],
  );
  if (questions.length > 0) {
    result.push({
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: questions.map((item) => ({
        "@type": "Question",
        name: item.question,
        acceptedAnswer: { "@type": "Answer", text: item.answer },
      })),
    });
  }
  return result;
}

export function unitStructuredData(data: SiteRenderData, unit: PublicUnitDetail): object {
  const type = unit.unit_type === "detached" ? "SingleFamilyResidence" : unit.unit_type === "apartment" ? "Apartment" : "Accommodation";
  return {
    "@context": "https://schema.org",
    "@type": type,
    name: unit.title ? `${unit.unit_number} – ${unit.title}` : unit.unit_number,
    url: `${data.site.url}/bolig/${encodeURIComponent(unit.slug)}`,
    numberOfRooms: unit.rooms ?? undefined,
    numberOfBedrooms: unit.bedrooms ?? undefined,
    floorLevel: unit.floor !== null ? String(unit.floor) : undefined,
    floorSize: unit.bra_i !== null ? { "@type": "QuantitativeValue", value: unit.bra_i, unitCode: "MTK" } : undefined,
    address: postalAddress(data),
    containedInPlace: { "@type": "ApartmentComplex", name: data.project.name, url: data.site.url },
    offers: {
      "@type": "Offer",
      availability: AVAILABILITY[unit.status],
      price: unit.price_hidden || unit.price === null ? undefined : unit.price,
      priceCurrency: unit.price_hidden || unit.price === null ? undefined : "NOK",
    },
  };
}

/** JSON som trygt kan stå i en <script>-tagg (ingen «</script>» i teksten). */
export function jsonLd(value: object): string {
  return JSON.stringify(value).replace(/</g, "\\u003c").replace(/>/g, "\\u003e").replace(/&/g, "\\u0026");
}
