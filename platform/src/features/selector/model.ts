/**
 * Datatyper for boligvelgeren: markeringer i editoren, innstillinger,
 * statusfarger og den publiserte velgeren slik databasen leverer den.
 * Data fra databasen tolkes med Zod, så ukjente eller ødelagte felt aldri
 * stopper den publiserte siden.
 */

import { z } from "zod";

import type { Point } from "@/features/selector/geometry";
import { UNIT_STATUSES, type UnitStatus } from "@/features/units/fields";

// -----------------------------------------------------------------------------
// Markeringer i editoren
// -----------------------------------------------------------------------------

export type HotspotTarget =
  | { type: "unit"; unitId: string }
  | { type: "view"; viewId: string }
  | { type: "project"; projectId: string }
  | { type: "url"; url: string };

export type EditorHotspot = {
  id: string;
  shape: "polygon" | "rect";
  points: Point[];
  target: HotspotTarget | null;
  label: string | null;
};

const pointSchema = z.tuple([z.number().min(0).max(1), z.number().min(0).max(1)]);

/** Markering slik den lagres med save_view_hotspots. */
export function toHotspotRow(hotspot: EditorHotspot) {
  const target = hotspot.target;
  return {
    id: hotspot.id,
    shape: hotspot.shape,
    points: hotspot.points,
    target_type: target?.type ?? null,
    target_unit_id: target?.type === "unit" ? target.unitId : null,
    target_view_id: target?.type === "view" ? target.viewId : null,
    target_project_id: target?.type === "project" ? target.projectId : null,
    target_url: target?.type === "url" ? target.url : null,
    label: hotspot.label,
  };
}

const hotspotRowSchema = z.object({
  id: z.uuid(),
  shape: z.enum(["polygon", "rect"]),
  points: z.array(pointSchema),
  target_type: z.enum(["unit", "view", "project", "url"]).nullable(),
  target_unit_id: z.string().nullable(),
  target_view_id: z.string().nullable(),
  target_project_id: z.string().nullable(),
  target_url: z.string().nullable(),
  label: z.string().nullable(),
});

export type HotspotRow = z.infer<typeof hotspotRowSchema>;

export function fromHotspotRow(row: Omit<HotspotRow, "points"> & { points: readonly Point[] }): EditorHotspot {
  let target: HotspotTarget | null = null;
  if (row.target_type === "unit" && row.target_unit_id) {
    target = { type: "unit", unitId: row.target_unit_id };
  } else if (row.target_type === "view" && row.target_view_id) {
    target = { type: "view", viewId: row.target_view_id };
  } else if (row.target_type === "project" && row.target_project_id) {
    target = { type: "project", projectId: row.target_project_id };
  } else if (row.target_type === "url" && row.target_url) {
    target = { type: "url", url: row.target_url };
  }
  return { id: row.id, shape: row.shape, points: [...row.points], target, label: row.label };
}

/** Validering av markeringene før de sendes til databasen (serveren sjekker det samme). */
export const saveHotspotsSchema = z
  .array(
    hotspotRowSchema.superRefine((row, ctx) => {
      if (row.shape === "rect" && row.points.length !== 2) {
        ctx.addIssue({ code: "custom", message: "invalidShape" });
      }
      if (row.shape === "polygon" && (row.points.length < 3 || row.points.length > 1000)) {
        ctx.addIssue({ code: "custom", message: "invalidShape" });
      }
      if (row.target_type === "url" && !/^https?:\/\//.test(row.target_url ?? "")) {
        ctx.addIssue({ code: "custom", message: "urlInvalid" });
      }
    }),
  )
  .max(2000);

// -----------------------------------------------------------------------------
// Innstillinger for velgeren
// -----------------------------------------------------------------------------

export const FILTER_KEYS = ["status", "rooms", "price", "area", "floor"] as const;
export type FilterKey = (typeof FILTER_KEYS)[number];

export const selectorSettingsSchema = z.object({
  filters: z.array(z.enum(FILTER_KEYS)).catch([...FILTER_KEYS]),
  list: z.enum(["side", "below", "hidden"]).catch("side"),
  hatch_sold: z.boolean().catch(true),
});

export type SelectorSettings = z.infer<typeof selectorSettingsSchema>;

export const DEFAULT_SELECTOR_SETTINGS: SelectorSettings = {
  filters: [...FILTER_KEYS],
  list: "side",
  hatch_sold: true,
};

export function parseSelectorSettings(value: unknown): SelectorSettings {
  const parsed = selectorSettingsSchema.safeParse(value ?? {});
  return parsed.success ? parsed.data : DEFAULT_SELECTOR_SETTINGS;
}

// -----------------------------------------------------------------------------
// Statusfarger
// -----------------------------------------------------------------------------

/** Standardfarger fra spesifikasjonen. Fyll med 45 % dekning og 2 px kantlinje. */
export const DEFAULT_STATUS_COLORS: Record<UnitStatus, string> = {
  available: "#2E9E5B",
  reserved: "#E6A100",
  sold: "#D64545",
  upcoming: "#8A8F98",
};

/** Rekkefølgen statusene vises i: menyen i Status-modus, filtre og tegnforklaring. */
export const STATUS_ORDER: UnitStatus[] = ["available", "reserved", "sold", "upcoming"];

export const FILL_OPACITY = 0.45;
export const STROKE_WIDTH = 2;

const hexColor = z.string().regex(/^#[0-9a-fA-F]{6}$/, { error: "colorInvalid" });

export const statusColorsSchema = z.object({
  available: hexColor.optional(),
  reserved: hexColor.optional(),
  sold: hexColor.optional(),
  upcoming: hexColor.optional(),
});

export type StatusColorOverrides = z.infer<typeof statusColorsSchema>;

/** Gyldige overstyringer fra databasen. Ukjente nøkler og ugyldige farger hoppes over. */
export function parseStatusColorOverrides(value: unknown): StatusColorOverrides {
  if (typeof value !== "object" || value === null) {
    return {};
  }
  const result: StatusColorOverrides = {};
  for (const status of UNIT_STATUSES) {
    const color = (value as Record<string, unknown>)[status];
    if (hexColor.safeParse(color).success) {
      result[status] = color as string;
    }
  }
  return result;
}

/** Prosjektets farger overstyrer organisasjonens, som overstyrer standardfargene. */
export function resolveStatusColors(organization: unknown, project: unknown): Record<UnitStatus, string> {
  return { ...DEFAULT_STATUS_COLORS, ...parseStatusColorOverrides(organization), ...parseStatusColorOverrides(project) };
}

// -----------------------------------------------------------------------------
// Publisert velger (get_published_selector og get_selector_preview)
// -----------------------------------------------------------------------------

const variantSchema = z.object({ width: z.number(), height: z.number(), path: z.string() });

export const publicAssetSchema = z.object({
  id: z.string(),
  path: z.string(),
  mime: z.string(),
  width: z.number().nullish().transform((value) => value ?? null),
  height: z.number().nullish().transform((value) => value ?? null),
  alt: z.string().nullish().transform((value) => value ?? null),
  filename: z.string().nullish().transform((value) => value ?? null),
  variants: z.array(variantSchema).catch([]),
});

export type PublicAsset = z.infer<typeof publicAssetSchema>;

const publicHotspotSchema = z.object({
  id: z.string(),
  shape: z.enum(["polygon", "rect"]),
  points: z.array(pointSchema),
  target_type: z.enum(["unit", "view", "project", "url"]),
  target_unit_id: z.string().nullable(),
  target_view_id: z.string().nullable(),
  target_project_id: z.string().nullable(),
  target_url: z.string().nullable(),
  label: z.string().nullable(),
});

export type PublicHotspot = z.infer<typeof publicHotspotSchema>;

const publicViewSchema = z.object({
  id: z.string(),
  parent_view_id: z.string().nullable(),
  name: z.string(),
  kind: z.string(),
  angle_group: z.string().nullable(),
  sort_order: z.number(),
  image_width: z.number().nullable(),
  image_height: z.number().nullable(),
  asset: publicAssetSchema.nullable(),
  // En markering med ugyldig innhold hoppes over i stedet for å stoppe hele velgeren.
  hotspots: z.array(z.unknown()).transform((items) =>
    items.flatMap((item) => {
      const parsed = publicHotspotSchema.safeParse(item);
      return parsed.success ? [parsed.data] : [];
    }),
  ),
});

export type PublicView = z.infer<typeof publicViewSchema>;

const nullableNumber = z.number().nullish().transform((value) => value ?? null);
const nullableString = z.string().nullish().transform((value) => value ?? null);

export const publicUnitSchema = z.object({
  id: z.string(),
  unit_number: z.string(),
  slug: z.string(),
  title: nullableString,
  unit_type: z.string(),
  status: z.enum(UNIT_STATUSES),
  floor: nullableNumber,
  rooms: nullableNumber,
  bedrooms: nullableNumber,
  bathrooms: nullableNumber,
  bra_i: nullableNumber,
  bra_e: nullableNumber,
  bra_b: nullableNumber,
  tba: nullableNumber,
  plot_area: nullableNumber,
  price_hidden: z.boolean(),
  price: nullableNumber,
  purchase_costs: nullableNumber,
  shared_debt: nullableNumber,
  monthly_fee: nullableNumber,
  ownership_type: nullableString,
  orientation: nullableString,
  parking: nullableString,
  storage: nullableString,
  sort_order: z.number(),
  stage: z.object({ id: z.string(), name: z.string() }).nullable(),
  building: z.object({ id: z.string(), name: z.string() }).nullable(),
  floor_plan: publicAssetSchema.nullable(),
});

export type PublicUnit = z.infer<typeof publicUnitSchema>;

export const publicProjectSchema = z.object({
  id: z.string(),
  name: z.string(),
  slug: z.string(),
  phase: z.string(),
  address: nullableString,
  postal_code: nullableString,
  city: nullableString,
  show_price_on_sold: z.boolean().catch(false),
});

const publishedSelectorSchema = z.object({
  selector: z.object({
    selector_id: z.string(),
    name: z.string(),
    settings: z.unknown(),
    entry_view_id: z.string().nullable(),
    views: z.array(publicViewSchema),
  }),
  published_at: z.string().nullable(),
  project: publicProjectSchema,
  status_colors: z.object({ organization: z.unknown(), project: z.unknown() }).catch({ organization: {}, project: {} }),
  units: z.array(z.unknown()).transform((items) =>
    items.flatMap((item) => {
      const parsed = publicUnitSchema.safeParse(item);
      return parsed.success ? [parsed.data] : [];
    }),
  ),
  linked_projects: z
    .array(
      z.object({
        id: z.string(),
        name: z.string(),
        subdomain: nullableString,
        hostname: nullableString,
      }),
    )
    .catch([]),
});

export type PublishedSelector = {
  id: string;
  name: string;
  settings: SelectorSettings;
  entryViewId: string | null;
  views: PublicView[];
  publishedAt: string | null;
  project: z.infer<typeof publicProjectSchema>;
  statusColors: Record<UnitStatus, string>;
  units: PublicUnit[];
  linkedProjects: { id: string; name: string; subdomain: string | null; hostname: string | null }[];
};

export function parsePublishedSelector(value: unknown): PublishedSelector | null {
  const parsed = publishedSelectorSchema.safeParse(value);
  if (!parsed.success) {
    return null;
  }
  const data = parsed.data;
  return {
    id: data.selector.selector_id,
    name: data.selector.name,
    settings: parseSelectorSettings(data.selector.settings),
    entryViewId: data.selector.entry_view_id,
    views: data.selector.views,
    publishedAt: data.published_at,
    project: data.project,
    statusColors: resolveStatusColors(data.status_colors.organization, data.status_colors.project),
    units: data.units,
    linkedProjects: data.linked_projects,
  };
}

// -----------------------------------------------------------------------------
// Enhetslisten (get_public_units) og enhetssiden (get_public_unit)
// -----------------------------------------------------------------------------

function parseList<T>(schema: z.ZodType<T>) {
  return z
    .array(z.unknown())
    .catch([])
    .transform((items) =>
      items.flatMap((item) => {
        const parsed = schema.safeParse(item);
        return parsed.success ? [parsed.data] : [];
      }),
    );
}

const publicUnitsSchema = z.object({ units: parseList(publicUnitSchema) });

/** Enhetene i et offentlig prosjekt, eller null hvis prosjektet ikke er offentlig. */
export function parsePublicUnits(value: unknown): PublicUnit[] | null {
  const parsed = publicUnitsSchema.safeParse(value);
  return parsed.success ? parsed.data.units : null;
}

const publicContactSchema = z.object({
  name: nullableString,
  title: nullableString,
  email: nullableString,
  phone: nullableString,
  image: publicAssetSchema.nullable().catch(null),
});

export type PublicContact = z.infer<typeof publicContactSchema>;

const publicUnitDetailSchema = publicUnitSchema.extend({
  description: nullableString,
  floor_plans: parseList(publicAssetSchema),
  gallery: parseList(publicAssetSchema),
  documents: parseList(publicAssetSchema),
  project: publicProjectSchema,
  contacts: parseList(publicContactSchema),
  status_colors: z.object({ organization: z.unknown(), project: z.unknown() }).catch({ organization: {}, project: {} }),
  organization: z.object({ name: z.string(), locale: z.string().catch("nb") }).catch({ name: "", locale: "nb" }),
  /** Bare felt prosjektet har gjort offentlige. Databasen filtrerer resten bort. */
  custom_fields: z.record(z.string(), z.unknown()).catch({}),
});

export type PublicUnitDetail = Omit<z.infer<typeof publicUnitDetailSchema>, "status_colors"> & {
  statusColors: Record<UnitStatus, string>;
};

export function parsePublicUnitDetail(value: unknown): PublicUnitDetail | null {
  const parsed = publicUnitDetailSchema.safeParse(value);
  if (!parsed.success) {
    return null;
  }
  const { status_colors: colors, ...unit } = parsed.data;
  return { ...unit, statusColors: resolveStatusColors(colors.organization, colors.project) };
}

/**
 * Om prisen skal skjules. Databasen skjuler prisen på solgte enheter når
 * prosjektet er satt opp slik. Når status endres i sanntid, gjøres det samme
 * i nettleseren, så prisen aldri vises på en enhet som nettopp ble solgt.
 */
export function isPriceHidden(status: UnitStatus, showPriceOnSold: boolean): boolean {
  return status === "sold" && !showPriceOnSold;
}
