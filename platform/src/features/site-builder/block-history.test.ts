import { describe, expect, it } from "vitest";

import {
  COALESCE_MS,
  canRedo,
  canUndo,
  keepPages,
  recordBlocks,
  redoBlocks,
  undoBlocks,
  type BlockHistories,
} from "@/features/site-builder/block-history";
import { createBlock, type Block } from "@/features/site-builder/blocks";
import { HISTORY_LIMIT } from "@/lib/history";

const PAGE = "side-1";

function text(value: string): Block {
  return { ...createBlock("text"), id: "b1", props: { ...createBlock("text").props, text: value } } as Block;
}

describe("angre og gjør om i blokkeditoren", () => {
  it("angrer og gjør om ett steg om gangen", () => {
    const a = [text("a")];
    const b = [text("b")];
    const c = [text("c")];
    let histories: BlockHistories = {};
    histories = recordBlocks(histories, PAGE, a, null, 0);
    histories = recordBlocks(histories, PAGE, b, null, 10);
    expect(canUndo(histories, PAGE)).toBe(true);
    expect(canRedo(histories, PAGE)).toBe(false);

    const undone = undoBlocks(histories, PAGE, c);
    expect(undone?.blocks).toBe(b);
    const undoneTwice = undoBlocks(undone!.histories, PAGE, b);
    expect(undoneTwice?.blocks).toBe(a);
    expect(undoBlocks(undoneTwice!.histories, PAGE, a)).toBeNull();

    const redone = redoBlocks(undoneTwice!.histories, PAGE, a);
    expect(redone?.blocks).toBe(b);
    expect(redoBlocks(redone!.histories, PAGE, b)?.blocks).toBe(c);
  });

  it("slår sammen skriving i samme blokk innen ett sekund til ett steg", () => {
    let histories: BlockHistories = {};
    histories = recordBlocks(histories, PAGE, [text("")], "block:b1", 0);
    histories = recordBlocks(histories, PAGE, [text("H")], "block:b1", 200);
    histories = recordBlocks(histories, PAGE, [text("He")], "block:b1", 400);
    expect(histories[PAGE]?.past).toHaveLength(1);
    // En pause over grensen gir et nytt steg.
    histories = recordBlocks(histories, PAGE, [text("Hei")], "block:b1", 400 + COALESCE_MS + 1);
    expect(histories[PAGE]?.past).toHaveLength(2);
    // En annen blokk eller en endring uten gruppe gir alltid et nytt steg.
    histories = recordBlocks(histories, PAGE, [text("Hei!")], "block:b2", 400 + COALESCE_MS + 2);
    histories = recordBlocks(histories, PAGE, [text("Hei!!")], null, 400 + COALESCE_MS + 3);
    expect(histories[PAGE]?.past).toHaveLength(4);
  });

  it("forkaster det som var angret når det kommer en ny endring", () => {
    let histories: BlockHistories = recordBlocks({}, PAGE, [text("a")], null, 0);
    histories = undoBlocks(histories, PAGE, [text("b")])!.histories;
    expect(canRedo(histories, PAGE)).toBe(true);
    histories = recordBlocks(histories, PAGE, [text("a")], null, 10);
    expect(canRedo(histories, PAGE)).toBe(false);
  });

  it("har egen historikk per side, og glemmer sider som er slettet", () => {
    let histories: BlockHistories = recordBlocks({}, PAGE, [text("a")], null, 0);
    histories = recordBlocks(histories, "side-2", [text("b")], null, 0);
    expect(canUndo(histories, "side-2")).toBe(true);
    expect(undoBlocks(histories, "side-3", [])).toBeNull();
    const kept = keepPages(histories, new Set([PAGE]));
    expect(Object.keys(kept)).toEqual([PAGE]);
    expect(keepPages(kept, new Set([PAGE]))).toBe(kept);
  });

  it("husker inntil grensen for antall steg", () => {
    let histories: BlockHistories = {};
    for (let step = 0; step < HISTORY_LIMIT + 20; step += 1) {
      histories = recordBlocks(histories, PAGE, [text(String(step))], null, step);
    }
    expect(histories[PAGE]?.past).toHaveLength(HISTORY_LIMIT);
    expect(histories[PAGE]?.past[0]).toEqual([text("20")]);
  });
});
