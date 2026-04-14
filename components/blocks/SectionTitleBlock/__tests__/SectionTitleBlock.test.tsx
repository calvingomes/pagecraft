import { render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { SectionTitleBlock as SectionTitleBlockType } from "@/types/editor";
import type { EditorContextValue } from "@/types/editor";

const mockUseEditorContext = vi.fn<() => EditorContextValue | null>(() => null);
vi.mock("@/contexts/EditorContext", () => ({
  useEditorContext: () => mockUseEditorContext(),
}));

const { SectionTitleBlock } = await import("../SectionTitleBlock");

const makeBlock = (title = ""): SectionTitleBlockType => ({
  id: "block-st-1",
  type: "sectionTitle",
  order: 0,
  content: { title },
  styles: { widthPreset: "full" },
});

const mockEditor = {
  username: "test",
  selectedBlockId: null as string | null,
  focusedBlockId: null as string | null,
  onUpdateBlock: vi.fn(),
  onRemoveBlock: vi.fn(),
  onSelectBlock: vi.fn(),
  onFocusBlock: vi.fn(),
  isActualMobile: false,
  isMapUnlocked: false,
  setIsMapUnlocked: vi.fn(),
};

describe("SectionTitleBlock — read-only (useEditorContext returns null)", () => {
  beforeEach(() => mockUseEditorContext.mockReturnValue(null));

  it("should return null for an empty title", () => {
    const { container } = render(<SectionTitleBlock block={makeBlock("")} />);
    expect(container.firstChild).toBeNull();
  });

  it("should return null for a whitespace-only title", () => {
    const { container } = render(<SectionTitleBlock block={makeBlock("   ")} />);
    expect(container.firstChild).toBeNull();
  });

  it("should render the title text when non-empty", () => {
    render(<SectionTitleBlock block={makeBlock("My Section")} />);
    expect(screen.getByText("My Section")).toBeInTheDocument();
  });

  it("should trim the title before rendering", () => {
    render(<SectionTitleBlock block={makeBlock("  Trimmed  ")} />);
    expect(screen.getByText("Trimmed")).toBeInTheDocument();
  });

  it("should not show any placeholder text in view mode", () => {
    const { container } = render(<SectionTitleBlock block={makeBlock("")} />);
    expect(container.textContent).toBe("");
  });
});

describe("SectionTitleBlock — editable mode, mobile jsdom viewport (innerWidth=0)", () => {
  // Explicitly set innerWidth to 0 (mobile) so isMobileViewport=true.
  // When not focused, showEditor=false → component falls through to read-only/placeholder branch.
  beforeEach(() => {
    mockUseEditorContext.mockReturnValue(mockEditor);
    vi.stubGlobal("innerWidth", 0);
  });

  afterEach(() => vi.unstubAllGlobals());

  it("should show the title text when not focused on mobile", () => {
    render(<SectionTitleBlock block={makeBlock("Projects")} />);
    expect(screen.getByText("Projects")).toBeInTheDocument();
  });

  it("should show the editor placeholder when title is empty and not focused on mobile", () => {
    render(<SectionTitleBlock block={makeBlock("")} />);
    expect(screen.getByText("Add section title...")).toBeInTheDocument();
  });
});

describe("SectionTitleBlock — editable mode, desktop jsdom viewport", () => {
  beforeEach(() => {
    mockUseEditorContext.mockReturnValue(mockEditor);
    vi.stubGlobal("innerWidth", 1440);
  });

  afterEach(() => vi.unstubAllGlobals());

  it("should render the text input when on desktop and editable", () => {
    render(<SectionTitleBlock block={makeBlock("Edit me")} />);
    const input = screen.getByRole("textbox");
    expect(input).toBeInTheDocument();
    expect(input).toHaveValue("Edit me");
  });

  it("should render the input with placeholder text when title is empty on desktop", () => {
    render(<SectionTitleBlock block={makeBlock("")} />);
    const input = screen.getByRole("textbox");
    expect(input).toBeInTheDocument();
    expect(input).toHaveAttribute("placeholder", "Add section title...");
  });
});
