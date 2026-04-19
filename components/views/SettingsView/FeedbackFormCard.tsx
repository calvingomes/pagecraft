"use client";

import { MessageCircleMore } from "lucide-react";
import type { FeedbackFormCardProps } from "./SettingsView.types";
import styles from "./FeedbackFormCard.module.css";

export function FeedbackFormCard({
  username,
  feedbackSubject,
  feedbackBody,
  isSubmitting,
  status,
  onSubjectChange,
  onBodyChange,
  onSubmit,
  style,
}: FeedbackFormCardProps) {
  return (
    <article className={styles.card} style={style}>
      <div className={styles.cardHeader}>
        <MessageCircleMore size={18} />
        <h3>Send feedback</h3>
      </div>
      <p className={styles.cardDescription}>
        Tell us what works and what should improve.
      </p>
      <input
        type="text"
        className={styles.input}
        value={feedbackSubject}
        onChange={(e) => onSubjectChange(e.target.value)}
        placeholder={`Feedback from @${username}`}
      />
      <textarea
        className={styles.textarea}
        value={feedbackBody}
        onChange={(e) => onBodyChange(e.target.value)}
        placeholder="Describe what happened and what you expected..."
      />
      <button
        type="button"
        className={styles.ghostBtn}
        onClick={onSubmit}
        disabled={isSubmitting}
      >
        {isSubmitting ? "Submitting..." : "Submit feedback"}
      </button>
      {status && (
        <p
          className={
            status.kind === "error" ? styles.statusError : styles.statusSuccess
          }
          role="status"
        >
          {status.message}
        </p>
      )}
    </article>
  );
}
