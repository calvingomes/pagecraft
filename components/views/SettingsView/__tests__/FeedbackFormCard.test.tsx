import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { FeedbackFormCard } from "../FeedbackFormCard";

describe("FeedbackFormCard", () => {
  it("calls change handlers for subject/body fields", () => {
    const onSubjectChange = vi.fn();
    const onBodyChange = vi.fn();

    render(
      <FeedbackFormCard
        username="calvingomes"
        feedbackSubject="Feedback from @calvingomes"
        feedbackBody=""
        isSubmitting={false}
        status={null}
        onSubjectChange={onSubjectChange}
        onBodyChange={onBodyChange}
        onSubmit={vi.fn()}
      />,
    );

    fireEvent.change(screen.getByPlaceholderText("Feedback from @calvingomes"), {
      target: { value: "New subject" },
    });
    fireEvent.change(
      screen.getByPlaceholderText("Describe what happened and what you expected..."),
      {
        target: { value: "New body" },
      },
    );

    expect(onSubjectChange).toHaveBeenCalledWith("New subject");
    expect(onBodyChange).toHaveBeenCalledWith("New body");
  });

  it("calls onSubmit when submit button is clicked", () => {
    const onSubmit = vi.fn();

    render(
      <FeedbackFormCard
        username="calvingomes"
        feedbackSubject="Feedback from @calvingomes"
        feedbackBody="hello there"
        isSubmitting={false}
        status={null}
        onSubjectChange={vi.fn()}
        onBodyChange={vi.fn()}
        onSubmit={onSubmit}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: "Submit feedback" }));
    expect(onSubmit).toHaveBeenCalledTimes(1);
  });
});
