"use client";
/* eslint-disable css-modules/no-unused-class */

import dynamic from "next/dynamic";
import { Link2 } from "lucide-react";
import { LinkBlock as LinkBlockType } from "@/types/editor";
import { useEditorContext } from "@/contexts/EditorContext";
import {
  getLinkHostOrUrl,
  resolveLinkTitle,
} from "@/lib/utils/linkBlock";
import {
  minimalRTHtmlToInlineForClamp,
  sanitizeMinimalRTH,
} from "@/lib/utils/sanitizeRichText";
import styles from "./LinkBlock.module.css";

const LinkBlockEditor = dynamic(
  () => import("./LinkBlockEditor").then((mod) => mod.LinkBlockEditor),
  { ssr: false }
);

export const LinkBlock = ({ block }: { block: LinkBlockType }) => {
  const editor = useEditorContext();
  const isEditable = !!editor;
  const content = block.content;
  const blockUrl = content.url ?? "";
  const titleHtml = sanitizeMinimalRTH(resolveLinkTitle(content));

  const imageUrl = content.imageUrl;
  const iconUrl = content.iconUrl;
  const displayUrl = blockUrl.trim();
  const urlSubtext = getLinkHostOrUrl(displayUrl);

  const titleText = resolveLinkTitle(content).trim();
  const metaTitle = (content.metaTitle ?? "").trim();
  const clampedTitleHtml = minimalRTHtmlToInlineForClamp(titleText || metaTitle);

  if (!isEditable && !displayUrl) return null;

  const IconElement = (
    <div className={styles.iconWrap} aria-hidden>
      {iconUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img className={styles.iconImg} src={iconUrl} alt="" />
      ) : (
        <Link2 className={styles.iconFallback} />
      )}
    </div>
  );

  const PreviewElement = (imageUrl || isEditable) ? (
    <div className={`${styles.preview} ${isEditable ? styles.previewEditable : ""} ${!imageUrl && isEditable ? styles.previewEmpty : ""}`}>
      {imageUrl && (
        // eslint-disable-next-line @next/next/no-img-element
        <img className={styles.previewImg} src={imageUrl} alt="" />
      )}
      {isEditable && (
        <LinkBlockEditor
          block={block}
          titleHtml={titleHtml}
          onUpdate={(updates) => editor?.onUpdateBlock(block.id, updates)}
          isTitleEmpty={!titleText && !metaTitle}
        />
      )}
    </div>
  ) : null;

  const TitleElement = isEditable ? null : (
    clampedTitleHtml ? (
      <div className={styles.title} dangerouslySetInnerHTML={{ __html: clampedTitleHtml }} />
    ) : (
      <div className={styles.title}>{displayUrl}</div>
    )
  );

  const ContentBody = (
    <>
      <div className={styles.header}>
        {IconElement}
        <div className={styles.text}>
          {TitleElement}
          <div className={styles.url}>{urlSubtext}</div>
        </div>
      </div>
      {PreviewElement}
    </>
  );

  if (isEditable) {
    return <div className={styles.card}>{ContentBody}</div>;
  }

  return (
    <a className={styles.card} href={displayUrl} target="_blank" rel="noopener noreferrer">
      {ContentBody}
    </a>
  );
};
