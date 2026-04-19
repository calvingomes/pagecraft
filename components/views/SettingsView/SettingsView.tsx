"use client";

import { useState, type CSSProperties } from "react";
import { sizePxForPreset } from "@/lib/editor-engine/grid/grid-math";
import { DESKTOP_GRID } from "@/lib/editor-engine/grid/grid-config";
import { supabase } from "@/lib/supabase/client";
import type {
  CardPreset,
  FeedbackStatus,
  SettingsViewProps,
} from "./SettingsView.types";
import { FeedbackFormCard } from "./FeedbackFormCard";
import styles from "./SettingsView.module.css";

const cardSizeStyle = (preset: CardPreset): CSSProperties => {
  const { widthPx, heightPx } = sizePxForPreset(preset, DESKTOP_GRID);
  return {
    "--card-width": `${widthPx}px`,
    "--card-height": `${heightPx}px`,
  } as CSSProperties;
};

export function SettingsView({ user, username }: SettingsViewProps) {
  const [feedbackSubject, setFeedbackSubject] = useState(
    `Feedback from @${username}`,
  );
  const [feedbackBody, setFeedbackBody] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [status, setStatus] = useState<FeedbackStatus>(null);

  const handleSubmitFeedback = async () => {
    if (isSubmitting) return;

    const message = feedbackBody.trim();
    if (message.length < 5) {
      setStatus({
        kind: "error",
        message: "Please enter at least 5 characters of feedback.",
      });
      return;
    }

    setStatus(null);
    setIsSubmitting(true);
    try {
      const { error } = await supabase.from("feedback").insert({
        user_id: user.id,
        message,
      });

      if (error) throw error;

      setFeedbackBody("");
      setStatus({
        kind: "success",
        message: "Thanks! Your feedback was submitted.",
      });
    } catch (error) {
      console.error("[SettingsView] Failed to submit feedback:", error);
      setStatus({
        kind: "error",
        message: "Could not submit feedback right now. Please try again.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className={styles.content}>
      <h2 className={styles.sectionTitle}>Support</h2>
      <div className={styles.rowWrap}>
        <FeedbackFormCard
          username={username}
          feedbackSubject={feedbackSubject}
          feedbackBody={feedbackBody}
          isSubmitting={isSubmitting}
          status={status}
          onSubjectChange={setFeedbackSubject}
          onBodyChange={setFeedbackBody}
          onSubmit={handleSubmitFeedback}
          style={cardSizeStyle("large")}
        />
      </div>
    </section>
  );
}
