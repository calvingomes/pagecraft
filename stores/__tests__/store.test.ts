import { describe, it, expect, beforeEach } from "vitest";
import { useEditorStore } from "../editor-store";
import { Block } from "@/types/editor";

describe("editor-store - Hardened Persistence", () => {
  const mockId = "test-block";
  const initialBlock: Partial<Block> = {
    id: mockId,
    type: "text",
    styles: { backgroundColor: "#ff0000", widthPreset: "small" },
    mobileStyles: { backgroundColor: "#0000ff", widthPreset: "wide" },
    visibility: { desktop: true, mobile: true },
    layout: { x: 0, y: 0 }
  };

  beforeEach(() => {
    useEditorStore.getState().setAllBlocks([initialBlock as Block]);
    useEditorStore.getState().selectBlock(null);
    useEditorStore.getState().focusBlock(null);
    useEditorStore.getState().setIsActualMobile(false);
  });

  it("should replace the entire blocks array", () => {
    const next = [
      { ...initialBlock, id: "b2", order: 2 },
      { ...initialBlock, id: "b3", order: 3 },
    ] as Block[];
    useEditorStore.getState().setAllBlocks(next);
    expect(useEditorStore.getState().blocks).toHaveLength(2);
    expect(useEditorStore.getState().blocks[0].id).toBe("b2");
    expect(useEditorStore.getState().blocks[1].id).toBe("b3");
  });

  it("should not mutate the original array passed in", () => {
    const source = [{ ...initialBlock, id: "x1", order: 1 } as Block];
    useEditorStore.getState().setAllBlocks(source);
    useEditorStore.getState().addBlock({ ...initialBlock, id: "x2", order: 2 } as Block);
    expect(source).toHaveLength(1);
    expect(source[0].id).toBe("x1");
  });

  it("should add a block to the end of the array", () => {
    const before = useEditorStore.getState().blocks.length;
    useEditorStore.getState().addBlock({
      ...initialBlock,
      id: "new-block",
      order: 99,
    } as Block);
    const blocks = useEditorStore.getState().blocks;
    expect(blocks).toHaveLength(before + 1);
    expect(blocks.at(-1)?.id).toBe("new-block");
  });

  it("should not affect other blocks", () => {
    useEditorStore.getState().setAllBlocks([
      { ...initialBlock, id: "a1", order: 1 } as Block,
      { ...initialBlock, id: "a2", order: 2 } as Block,
    ]);
    useEditorStore.getState().addBlock({
      ...initialBlock,
      id: "a3",
      order: 3,
    } as Block);
    expect(useEditorStore.getState().blocks[0].id).toBe("a1");
    expect(useEditorStore.getState().blocks[1].id).toBe("a2");
  });

  it("performs deep merge for desktop styles (preserves color when changing size)", () => {
    useEditorStore.getState().updateBlock(mockId, {
      styles: { widthPreset: "full" }
    });

    const updated = useEditorStore.getState().blocks[0];
    expect(updated.styles?.widthPreset).toBe("full");
    expect(updated.styles?.backgroundColor).toBe("#ff0000"); // Should be preserved
  });

  it("performs deep merge for mobile styles (preserves color when changing size)", () => {
    useEditorStore.getState().updateBlock(mockId, {
      mobileStyles: { widthPreset: "small" }
    });

    const updated = useEditorStore.getState().blocks[0];
    expect(updated.mobileStyles?.widthPreset).toBe("small");
    expect(updated.mobileStyles?.backgroundColor).toBe("#0000ff"); // Should be preserved
  });

  it("isolates viewport updates (changing mobile size doesn't touch desktop size)", () => {
    useEditorStore.getState().updateBlock(mockId, {
      mobileStyles: { widthPreset: "small" }
    });

    const updated = useEditorStore.getState().blocks[0];
    expect(updated.mobileStyles?.widthPreset).toBe("small");
    expect(updated.styles?.widthPreset).toBe("small"); // Desktop remains at initial value
  });

  it("performs deep merge for visibility", () => {
    useEditorStore.getState().updateBlock(mockId, {
      visibility: { mobile: false }
    });

    const updated = useEditorStore.getState().blocks[0];
    expect(updated.visibility?.mobile).toBe(false);
    expect(updated.visibility?.desktop).toBe(true); // Should be preserved
  });

  it("should remove the block with the matching id", () => {
    useEditorStore.getState().setAllBlocks([
      { ...initialBlock, id: "r1", order: 1 } as Block,
      { ...initialBlock, id: "r2", order: 2 } as Block,
    ]);
    useEditorStore.getState().removeBlock("r1");
    const blocks = useEditorStore.getState().blocks;
    expect(blocks).toHaveLength(1);
    expect(blocks[0].id).toBe("r2");
  });

  it("should not remove any blocks when the id does not exist", () => {
    const before = useEditorStore.getState().blocks;
    useEditorStore.getState().removeBlock("missing");
    expect(useEditorStore.getState().blocks).toEqual(before);
  });

  it("should clear selectedBlockId when the removed block was selected", () => {
    useEditorStore.getState().selectBlock(mockId);
    useEditorStore.getState().removeBlock(mockId);
    expect(useEditorStore.getState().selectedBlockId).toBeNull();
  });

  it("should clear focusedBlockId when the removed block was focused", () => {
    useEditorStore.getState().focusBlock(mockId);
    useEditorStore.getState().removeBlock(mockId);
    expect(useEditorStore.getState().focusedBlockId).toBeNull();
  });

  it("should set selectedBlockId to the given id", () => {
    useEditorStore.getState().selectBlock("select-1");
    expect(useEditorStore.getState().selectedBlockId).toBe("select-1");
  });

  it("should clear selectedBlockId when passed null", () => {
    useEditorStore.getState().selectBlock("select-1");
    useEditorStore.getState().selectBlock(null);
    expect(useEditorStore.getState().selectedBlockId).toBeNull();
  });

  it("should set focusedBlockId to the given id", () => {
    useEditorStore.getState().focusBlock("focus-1");
    expect(useEditorStore.getState().focusedBlockId).toBe("focus-1");
  });

  it("should update isActualMobile", () => {
    useEditorStore.getState().setIsActualMobile(true);
    expect(useEditorStore.getState().isActualMobile).toBe(true);
  });

  it('selectActiveViewportBlocks should return all blocks when activeViewportMode is "desktop"', async () => {
    const { selectActiveViewportBlocks } = await import("../editor-store");
    useEditorStore.getState().setActiveViewportMode("desktop");
    const selected = selectActiveViewportBlocks(useEditorStore.getState());
    expect(selected).toEqual(useEditorStore.getState().blocks);
  });

  it('selectActiveViewportBlocks should return all blocks when activeViewportMode is "mobile"', async () => {
    const { selectActiveViewportBlocks } = await import("../editor-store");
    useEditorStore.getState().setActiveViewportMode("mobile");
    const selected = selectActiveViewportBlocks(useEditorStore.getState());
    expect(selected).toEqual(useEditorStore.getState().blocks);
  });
});
