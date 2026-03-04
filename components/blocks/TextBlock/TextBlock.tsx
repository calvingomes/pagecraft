"use client";

import { EditorContent } from "@tiptap/react";
import { TextBlock as TextBlockType } from "@/types/editor";
import { useEditorContext } from "@/contexts/EditorContext";
import {
  minimalRTHtmlToInlineForClamp,
  sanitizeMinimalRTH,
} from "@/helper/sanitizeRichText";
import { useBlockEditor } from "@/hooks/useBlockEditor";
import styles from "./TextBlock.module.css";

export const TextBlock = ({ block }: { block: TextBlockType }) => {
  const contextEditor = useEditorContext();
  const editable = !!contextEditor;
  const initialContent = block.content?.text ?? "";

  const preset = block.styles?.widthPreset ?? "small";
  const clampClass =
    preset === "tall" || preset === "large"
      ? styles.clampTall
      : styles.clampSmall;

  const { editor } = useBlockEditor({
    content: initialContent,
    placeholder: "Write something...",
    editable,
    onUpdate: (html) => {
      contextEditor?.onUpdateBlock(block.id, {
        content: { text: html },
      });
    },
  });

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
