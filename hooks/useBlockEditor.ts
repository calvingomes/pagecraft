import { useEffect, useRef, useState } from "react";
import { useEditor, EditorOptions } from "@tiptap/react";
import { minimalRTEWithPlaceholder } from "@/lib/tiptap/minimalRichText";
import { sanitizeMinimalRTH } from "@/lib/utils/sanitizeRichText";

type UseBlockEditorProps = {
  content: string;
  placeholder?: string;
  editable: boolean;
  onUpdate?: (html: string) => void;
  editorProps?: EditorOptions["editorProps"];
  autofocus?: EditorOptions["autofocus"];
};

export function useBlockEditor({
  content,
  placeholder,
  editable,
  onUpdate,
  editorProps,
  autofocus,
}: UseBlockEditorProps) {
  const lastSyncedContent = useRef(sanitizeMinimalRTH(content));
  const [isEmpty, setIsEmpty] = useState(!content);

  const onUpdateRef = useRef(onUpdate);
  const debounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    onUpdateRef.current = onUpdate;
  }, [onUpdate]);

  const editor = useEditor(
    {
      autofocus,
      extensions: minimalRTEWithPlaceholder({
        placeholder: placeholder ?? "",
        showOnlyWhenEditable: true,
      }),
      content: sanitizeMinimalRTH(content),
      editable,
      immediatelyRender: false,
      editorProps: {
        attributes: {
          spellcheck: "false",
          autocorrect: "off",
          autocapitalize: "off",
        },
        ...editorProps,
      },
      onCreate: ({ editor }) => {
        setIsEmpty(editor.isEmpty);
      },
      onUpdate: ({ editor }) => {
        setIsEmpty(editor.isEmpty);

        const callback = onUpdateRef.current;
        if (!callback) return;

        // Clear existing debounce
        if (debounceTimerRef.current) {
          clearTimeout(debounceTimerRef.current);
        }

        // Debounce store update to 500ms while typing
        debounceTimerRef.current = setTimeout(() => {
          const html = editor.isEmpty ? "" : editor.getHTML();
          const final = sanitizeMinimalRTH(html);

          if (final !== lastSyncedContent.current) {
            lastSyncedContent.current = final;
            callback(final);
          }
        }, 500);
      },
      onBlur: ({ editor }) => {
        const callback = onUpdateRef.current;
        if (!callback) return;

        // Final sync on blur
        if (debounceTimerRef.current) {
          clearTimeout(debounceTimerRef.current);
        }

        const html = editor.isEmpty ? "" : editor.getHTML();
        const final = sanitizeMinimalRTH(html);

        if (final !== lastSyncedContent.current) {
          lastSyncedContent.current = final;
          callback(final);
        }
      },
    },
    [],
  );

  useEffect(() => {
    if (!editor) return;

    const incoming = sanitizeMinimalRTH(content);
    if (incoming !== lastSyncedContent.current) {
      lastSyncedContent.current = incoming;
      editor.commands.setContent(incoming);
    }
  }, [content, editor]);

  useEffect(() => {
    if (!editor) return;
    if (editor.isEditable !== editable) {
      editor.setEditable(editable);
    }
  }, [editor, editable]);

  return { editor, isEmpty };
}
