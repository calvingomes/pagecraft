import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { MapBlock } from "../MapBlock";
import type { MapBlock as MapBlockType } from "@/types/editor";

// Mock next/dynamic to render synchronously in tests
vi.mock("next/dynamic", () => ({
  default: (loader: any) => {
    const Component = (props: any) => {
      const [C, setC] = (require("react") as any).useState(null);
      (require("react") as any).useEffect(() => {
        loader().then((mod: any) => setC(() => mod.default));
      }, []);
      return C ? <C {...props} /> : null;
    };
    Component.displayName = "DynamicComponent";
    return Component;
  },
}));

// Mock MapInterface to isolate testing to MapBlock state logic
vi.mock("../MapInterface", () => ({
  __esModule: true,
  default: ({ onMoveEnd, isUnlocked }: any) => (
    <div data-testid="mock-map">
      {isUnlocked && (
        <button 
          data-testid="simulate-move"
          onClick={() => onMoveEnd(10, 20, 15)}
        >
          Simulate Move
        </button>
      )}
    </div>
  ),
}));

const mockOnUpdateBlock = vi.fn();
const mockUseEditorContext = vi.fn();
vi.mock("@/contexts/EditorContext", () => ({
  useEditorContext: () => mockUseEditorContext(),
}));

describe("MapBlock", () => {
  const mockBlock: MapBlockType = {
    id: "test-id",
    type: "map",
    content: { 
      address: "Paris, France",
      lat: 48.8566,
      lng: 2.3522,
      zoom: 12
    },
    order: 0,
    styles: { widthPreset: "small" },
  };

  beforeEach(() => {
    vi.clearAllMocks();
    mockUseEditorContext.mockReturnValue({ 
      onUpdateBlock: mockOnUpdateBlock,
      isActualMobile: false 
    });
  });

  it("renders the static image in read-only mode with overscan and zoom correction", () => {
    mockUseEditorContext.mockReturnValue(null); // Read-only mode
    render(<MapBlock block={mockBlock} />);
    const img = screen.getByRole("img");
    
    // Check for +120px overscan (Small is 200px -> Math.max(200, 400) + 120 = 520)
    expect(img).toHaveAttribute("src", expect.stringContaining("w=520&h=520"));
    // Check for +0.1 zoom correction
    expect(img).toHaveAttribute("src", expect.stringContaining("zoom=12.1"));
  });

  it("does not save to DB while moving (Deferred Saving)", async () => {
    // Render initially as UNLOCKED
    render(<MapBlock block={mockBlock} isMapUnlocked={true} />);
    
    // Wait for dynamic MapInterface to load
    const moveBtn = await screen.findByTestId("simulate-move");
    fireEvent.click(moveBtn);

    // Verify coordinates updated locally (ref) but DB wasn't called
    expect(mockOnUpdateBlock).not.toHaveBeenCalled();
  });

  it("commits changes to DB only when toggling from unlocked to locked", async () => {
    const { rerender } = render(<MapBlock block={mockBlock} isMapUnlocked={true} />);
    
    // 1. Wait for map and move it
    const moveBtn = await screen.findByTestId("simulate-move");
    fireEvent.click(moveBtn);
    expect(mockOnUpdateBlock).not.toHaveBeenCalled();

    // 2. Lock the map (simulate clicking the Tick icon)
    rerender(<MapBlock block={mockBlock} isMapUnlocked={false} />);

    // 3. Verify final coordinates were saved
    expect(mockOnUpdateBlock).toHaveBeenCalledWith("test-id", expect.objectContaining({
      content: expect.objectContaining({
        lat: 10,
        lng: 20,
        zoom: 15
      })
    }));
  });

  it("saves address updates immediately", () => {
    render(<MapBlock block={mockBlock} isMapUnlocked={false} />);
    
    const input = screen.getByPlaceholderText("Label this location...");
    fireEvent.change(input, { target: { value: "New Address" } });

    expect(mockOnUpdateBlock).toHaveBeenCalledWith("test-id", expect.objectContaining({
      content: expect.objectContaining({ address: "New Address" })
    }));
  });
});
