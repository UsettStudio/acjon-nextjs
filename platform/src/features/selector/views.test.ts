import { describe, expect, it } from "vitest";

import { angleSiblings, descendantIds, flattenViews, moveView, viewPath, type ViewNode } from "@/features/selector/views";

const view = (id: string, parentViewId: string | null, sortOrder: number, angleGroup: string | null = null): ViewNode => ({
  id,
  parentViewId,
  sortOrder,
  angleGroup,
});

// oversikt
// ├── bygg-a (nord, sør som vinkler)
// │   └── etasje-1
// └── bygg-b
const views: ViewNode[] = [
  view("bygg-b", "oversikt", 3),
  view("etasje-1", "bygg-a-nord", 4),
  view("oversikt", null, 1),
  view("bygg-a-nord", "oversikt", 1, "bygg-a"),
  view("bygg-a-sor", "oversikt", 2, "bygg-a"),
];

describe("visningstreet", () => {
  it("flater ut treet ovenfra og ned med dybde", () => {
    expect(flattenViews(views).map((item) => `${"-".repeat(item.depth)}${item.view.id}`)).toEqual([
      "oversikt",
      "-bygg-a-nord",
      "--etasje-1",
      "-bygg-a-sor",
      "-bygg-b",
    ]);
  });

  it("tåler sykler og foreldre som ikke finnes", () => {
    const broken = [view("a", "b", 1), view("b", "a", 2), view("c", "mangler", 3)];
    expect(flattenViews(broken).map((item) => item.view.id).sort()).toEqual(["a", "b", "c"]);
  });

  it("finner alle visninger under en visning", () => {
    expect([...descendantIds(views, "oversikt")].sort()).toEqual(["bygg-a-nord", "bygg-a-sor", "bygg-b", "etasje-1"]);
    expect([...descendantIds(views, "bygg-b")]).toEqual([]);
  });

  it("lager brødsmuler fra toppen", () => {
    expect(viewPath(views, "etasje-1").map((item) => item.id)).toEqual(["oversikt", "bygg-a-nord", "etasje-1"]);
  });

  it("finner andre vinkler av samme visning", () => {
    expect(angleSiblings(views, "bygg-a-sor").map((item) => item.id)).toEqual(["bygg-a-nord", "bygg-a-sor"]);
    expect(angleSiblings(views, "bygg-b")).toEqual([]);
  });

  it("flytter en visning blant søsknene og nummererer på nytt", () => {
    const moved = moveView(views, "bygg-b", "bygg-a-nord");
    expect(moved?.map((item) => `${item.id}:${item.sortOrder}`)).toEqual([
      "oversikt:1",
      "bygg-b:2",
      "bygg-a-nord:3",
      "etasje-1:4",
      "bygg-a-sor:5",
    ]);
  });

  it("flytter ikke en visning til en annen forelder", () => {
    expect(moveView(views, "etasje-1", "bygg-b")).toBeNull();
    expect(moveView(views, "bygg-b", "bygg-b")).toBeNull();
  });
});
