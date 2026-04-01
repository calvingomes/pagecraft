"use client";
/* eslint-disable css-modules/no-unused-class */

import { EditorContent } from "@tiptap/react";
import { TextBlock as TextBlockType } from "@/types/editor";
import { useBlockEditor } from "@/hooks/useBlockEditor";
import styles from "./TextBlock.module.css";

type TextBlockEditorProps = {
  block: TextBlockType;
  onUpdate: (html: string) => void;
};

export const TextBlockEditor = ({ block, onUpdate }: TextBlockEditorProps) => {
  const initialContent = block.content?.text ?? "";

  const { editor } = useBlockEditor({
    content: initialContent,
    placeholder: "Write something...",
    editable: true,
    onUpdate,
  });

  if (!editor) return null;

  return (
    <div className={styles.editorContainer}>
      <EditorContent editor={editor} className={styles.editor} />
    </div>
  );
};
