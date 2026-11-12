"use client";

/* eslint-disable @next/next/no-img-element -- Bildene er ferdige WebP-varianter fra Storage med srcSet. */

import { ArrowLeftIcon, FileTextIcon, MailIcon, PhoneIcon } from "lucide-react";
import { useTranslations } from "next-intl";
import { useCallback, useState } from "react";

import { imageSources } from "@/features/selector/components/hotspot-svg";
import { StatusPill } from "@/features/selector/components/public/unit-card";
import { usePublicUnitStatus } from "@/features/selector/components/public/use-public-units";
import { useUnitFormat } from "@/features/selector/components/public/use-unit-format";
import { isPriceHidden, parsePublicUnitDetail, type PublicAsset, type PublicUnitDetail } from "@/features/selector/model";
import { selectorPublicPath } from "@/features/selector/paths";
import { publicMediaUrl } from "@/features/media/model";
import { calculateTotals } from "@/features/units/price";
import { getPublicBrowserClient } from "@/lib/supabase/public-browser";

function Picture({ asset, alt, sizes, className }: { asset: PublicAsset; alt: string; sizes: string; className?: string }) {
  const sources = imageSources(asset);
  return <img src={sources.src} srcSet={sources.srcSet} sizes={sizes} alt={alt} className={className} loading="lazy" />;
}

/** Tilbake til velgeren. Kom kjøperen derfra, brukes nettleserens historikk, så filter og visning er som før. */
function BackLink({ selectorId, label }: { selectorId: string; label: string }) {
  const href = selectorPublicPath(selectorId);
  return (
    <a
      href={href}
      className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground hover:underline"
      onClick={(event) => {
        try {
          const referrer = document.referrer ? new URL(document.referrer) : null;
          if (referrer && referrer.origin === window.location.origin && referrer.pathname === href && window.history.length > 1) {
            event.preventDefault();
            window.history.back();
          }
        } catch {
          // Ugyldig referrer: følg lenken som vanlig.
        }
      }}
    >
      <ArrowLeftIcon className="size-4" aria-hidden="true" />
      {label}
    </a>
  );
}

export function PublicUnitPage({ selectorId, projectId, unit: initial }: { selectorId: string; projectId: string; unit: PublicUnitDetail }) {
  const t = useTranslations("publicSelector.unitPage");
  const tFields = useTranslations("units.fields");
  const tTypes = useTranslations("units.types");
  const tOwnership = useTranslations("units.ownership");
  const formatUnit = useUnitFormat();
  const [unit, setUnit] = useState(initial);

  const reload = useCallback(async () => {
    const { data, error } = await getPublicBrowserClient().rpc("get_public_unit", { p_project_id: projectId, p_slug: initial.slug });
    if (!error) {
      const fresh = parsePublicUnitDetail(data);
      if (fresh) {
        setUnit(fresh);
      }
    }
  }, [initial.slug, projectId]);

  const live = usePublicUnitStatus(projectId, true, {
    onStatus: (unitId, status) => {
      if (unitId !== initial.id) {
        return;
      }
      const hidden = isPriceHidden(status, unit.project.show_price_on_sold);
      if (unit.price_hidden && !hidden) {
        void reload();
      }
      setUnit((current) =>
        hidden
          ? { ...current, status, price_hidden: true, price: null, purchase_costs: null, shared_debt: null }
          : { ...current, status, price_hidden: false },
      );
    },
    onSubscribed: () => void reload(),
  });

  const totals = unit.price_hidden ? null : calculateTotals({ price: unit.price, purchaseCosts: unit.purchase_costs, sharedDebt: unit.shared_debt });
  const facts: { label: string; value: string }[] = [
    { label: tFields("unit_type"), value: tTypes.has(unit.unit_type as "apartment") ? tTypes(unit.unit_type as "apartment") : unit.unit_type },
    { label: tFields("rooms"), value: unit.rooms?.toString() ?? "–" },
    { label: tFields("bedrooms"), value: unit.bedrooms?.toString() ?? "–" },
    { label: tFields("bathrooms"), value: unit.bathrooms?.toString() ?? "–" },
    { label: tFields("bra_i"), value: formatUnit.area(unit.bra_i) },
    ...(unit.bra_e !== null ? [{ label: tFields("bra_e"), value: formatUnit.area(unit.bra_e) }] : []),
    ...(unit.bra_b !== null ? [{ label: tFields("bra_b"), value: formatUnit.area(unit.bra_b) }] : []),
    ...(unit.tba !== null ? [{ label: tFields("tba"), value: formatUnit.area(unit.tba) }] : []),
    ...(unit.plot_area !== null ? [{ label: tFields("plot_area"), value: formatUnit.area(unit.plot_area) }] : []),
    { label: tFields("floor"), value: unit.floor?.toString() ?? "–" },
    ...(unit.ownership_type
      ? [{ label: tFields("ownership_type"), value: tOwnership.has(unit.ownership_type as "selveier") ? tOwnership(unit.ownership_type as "selveier") : unit.ownership_type }]
      : []),
    ...(unit.orientation ? [{ label: tFields("orientation"), value: unit.orientation }] : []),
    ...(unit.parking ? [{ label: tFields("parking"), value: unit.parking }] : []),
    ...(unit.storage ? [{ label: tFields("storage"), value: unit.storage }] : []),
    ...(unit.building ? [{ label: tFields("building"), value: unit.building.name }] : []),
    ...(unit.stage ? [{ label: tFields("stage"), value: unit.stage.name }] : []),
  ];

  const priceRows: { label: string; value: string; strong?: boolean }[] = unit.price_hidden
    ? []
    : [
        ...(unit.price !== null ? [{ label: tFields("price"), value: formatUnit.money(unit.price) }] : []),
        ...(unit.purchase_costs !== null ? [{ label: tFields("purchase_costs"), value: formatUnit.money(unit.purchase_costs) }] : []),
        ...(totals?.total !== null && totals?.total !== undefined ? [{ label: tFields("total"), value: formatUnit.money(totals.total), strong: true }] : []),
        ...(unit.shared_debt !== null && unit.shared_debt > 0 ? [{ label: tFields("shared_debt"), value: formatUnit.money(unit.shared_debt) }] : []),
        ...(totals?.totalWithSharedDebt ? [{ label: tFields("total_with_debt"), value: formatUnit.money(totals.totalWithSharedDebt), strong: true }] : []),
      ];
  const address = [unit.project.address, [unit.project.postal_code, unit.project.city].filter(Boolean).join(" ")].filter(Boolean).join(", ");
  const [hero, ...gallery] = unit.gallery;
  // Uten bilder, plantegninger, beskrivelse og dokumenter vises nøkkelinformasjonen alene, uten tom kolonne.
  const hasMain = Boolean(hero) || unit.floor_plans.length > 0 || Boolean(unit.description) || unit.documents.length > 0;

  return (
    <article className="mx-auto grid w-full max-w-6xl gap-6 p-4 sm:p-6" data-live={live}>
      <BackLink selectorId={selectorId} label={t("back")} />
      <header className="grid gap-2">
        <p className="text-sm text-muted-foreground">
          {unit.project.name}
          {address ? ` · ${address}` : ""}
        </p>
        <div className="flex flex-wrap items-center gap-3">
          <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">{unit.title ? `${unit.unit_number} – ${unit.title}` : unit.unit_number}</h1>
          <StatusPill status={unit.status} color={unit.statusColors[unit.status]} />
        </div>
        <p className="text-xl font-semibold" data-testid="unit-price">
          {formatUnit.price(unit)}
        </p>
      </header>

      <div className={hasMain ? "grid gap-8 lg:grid-cols-[minmax(0,1fr)_22rem]" : "grid max-w-xl gap-8"}>
        <div className={hasMain ? "grid min-w-0 content-start gap-8" : "hidden"}>
          {hero ? (
            <section aria-label={t("gallery")} className="grid gap-2">
              <Picture asset={hero} alt={hero.alt ?? t("imageAlt", { unit: unit.unit_number })} sizes="(min-width: 1024px) 44rem, 100vw" className="aspect-[3/2] w-full rounded-lg object-cover" />
              {gallery.length > 0 ? (
                <ul className="grid grid-cols-3 gap-2 sm:grid-cols-4">
                  {gallery.map((asset) => (
                    <li key={asset.id}>
                      <a href={publicMediaUrl(asset.path)} target="_blank" rel="noreferrer">
                        <Picture asset={asset} alt={asset.alt ?? t("imageAlt", { unit: unit.unit_number })} sizes="12rem" className="aspect-[4/3] w-full rounded-md object-cover" />
                      </a>
                    </li>
                  ))}
                </ul>
              ) : null}
            </section>
          ) : null}

          {unit.floor_plans.length > 0 ? (
            <section aria-labelledby="unit-floor-plans" className="grid gap-3">
              <h2 id="unit-floor-plans" className="text-lg font-semibold">
                {t("floorPlans")}
              </h2>
              {unit.floor_plans.map((plan) => (
                <Picture
                  key={plan.id}
                  asset={plan}
                  alt={plan.alt ?? t("floorPlanAlt", { unit: unit.unit_number })}
                  sizes="(min-width: 1024px) 44rem, 100vw"
                  className="w-full rounded-lg border bg-white object-contain"
                />
              ))}
            </section>
          ) : null}

          {unit.description ? (
            <section aria-labelledby="unit-description" className="grid gap-2">
              <h2 id="unit-description" className="text-lg font-semibold">
                {t("description")}
              </h2>
              <p className="leading-relaxed whitespace-pre-line">{unit.description}</p>
            </section>
          ) : null}

          {unit.documents.length > 0 ? (
            <section aria-labelledby="unit-documents" className="grid gap-2">
              <h2 id="unit-documents" className="text-lg font-semibold">
                {t("documents")}
              </h2>
              <ul className="grid gap-1">
                {unit.documents.map((document) => (
                  <li key={document.id}>
                    <a href={publicMediaUrl(document.path)} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 text-sm hover:underline">
                      <FileTextIcon className="size-4 text-muted-foreground" aria-hidden="true" />
                      {document.filename ?? t("document")}
                    </a>
                  </li>
                ))}
              </ul>
            </section>
          ) : null}
        </div>

        <aside className="grid content-start gap-6 lg:sticky lg:top-6">
          <section aria-labelledby="unit-facts" className="grid gap-3 rounded-lg border p-4">
            <h2 id="unit-facts" className="font-semibold">
              {t("facts")}
            </h2>
            <dl className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
              {facts.map((fact) => (
                <div key={fact.label}>
                  <dt className="text-xs text-muted-foreground">{fact.label}</dt>
                  <dd className="font-medium">{fact.value}</dd>
                </div>
              ))}
            </dl>
          </section>

          <section aria-labelledby="unit-price-title" className="grid gap-3 rounded-lg border p-4">
            <h2 id="unit-price-title" className="font-semibold">
              {t("price")}
            </h2>
            {unit.price_hidden ? (
              <p className="text-sm">{t("soldPrice")}</p>
            ) : priceRows.length === 0 ? (
              <p className="text-sm text-muted-foreground">{t("priceComing")}</p>
            ) : (
              <dl className="grid gap-1.5 text-sm">
                {priceRows.map((row) => (
                  <div key={row.label} className="flex justify-between gap-4">
                    <dt className={row.strong ? "font-medium" : "text-muted-foreground"}>{row.label}</dt>
                    <dd className={row.strong ? "font-semibold tabular-nums" : "tabular-nums"}>{row.value}</dd>
                  </div>
                ))}
              </dl>
            )}
            {unit.monthly_fee !== null ? (
              <p className="flex justify-between gap-4 border-t pt-2 text-sm">
                <span className="text-muted-foreground">{tFields("monthly_fee")}</span>
                <span className="tabular-nums">{formatUnit.money(unit.monthly_fee)}</span>
              </p>
            ) : null}
          </section>

          {unit.contacts.length > 0 ? (
            <section aria-labelledby="unit-contacts" className="grid gap-3 rounded-lg border p-4">
              <h2 id="unit-contacts" className="font-semibold">
                {t("contact")}
              </h2>
              <ul className="grid gap-4">
                {unit.contacts.map((contact, index) => (
                  <li key={`${contact.name}-${index}`} className="flex gap-3">
                    {contact.image ? (
                      <Picture asset={contact.image} alt="" sizes="4rem" className="size-14 shrink-0 rounded-full object-cover" />
                    ) : null}
                    <div className="grid gap-0.5 text-sm">
                      <p className="font-medium">{contact.name}</p>
                      {contact.title ? <p className="text-muted-foreground">{contact.title}</p> : null}
                      {contact.phone ? (
                        <a href={`tel:${contact.phone.replace(/\s/g, "")}`} className="inline-flex items-center gap-1.5 hover:underline">
                          <PhoneIcon className="size-3.5" aria-hidden="true" />
                          {contact.phone}
                        </a>
                      ) : null}
                      {contact.email ? (
                        <a href={`mailto:${contact.email}`} className="inline-flex items-center gap-1.5 break-all hover:underline">
                          <MailIcon className="size-3.5" aria-hidden="true" />
                          {contact.email}
                        </a>
                      ) : null}
                    </div>
                  </li>
                ))}
              </ul>
            </section>
          ) : null}
          {live === "live" ? <p className="text-xs text-muted-foreground">{t("liveStatus")}</p> : null}
        </aside>
      </div>
    </article>
  );
}
