/**
 * Demodata: organisasjonen «Demo Bolig AS» med prosjektet «Fjordparken», 24
 * leiligheter på fire etasjer, illustrasjoner i SVG (fasaden med ferdige
 * markeringer, huset ved fjorden og en stue) og en publisert prosjektside. Alt
 * er oppdiktet. Skriptet scripts/demo.ts legger det inn med de samme
 * databasefunksjonene som appen.
 */

import type { UnitStatus } from "@/features/units/fields";

export const DEMO_ORGANIZATION = { name: "Demo Bolig AS", slug: "demo-bolig" } as const;

/** Merkevareprofilen: designstilen Nordisk med en dempet salviegrønn (hvit tekst får kontrast 5,6:1). */
export const DEMO_BRAND = {
  style: "nordic",
  primary: "#5F6B58",
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
// Illustrasjon til «Om prosjektet»
// -----------------------------------------------------------------------------

export const LANDSCAPE = { width: 2400, height: 1600 } as const;

function bush(x: number, y: number, r: number, fill: string): string {
  return `<circle cx="${f(x)}" cy="${f(y)}" r="${f(r)}" fill="${fill}"/>`;
}

function roundTree(x: number, ground: number, crown: number): string {
  return (
    rect(x - 10, ground - crown * 1.6, 20, crown * 1.6, 'fill="#6b5a45"') +
    bush(x, ground - crown * 1.9, crown, "#66775c") +
    bush(x - crown * 0.55, ground - crown * 1.45, crown * 0.72, "#748669") +
    bush(x + crown * 0.5, ground - crown * 1.5, crown * 0.6, "#6d7e62")
  );
}

/**
 * Plassholderen for et stemningsbilde: huset sett fra hagen, med fjorden, en
 * lav sol og åsene bak. Flate farger i de samme dempede tonene som designstilen
 * Nordisk, og ingen tekst i bildet.
 */
export function landscapeSvg(): string {
  const { width, height } = LANDSCAPE;
  const parts: string[] = [];
  parts.push(
    "<defs>" +
      '<linearGradient id="sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#d9dfd6"/><stop offset="1" stop-color="#f5efe2"/></linearGradient>' +
      '<linearGradient id="water" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#9caeae"/><stop offset="1" stop-color="#c8d3cd"/></linearGradient>' +
      "</defs>",
  );
  parts.push(rect(0, 0, width, height, 'fill="url(#sky)"'));

  // Lav sol over fjorden
  parts.push(bush(1640, 600, 260, "#f2e4c4").replace("/>", ' fill-opacity="0.6"/>'));
  parts.push(bush(1640, 600, 135, "#ecd5a6"));

  // Åsene, lengst bak først
  parts.push('<path d="M0 760 C 260 640 520 640 760 700 S 1220 600 1480 660 S 2000 720 2400 600 V 980 H 0 Z" fill="#bcc5b3"/>');
  parts.push('<path d="M0 880 C 300 780 620 800 900 860 S 1500 800 1800 850 S 2200 860 2400 820 V 990 H 0 Z" fill="#9daa94"/>');

  // Fjorden, med lyset fra solen i vannet
  parts.push(rect(0, 950, width, 280, 'fill="url(#water)"'));
  const glints: [number, number, number][] = [
    [1520, 985, 240],
    [1560, 1020, 170],
    [1590, 1055, 110],
    [1610, 1090, 70],
    [260, 1010, 170],
    [700, 1090, 230],
    [1120, 1000, 150],
    [2010, 1110, 210],
    [1900, 1040, 120],
  ];
  for (const [x, y, length] of glints) {
    parts.push(rect(x, y, length, 5, 'fill="#ffffff" fill-opacity="0.45"'));
  }

  // En seilbåt
  parts.push('<path d="M1180 1070 H1320 L1296 1094 H1204 Z" fill="#59656c"/>');
  parts.push('<path d="M1252 1064 V920 L1318 1058 Z" fill="#f8f5ee"/>');
  parts.push('<path d="M1244 1064 V950 L1196 1058 Z" fill="#ebe4d6"/>');

  // Hagen i forgrunnen og gangstien ned mot vannet
  parts.push('<path d="M0 1190 C 500 1150 900 1200 1300 1180 S 2000 1150 2400 1170 V 1600 H 0 Z" fill="#7f8e73"/>');
  parts.push('<path d="M1180 1600 C 1250 1430 1420 1300 1700 1200 L 1790 1206 C 1560 1320 1440 1450 1420 1600 Z" fill="#dcd2bf"/>');

  // Huset til venstre: fire etasjer med tre leiligheter i hver, vinduer og balkonger
  const house = { left: 0, right: 820, top: 330, ground: 1250 } as const;
  const floorHeight = (house.ground - house.top) / FLOORS;
  const unitWidth = (house.right - house.left) / 3;
  parts.push(rect(house.left, house.top, house.right - house.left, house.ground - house.top, 'fill="#ebe4d8"'));
  parts.push(rect(house.left - 20, house.top - 40, house.right - house.left + 40, 40, 'fill="#4a4f55"'));
  for (let floor = 1; floor <= FLOORS; floor++) {
    const bottom = house.ground - (floor - 1) * floorHeight;
    const top = bottom - floorHeight;
    if (floor < FLOORS) {
      parts.push(rect(house.left, top - 6, house.right - house.left, 12, 'fill="#d4cab9"'));
    }
    for (let position = 0; position < 3; position++) {
      const left = house.left + position * unitWidth;
      const windowTop = top + 34;
      const windowHeight = floorHeight - 110;
      parts.push(rect(left + unitWidth * 0.12, windowTop, unitWidth * 0.3, windowHeight, 'fill="#8db1c7" stroke="#ffffff" stroke-width="6"'));
      parts.push(rect(left + unitWidth * 0.56, windowTop, unitWidth * 0.3, windowHeight + 50, 'fill="#7fa6be" stroke="#ffffff" stroke-width="6"'));
      parts.push(rect(left + unitWidth * 0.06, bottom - 70, unitWidth * 0.88, 56, 'fill="#bcd6e6" fill-opacity="0.75" stroke="#5f7b8a" stroke-width="4"'));
      parts.push(rect(left + unitWidth * 0.04, bottom - 16, unitWidth * 0.92, 12, 'fill="#9aa3a8"'));
    }
  }

  // Busker langs huset og trær i hagen
  for (let x = 30; x < house.right + 40; x += 95) {
    parts.push(bush(x, house.ground + 10, 58, x % 190 === 30 ? "#6d7e62" : "#748669"));
  }
  parts.push(roundTree(1010, 1230, 95));
  parts.push(roundTree(2160, 1240, 150));
  parts.push(roundTree(1960, 1225, 85));
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">${parts.join("")}</svg>`;
}

export const LANDSCAPE_ALT = "Illustrasjon av Fjordparken sett fra hagen, med fjorden og åsene i bakgrunnen";

export const INTERIOR = { width: 2400, height: 1600 } as const;

/**
 * Plassholderen for et interiørbilde: en stue med et stort vindu mot fjorden,
 * sofa, lampe og planter. Samme toner som de andre illustrasjonene, uten tekst.
 */
export function interiorSvg(): string {
  const { width, height } = INTERIOR;
  const floor = 1250;
  const win = { left: 320, right: 1460, top: 200, bottom: 1150 } as const;
  const parts: string[] = [];
  parts.push(
    "<defs>" +
      '<linearGradient id="view" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#d6ddd5"/><stop offset="1" stop-color="#f3ecdf"/></linearGradient>' +
      '<linearGradient id="light" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#fffaf0" stop-opacity="0.55"/><stop offset="1" stop-color="#fffaf0" stop-opacity="0"/></linearGradient>' +
      "</defs>",
  );
  // Vegg og gulv med bord
  parts.push(rect(0, 0, width, floor, 'fill="#eee8dd"'));
  parts.push(rect(0, floor, width, height - floor, 'fill="#cbb99e"'));
  for (let y = floor + 70; y < height; y += 80) {
    parts.push(rect(0, y, width, 3, 'fill="#bba98c"'));
  }
  parts.push(rect(0, floor - 18, width, 18, 'fill="#e2d9ca"'));

  // Utsikten gjennom vinduet: himmel, åser og fjord
  parts.push(rect(win.left, win.top, win.right - win.left, win.bottom - win.top, 'fill="url(#view)"'));
  parts.push(bush(1180, 520, 90, "#ecd5a6"));
  parts.push(
    `<path d="M${win.left} 700 C 560 610 760 640 960 680 S 1300 620 ${win.right} 640 V 860 H ${win.left} Z" fill="#bcc5b3"/>`,
  );
  parts.push(`<path d="M${win.left} 790 C 640 730 900 770 1120 790 S 1380 760 ${win.right} 780 V 880 H ${win.left} Z" fill="#9daa94"/>`);
  parts.push(rect(win.left, 850, win.right - win.left, win.bottom - 850, 'fill="#a9b9b7"'));
  for (const [x, y, length] of [
    [1080, 900, 180],
    [1110, 940, 110],
    [520, 980, 160],
    [820, 1060, 200],
  ] as const) {
    parts.push(rect(x, y, length, 5, 'fill="#ffffff" fill-opacity="0.5"'));
  }
  // Vinduskarm og sprosser
  parts.push(rect(win.left - 26, win.top - 26, win.right - win.left + 52, 26, 'fill="#5c605a"'));
  parts.push(rect(win.left - 26, win.bottom, win.right - win.left + 52, 30, 'fill="#5c605a"'));
  parts.push(rect(win.left - 26, win.top, 26, win.bottom - win.top, 'fill="#5c605a"'));
  parts.push(rect(win.right, win.top, 26, win.bottom - win.top, 'fill="#5c605a"'));
  parts.push(rect((win.left + win.right) / 2 - 10, win.top, 20, win.bottom - win.top, 'fill="#5c605a"'));
  // Lyset fra vinduet på gulvet
  parts.push(`<path d="M${win.left} ${floor} L${win.right} ${floor} L1900 ${height} L560 ${height} Z" fill="url(#light)"/>`);

  // Gardin
  parts.push(rect(150, 140, 150, floor - 140, 'fill="#ddd3c3"'));
  for (const x of [185, 225, 265]) {
    parts.push(rect(x, 140, 4, floor - 140, 'fill="#cdc2b0"'));
  }
  parts.push(rect(110, 120, 1420, 16, 'fill="#8c8478"'));

  // Teppe, sofa og bord
  parts.push(`<ellipse cx="1820" cy="1420" rx="560" ry="110" fill="#e4dacb"/>`);
  parts.push('<rect x="1500" y="880" width="760" height="230" rx="36" fill="#6f7f63"/>');
  parts.push('<rect x="1460" y="1020" width="840" height="200" rx="40" fill="#7f8e73"/>');
  parts.push('<rect x="1540" y="990" width="330" height="90" rx="30" fill="#8b9a7f"/>');
  parts.push('<rect x="1890" y="990" width="330" height="90" rx="30" fill="#8b9a7f"/>');
  parts.push('<rect x="1600" y="920" width="150" height="120" rx="24" fill="#d8cdb8"/>');
  parts.push(rect(1500, 1220, 22, 50, 'fill="#6b5a45"'));
  parts.push(rect(2238, 1220, 22, 50, 'fill="#6b5a45"'));
  parts.push('<ellipse cx="1820" cy="1330" rx="230" ry="40" fill="#b59f7b"/>');
  parts.push(rect(1700, 1330, 16, 90, 'fill="#8c7a5e"'));
  parts.push(rect(1924, 1330, 16, 90, 'fill="#8c7a5e"'));

  // Bilde på veggen og en lampe i taket
  parts.push(rect(1700, 380, 380, 300, 'fill="#f7f3ea" stroke="#5c605a" stroke-width="14"'));
  parts.push('<path d="M1720 640 C 1800 560 1880 580 1960 610 S 2040 580 2060 600 V 662 H 1720 Z" fill="#9daa94"/>');
  parts.push(bush(1990, 470, 40, "#ecd5a6"));
  parts.push(rect(1887, 0, 6, 200, 'fill="#5c605a"'));
  parts.push('<path d="M1800 290 Q 1890 170 1980 290 Z" fill="#5c605a"/>');

  // Planter i krukke
  parts.push('<path d="M1300 1250 L1320 1110 H1440 L1460 1250 Z" fill="#b59f7b"/>');
  for (const [x, y, rx, ry, rotate] of [
    [1350, 1010, 40, 120, -25],
    [1410, 990, 40, 130, 20],
    [1380, 960, 36, 140, 0],
    [1330, 1060, 34, 90, -55],
    [1440, 1060, 34, 90, 55],
  ] as const) {
    parts.push(`<ellipse cx="${x}" cy="${y}" rx="${rx}" ry="${ry}" fill="#66775c" transform="rotate(${rotate} ${x} ${y})"/>`);
  }
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">${parts.join("")}</svg>`;
}

export const INTERIOR_ALT = "Illustrasjon av en stue med stort vindu, sofa og planter, og utsikt mot fjorden";

/** Nærområdet på kartet. Stedene er oppdiktet, som resten av demoen. */
export const DEMO_PLACES = [
  { name: "Strandtorget", category: "Tog og T-bane", distance: "6 min" },
  { name: "Kaiveien", category: "Buss", distance: "2 min" },
  { name: "Solsiden barnehage", category: "Barnehage", distance: "4 min" },
  { name: "Fjordlia skole", category: "Barneskole", distance: "8 min" },
  { name: "Nærbutikken", category: "Dagligvare", distance: "3 min" },
  { name: "Badeplassen", category: "Strand og bad", distance: "5 min" },
] as const;

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
