import Placeholder from "@tiptap/extension-placeholder";
import Document from "@tiptap/extension-document";
import Paragraph from "@tiptap/extension-paragraph";
import Text from "@tiptap/extension-text";
import Bold from "@tiptap/extension-bold";
import Italic from "@tiptap/extension-italic";
import Underline from "@tiptap/extension-underline";

export const minimalRTE = [
  Document,
  Paragraph,
  Text,
  Bold,
  Italic,
  Underline,
] as const;

export function minimalRTEWithPlaceholder(options: {
  placeholder: string;
  showOnlyWhenEditable?: boolean;
}) {
  return [
    ...minimalRTE,
    Placeholder.configure({
      placeholder: options.placeholder,
      showOnlyWhenEditable: options.showOnlyWhenEditable ?? true,
    }),
  ];
}
