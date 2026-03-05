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
};

export function useBlockEditor({
  content,
  placeholder,
  editable,
  onUpdate,
  editorProps,
}: UseBlockEditorProps) {
  const lastSyncedContent = useRef(sanitizeMinimalRTH(content));
  const [isEmpty, setIsEmpty] = useState(!content);

  const onUpdateRef = useRef(onUpdate);

  useEffect(() => {
    onUpdateRef.current = onUpdate;
  }, [onUpdate]);

  const editor = useEditor(
    {
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
      },
      onBlur: ({ editor }) => {
        const callback = onUpdateRef.current;
        if (!callback) return;

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
