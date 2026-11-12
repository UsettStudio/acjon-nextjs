/**
 * Demodata: organisasjonen «Demo Bolig AS» med prosjektet «Fjordparken», 24
 * leiligheter på fire etasjer, en fasade i SVG med ferdige markeringer og en
 * publisert prosjektside. Alt er oppdiktet. Skriptet scripts/demo.ts legger det
 * inn med de samme databasefunksjonene som appen.
 */

import type { UnitStatus } from "@/features/units/fields";

export const DEMO_ORGANIZATION = { name: "Demo Bolig AS", slug: "demo-bolig" } as const;

export const DEMO_BRAND = {
  primary: "#1E4D5C",
  heading_font: "lora",
  body_font: "inter",
  button_style: "rounded",
} as const;

export const DEMO_PROJECT = {
  name: "Fjordparken",
  phase: "for_sale",
  address: "Fjordparken 1",
  postal_code: "0150",
  city: "Oslo",
  municipality: "Oslo",
  lat: 59.9075,
  lng: 10.7398,
  description:
    "Fjordparken er et boligprosjekt med 24 leiligheter fordelt på fire etasjer. Alle leilighetene har balkong mot sør, " +
    "og de største har vinduer i to retninger. Mellom husene blir det en felles hage med lekeplass og sykkelparkering.",
  milestones: [
    { key: "planning", label: null, text: "Ferdig regulert", date: null },
    { key: "sales_start", label: null, text: null, date: "2026-09-01" },
    { key: "construction_start", label: null, text: "Når 60 % er solgt", date: null },
    { key: "move_in", label: null, text: "Høsten 2028", date: null },
  ],
  contacts: [{ name: "Mia Megler", title: "Eiendomsmegler", email: "mia.megler@demobolig.example", phone: null }],
} as const;

export const DEMO_STAGE = "Trinn 1";
export const DEMO_BUILDING = "Hus A";
export const FLOORS = 4;
export const UNITS_PER_FLOOR = 6;

/** Leilighetene i hver etasje, fra venstre mot høyre på fasaden. */
const LAYOUT = [
  { rooms: 4, bedrooms: 3, bra_i: 94.5, tba: 12, orientation: "Sør og vest" },
  { rooms: 3, bedrooms: 2, bra_i: 72, tba: 8, orientation: "Sør" },
  { rooms: 2, bedrooms: 1, bra_i: 54.5, tba: 7, orientation: "Sør" },
  { rooms: 2, bedrooms: 1, bra_i: 52, tba: 7, orientation: "Sør" },
  { rooms: 3, bedrooms: 2, bra_i: 70.5, tba: 8, orientation: "Sør" },
  { rooms: 4, bedrooms: 3, bra_i: 96, tba: 12, orientation: "Sør og øst" },
] as const;

const SOLD = new Set(["A-101", "A-104", "A-201", "A-205", "A-303", "A-306"]);
const RESERVED = new Set(["A-202"]);

/** Statusendringer etter importen, så loggen og oversikten har noe å vise. */
export const DEMO_STATUS_CHANGES: { unitNumber: string; status: UnitStatus; note: string }[] = [
  { unitNumber: "A-405", status: "reserved", note: "Forbehold om finansiering" },
  { unitNumber: "A-402", status: "sold", note: "Kontrakt signert" },
];

export type DemoUnit = {
  unit_number: string;
  title: string;
  unit_type: "apartment";
  status: UnitStatus;
  floor: number;
  rooms: number;
  bedrooms: number;
  bathrooms: number;
  bra_i: number;
  tba: number;
  price: number;
  purchase_costs: number;
  shared_debt: number;
  monthly_fee: number;
  ownership_type: "selveier";
  orientation: string;
  parking: string;
  storage: string;
  description: string;
  stage: string;
  building: string;
};

export function unitNumber(floor: number, position: number): string {
  return `A-${floor}0${position}`;
}

/** Pris per kvadratmeter stiger med etasjen. Alle beløp er hele kroner. */
function priceFor(braI: number, floor: number): number {
  return Math.round((braI * 68_000 * (1 + 0.035 * (floor - 1))) / 10_000) * 10_000;
}

export function demoUnits(): DemoUnit[] {
  const units: DemoUnit[] = [];
  for (let floor = 1; floor <= FLOORS; floor++) {
    LAYOUT.forEach((layout, index) => {
      const number = unitNumber(floor, index + 1);
      const price = priceFor(layout.bra_i, floor);
      units.push({
        unit_number: number,
        title: `${layout.rooms}-roms med balkong mot ${layout.orientation.toLowerCase()}`,
        unit_type: "apartment",
        status: SOLD.has(number) ? "sold" : RESERVED.has(number) ? "reserved" : "available",
        floor,
        rooms: layout.rooms,
        bedrooms: layout.bedrooms,
        bathrooms: layout.rooms >= 4 ? 2 : 1,
        bra_i: layout.bra_i,
        tba: layout.tba,
        price,
        // Dokumentavgift av tomteandelen og tinglysing.
        purchase_costs: Math.round((price * 0.25 * 0.025 + 1_200) / 100) * 100,
        shared_debt: 0,
        monthly_fee: Math.round((layout.bra_i * 34) / 50) * 50,
        ownership_type: "selveier",
        orientation: layout.orientation,
        parking: "Garasjeplass kan kjøpes",
        storage: "Bod i kjelleren",
        description:
          `Lys ${layout.rooms}-roms med åpen stue og kjøkken, ${layout.bedrooms} soverom ` +
          `og balkong på ${layout.tba} m² mot ${layout.orientation.toLowerCase()}.` +
          (floor >= 3 ? " Fra denne etasjen er det utsikt over fjorden." : ""),
        stage: DEMO_STAGE,
        building: DEMO_BUILDING,
      });
    });
  }
  return units;
}

// -----------------------------------------------------------------------------
// Fasaden
// -----------------------------------------------------------------------------

export const FACADE = { width: 2400, height: 1600 } as const;
const BUILDING = { left: 200, right: 2200, top: 300, ground: 1400 } as const;
const FLOOR_HEIGHT = (BUILDING.ground - BUILDING.top) / FLOORS;
const UNIT_WIDTH = (BUILDING.right - BUILDING.left) / UNITS_PER_FLOOR;

/** Leilighetens del av fasaden i piksler: [venstre, topp, høyre, bunn]. */
export function unitBox(floor: number, position: number): [number, number, number, number] {
  const left = BUILDING.left + (position - 1) * UNIT_WIDTH;
  const bottom = BUILDING.ground - (floor - 1) * FLOOR_HEIGHT;
  return [left, bottom - FLOOR_HEIGHT, left + UNIT_WIDTH, bottom];
}

const round4 = (value: number) => Math.round(value * 10_000) / 10_000;

/**
 * Markeringen for en leilighet: et rektangel litt innenfor leiligheten, som
 * andeler av bildets bredde og høyde (slik markeringer lagres).
 */
export function hotspotRect(floor: number, position: number): [[number, number], [number, number]] {
  const [left, top, right, bottom] = unitBox(floor, position);
  const inset = 10;
  return [
    [round4((left + inset) / FACADE.width), round4((top + inset + 8) / FACADE.height)],
    [round4((right - inset) / FACADE.width), round4((bottom - inset) / FACADE.height)],
  ];
}

export function demoHotspots(): { unitNumber: string; points: [[number, number], [number, number]] }[] {
  const hotspots = [];
  for (let floor = 1; floor <= FLOORS; floor++) {
    for (let position = 1; position <= UNITS_PER_FLOOR; position++) {
      hotspots.push({ unitNumber: unitNumber(floor, position), points: hotspotRect(floor, position) });
    }
  }
  return hotspots;
}

const f = (value: number) => Math.round(value * 10) / 10;

function rect(x: number, y: number, width: number, height: number, attributes: string): string {
  return `<rect x="${f(x)}" y="${f(y)}" width="${f(width)}" height="${f(height)}" ${attributes}/>`;
}

function tree(x: number, crown: number): string {
  return (
    rect(x - 12, BUILDING.ground - 170, 24, 190, 'fill="#6b5a45"') +
    `<circle cx="${x}" cy="${BUILDING.ground - 230}" r="${crown}" fill="#5f8a5a"/>` +
    `<circle cx="${x - crown * 0.45}" cy="${BUILDING.ground - 190}" r="${crown * 0.7}" fill="#6d9a66"/>`
  );
}

/**
 * Plassholderen for fasaden: et hus med fire etasjer og seks leiligheter i hver,
 * med vinduer og balkonger. Ingen tekst i bildet, så bildet ikke må leses.
 */
export function facadeSvg(): string {
  const parts: string[] = [];
  parts.push(
    '<defs><linearGradient id="sky" x1="0" y1="0" x2="0" y2="1">' +
      '<stop offset="0" stop-color="#cfe3f1"/><stop offset="1" stop-color="#f3f7fa"/></linearGradient></defs>',
  );
  parts.push(rect(0, 0, FACADE.width, FACADE.height, 'fill="url(#sky)"'));
  parts.push(`<ellipse cx="500" cy="1420" rx="900" ry="260" fill="#b9cbb0"/>`);
  parts.push(`<ellipse cx="1900" cy="1430" rx="1000" ry="240" fill="#aac0a2"/>`);
  parts.push(rect(0, BUILDING.ground, FACADE.width, FACADE.height - BUILDING.ground, 'fill="#c3cfb8"'));
  parts.push(rect(0, BUILDING.ground, FACADE.width, 46, 'fill="#d8d2c4"'));

  // Huset, takkant og etasjeskiller
  parts.push(rect(BUILDING.left, BUILDING.top, BUILDING.right - BUILDING.left, BUILDING.ground - BUILDING.top, 'fill="#ebe4d8"'));
  parts.push(rect(BUILDING.left - 24, BUILDING.top - 44, BUILDING.right - BUILDING.left + 48, 44, 'fill="#4a4f55"'));
  for (let floor = 1; floor < FLOORS; floor++) {
    const y = BUILDING.ground - floor * FLOOR_HEIGHT;
    parts.push(rect(BUILDING.left, y - 7, BUILDING.right - BUILDING.left, 14, 'fill="#d4cab9"'));
  }

  for (let floor = 1; floor <= FLOORS; floor++) {
    for (let position = 1; position <= UNITS_PER_FLOOR; position++) {
      const [left, top, right, bottom] = unitBox(floor, position);
      const width = right - left;
      // Skillevegg mellom leilighetene
      if (position > 1) {
        parts.push(rect(left - 2, top, 4, bottom - top, 'fill="#ddd4c5"'));
      }
      // To vinduer og en balkongdør
      const windowTop = top + 40;
      const windowHeight = FLOOR_HEIGHT - 120;
      parts.push(rect(left + width * 0.1, windowTop, width * 0.22, windowHeight, 'fill="#8db1c7" stroke="#ffffff" stroke-width="6"'));
      parts.push(rect(left + width * 0.38, windowTop, width * 0.22, windowHeight + 60, 'fill="#7fa6be" stroke="#ffffff" stroke-width="6"'));
      parts.push(rect(left + width * 0.68, windowTop, width * 0.22, windowHeight, 'fill="#8db1c7" stroke="#ffffff" stroke-width="6"'));
      // Balkong med glassrekkverk
      parts.push(rect(left + width * 0.06, bottom - 78, width * 0.88, 64, 'fill="#bcd6e6" fill-opacity="0.75" stroke="#5f7b8a" stroke-width="4"'));
      parts.push(rect(left + width * 0.04, bottom - 16, width * 0.92, 12, 'fill="#9aa3a8"'));
    }
  }

  parts.push(tree(110, 90));
  parts.push(tree(2300, 95));
  return (
    `<svg xmlns="http://www.w3.org/2000/svg" width="${FACADE.width}" height="${FACADE.height}" ` +
    `viewBox="0 0 ${FACADE.width} ${FACADE.height}">${parts.join("")}</svg>`
  );
}

export const FACADE_ALT = "Fasaden til Fjordparken: et hus med fire etasjer og seks leiligheter med balkong i hver etasje";

// -----------------------------------------------------------------------------
// Innhold på prosjektsiden og leads
// -----------------------------------------------------------------------------

export const DEMO_FAQ = [
  {
    question: "Når kan vi flytte inn?",
    answer: "Byggestart er når 60 % av leilighetene er solgt. Innflytting er planlagt høsten 2028.",
  },
  {
    question: "Kan vi velge kjøkken og bad selv?",
    answer: "Ja. Du får en tilvalgsliste etter kontraktsignering, med frister for hver runde.",
  },
  {
    question: "Hva dekker felleskostnadene?",
    answer: "Forsikring av bygget, strøm i fellesarealer, renhold, snømåking og vedlikehold av hagen.",
  },
];

/** Visninger de to neste søndagene etter datoen, kl. 12–14. */
export function demoViewings(from: Date): { date: string; start: string; end: string; note: string }[] {
  const firstSunday = new Date(Date.UTC(from.getUTCFullYear(), from.getUTCMonth(), from.getUTCDate()));
  firstSunday.setUTCDate(firstSunday.getUTCDate() + ((7 - firstSunday.getUTCDay()) % 7 || 7));
  return [0, 7].map((offset, index) => {
    const date = new Date(firstSunday);
    date.setUTCDate(date.getUTCDate() + offset);
    return {
      date: date.toISOString().slice(0, 10),
      start: "12:00",
      end: "14:00",
      note: index === 0 ? "Visning i leilighet A-302" : "Visning i leilighet A-404",
    };
  });
}

export const DEMO_LEADS = [
  {
    name: "Ola Nordmann",
    email: "ola.nordmann@example.com",
    phone: null,
    message: "Er det mulig å se A-302 før visningen?",
    unitNumber: "A-302",
    consentSimilar: false,
  },
  {
    name: "Kari Hansen",
    email: "kari.hansen@example.com",
    phone: null,
    message: "Vi ønsker mer informasjon om 4-romsleilighetene.",
    unitNumber: null,
    consentSimilar: true,
  },
  {
    name: "Per Olsen",
    email: "per.olsen@example.com",
    phone: null,
    message: "",
    unitNumber: "A-406",
    consentSimilar: false,
  },
] as const;
