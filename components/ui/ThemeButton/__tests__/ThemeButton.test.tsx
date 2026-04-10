import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { ThemeButton } from "../ThemeButton";

// Mock posthog-js
vi.mock('posthog-js/react', () => ({
  usePostHog: () => ({
    capture: vi.fn(),
  }),
}));

describe("ThemeButton", () => {
  it("renders a button with the correct label", () => {
    render(<ThemeButton label="Click Me" cta={() => {}} bgColor="red" />);
    expect(screen.getByText("Click Me")).toBeInTheDocument();
  });

  it("applies the correct HTML type attribute", () => {
    const { rerender } = render(<ThemeButton label="Submit" cta={() => {}} type="submit" bgColor="red" />);
    const button = screen.getByRole("button");
    expect(button).toHaveAttribute("type", "submit");

    rerender(<ThemeButton label="Button" cta={() => {}} type="button" bgColor="red" />);
    expect(button).toHaveAttribute("type", "button");
  });

  it("renders as a Link when cta is a string", () => {
    render(<ThemeButton label="Go Home" cta="/home" bgColor="red" />);
    const link = screen.getByRole("link");
    expect(link).toBeInTheDocument();
    expect(link).toHaveAttribute("href", "/home");
  });

  it("disables the button when the disabled prop is true", () => {
    render(<ThemeButton label="Disabled" cta={() => {}} disabled={true} bgColor="red" />);
    const button = screen.getByRole("button");
    expect(button).toBeDisabled();
  });
});
