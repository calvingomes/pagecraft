"use client";

import { useEffect, useRef } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import { ParagraphBlock as ParagraphBlockType } from "@/types/editor";
import { useEditorContext } from "@/contexts/EditorContext";
import { useEditorStore } from "@/stores/editor-store";
import { sanitizeMinimalRTH } from "@/helper/sanitizeRichText";
import { minimalRTEWithPlaceholder } from "@/lib/tiptap/minimalRichText";
import { computeAutoHeightReflowUpdates } from "@/lib/autoHeightLayout";
import { normalizeAutoHeightPx, quantizeAutoHeightPx } from "@/lib/blockGrid";
import styles from "./ParagraphBlock.module.css";

export const ParagraphBlock = ({ block }: { block: ParagraphBlockType }) => {
  const contextEditor = useEditorContext();
  const allBlocks = useEditorStore((s) => s.blocks);
  const updateBlock = useEditorStore((s) => s.updateBlock);
  const editable = !!contextEditor;
  const initialContent = sanitizeMinimalRTH(block.content?.text ?? "");
  const lastSyncedContent = useRef(initialContent);
  const lastSyncedHeight = useRef<number>(
    normalizeAutoHeightPx(block.styles?.height, block.type),
  );

  const syncHeight = (nextHeightPx: number) => {
    if (!contextEditor?.onUpdateBlock) return;

    const next = normalizeAutoHeightPx(nextHeightPx, block.type);
    const prevOccupancy = quantizeAutoHeightPx(
      lastSyncedHeight.current,
      block.type,
    );
    const nextOccupancy = quantizeAutoHeightPx(next, block.type);
    const occupancyChanged = prevOccupancy !== nextOccupancy;

    if (!occupancyChanged && Math.abs(next - lastSyncedHeight.current) < 8)
      return;

    lastSyncedHeight.current = next;
    const updates = computeAutoHeightReflowUpdates({
      anchorBlock: block,
      nextHeight: next,
      allBlocks,
    });

    for (const { id, updates: nextUpdates } of updates) {
      updateBlock(id, nextUpdates);
    }

    contextEditor?.onUpdateBlock(block.id, {
      styles: {
        ...block.styles,
        height: next,
      },
    });
  };

  const editor = useEditor({
    extensions: minimalRTEWithPlaceholder({
      placeholder: "Write a paragraph...",
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

      const root = editor.view.dom as HTMLElement;
      syncHeight(root.scrollHeight);
    },
    onUpdate: ({ editor }) => {
      if (!editable) return;
      const root = editor.view.dom as HTMLElement;
      syncHeight(root.scrollHeight);
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

  useEffect(() => {
    if (!editor || !editable) return;
    const root = editor.view.dom as HTMLElement;
    syncHeight(root.scrollHeight);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editor, editable, block.id]);

  if (editable && editor) {
    return (
      <div className={styles.editorContainer}>
        <EditorContent editor={editor} className={styles.editor} />
      </div>
    );
  }

  const html = block.content?.text ?? "";
  const safeHtml = sanitizeMinimalRTH(html);
  const renderedHtml = safeHtml;
  return renderedHtml ? (
    <div
      className={styles.display}
      dangerouslySetInnerHTML={{ __html: renderedHtml }}
    />
  ) : null;
};
