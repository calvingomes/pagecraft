"use client";
/* eslint-disable css-modules/no-unused-class */
import Image from "next/image";
import { useAuthStore } from "@/stores/auth-store";
import styles from "./ProfileSidebar.module.css";
import { EditorContent } from "@tiptap/react";
import React, { useState } from "react";
import { htmlToText } from "@/lib/utils/htmlToText";
import { sanitizeMinimalRTH } from "@/lib/utils/sanitizeRichText";
import { AvatarHoverToolbar } from "@/components/builder/HoverToolbar/AvatarHoverToolbar/AvatarHoverToolbar";
import { useBlockEditor } from "@/hooks/useBlockEditor";
import { DeleteButtonCorner } from "@/components/builder/DeleteButtonCorner/DeleteButtonCorner";

type ProfileSidebarEditorProps = {
  displayName?: string;
  bioHtml?: string;
  avatarUrl?: string;
  avatarShape?: "circle" | "square";
  onChangeDisplayName?: (displayName: string) => void;
  onChangeBioHtml?: (bioHtml: string) => void;
  onChangeAvatarUrl?: (avatarUrl: string) => void;
  onChangeAvatarShape?: (avatarShape: "circle" | "square") => void;
};

export const ProfileSidebarEditor = (props: ProfileSidebarEditorProps) => {
  const { username } = useAuthStore();
  const displayNameRaw = typeof props.displayName === "string" ? props.displayName : (username ?? "");
  const safeDisplayNameHtml = sanitizeMinimalRTH(displayNameRaw);
  const displayNameText = displayNameRaw.includes("<") ? htmlToText(displayNameRaw) : displayNameRaw;
  const safeBioHtml = sanitizeMinimalRTH(props.bioHtml ?? "");
  const avatarShape = props.avatarShape ?? "circle";
  const avatarUrl = props.avatarUrl ?? "";

  const [showAvatarHoverToolbar, setShowAvatarHoverToolbar] = useState(false);

  const avatarLetter = (() => {
    const source = (displayNameText || username || "?").trim();
    return (source[0] ?? "?").toUpperCase();
  })();

  const { editor: displayNameEditor } = useBlockEditor({
    content: safeDisplayNameHtml,
    placeholder: username ?? "Display name",
    editable: true,
    onUpdate: (html) => props.onChangeDisplayName?.(html),
    editorProps: {
      attributes: { "aria-label": "Display name" },
      handleKeyDown: (_view, event) => event.key === "Enter",
    },
  });

  const { editor: bioEditor } = useBlockEditor({
    content: safeBioHtml,
    placeholder: "Add a description…",
    editable: true,
    onUpdate: (html) => props.onChangeBioHtml?.(html),
  });

  const avatarClassName = `${styles.avatar} ${avatarShape === "square" ? styles.avatarSquare : ""}`;

  return (
    <aside className={`${styles.sidebar} ${styles.sidebarCenter}`}>
      <div className={styles.profileCard}>
        <div
          className={styles.avatarWrap}
          onMouseEnter={() => setShowAvatarHoverToolbar(true)}
          onMouseLeave={() => setShowAvatarHoverToolbar(false)}
        >
          <div className={avatarClassName}>
            {avatarUrl ? (
              <Image
                src={avatarUrl}
                alt="Profile image"
                width={200}
                height={200}
                className={styles.avatarImage}
                priority
              />
            ) : (
              avatarLetter
            )}
          </div>
          <AvatarHoverToolbar
            visible={showAvatarHoverToolbar}
            currentShape={avatarShape}
            onShapeChange={(nextShape) => props.onChangeAvatarShape?.(nextShape)}
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
        </div>
        <div>
          <div className={styles.nameInput}>
            <EditorContent editor={displayNameEditor} />
          </div>
          <div className={styles.bioEditor}>
            <EditorContent editor={bioEditor} className={styles.bioEditor} />
          </div>
        </div>
      </div>
    </aside>
  );
};
