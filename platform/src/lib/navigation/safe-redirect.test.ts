import { describe, expect, it } from "vitest";

import { safeNextPath } from "@/lib/navigation/safe-redirect";

describe("safeNextPath", () => {
  it.each([
    ["/fjordbygg", "/fjordbygg"],
    ["/fjordbygg/settings?tab=1#a", "/fjordbygg/settings?tab=1#a"],
    ["/invite/abc-123", "/invite/abc-123"],
  ])("godtar intern sti %s", (input, expected) => {
    expect(safeNextPath(input)).toBe(expected);
  });

  it.each([
    "https://angriper.no",
    "//angriper.no",
    "/\\angriper.no",
    "javascript:alert(1)",
    "fjordbygg",
    "/a\nb",
    "",
    undefined,
    42,
  ])("avviser %s", (input) => {
    expect(safeNextPath(input, "/")).toBe("/");
  });
});
