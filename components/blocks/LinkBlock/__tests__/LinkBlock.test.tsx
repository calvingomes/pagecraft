import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { LinkBlock as LinkBlockType } from "@/types/editor";
import type { EditorContextValue } from "@/types/editor";

const mockUseEditorContext = vi.fn<() => EditorContextValue | null>(() => null);
vi.mock("@/contexts/EditorContext", () => ({
  useEditorContext: () => mockUseEditorContext(),
}));

vi.mock("next/dynamic", () => ({
  default: () => () => null,
}));

const { LinkBlock } = await import("../LinkBlock");

const makeBlock = (overrides: Partial<LinkBlockType> = {}): LinkBlockType => ({
  id: "block-link-1",
  type: "link",
  order: 0,
  content: { url: "https://example.com", title: "Example" },
  styles: { widthPreset: "small" },
  ...overrides,
});

describe("LinkBlock — read-only (useEditorContext returns null)", () => {
  beforeEach(() => mockUseEditorContext.mockReturnValue(null));

  it("should return null when URL is empty and not editable", () => {
    const { container } = render(
      <LinkBlock block={makeBlock({ content: { url: "" } })} />,
    );
    expect(container.firstChild).toBeNull();
  });

  it("should render as an anchor tag with the correct href", () => {
    render(<LinkBlock block={makeBlock()} />);
    const link = screen.getByRole("link");
    expect(link).toHaveAttribute("href", "https://example.com");
  });

  it("should open links in a new tab with noopener noreferrer", () => {
    render(<LinkBlock block={makeBlock()} />);
    const link = screen.getByRole("link");
    expect(link).toHaveAttribute("target", "_blank");
    expect(link).toHaveAttribute("rel", "noopener noreferrer");
  });

  it("should display the resolved title", () => {
    render(
      <LinkBlock
        block={makeBlock({
          content: { url: "https://example.com", title: "My Link" },
        })}
      />,
    );
    expect(screen.getByText("My Link")).toBeInTheDocument();
  });

  it("should fall back to metaTitle when title is absent", () => {
    render(
      <LinkBlock
        block={makeBlock({
          content: { url: "https://example.com", metaTitle: "Meta Title" },
        })}
      />,
    );
    expect(screen.getByText("Meta Title")).toBeInTheDocument();
  });

  it("should show the URL host as subtext", () => {
    render(
      <LinkBlock
        block={makeBlock({
          content: { url: "https://example.com/path", title: "X" },
        })}
      />,
    );
    expect(screen.getByText("example.com")).toBeInTheDocument();
  });

  it("should display the URL directly as the title when title and metaTitle are absent", () => {
    render(
      <LinkBlock
        block={makeBlock({ content: { url: "https://example.com" } })}
      />,
    );
    // Title element falls back to displayUrl when title and metaTitle are absent
    expect(screen.getByText("https://example.com")).toBeInTheDocument();
  });

  it("should not render a preview image for compact presets (small)", () => {
    const { container } = render(
      <LinkBlock
        block={makeBlock({
          content: {
            url: "https://example.com",
            title: "X",
            imageUrl: "https://img.example.com/pic.webp",
          },
          styles: { widthPreset: "small" },
        })}
      />,
    );
    expect(container.querySelector("img")).toBeNull();
  });

  it("should render a preview image element for non-compact presets (wide)", () => {
    const { container } = render(
      <LinkBlock
        block={makeBlock({
          content: {
            url: "https://example.com",
            title: "X",
            // Use a supabase URL so getCacheBustedUrl adds ?v=1
            imageUrl: "https://img.supabase.co/pic.webp",
          },
          styles: { widthPreset: "wide" },
        })}
      />,
    );
    // Image has alt="" (decorative), query directly not via ARIA role
    expect(container.querySelector("img")).not.toBeNull();
  });
});
