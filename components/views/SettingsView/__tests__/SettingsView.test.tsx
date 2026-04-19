import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it, vi, beforeEach } from "vitest";

vi.mock("@/lib/supabase/client", () => ({
  supabase: {
    from: vi.fn(),
  },
}));

import { SettingsView } from "../SettingsView";
import { supabase } from "@/lib/supabase/client";

const mockInsert = vi.fn();
const s = supabase as unknown as { from: ReturnType<typeof vi.fn> };

describe("SettingsView", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    s.from.mockReturnValue({ insert: mockInsert });
  });

  it("renders support section and submit button", () => {
    render(
      <SettingsView
        user={{ id: "user-1" } as never}
        username="calvingomes"
        onLogout={async () => {}}
      />,
    );

    expect(screen.getByText("Support")).toBeInTheDocument();
    expect(screen.getByText("Send feedback")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Submit feedback" })).toBeInTheDocument();
  });

  it("shows validation error for short feedback and does not call insert", async () => {
    render(
      <SettingsView
        user={{ id: "user-1" } as never}
        username="calvingomes"
        onLogout={async () => {}}
      />,
    );

    fireEvent.change(
      screen.getByPlaceholderText("Describe what happened and what you expected..."),
      { target: { value: "hey" } },
    );
    fireEvent.click(screen.getByRole("button", { name: "Submit feedback" }));

    expect(
      await screen.findByText("Please enter at least 5 characters of feedback."),
    ).toBeInTheDocument();
    expect(s.from).not.toHaveBeenCalled();
    expect(mockInsert).not.toHaveBeenCalled();
  });

  it("submits feedback and shows success state", async () => {
    mockInsert.mockResolvedValueOnce({ error: null });

    render(
      <SettingsView
        user={{ id: "user-1" } as never}
        username="calvingomes"
        onLogout={async () => {}}
      />,
    );

    fireEvent.change(
      screen.getByPlaceholderText("Describe what happened and what you expected..."),
      { target: { value: "   Works great overall, but upload could be clearer.   " } },
    );
    fireEvent.click(screen.getByRole("button", { name: "Submit feedback" }));

    await waitFor(() => {
      expect(s.from).toHaveBeenCalledWith("feedback");
      expect(mockInsert).toHaveBeenCalledWith({
        user_id: "user-1",
        message: "Works great overall, but upload could be clearer.",
      });
    });

    expect(
      await screen.findByText("Thanks! Your feedback was submitted."),
    ).toBeInTheDocument();
  });
});
