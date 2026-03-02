"use client";

import { useEffect, useRef } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Placeholder from "@tiptap/extension-placeholder";
import { TextBlock as TextBlockType } from "@/types/editor";
import { useEditorContext } from "@/contexts/EditorContext";
import styles from "./TextBlock.module.css";

export const TextBlock = ({ block }: { block: TextBlockType }) => {
  const contextEditor = useEditorContext();
  const editable = !!contextEditor;
  const lastSyncedContent = useRef(block.content?.text ?? "");

  const preset = block.styles?.widthPreset ?? "small";
  const clampClass =
    preset === "skinnyWide"
      ? styles.clampskinnyWide
      : preset === "tall" || preset === "large"
        ? styles.clampTall
        : styles.clampSmall;

  const editor = useEditor({
    extensions: [
      StarterKit,
      Placeholder.configure({
        placeholder: "Write something...",
        showOnlyWhenEditable: true,
      }),
    ],
    content: block.content?.text ?? "",
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
      const html = editor.getHTML();
      if (html !== lastSyncedContent.current && contextEditor?.onUpdateBlock) {
      }
    },
    onBlur: ({ editor }) => {
      if (!contextEditor?.onUpdateBlock) return;

      const html = editor.getHTML();
      const finalContent = editor.isEmpty ? "" : html;

      if (finalContent !== lastSyncedContent.current) {
        lastSyncedContent.current = finalContent;
        contextEditor.onUpdateBlock(block.id, {
          content: { text: finalContent },
        });
      }
    },
  });

  useEffect(() => {
    if (!editor) return;

    if (block.content?.text !== lastSyncedContent.current) {
      const newContent = block.content?.text ?? "";
      lastSyncedContent.current = newContent;
      editor.commands.setContent(newContent);
    }
  }, [block.id, block.content?.text, editor]);

  useEffect(() => {
    if (!editor) return;
    editor.setEditable(editable);
  }, [editor, editable]);

  if (editable && editor) {
    return (
      <div className={styles.editorContainer}>
        <EditorContent editor={editor} className={styles.editor} />
      </div>
    );
  }

  const html = block.content?.text ?? "";
  return html ? (
    <div
      className={`${styles.display} ${clampClass}`}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  ) : null;
};
