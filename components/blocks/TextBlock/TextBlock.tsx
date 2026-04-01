"use client";
/* eslint-disable css-modules/no-unused-class */

import dynamic from "next/dynamic";
import { TextBlock as TextBlockType } from "@/types/editor";
import { useEditorContext } from "@/contexts/EditorContext";
import {
  minimalRTHtmlToInlineForClamp,
  sanitizeMinimalRTH,
} from "@/lib/utils/sanitizeRichText";
import styles from "./TextBlock.module.css";

const TextBlockEditor = dynamic(
  () => import("./TextBlockEditor").then((mod) => mod.TextBlockEditor),
  { ssr: false }
);

export const TextBlock = ({ block }: { block: TextBlockType }) => {
  const contextEditor = useEditorContext();
  const editable = !!contextEditor;

  const preset = block.styles?.widthPreset ?? "small";
  const isSkinnyWide = preset === "skinnyWide";

  const clampClass =
    isSkinnyWide
      ? styles.skinnyWide
      : preset === "tall" || preset === "large"
        ? styles.clampTall
        : styles.clampSmall;

  if (editable) {
    return (
      <TextBlockEditor
        block={block}
        onUpdate={(html) => {
          contextEditor?.onUpdateBlock(block.id, {
            content: { text: html },
          });
        }}
      />
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
