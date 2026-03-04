"use client";

import { useEffect } from "react";
import styles from "./OverlayPopup.module.css";
import type { OverlayPopupProps } from "./OverlayPopup.types";

const LOCK_COUNT_ATTR = "data-overlay-lock-count";
const PREV_OVERFLOW_ATTR = "data-overlay-prev-overflow";
const PREV_TOUCH_ACTION_ATTR = "data-overlay-prev-touch-action";

export const OverlayPopup = ({
  open,
  title,
  message,
  showCloseButton = false,
  onClose,
}: OverlayPopupProps) => {
  useEffect(() => {
    if (!open) return;
    if (typeof document === "undefined") return;

    const body = document.body;
    const currentCount = Number(body.getAttribute(LOCK_COUNT_ATTR) ?? "0");

    if (currentCount === 0) {
      body.setAttribute(PREV_OVERFLOW_ATTR, body.style.overflow);
      body.setAttribute(PREV_TOUCH_ACTION_ATTR, body.style.touchAction);
      body.style.overflow = "hidden";
      body.style.touchAction = "none";
    }

    body.setAttribute(LOCK_COUNT_ATTR, String(currentCount + 1));

    return () => {
      const latestCount = Number(body.getAttribute(LOCK_COUNT_ATTR) ?? "1");
      const nextCount = Math.max(0, latestCount - 1);

      if (nextCount === 0) {
        body.style.overflow = body.getAttribute(PREV_OVERFLOW_ATTR) ?? "";
        body.style.touchAction =
          body.getAttribute(PREV_TOUCH_ACTION_ATTR) ?? "";
        body.removeAttribute(PREV_OVERFLOW_ATTR);
        body.removeAttribute(PREV_TOUCH_ACTION_ATTR);
        body.removeAttribute(LOCK_COUNT_ATTR);
        return;
      }

      body.setAttribute(LOCK_COUNT_ATTR, String(nextCount));
    };
  }, [open]);

  if (!open) return null;

  return (
    <div className={styles.overlay} role="dialog" aria-modal="true">
      <div className={styles.panel}>
        <div className={styles.header}>
          <h2 className={styles.title}>{title}</h2>
          {showCloseButton && (
            <button
              type="button"
              className={styles.closeButton}
              aria-label="Close"
              onClick={onClose}
            >
              ×
            </button>
          )}
        </div>
        <p className={styles.text}>{message}</p>
      </div>
    </div>
  );
};
