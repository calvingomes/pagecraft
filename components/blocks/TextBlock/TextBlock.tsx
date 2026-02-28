"use client";

import { useEffect, useRef } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { TextBlock as TextBlockType } from "@/types/editor";
import { useEditorContext } from "@/contexts/EditorContext";
import styles from "./TextBlock.module.css";

export const TextBlock = ({ block }: { block: TextBlockType }) => {
  const contextEditor = useEditorContext();
  const editable = !!contextEditor;
  const lastSyncedContent = useRef(block.content?.text ?? "");

  const editor = useEditor({
    extensions: [StarterKit],
    content: block.content?.text ?? "",
    editable,
    immediatelyRender: false,
    onUpdate: ({ editor }) => {
      const html = editor.getHTML();
      if (html !== lastSyncedContent.current && contextEditor?.onUpdateBlock) {
      }
    },
    onBlur: ({ editor }) => {
      if (!contextEditor?.onUpdateBlock) return;

      const html = editor.getHTML();
      const isEmpty = html === "<p></p>";
      const finalContent = isEmpty ? "<p>New text block</p>" : html;

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

  if (!editable && editor) {
    const html = editor.getHTML();
    return html && html !== "<p></p>" ? (
      <div
        className={styles.display}
        dangerouslySetInnerHTML={{ __html: html }}
      />
    ) : null;
  }

  return null;
};
