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
});
