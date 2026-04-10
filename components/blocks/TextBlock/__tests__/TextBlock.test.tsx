import { render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { TextBlock as TextBlockType } from "@/types/editor";
import type { EditorContextValue } from "@/types/editor";

// Mock the context module so we can switch between read-only and editable per-test.
const mockUseEditorContext = vi.fn<() => EditorContextValue | null>(() => null);
vi.mock("@/contexts/EditorContext", () => ({
  useEditorContext: () => mockUseEditorContext(),
}));

// Prevent next/dynamic from trying to lazy-load Tiptap in jsdom.
vi.mock("next/dynamic", () => ({
  default: () => () => null,
}));

// Import AFTER mocks are set up.
const { TextBlock } = await import("../TextBlock");

const mockEditor = {
  username: "test",
  selectedBlockId: null as string | null,
  focusedBlockId: null as string | null,
  onUpdateBlock: vi.fn(),
  onRemoveBlock: vi.fn(),
  onSelectBlock: vi.fn(),
  onFocusBlock: vi.fn(),
  isActualMobile: false,
};

const makeBlock = (overrides: Partial<TextBlockType> = {}): TextBlockType => ({
  id: "block-1",
  type: "text",
  order: 0,
  content: { text: "" },
  styles: { widthPreset: "small" },
  ...overrides,
});

describe("TextBlock — read-only (useEditorContext returns null)", () => {
  beforeEach(() => mockUseEditorContext.mockReturnValue(null));

  it("should return null for empty text content", () => {
    const { container } = render(<TextBlock block={makeBlock()} />);
    expect(container.firstChild).toBeNull();
  });

  it("should return null for content that is only an empty paragraph", () => {
    const { container } = render(
      <TextBlock block={makeBlock({ content: { text: "<p><br></p>" } })} />,
    );
    expect(container.firstChild).toBeNull();
  });

  it("should render text content as visible text", () => {
    render(
      <TextBlock block={makeBlock({ content: { text: "<p>Hello World</p>" } })} />,
    );
    expect(screen.getByText("Hello World")).toBeInTheDocument();
  });

  it("should strip the script element but preserve surrounding text content", () => {
    const { container } = render(
      <TextBlock
        block={makeBlock({ content: { text: "<p><script>alert(1)</script>Safe text</p>" } })}
      />,
    );
    // sanitizeMinimalRTH strips the <script> tag (not executable) but text content may remain
    expect(container.querySelector("script")).toBeNull();
    expect(screen.getByText(/Safe text/)).toBeInTheDocument();
  });

  it("should preserve bold formatting in output", () => {
    const { container } = render(
      <TextBlock
        block={makeBlock({ content: { text: "<p><strong>Bold</strong></p>" } })}
      />,
    );
    expect(container.querySelector("strong")).not.toBeNull();
  });

  it("should render multi-paragraph content with both paragraphs present", () => {
    const { container } = render(
      <TextBlock
        block={makeBlock({ content: { text: "<p>First</p><p>Second</p>" } })}
      />,
    );
    // minimalRTHtmlToInlineForClamp joins paragraphs with <br> — both words present as HTML
    expect(container.textContent).toContain("First");
    expect(container.textContent).toContain("Second");
  });
});

describe("TextBlock — editable mode, mobile jsdom viewport (innerWidth=0)", () => {
  // Explicitly set innerWidth to 0 (mobile) so isMobileViewport=true.
  // When not focused, shouldShowEditor=false so the component falls through
  // to the read-only display even in editable mode.
  beforeEach(() => {
    mockUseEditorContext.mockReturnValue(mockEditor);
    vi.stubGlobal("innerWidth", 0);
  });

  afterEach(() => vi.unstubAllGlobals());

  it("should show the read-only display when not focused on mobile", () => {
    const { container } = render(
      <TextBlock block={makeBlock({ content: { text: "<p>Mobile read view</p>" } })} />,
    );
    expect(container.textContent).toContain("Mobile read view");
  });

  it("should return null when content is empty and not focused", () => {
    const { container } = render(<TextBlock block={makeBlock()} />);
    expect(container.firstChild).toBeNull();
  });
});
