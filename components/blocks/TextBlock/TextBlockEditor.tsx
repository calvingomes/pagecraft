"use client";
/* eslint-disable css-modules/no-unused-class */

import { EditorContent } from "@tiptap/react";
import { TextBlock as TextBlockType } from "@/types/editor";
import { useBlockEditor } from "@/hooks/useBlockEditor";
import styles from "./TextBlock.module.css";

type TextBlockEditorProps = {
  block: TextBlockType;
  isFocused: boolean;
  onUpdate: (html: string) => void;
  onFocus?: () => void;
  onBlur?: () => void;
};

export const TextBlockEditor = ({ block, isFocused, onUpdate, onFocus, onBlur }: TextBlockEditorProps) => {
  const initialContent = block.content?.text ?? "";

  const { editor } = useBlockEditor({
    content: initialContent,
    placeholder: "Write something...",
    editable: true,
    autofocus: isFocused ? "end" : false,
    onUpdate,
    onFocus,
    onBlur,
  });

  if (!editor) return null;

  return (
    <div className={styles.editorContainer}>
      <EditorContent editor={editor} className={styles.editor} />
    </div>
  );
};
