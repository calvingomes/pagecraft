"use client";

import { useAuthStore } from "@/stores/auth-store";
import styles from "./ProfileSidebar.module.css";
import { EditorContent } from "@tiptap/react";
import React, { useState, useRef, useEffect } from "react";
import { MOBILE_GRID } from "@/lib/editor-engine/grid/grid-config";
import { htmlToText } from "@/lib/utils/htmlToText";
import { sanitizeMinimalRTH } from "@/lib/utils/sanitizeRichText";
import type { ProfileSidebarProps } from "./ProfileSidebar.types";
import { AvatarHoverToolbar } from "@/components/builder/HoverToolbar/AvatarHoverToolbar/AvatarHoverToolbar";
import { useBlockEditor } from "@/hooks/useBlockEditor";
import { DeleteButtonCorner } from "@/components/builder/DeleteButtonCorner/DeleteButtonCorner";

export const ProfileSidebar = (props: ProfileSidebarProps) => {
  const { username: editorUsername } = useAuthStore();
  const username = props.variant === "view" ? props.username : editorUsername;

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

  const [showAvatarHoverToolbar, setShowAvatarHoverToolbar] = useState(false);

  const wrapperRef = useRef<HTMLDivElement>(null);
  const [zoom, setZoom] = useState(1);

  useEffect(() => {
    if (props.variant !== "view") return;
    const el = wrapperRef.current;
    if (!el) return;
    const observer = new ResizeObserver((entries) => {
      const width = entries[0].contentRect.width;
      if (!width) return;
      setZoom(width < MOBILE_GRID.canvasPx ? width / MOBILE_GRID.canvasPx : 1);
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, [props.variant]);

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

  const avatarClassName = `${styles.avatar} ${avatarShape === "square" ? styles.avatarSquare : ""}`;

  const asideStyle =
    props.variant === "view" && zoom < 1
      ? ({ width: `${MOBILE_GRID.canvasPx}px`, zoom } as React.CSSProperties)
      : undefined;

  return (
    <div ref={wrapperRef}>
    <aside className={`${styles.sidebar} ${styles.sidebarCenter}`} style={asideStyle}>
      <div className={styles.profileCard}>
        <div
          className={styles.avatarWrap}
          onMouseEnter={() => setShowAvatarHoverToolbar(true)}
          onMouseLeave={() => setShowAvatarHoverToolbar(false)}
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
            <>
              <AvatarHoverToolbar
                visible={showAvatarHoverToolbar}
                currentShape={avatarShape}
                onShapeChange={(nextShape) =>
                  props.onChangeAvatarShape?.(nextShape)
                }
                onUpload={(nextImage) => props.onChangeAvatarUrl?.(nextImage)}
                className={styles.AvatarHoverToolbar}
              />
              {showAvatarHoverToolbar && !!avatarUrl && (
                <DeleteButtonCorner
                  onClick={() => props.onChangeAvatarUrl?.("")}
                  title="Remove image"
                  ariaLabel="Remove image"
                />
              )}
            </>
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
    </div>
  );
};
