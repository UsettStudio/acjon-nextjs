import { describe, expect, it } from "vitest";

import { EMPTY_FILTERS, filterOptions, hasActiveFilters, matchesFilters, parseFilters, writeFilters } from "@/features/selector/filters";
import {
  boundsIntersect,
  boundsOf,
  centroid,
  clientToFraction,
  duplicatePoints,
  fitViewport,
  insertPoint,
  nearestEdge,
  normalizeRect,
  nudge,
  pointInPolygon,
  polygonArea,
  rectCorners,
  removePoint,
  resizeRect,
  toSvgPoints,
  translateGroup,
  translatePoints,
  zoomAt,
  type Point,
} from "@/features/selector/geometry";
import { createHistory, HISTORY_LIMIT, pushHistory, redoHistory, undoHistory } from "@/features/selector/history";
import {
  FILTER_KEYS,
  fromHotspotRow,
  parsePublishedSelector,
  parseSelectorSettings,
  resolveStatusColors,
  saveHotspotsSchema,
  toHotspotRow,
  type PublicUnit,
} from "@/features/selector/model";

const square: Point[] = [
  [0.1, 0.1],
  [0.3, 0.1],
  [0.3, 0.3],
  [0.1, 0.3],
];

describe("koordinatomregning", () => {
  it("regner skjermpunkt om til andel av bildet, også når bildet er zoomet og flyttet", () => {
    // Bildet vises 800 × 400 px, flyttet 50 px inn og 100 px ned.
    const box = { left: 50, top: 100, width: 800, height: 400 };
    expect(clientToFraction(50, 100, box)).toEqual([0, 0]);
    expect(clientToFraction(450, 300, box)).toEqual([0.5, 0.5]);
    expect(clientToFraction(850, 500, box)).toEqual([1, 1]);
  });

  it("holder punkter innenfor bildet", () => {
    const box = { left: 0, top: 0, width: 100, height: 100 };
    expect(clientToFraction(-20, 150, box)).toEqual([0, 1]);
  });

  it("gir samme plassering i piksler uansett hvor bredt bildet vises", () => {
    // Akseptkriterium 3: markeringene er andeler og følger bildet på 360, 768 og 1920 px.
    for (const width of [360, 768, 1920]) {
      const height = (width * 1600) / 2400;
      const box = { left: 0, top: 0, width, height };
      const [x, y] = clientToFraction(width * 0.25, height * 0.75, box);
      expect(x).toBeCloseTo(0.25, 6);
      expect(y).toBeCloseTo(0.75, 6);
    }
  });

  it("lager SVG-punkter i bildepiksler", () => {
    expect(toSvgPoints([[0.5, 0.25]], 2400, 1600)).toBe("1200,400");
  });
});

describe("former", () => {
  it("normaliserer rektangler uansett dra-retning", () => {
    expect(normalizeRect([0.6, 0.7], [0.2, 0.1])).toEqual([
      [0.2, 0.1],
      [0.6, 0.7],
    ]);
    expect(rectCorners([[0.2, 0.1], [0.6, 0.7]])).toEqual([
      [0.2, 0.1],
      [0.6, 0.1],
      [0.6, 0.7],
      [0.2, 0.7],
    ]);
  });

  it("flytter former uten at de går utenfor bildet", () => {
    expect(translatePoints(square, 0.1, 0)).toEqual([
      [0.2, 0.1],
      [0.4, 0.1],
      [0.4, 0.3],
      [0.2, 0.3],
    ]);
    const moved = translatePoints(square, -0.5, 0.9);
    expect(boundsOf(moved)).toEqual({ minX: 0, minY: 0.8, maxX: 0.2, maxY: 1 });
  });

  it("flytter ett piksel med piltaster og ti med Shift", () => {
    const right = nudge(square, "ArrowRight", false, 1000, 500);
    expect(right?.[0]).toEqual([0.101, 0.1]);
    const down = nudge(square, "ArrowDown", true, 1000, 500);
    expect(down?.[0]).toEqual([0.1, 0.12]);
    expect(nudge(square, "Enter", false, 1000, 500)).toBeNull();
  });

  it("dupliserer med en liten forskyvning", () => {
    expect(duplicatePoints(square, 1200, 600)[0]).toEqual([0.11, 0.12]);
  });

  it("finner nærmeste kant og setter inn nytt punkt der", () => {
    const hit = nearestEdge(square, [0.2, 0.102], 8, 1000, 1000);
    expect(hit).toEqual({ insertAt: 1, point: [0.2, 0.1] });
    expect(insertPoint(square, 1, [0.2, 0.1])).toHaveLength(5);
    expect(nearestEdge(square, [0.2, 0.2], 8, 1000, 1000)).toBeNull();
  });

  it("fjerner punkter, men aldri under tre", () => {
    expect(removePoint(square, 0)).toHaveLength(3);
    expect(removePoint(square.slice(0, 3), 0)).toBeNull();
  });

  it("regner areal i piksler og tyngdepunkt", () => {
    expect(polygonArea(square, 1000, 500)).toBeCloseTo(200 * 100, 6);
    const [cx, cy] = centroid(square);
    expect(cx).toBeCloseTo(0.2, 9);
    expect(cy).toBeCloseTo(0.2, 9);
  });

  it("vet om et punkt er inne i en form", () => {
    expect(pointInPolygon([0.2, 0.2], square)).toBe(true);
    expect(pointInPolygon([0.5, 0.2], square)).toBe(false);
  });

  it("finner former som overlapper en dra-ramme", () => {
    expect(boundsIntersect(boundsOf(square), { minX: 0.25, minY: 0.25, maxX: 0.5, maxY: 0.5 })).toBe(true);
    expect(boundsIntersect(boundsOf(square), { minX: 0.31, minY: 0.31, maxX: 0.5, maxY: 0.5 })).toBe(false);
  });

  it("flytter flere former samlet og stopper ved bildekanten", () => {
    const left: Point[] = [
      [0.05, 0.1],
      [0.2, 0.1],
      [0.2, 0.3],
    ];
    const right: Point[] = [
      [0.6, 0.1],
      [0.9, 0.1],
      [0.9, 0.3],
    ];
    const [movedLeft, movedRight] = translateGroup([left, right], 0.5, 0);
    // Den høyre formen stopper ved kanten (0,9 → 1,0), og den venstre flytter like langt.
    expect(movedRight?.[1]?.[0]).toBeCloseTo(1, 9);
    expect(movedLeft?.[0]?.[0]).toBeCloseTo(0.15, 9);
    expect(translateGroup([], 0.1, 0.1)).toEqual([]);
  });

  it("endrer størrelse på rektangel fra et hjørne", () => {
    const rect: Point[] = [
      [0.2, 0.2],
      [0.4, 0.5],
    ];
    // Nederst til høyre (hjørne 2) dras ut. Øverst til venstre ligger i ro.
    expect(resizeRect(rect, 2, [0.6, 0.7])).toEqual([
      [0.2, 0.2],
      [0.6, 0.7],
    ]);
    // Øverst til venstre (hjørne 0) dras forbi motsatt hjørne: rektangelet snus riktig vei.
    expect(resizeRect(rect, 0, [0.5, 0.6])).toEqual([
      [0.4, 0.5],
      [0.5, 0.6],
    ]);
    // Utenfor bildet begrenses til kanten.
    expect(resizeRect(rect, 2, [1.4, -0.2])).toEqual([
      [0.2, 0],
      [1, 0.2],
    ]);
  });
});

describe("zoom og panorering", () => {
  it("tilpasser bildet til vinduet", () => {
    expect(fitViewport(1000, 600, 2400, 1600, 0)).toEqual({ scale: 0.375, x: 50, y: 0 });
  });

  it("zoomer rundt musepekeren, så punktet under pekeren står stille", () => {
    const start = { scale: 0.5, x: 100, y: 50 };
    const next = zoomAt(start, 2, 300, 250);
    const before = [(300 - start.x) / start.scale, (250 - start.y) / start.scale];
    const after = [(300 - next.x) / next.scale, (250 - next.y) / next.scale];
    expect(after).toEqual(before);
    expect(next.scale).toBe(1);
  });
});

describe("angre og gjør om", () => {
  it("husker minst 50 steg", () => {
    let history = createHistory(0);
    for (let i = 1; i <= 60; i++) {
      history = pushHistory(history, i);
    }
    for (let i = 0; i < 50; i++) {
      history = undoHistory(history);
    }
    expect(history.present).toBe(10);
    expect(HISTORY_LIMIT).toBeGreaterThanOrEqual(50);
  });

  it("gjør om det som ble angret, og glemmer det etter en ny endring", () => {
    let history = pushHistory(pushHistory(createHistory("a"), "b"), "c");
    history = undoHistory(history);
    expect(history.present).toBe("b");
    history = redoHistory(history);
    expect(history.present).toBe("c");
    history = pushHistory(undoHistory(history), "d");
    expect(history.future).toEqual([]);
    expect(redoHistory(history).present).toBe("d");
  });

  it("glemmer de eldste stegene over grensen", () => {
    let history = createHistory(0);
    for (let i = 1; i <= 10; i++) {
      history = pushHistory(history, i, 5);
    }
    expect(history.past).toEqual([5, 6, 7, 8, 9]);
  });
});

const unit = (overrides: Partial<PublicUnit>): PublicUnit => ({
  id: "u1",
  unit_number: "A-101",
  slug: "a-101",
  title: null,
  unit_type: "apartment",
  status: "available",
  floor: 1,
  rooms: 3,
  bedrooms: 2,
  bathrooms: 1,
  bra_i: 68.5,
  bra_e: null,
  bra_b: null,
  tba: null,
  plot_area: null,
  price_hidden: false,
  price: 4_250_000,
  purchase_costs: 100_000,
  shared_debt: null,
  monthly_fee: 3500,
  ownership_type: "selveier",
  orientation: null,
  parking: null,
  storage: null,
  sort_order: 1,
  stage: null,
  building: null,
  floor_plan: null,
  ...overrides,
});

describe("filter", () => {
  it("leser og skriver filteret i adressen med norske navn", () => {
    const filters = parseFilters(new URLSearchParams("status=ledig,solgt&rom=4,3&pris=2000000-4500000&areal=60-&etasje=2&visning=x"));
    expect(filters).toEqual({
      status: ["available", "sold"],
      rooms: [3, 4],
      price: { min: 2_000_000, max: 4_500_000 },
      area: { min: 60, max: null },
      floor: [2],
      favorites: false,
    });
    const params = writeFilters(filters, new URLSearchParams("visning=x"));
    expect(params.toString()).toBe("visning=x&status=ledig%2Csolgt&rom=3%2C4&pris=2000000-4500000&areal=60-&etasje=2");
  });

  it("tåler ugyldige verdier og bytter om min og maks", () => {
    expect(parseFilters(new URLSearchParams("status=borte&rom=tre&pris=500-100"))).toEqual({
      ...EMPTY_FILTERS,
      price: { min: 100, max: 500 },
    });
    expect(hasActiveFilters(EMPTY_FILTERS)).toBe(false);
  });

  it("filtrerer på 3 rom og ledig (akseptkriterium 5)", () => {
    const filters = { ...EMPTY_FILTERS, status: ["available" as const], rooms: [3] };
    expect(matchesFilters(unit({}), filters, FILTER_KEYS)).toBe(true);
    expect(matchesFilters(unit({ rooms: 4 }), filters, FILTER_KEYS)).toBe(false);
    expect(matchesFilters(unit({ status: "sold" }), filters, FILTER_KEYS)).toBe(false);
  });

  it("filtrerer på pris, areal og etasje, og bare med filtre som er slått på", () => {
    const filters = { ...EMPTY_FILTERS, price: { min: null, max: 4_000_000 }, area: { min: 60, max: 70 }, floor: [2] };
    expect(matchesFilters(unit({ price: 3_900_000, floor: 2 }), filters, FILTER_KEYS)).toBe(true);
    expect(matchesFilters(unit({ price: 4_100_000, floor: 2 }), filters, FILTER_KEYS)).toBe(false);
    expect(matchesFilters(unit({ price: 4_100_000, floor: 2 }), filters, ["area", "floor"])).toBe(true);
  });

  it("lar ikke en skjult pris treffe et prisfilter", () => {
    const filters = { ...EMPTY_FILTERS, price: { min: 1, max: null } };
    expect(matchesFilters(unit({ status: "sold", price_hidden: true, price: null }), filters, FILTER_KEYS)).toBe(false);
  });

  it("viser bare favoritter når det er valgt", () => {
    const filters = { ...EMPTY_FILTERS, favorites: true };
    expect(matchesFilters(unit({}), filters, FILTER_KEYS, new Set(["u1"]))).toBe(true);
    expect(matchesFilters(unit({}), filters, FILTER_KEYS, new Set())).toBe(false);
  });

  it("finner valgene som finnes i prosjektet", () => {
    expect(
      filterOptions([unit({ rooms: 4, floor: 2, price: 5_000_000 }), unit({ id: "u2" }), unit({ id: "u3", price_hidden: true, price: null })]),
    ).toEqual({ rooms: [3, 4], floors: [1, 2], price: { min: 4_250_000, max: 5_000_000 }, area: { min: 68.5, max: 68.5 } });
  });
});

describe("modell", () => {
  it("bruker standardfarger og lar prosjektet overstyre organisasjonen", () => {
    expect(resolveStatusColors({}, {})).toEqual({
      available: "#2E9E5B",
      reserved: "#E6A100",
      sold: "#D64545",
      upcoming: "#8A8F98",
    });
    expect(resolveStatusColors({ sold: "#000000", reserved: "rød" }, { sold: "#111111" })).toMatchObject({
      sold: "#111111",
      reserved: "#E6A100",
    });
  });

  it("gjør markeringer om til databaserader og tilbake", () => {
    const hotspot = {
      id: "00000000-0000-4000-8000-000000000001",
      shape: "rect" as const,
      points: [
        [0.1, 0.1],
        [0.2, 0.2],
      ] as Point[],
      target: { type: "unit" as const, unitId: "u1" },
      label: null,
    };
    const row = toHotspotRow(hotspot);
    expect(row).toMatchObject({ target_type: "unit", target_unit_id: "u1", target_url: null });
    expect(fromHotspotRow(row)).toEqual(hotspot);
    expect(saveHotspotsSchema.safeParse([row]).success).toBe(true);
    expect(saveHotspotsSchema.safeParse([{ ...row, shape: "polygon" }]).success).toBe(false);
    expect(saveHotspotsSchema.safeParse([{ ...row, target_type: "url", target_url: "javascript:x" }]).success).toBe(false);
  });

  it("bruker standardinnstillinger når innstillingene mangler eller er ugyldige", () => {
    expect(parseSelectorSettings(null)).toEqual({ filters: [...FILTER_KEYS], list: "side", hatch_sold: true });
    expect(parseSelectorSettings({ list: "below", hatch_sold: false, filters: ["status"] })).toEqual({
      filters: ["status"],
      list: "below",
      hatch_sold: false,
    });
    expect(parseSelectorSettings({ list: "venstre" }).list).toBe("side");
  });

  it("tolker publisert velger og hopper over ødelagte markeringer og enheter", () => {
    const parsed = parsePublishedSelector({
      selector: {
        selector_id: "s1",
        name: "Boligvelger",
        settings: {},
        entry_view_id: "v1",
        views: [
          {
            id: "v1",
            parent_view_id: null,
            name: "Oversikt",
            kind: "overview",
            angle_group: null,
            sort_order: 0,
            image_width: 2400,
            image_height: 1600,
            asset: null,
            hotspots: [
              {
                id: "h1",
                shape: "rect",
                points: [
                  [0.1, 0.1],
                  [0.2, 0.2],
                ],
                target_type: "unit",
                target_unit_id: "u1",
                target_view_id: null,
                target_project_id: null,
                target_url: null,
                label: null,
              },
              { id: "ødelagt" },
            ],
          },
        ],
      },
      published_at: "2026-11-12T10:00:00Z",
      project: { id: "p1", name: "Fjordparken", slug: "fjordparken", phase: "for_sale", show_price_on_sold: false },
      status_colors: { organization: {}, project: { available: "#00AA00" } },
      units: [unit({}), { id: "mangler-felt" }],
      linked_projects: [],
    });
    expect(parsed?.views[0]?.hotspots).toHaveLength(1);
    expect(parsed?.units).toHaveLength(1);
    expect(parsed?.statusColors.available).toBe("#00AA00");
    expect(parsePublishedSelector({ selector: null })).toBeNull();
  });
});
