"use client";

import * as Dialog from "@radix-ui/react-dialog";
import styles from "./OverlayPopup.module.css";
import type { OverlayPopupProps } from "./OverlayPopup.types";

export const OverlayPopup = ({
  open,
  title,
  message,
  showCloseButton = false,
  onClose,
}: OverlayPopupProps) => {
  return (
    <Dialog.Root
      open={open}
      onOpenChange={(nextOpen) => !nextOpen && onClose?.()}
    >
      <Dialog.Portal>
        <Dialog.Overlay className={styles.overlay} />
        <Dialog.Content className={styles.panel}>
          <div className={styles.header}>
            <Dialog.Title className={styles.title}>{title}</Dialog.Title>
            {showCloseButton && (
              <Dialog.Close asChild>
                <button
                  type="button"
                  className={styles.closeButton}
                  aria-label="Close"
                >
                  ×
                </button>
              </Dialog.Close>
            )}
          </div>
          <Dialog.Description className={styles.text}>
            {message}
          </Dialog.Description>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
};
