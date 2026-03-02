"use client";

import { useAuthStore } from "@/stores/auth-store";
import type { SidebarPosition } from "@/types/page";
import styles from "./ProfileSidebar.module.css";
import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Placeholder from "@tiptap/extension-placeholder";
import { useEffect, useRef } from "react";

type ProfileSidebarProps = (
  | {
      variant: "editor";
      displayName?: string;
      bioHtml?: string;
      onChangeDisplayName?: (displayName: string) => void;
      onChangeBioHtml?: (bioHtml: string) => void;
    }
  | {
      variant: "view";
      username: string;
      displayName?: string;
      bioHtml?: string;
    }
) & { position?: SidebarPosition };

export const ProfileSidebar = (props: ProfileSidebarProps) => {
  const { username: editorUsername } = useAuthStore();
  const username = props.variant === "view" ? props.username : editorUsername;
  const position = props.position ?? "left";

  const displayName =
    props.displayName?.trim() ||
    (props.variant === "view" ? username : username);

  const lastSyncedBio = useRef(props.bioHtml ?? "");
  const editable = props.variant === "editor";

  const bioEditor = useEditor({
    extensions: [
      StarterKit,
      Placeholder.configure({
        placeholder: "Add a description…",
        showOnlyWhenEditable: true,
      }),
    ],
    content: props.bioHtml ?? "",
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
      const html = editor.isEmpty ? "" : editor.getHTML();
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
    if (!bioEditor) return;
    const incoming = props.bioHtml ?? "";
    if (incoming === lastSyncedBio.current) return;
    lastSyncedBio.current = incoming;
    bioEditor.commands.setContent(incoming);
  }, [bioEditor, props.bioHtml]);

  const positionClass =
    position === "left"
      ? styles.sidebarLeft
      : position === "center"
        ? styles.sidebarCenter
        : styles.sidebarRight;

  return (
    <aside className={`${styles.sidebar} ${positionClass}`}>
      <div className={styles.profileCard}>
        <div className={styles.avatar}>
          {displayName?.[0]?.toUpperCase() ?? "?"}
        </div>
        <div className={styles.profileText}>
          {props.variant === "editor" ? (
            <input
              className={styles.nameInput}
              type="text"
              value={props.displayName ?? ""}
              onChange={(e) => props.onChangeDisplayName?.(e.target.value)}
              placeholder={username ?? "Display name"}
              aria-label="Display name"
            />
          ) : (
            <h2 className={styles.name}>{displayName ?? "—"}</h2>
          )}

          {props.variant === "editor" ? (
            <div className={styles.bioEditor}>
              <EditorContent editor={bioEditor} className={styles.bioEditor} />
            </div>
          ) : props.bioHtml ? (
            <div
              className={styles.bio}
              dangerouslySetInnerHTML={{ __html: props.bioHtml }}
            />
          ) : null}
        </div>
      </div>
    </aside>
  );
};
