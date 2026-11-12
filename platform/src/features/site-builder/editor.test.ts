import { describe, expect, it } from "vitest";

import nb from "../../../messages/nb.json";
import { BLOCK_TYPES, blockPropsSchemas, createBlock } from "@/features/site-builder/blocks";
import { BLOCK_FIELDS, issuesByPath, listItemTitle, type FieldSpec } from "@/features/site-builder/components/editor/field-specs";
import { missingForFull } from "@/features/site-builder/templates";

const editor = nb.siteBuilder.editor as unknown as Record<string, Record<string, unknown>>;

/** Alle felt, også feltene i lister. */
function allSpecs(specs: FieldSpec[]): FieldSpec[] {
  return specs.flatMap((spec) => (spec.kind === "list" ? [spec, ...allSpecs(spec.fields)] : [spec]));
}

describe("skjemaene for blokkene", () => {
  it("har skjema for alle 18 blokktyper, og hvert felt finnes i blokkens data", () => {
    expect(Object.keys(BLOCK_FIELDS).sort()).toEqual([...BLOCK_TYPES].sort());
    for (const type of BLOCK_TYPES) {
      const props = createBlock(type).props as Record<string, unknown>;
      for (const spec of BLOCK_FIELDS[type]) {
        expect(props, `${type}.${spec.key}`).toHaveProperty(spec.key);
      }
    }
  });

  it("legger til gyldige elementer i alle lister", () => {
    for (const type of BLOCK_TYPES) {
      for (const spec of BLOCK_FIELDS[type]) {
        if (spec.kind !== "list") {
          continue;
        }
        const props = { ...createBlock(type).props, [spec.key]: [spec.newItem(), spec.newItem()] };
        const parsed = blockPropsSchemas[type].safeParse(props);
        // Tomme tekstfelt er gyldige i blokkene. Bare format (dato, tid, adresse) kan gi feil.
        expect(parsed.success, `${type}.${spec.key}`).toBe(true);
      }
    }
  });

  it("har ledetekst, hjelpetekst, valg og plassholder på bokmål for hvert felt", () => {
    for (const type of BLOCK_TYPES) {
      for (const spec of allSpecs(BLOCK_FIELDS[type])) {
        expect(editor.fields, `fields.${spec.label ?? spec.key}`).toHaveProperty(spec.label ?? spec.key);
        if (spec.help) {
          expect(editor.help, `help.${spec.help}`).toHaveProperty(spec.help);
        }
        if (spec.kind === "select") {
          for (const value of spec.values) {
            expect((editor.options as Record<string, Record<string, string>>)[spec.options], `options.${spec.options}.${value}`).toHaveProperty(String(value));
          }
        }
        if (spec.kind === "text" && spec.placeholder) {
          expect(editor.placeholders, `placeholders.${spec.placeholder}`).toHaveProperty(spec.placeholder);
        }
        if (spec.kind === "list") {
          expect(editor.list, `list.${spec.addLabel}`).toHaveProperty(spec.addLabel);
        }
      }
    }
  });

  it("samler valideringsfeil per felt, første feil vinner", () => {
    expect(
      issuesByPath([
        { path: ["items", 2, "start"], message: "timeInvalid" },
        { path: ["items", 2, "start"], message: "required" },
        { path: ["url"], message: "videoInvalid" },
      ]),
    ).toEqual({ "items.2.start": "timeInvalid", url: "videoInvalid" });
    const parsed = blockPropsSchemas.viewings.safeParse({ items: [{ date: "2027-05-01", start: "25:00", end: "", note: "" }] });
    expect(parsed.success).toBe(false);
    expect(parsed.success ? {} : issuesByPath(parsed.error.issues)).toEqual({ "items.0.start": "timeInvalid" });
  });

  it("navngir listeelementer etter første utfylte felt", () => {
    expect(listItemTitle({ label: "", value: "24" }, ["label", "value"])).toBe("24");
    expect(listItemTitle({ label: "  " }, ["label"])).toBeNull();
  });
});

describe("utbygging til full prosjektside", () => {
  it("lister blokkene som mangler, og ingen når siden er full", () => {
    const comingSoon = [createBlock("hero"), createBlock("text"), createBlock("lead_form")];
    const missing = missingForFull(comingSoon, true);
    expect(missing).toContain("selector");
    expect(missing).not.toContain("text_image");
    expect(missing).not.toContain("hero");
    expect(missingForFull([...comingSoon, ...missing.map((type) => createBlock(type))], true)).toEqual([]);
  });

  it("foreslår enhetsliste når prosjektet ikke har boligvelger", () => {
    const missing = missingForFull([createBlock("hero")], false);
    expect(missing).toContain("unit_list");
    expect(missing).not.toContain("selector");
  });
});
