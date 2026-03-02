"use client";

import { useEffect, useRef } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import { TextBlock as TextBlockType } from "@/types/editor";
import { useEditorContext } from "@/contexts/EditorContext";
import {
  minimalRTHtmlToInlineForClamp,
  sanitizeMinimalRTH,
} from "@/helper/sanitizeRichText";
import { minimalRTEWithPlaceholder } from "@/lib/tiptap/minimalRichText";
import styles from "./TextBlock.module.css";

export const TextBlock = ({ block }: { block: TextBlockType }) => {
  const contextEditor = useEditorContext();
  const editable = !!contextEditor;
  const initialContent = sanitizeMinimalRTH(block.content?.text ?? "");
  const lastSyncedContent = useRef(initialContent);

  const preset = block.styles?.widthPreset ?? "small";
  const clampClass =
    preset === "skinnyWide"
      ? styles.clampskinnyWide
      : preset === "tall" || preset === "large"
        ? styles.clampTall
        : styles.clampSmall;

  const editor = useEditor({
    extensions: minimalRTEWithPlaceholder({
      placeholder: "Write something...",
      showOnlyWhenEditable: true,
    }),
    content: initialContent,
    editable,
    immediatelyRender: false,
    editorProps: {
      attributes: {
        spellcheck: "false",
        autocorrect: "off",
        autocapitalize: "off",
      },
    },
    onBlur: ({ editor }) => {
      if (!contextEditor?.onUpdateBlock) return;

      const html = editor.isEmpty ? "" : editor.getHTML();
      const finalContent = sanitizeMinimalRTH(html);

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

    const incoming = sanitizeMinimalRTH(block.content?.text ?? "");
    if (incoming !== lastSyncedContent.current) {
      lastSyncedContent.current = incoming;
      editor.commands.setContent(incoming);
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
  const safeHtml = sanitizeMinimalRTH(html);
  const clampedHtml = minimalRTHtmlToInlineForClamp(safeHtml);
  return clampedHtml ? (
    <div
      className={`${styles.display} ${clampClass}`}
      dangerouslySetInnerHTML={{ __html: clampedHtml }}
    />
  ) : null;
};
