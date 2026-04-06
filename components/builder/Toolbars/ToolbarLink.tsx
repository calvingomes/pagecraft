/* eslint-disable css-modules/no-unused-class */
"use client";

import * as Label from "@radix-ui/react-label";
import * as Toolbar from "@radix-ui/react-toolbar";
import { ArrowLeft, Check } from "lucide-react";
import { VISUALLY_HIDDEN_STYLE } from "@/lib/utils/visuallyHidden";
import { isSupportedLinkUrl } from "@/lib/utils/linkBlock";
import styles from "./Toolbar.module.css";
import type { ToolbarLinkProps } from "./Toolbar.types";

export function ToolbarLink({
  linkUrl,
  onChangeLinkUrl,
  onBack,
  onCreateLink,
}: ToolbarLinkProps) {
  const inputId = "toolbar-link-url";
  const isValid = isSupportedLinkUrl(linkUrl);

  const handleSubmit = () => {
    if (!isValid) return;
    void onCreateLink();
  };

  return (
    <Toolbar.Root
      className={`${styles.toolbarContainer} ${styles.toolbarLinkContainer}`}
      aria-label="Link toolbar"
    >
      <Toolbar.Button
        type="button"
        className={styles.backButton}
        onClick={onBack}
        aria-label="Back to toolbar"
      >
        <ArrowLeft size={18} />
      </Toolbar.Button>
      <Label.Root htmlFor={inputId} style={VISUALLY_HIDDEN_STYLE}>
        Link URL
      </Label.Root>
      <input
        id={inputId}
        className={styles.linkInput}
        placeholder="Add link here"
        autoFocus
        value={linkUrl}
        name="link-url"
        onChange={(e) => onChangeLinkUrl(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            e.preventDefault();
            handleSubmit();
          }
        }}
      />
      <Toolbar.Button
        type="button"
        className={styles.pasteButton}
        onClick={handleSubmit}
        disabled={!isValid}
        aria-label="Create link"
      >
        <Check size={18} />
      </Toolbar.Button>
    </Toolbar.Root>
  );
}
