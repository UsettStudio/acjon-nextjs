import { describe, expect, it } from "vitest";

import en from "../messages/en.json";
import nb from "../messages/nb.json";
import sv from "../messages/sv.json";

type Messages = { [key: string]: string | Messages };

function flatten(messages: Messages, prefix = ""): Record<string, string> {
  return Object.entries(messages).reduce<Record<string, string>>((result, [key, value]) => {
    const path = prefix ? `${prefix}.${key}` : key;
    return typeof value === "string" ? { ...result, [path]: value } : { ...result, ...flatten(value, path) };
  }, {});
}

/** Plassholdere i ICU-meldinger, f.eks. {email} og {count, plural, …}. */
function placeholders(message: string): string[] {
  return [...message.matchAll(/\{\s*([a-zA-Z]+)\s*[,}]/g)].map((match) => match[1] ?? "").sort();
}

const reference = flatten(nb);

describe.each([
  ["en", flatten(en)],
  ["sv", flatten(sv)],
])("oversettelser (%s)", (_locale, messages) => {
  it("har nøyaktig de samme nøklene som bokmål", () => {
    expect(Object.keys(messages).sort()).toEqual(Object.keys(reference).sort());
  });

  it("bruker de samme plassholderne som bokmål", () => {
    for (const [key, message] of Object.entries(reference)) {
      expect({ key, placeholders: placeholders(messages[key] ?? "") }).toEqual({ key, placeholders: placeholders(message) });
    }
  });

  it("har ingen tomme tekster", () => {
    expect(Object.entries(messages).filter(([, value]) => value.trim() === "")).toEqual([]);
  });
});
