/**
 * Leser regneark (CSV og XLSX) til overskrifter og rader. Delen som tolker
 * CSV-tekst og rydder radene er ren logikk og testes uten nettleser.
 */

import Papa from "papaparse";

import { MAX_IMPORT_ROWS, type Cell } from "@/features/units/import/validate";

export type Spreadsheet = { headers: string[]; rows: Cell[][] };

export class SpreadsheetError extends Error {
  constructor(public readonly code: "empty" | "tooManyRows" | "unsupported" | "unreadable") {
    super(code);
  }
}

const isEmpty = (cell: Cell) => cell === null || cell === undefined || (typeof cell === "string" && cell.trim() === "");

const filled = (row: Cell[]) => row.filter((cell) => !isEmpty(cell)).length;

/**
 * Finner overskriftsraden. Mange prislister har en tittel eller tomme rader
 * øverst, så overskriften er første rad (blant de 20 første) som har minst
 * to utfylte celler og minst 60 % av cellene i den bredeste raden.
 */
function headerIndex(data: Cell[][]): number {
  const candidates = data.slice(0, 20);
  const widest = Math.max(0, ...candidates.map(filled));
  if (widest === 0) {
    return data.findIndex((row) => filled(row) > 0);
  }
  const threshold = Math.max(Math.min(2, widest), Math.ceil(widest * 0.6));
  return candidates.findIndex((row) => filled(row) >= threshold);
}

/** Tomme kolonner til høyre og tomme rader nederst fjernes. */
export function toSpreadsheet(data: Cell[][]): Spreadsheet {
  const start = headerIndex(data);
  if (start === -1) {
    throw new SpreadsheetError("empty");
  }
  const body = data.slice(start);
  let width = 0;
  for (const row of body) {
    for (let column = row.length - 1; column >= width; column--) {
      if (!isEmpty(row[column])) {
        width = column + 1;
        break;
      }
    }
  }
  const headerRow = body[0] ?? [];
  const headers = Array.from({ length: width }, (_, column) => {
    const cell = headerRow[column];
    return cell === null || cell === undefined ? "" : String(cell).trim();
  });
  let rows = body.slice(1).map((row) => Array.from({ length: width }, (_, column) => row[column] ?? null));
  while (rows.length > 0 && (rows[rows.length - 1] ?? []).every(isEmpty)) {
    rows = rows.slice(0, -1);
  }
  if (rows.length === 0) {
    throw new SpreadsheetError("empty");
  }
  if (rows.length > MAX_IMPORT_ROWS) {
    throw new SpreadsheetError("tooManyRows");
  }
  return { headers, rows };
}

/** Tolker CSV-tekst. Skilletegnet (semikolon, komma eller tabulator) gjettes. */
export function parseCsv(text: string): Spreadsheet {
  const result = Papa.parse<string[]>(text.replace(/^﻿/, ""), {
    delimitersToGuess: [";", ",", "\t", "|"],
    skipEmptyLines: "greedy",
  });
  return toSpreadsheet(result.data);
}

/**
 * CSV fra Excel på norsk er ofte lagret som Windows-1252, ikke UTF-8. Gir UTF-8
 * erstatningstegn (�), leses filen på nytt som Windows-1252.
 */
export function decodeCsv(buffer: ArrayBuffer): string {
  const utf8 = new TextDecoder("utf-8").decode(buffer);
  return utf8.includes("�") ? new TextDecoder("windows-1252").decode(buffer) : utf8;
}

export async function readSpreadsheet(file: File): Promise<Spreadsheet> {
  const name = file.name.toLowerCase();
  if (name.endsWith(".xlsx")) {
    try {
      const { readSheet } = await import("read-excel-file/browser");
      // Typene i read-excel-file sier «typeof Date» der verdien er en Date-forekomst.
      return toSpreadsheet((await readSheet(file)) as unknown as Cell[][]);
    } catch (error) {
      if (error instanceof SpreadsheetError) {
        throw error;
      }
      throw new SpreadsheetError("unreadable");
    }
  }
  if (name.endsWith(".csv") || name.endsWith(".txt") || file.type === "text/csv") {
    return parseCsv(decodeCsv(await file.arrayBuffer()));
  }
  throw new SpreadsheetError("unsupported");
}
