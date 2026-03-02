"use client";

import { useAuthStore } from "@/stores/auth-store";
import styles from "./ProfileSidebar.module.css";
import { EditorContent, useEditor } from "@tiptap/react";
import { useEffect, useRef, useState } from "react";
import { WordCount } from "@/components/ui/WordCount/WordCount";
import { htmlToText } from "@/helper/htmlToText";
import { sanitizeMinimalRichTextHtml } from "@/helper/sanitizeRichText";
import { minimalRTEWithPlaceholder } from "@/lib/tiptap/minimalRichText";
import type { ProfileSidebarProps } from "./ProfileSidebar.types";

const DISPLAY_NAME_MAX_CHARS = 70;

export const ProfileSidebar = (props: ProfileSidebarProps) => {
  const { username: editorUsername } = useAuthStore();
  const username = props.variant === "view" ? props.username : editorUsername;
  const position = props.position ?? "left";

  const displayNameRaw =
    typeof props.displayName === "string"
      ? props.displayName
      : (username ?? "");

  const safeDisplayNameHtml = sanitizeMinimalRichTextHtml(displayNameRaw);

  const displayNameText = displayNameRaw.includes("<")
    ? htmlToText(displayNameRaw)
    : displayNameRaw;

  const safeBioHtml = sanitizeMinimalRichTextHtml(props.bioHtml ?? "");

  const lastSyncedBio = useRef(safeBioHtml);
  const lastSyncedDisplayName = useRef(safeDisplayNameHtml);
  const editable = props.variant === "editor";

  const [isDisplayNameActive, setIsDisplayNameActive] = useState(false);

  const avatarLetter = (() => {
    const source = (displayNameText || username || "?").trim();
    return (source[0] ?? "?").toUpperCase();
  })();

  const displayNameEditor = useEditor({
    extensions: minimalRTEWithPlaceholder({
      placeholder: username ?? "Display name",
      showOnlyWhenEditable: true,
    }),
    content: safeDisplayNameHtml,
    editable,
    immediatelyRender: false,
    editorProps: {
      attributes: {
        "aria-label": "Display name",
        spellcheck: "false",
        autocorrect: "off",
        autocapitalize: "off",
      },
      handleKeyDown: (_view, event) => {
        if (event.key === "Enter") return true;
        return false;
      },
      handleTextInput: (view, from, to, text) => {
        const current = view.state.doc.textBetween(
          0,
          view.state.doc.content.size,
          " ",
        );
        const selected = view.state.doc.textBetween(from, to, " ");
        const nextLen = current.length - selected.length + text.length;
        if (nextLen > DISPLAY_NAME_MAX_CHARS) return true;
        return false;
      },
      handlePaste: (view, event) => {
        const text = event.clipboardData?.getData("text/plain") ?? "";
        if (!text) return false;
        const { from, to } = view.state.selection;
        const current = view.state.doc.textBetween(
          0,
          view.state.doc.content.size,
          " ",
        );
        const selected = view.state.doc.textBetween(from, to, " ");
        const nextLen = current.length - selected.length + text.length;
        if (nextLen > DISPLAY_NAME_MAX_CHARS) return true;
        return false;
      },
    },
    onUpdate: ({ editor }) => {
      if (props.variant !== "editor") return;
      const html = editor.isEmpty
        ? ""
        : sanitizeMinimalRichTextHtml(editor.getHTML());
      if (html === lastSyncedDisplayName.current) return;
      lastSyncedDisplayName.current = html;
      props.onChangeDisplayName?.(html);
    },
    onFocus: () => setIsDisplayNameActive(true),
    onBlur: () => setIsDisplayNameActive(false),
  });

  const bioEditor = useEditor({
    extensions: minimalRTEWithPlaceholder({
      placeholder: "Add a description…",
      showOnlyWhenEditable: true,
    }),
    content: safeBioHtml,
    editable,
    immediatelyRender: false,
    editorProps: {
      attributes: {
        spellcheck: "false",
        autocorrect: "off",
        autocapitalize: "off",
      },
    },
    onUpdate: ({ editor }) => {
      if (props.variant !== "editor") return;
      const html = editor.isEmpty
        ? ""
        : sanitizeMinimalRichTextHtml(editor.getHTML());
      if (html === lastSyncedBio.current) return;
      lastSyncedBio.current = html;
      props.onChangeBioHtml?.(html);
    },
  });

  useEffect(() => {
    if (!bioEditor) return;
    bioEditor.setEditable(editable);
  }, [bioEditor, editable]);

  useEffect(() => {
    if (!displayNameEditor) return;
    displayNameEditor.setEditable(editable);
  }, [displayNameEditor, editable]);

  useEffect(() => {
    if (!bioEditor) return;
    const incoming = sanitizeMinimalRichTextHtml(props.bioHtml ?? "");
    if (incoming === lastSyncedBio.current) return;
    lastSyncedBio.current = incoming;
    bioEditor.commands.setContent(incoming);
  }, [bioEditor, props.bioHtml]);

  useEffect(() => {
    if (!displayNameEditor) return;
    const incoming = sanitizeMinimalRichTextHtml(displayNameRaw);
    if (incoming === lastSyncedDisplayName.current) return;
    lastSyncedDisplayName.current = incoming;
    displayNameEditor.commands.setContent(incoming);
  }, [displayNameEditor, displayNameRaw]);

  const positionClass =
    position === "left"
      ? styles.sidebarLeft
      : position === "center"
        ? styles.sidebarCenter
        : styles.sidebarRight;

  return (
    <aside className={`${styles.sidebar} ${positionClass}`}>
      <div className={styles.profileCard}>
        <div className={styles.avatar}>{avatarLetter}</div>
        <div className={styles.profileText}>
          {props.variant === "editor" ? (
            <div className={styles.nameInput}>
              <EditorContent editor={displayNameEditor} />

              {props.variant === "editor" && isDisplayNameActive ? (
                <WordCount
                  value={displayNameEditor?.getText() ?? displayNameText}
                  max={DISPLAY_NAME_MAX_CHARS}
                  mode="characters"
                  className={styles.displayNameCount}
                  ariaLabel="Display name character count"
                />
              ) : null}
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
