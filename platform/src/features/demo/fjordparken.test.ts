import { describe, expect, it } from "vitest";

import {
  DEMO_STATUS_CHANGES,
  FACADE,
  demoHotspots,
  demoUnits,
  demoViewings,
  facadeSvg,
  hotspotRect,
  unitBox,
} from "@/features/demo/fjordparken";
import { UNIT_STATUSES } from "@/features/units/fields";

describe("demodata for Fjordparken", () => {
  const units = demoUnits();

  it("har 24 leiligheter på fire etasjer med seks i hver", () => {
    expect(units).toHaveLength(24);
    expect(new Set(units.map((unit) => unit.unit_number)).size).toBe(24);
    for (let floor = 1; floor <= 4; floor++) {
      expect(units.filter((unit) => unit.floor === floor)).toHaveLength(6);
    }
    expect(units[0]?.unit_number).toBe("A-101");
    expect(units.at(-1)?.unit_number).toBe("A-406");
  });

  it("har gyldige verdier: hele kroner, positive arealer og kjente statuser", () => {
    for (const unit of units) {
      expect(Number.isInteger(unit.price)).toBe(true);
      expect(unit.price).toBeGreaterThan(3_000_000);
      expect(Number.isInteger(unit.purchase_costs)).toBe(true);
      expect(unit.bra_i).toBeGreaterThan(40);
      expect(unit.bedrooms).toBe(unit.rooms - 1);
      expect(UNIT_STATUSES).toContain(unit.status);
    }
  });

  it("får høyere pris per kvadratmeter jo høyere etasjen er", () => {
    const perSquareMeter = (number: string) => {
      const unit = units.find((item) => item.unit_number === number);
      return unit ? unit.price / unit.bra_i : 0;
    };
    expect(perSquareMeter("A-401")).toBeGreaterThan(perSquareMeter("A-101"));
  });

  it("endrer status på enheter som finnes, så loggen får innhold", () => {
    for (const change of DEMO_STATUS_CHANGES) {
      expect(units.some((unit) => unit.unit_number === change.unitNumber)).toBe(true);
    }
  });

  it("har én markering per leilighet, innenfor bildet", () => {
    const hotspots = demoHotspots();
    expect(hotspots).toHaveLength(24);
    expect(new Set(hotspots.map((hotspot) => hotspot.unitNumber))).toEqual(new Set(units.map((unit) => unit.unit_number)));
    for (const { points } of hotspots) {
      for (const [x, y] of points) {
        expect(x).toBeGreaterThanOrEqual(0);
        expect(x).toBeLessThanOrEqual(1);
        expect(y).toBeGreaterThanOrEqual(0);
        expect(y).toBeLessThanOrEqual(1);
      }
      expect(points[1][0]).toBeGreaterThan(points[0][0]);
      expect(points[1][1]).toBeGreaterThan(points[0][1]);
    }
  });

  it("legger markeringene over riktig leilighet uten overlapp", () => {
    // 1. etasje er nederst på fasaden, og posisjon 1 er lengst til venstre.
    const [left, top, right, bottom] = unitBox(1, 1);
    const [[x1, y1], [x2, y2]] = hotspotRect(1, 1);
    expect(x1 * FACADE.width).toBeGreaterThanOrEqual(left);
    expect(x2 * FACADE.width).toBeLessThanOrEqual(right);
    expect(y1 * FACADE.height).toBeGreaterThanOrEqual(top);
    expect(y2 * FACADE.height).toBeLessThanOrEqual(bottom);
    expect(hotspotRect(2, 1)[1][1]).toBeLessThan(y1);

    const boxes = demoHotspots().map(({ points }) => points);
    for (const [index, a] of boxes.entries()) {
      for (const b of boxes.slice(index + 1)) {
        const overlaps = a[0][0] < b[1][0] && b[0][0] < a[1][0] && a[0][1] < b[1][1] && b[0][1] < a[1][1];
        expect(overlaps).toBe(false);
      }
    }
  });

  it("lager en fasade i SVG med bildets mål og uten tekst", () => {
    const svg = facadeSvg();
    expect(svg.startsWith("<svg ")).toBe(true);
    expect(svg).toContain(`viewBox="0 0 ${FACADE.width} ${FACADE.height}"`);
    expect(svg).not.toContain("<text");
    expect(svg).not.toContain("<script");
  });

  it("legger visningene på de to neste søndagene", () => {
    // Torsdag 12. november 2026
    expect(demoViewings(new Date("2026-11-12T10:00:00Z")).map((viewing) => viewing.date)).toEqual(["2026-11-15", "2026-11-22"]);
    // En søndag gir søndagen etter, ikke samme dag
    expect(demoViewings(new Date("2026-11-15T10:00:00Z"))[0]?.date).toBe("2026-11-22");
  });
});
