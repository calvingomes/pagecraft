"use client";

import { useAuthStore } from "@/stores/auth-store";
import styles from "./ProfileSidebar.module.css";
import { EditorContent } from "@tiptap/react";
import { useState } from "react";
import { htmlToText } from "@/lib/utils/htmlToText";
import { sanitizeMinimalRTH } from "@/lib/utils/sanitizeRichText";
import type { ProfileSidebarProps } from "./ProfileSidebar.types";
import { AvatarToolbar } from "./AvatarToolbar";
import { useBlockEditor } from "@/hooks/useBlockEditor";

export const ProfileSidebar = (props: ProfileSidebarProps) => {
  const { username: editorUsername } = useAuthStore();
  const username = props.variant === "view" ? props.username : editorUsername;
  const position = props.position ?? "left";

  const displayNameRaw =
    typeof props.displayName === "string"
      ? props.displayName
      : (username ?? "");

  const safeDisplayNameHtml = sanitizeMinimalRTH(displayNameRaw);

  const displayNameText = displayNameRaw.includes("<")
    ? htmlToText(displayNameRaw)
    : displayNameRaw;

  const safeBioHtml = sanitizeMinimalRTH(props.bioHtml ?? "");

  const editable = props.variant === "editor";
  const avatarShape = props.avatarShape ?? "circle";
  const avatarUrl = props.avatarUrl ?? "";

  const [showAvatarToolbar, setShowAvatarToolbar] = useState(false);

  const avatarLetter = (() => {
    const source = (displayNameText || username || "?").trim();
    return (source[0] ?? "?").toUpperCase();
  })();

  const { editor: displayNameEditor } = useBlockEditor({
    content: safeDisplayNameHtml,
    placeholder: username ?? "Display name",
    editable,
    onUpdate: (html) => {
      if (props.variant !== "editor") return;
      props.onChangeDisplayName?.(html);
    },
    editorProps: {
      attributes: {
        "aria-label": "Display name",
      },
      handleKeyDown: (_view, event) => {
        if (event.key === "Enter") return true;
        return false;
      },
    },
  });

  const { editor: bioEditor } = useBlockEditor({
    content: safeBioHtml,
    placeholder: "Add a description…",
    editable,
    onUpdate: (html) => {
      if (props.variant !== "editor") return;
      props.onChangeBioHtml?.(html);
    },
  });

  const positionClass =
    position === "left"
      ? styles.sidebarLeft
      : position === "center"
        ? styles.sidebarCenter
        : styles.sidebarRight;

  const avatarClassName = `${styles.avatar} ${avatarShape === "square" ? styles.avatarSquare : ""}`;

  return (
    <aside className={`${styles.sidebar} ${positionClass}`}>
      <div className={styles.profileCard}>
        <div
          className={styles.avatarWrap}
          onMouseEnter={() => setShowAvatarToolbar(true)}
          onMouseLeave={() => setShowAvatarToolbar(false)}
        >
          <div className={avatarClassName}>
            {avatarUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                className={styles.avatarImage}
                src={avatarUrl}
                alt="Profile image"
              />
            ) : (
              avatarLetter
            )}
          </div>

          {props.variant === "editor" ? (
            <AvatarToolbar
              visible={showAvatarToolbar}
              currentShape={avatarShape}
              onShapeChange={(nextShape) =>
                props.onChangeAvatarShape?.(nextShape)
              }
              onDelete={() => props.onChangeAvatarUrl?.("")}
              onUpload={(nextImage) => props.onChangeAvatarUrl?.(nextImage)}
              className={styles.avatarToolbar}
            />
          ) : null}
        </div>
        <div>
          {props.variant === "editor" ? (
            <div className={styles.nameInput}>
              <EditorContent editor={displayNameEditor} />
            </div>
          ) : (
            <div
              className={styles.name}
              role="heading"
              aria-level={2}
              {...(safeDisplayNameHtml.includes("<")
                ? { dangerouslySetInnerHTML: { __html: safeDisplayNameHtml } }
                : {})}
            >
              {!safeDisplayNameHtml.includes("<") ? safeDisplayNameHtml : null}
            </div>
          )}

          {props.variant === "editor" ? (
            <div className={styles.bioEditor}>
              <EditorContent editor={bioEditor} className={styles.bioEditor} />
            </div>
          ) : props.bioHtml ? (
            <div
              className={styles.bio}
              dangerouslySetInnerHTML={{ __html: safeBioHtml }}
            />
          ) : null}
        </div>
      </div>
    </aside>
  );
};
