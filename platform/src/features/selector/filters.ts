/**
 * Filtre i den publiserte velgeren. Filteret ligger i adressen, så det kan
 * deles: «?status=ledig&rom=3,4&pris=2000000-4500000&areal=60-&etasje=2,3».
 */

import type { FilterKey } from "@/features/selector/model";
import type { PublicUnit } from "@/features/selector/model";
import type { UnitStatus } from "@/features/units/fields";

export type Range = { min: number | null; max: number | null };

export type SelectorFilters = {
  status: UnitStatus[];
  rooms: number[];
  price: Range;
  area: Range;
  floor: number[];
  favorites: boolean;
};

export const EMPTY_FILTERS: SelectorFilters = {
  status: [],
  rooms: [],
  price: { min: null, max: null },
  area: { min: null, max: null },
  floor: [],
  favorites: false,
};

/** Statusnavn i adressen er norske, så delte lenker er lesbare. */
const STATUS_PARAM: Record<UnitStatus, string> = {
  available: "ledig",
  reserved: "reservert",
  sold: "solgt",
  upcoming: "kommende",
};
const STATUS_FROM_PARAM = Object.fromEntries(Object.entries(STATUS_PARAM).map(([status, param]) => [param, status])) as Record<
  string,
  UnitStatus
>;

const PARAMS = { status: "status", rooms: "rom", price: "pris", area: "areal", floor: "etasje", favorites: "favoritter" } as const;

function parseIntegerList(value: string | null): number[] {
  if (!value) {
    return [];
  }
  return [...new Set(value.split(",").map((item) => Number(item.trim())).filter((item) => Number.isInteger(item)))].sort(
    (a, b) => a - b,
  );
}

function parseRange(value: string | null): Range {
  if (!value) {
    return { min: null, max: null };
  }
  const [rawMin = "", rawMax = ""] = value.split("-");
  const toNumber = (raw: string) => {
    const number = Number(raw);
    return raw.trim() === "" || !Number.isFinite(number) || number < 0 ? null : number;
  };
  const min = toNumber(rawMin);
  const max = toNumber(rawMax);
  if (min !== null && max !== null && min > max) {
    return { min: max, max: min };
  }
  return { min, max };
}

function rangeParam(range: Range): string | null {
  if (range.min === null && range.max === null) {
    return null;
  }
  return `${range.min ?? ""}-${range.max ?? ""}`;
}

export function parseFilters(params: URLSearchParams): SelectorFilters {
  const status = (params.get(PARAMS.status) ?? "")
    .split(",")
    .map((item) => STATUS_FROM_PARAM[item.trim().toLowerCase()])
    .filter((item): item is UnitStatus => item !== undefined);
  return {
    status: [...new Set(status)],
    rooms: parseIntegerList(params.get(PARAMS.rooms)),
    price: parseRange(params.get(PARAMS.price)),
    area: parseRange(params.get(PARAMS.area)),
    floor: parseIntegerList(params.get(PARAMS.floor)),
    favorites: params.get(PARAMS.favorites) === "1",
  };
}

/** Skriver filteret inn i adressen. Andre parametere (som valgt visning) beholdes. */
export function writeFilters(filters: SelectorFilters, base: URLSearchParams): URLSearchParams {
  const params = new URLSearchParams(base);
  for (const key of Object.values(PARAMS)) {
    params.delete(key);
  }
  if (filters.status.length > 0) {
    params.set(PARAMS.status, filters.status.map((status) => STATUS_PARAM[status]).join(","));
  }
  if (filters.rooms.length > 0) {
    params.set(PARAMS.rooms, filters.rooms.join(","));
  }
  const price = rangeParam(filters.price);
  if (price) {
    params.set(PARAMS.price, price);
  }
  const area = rangeParam(filters.area);
  if (area) {
    params.set(PARAMS.area, area);
  }
  if (filters.floor.length > 0) {
    params.set(PARAMS.floor, filters.floor.join(","));
  }
  if (filters.favorites) {
    params.set(PARAMS.favorites, "1");
  }
  return params;
}

export function hasActiveFilters(filters: SelectorFilters): boolean {
  return (
    filters.status.length > 0 ||
    filters.rooms.length > 0 ||
    filters.floor.length > 0 ||
    filters.favorites ||
    filters.price.min !== null ||
    filters.price.max !== null ||
    filters.area.min !== null ||
    filters.area.max !== null
  );
}

function inRange(value: number | null, range: Range): boolean {
  if (range.min === null && range.max === null) {
    return true;
  }
  if (value === null) {
    return false;
  }
  return (range.min === null || value >= range.min) && (range.max === null || value <= range.max);
}

/**
 * Om enheten treffer filteret. Bare filtrene som er slått på for velgeren,
 * brukes. En skjult pris (solgt) treffer ikke et prisfilter.
 */
export function matchesFilters(
  unit: PublicUnit,
  filters: SelectorFilters,
  enabled: readonly FilterKey[],
  favorites: ReadonlySet<string> = new Set(),
): boolean {
  const on = (key: FilterKey) => enabled.includes(key);
  if (on("status") && filters.status.length > 0 && !filters.status.includes(unit.status)) {
    return false;
  }
  if (on("rooms") && filters.rooms.length > 0 && (unit.rooms === null || !filters.rooms.includes(unit.rooms))) {
    return false;
  }
  if (on("floor") && filters.floor.length > 0 && (unit.floor === null || !filters.floor.includes(unit.floor))) {
    return false;
  }
  if (on("price") && !inRange(unit.price_hidden ? null : unit.price, filters.price)) {
    return false;
  }
  if (on("area") && !inRange(unit.bra_i, filters.area)) {
    return false;
  }
  if (filters.favorites && !favorites.has(unit.id)) {
    return false;
  }
  return true;
}

/** Valgene som finnes i prosjektet: antall rom, etasjer og spennet i pris og areal. */
export function filterOptions(units: readonly PublicUnit[]) {
  const rooms = [...new Set(units.flatMap((unit) => (unit.rooms === null ? [] : [unit.rooms])))].sort((a, b) => a - b);
  const floors = [...new Set(units.flatMap((unit) => (unit.floor === null ? [] : [unit.floor])))].sort((a, b) => a - b);
  const prices = units.flatMap((unit) => (unit.price === null || unit.price_hidden ? [] : [unit.price]));
  const areas = units.flatMap((unit) => (unit.bra_i === null ? [] : [unit.bra_i]));
  return {
    rooms,
    floors,
    price: prices.length > 0 ? { min: Math.min(...prices), max: Math.max(...prices) } : null,
    area: areas.length > 0 ? { min: Math.min(...areas), max: Math.max(...areas) } : null,
  };
}
