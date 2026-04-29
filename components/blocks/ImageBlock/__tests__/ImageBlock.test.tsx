import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { ImageBlock as ImageBlockType } from "@/types/editor";
import type { EditorContextValue } from "@/types/editor";

const mockUseEditorContext = vi.fn<() => EditorContextValue | null>(() => null);
vi.mock("@/contexts/EditorContext", () => ({
  useEditorContext: () => mockUseEditorContext(),
}));

// Render next/image as a plain <img> in tests.
vi.mock("next/image", () => ({
  default: ({
    src,
    alt,
    ...rest
  }: {
    src: string;
    alt: string;
    fill?: boolean;
    sizes?: string;
    [key: string]: unknown;
  }) => {
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={src} alt={alt} data-testid="block-image" {...rest} />;
  },
}));

const { ImageBlock } = await import("../ImageBlock");

const makeBlock = (overrides: Partial<ImageBlockType> = {}): ImageBlockType => ({
  id: "block-img-1",
  type: "image",
  order: 0,
  content: {
    url: "https://abc.supabase.co/storage/v1/object/public/test.webp",
    alt: "Test image",
  },
  styles: { widthPreset: "small" },
  ...overrides,
});

describe("ImageBlock — read-only (useEditorContext returns null)", () => {
  beforeEach(() => mockUseEditorContext.mockReturnValue(null));

  it("should return null when the URL is empty", () => {
    const { container } = render(
      <ImageBlock block={makeBlock({ content: { url: "", alt: "" } })} />,
    );
    expect(container.firstChild).toBeNull();
  });

  it("should return null when the URL is only whitespace", () => {
    const { container } = render(
      <ImageBlock block={makeBlock({ content: { url: "   ", alt: "" } })} />,
    );
    expect(container.firstChild).toBeNull();
  });

  it("should render an image when URL is present", () => {
    render(<ImageBlock block={makeBlock()} />);
    expect(screen.getByTestId("block-image")).toBeInTheDocument();
  });

  it("should pass the alt text to the image element", () => {
    render(<ImageBlock block={makeBlock()} />);
    expect(screen.getByAltText("Test image")).toBeInTheDocument();
  });

  it("should show the caption overlay when a non-empty caption is set", () => {
    render(
      <ImageBlock
        block={makeBlock({
          content: {
            url: "https://abc.supabase.co/img.webp",
            alt: "",
            caption: "A sunset",
          },
        })}
      />,
    );
    expect(screen.getByText("A sunset")).toBeInTheDocument();
  });

  it("should not render a caption element when caption is empty", () => {
    const { container } = render(
      <ImageBlock
        block={makeBlock({
          content: { url: "https://abc.supabase.co/img.webp", alt: "", caption: "" },
        })}
      />,
    );
    // The captionOverlay div should be absent
    expect(container.querySelector("[class*='captionOverlay']")).toBeNull();
  });

  it("should wrap the image in an anchor when linkUrl is set (read-only)", () => {
    render(
      <ImageBlock
        block={makeBlock({
          content: {
            url: "https://abc.supabase.co/img.webp",
            alt: "",
            linkUrl: "https://destination.com",
          },
        })}
      />,
    );
    const link = screen.getByRole("link");
    expect(link).toHaveAttribute("href", "https://destination.com");
    expect(link).toHaveAttribute("target", "_blank");
  });

  it("should not render an anchor when linkUrl is absent", () => {
    render(<ImageBlock block={makeBlock()} />);
    expect(screen.queryByRole("link")).toBeNull();
  });
});
