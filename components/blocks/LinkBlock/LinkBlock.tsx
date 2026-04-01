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
import { getCacheBustedUrl } from "@/lib/utils/imageUtils";
import styles from "./LinkBlock.module.css";

const LinkTitleEditor = dynamic(
  () => import("./LinkTitleEditor").then((mod) => mod.LinkTitleEditor),
  { ssr: false }
);

const LinkImageEditor = dynamic(
  () => import("./LinkImageEditor").then((mod) => mod.LinkImageEditor),
  { ssr: false }
);

export const LinkBlock = ({ block }: { block: LinkBlockType }) => {
  const editor = useEditorContext();
  const isEditable = !!editor;
  const content = block.content;
  const blockUrl = content.url ?? "";
  const titleHtml = sanitizeMinimalRTH(resolveLinkTitle(content));

  const titleText = resolveLinkTitle(content).trim();
  const metaTitle = (content.metaTitle ?? "").trim();
  const clampedTitleHtml = minimalRTHtmlToInlineForClamp(titleText || metaTitle);

  const imageUrl = getCacheBustedUrl(content.imageUrl, block.updated_at);
  const iconUrl = getCacheBustedUrl(content.iconUrl, block.updated_at);
  const displayUrl = blockUrl.trim();
  const urlSubtext = getLinkHostOrUrl(displayUrl);

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

  const widthPreset = block.styles?.widthPreset || "small";
  const isCompact = widthPreset === "small" || widthPreset === "skinnyWide";

  const PreviewElement = (imageUrl || isEditable) && !isCompact ? (
    <div className={`${styles.preview} ${isEditable ? styles.previewEditable : ""} ${!imageUrl && isEditable ? styles.previewEmpty : ""}`}>
      {imageUrl && (
        // eslint-disable-next-line @next/next/no-img-element
        <img className={styles.previewImg} src={imageUrl} alt="" />
      )}
      {isEditable && (
        <LinkImageEditor
          block={block}
          onUpdate={(updates) => editor?.onUpdateBlock(block.id, updates)}
        />
      )}
    </div>
  ) : null;

  const TitleElement = isEditable ? (
    <LinkTitleEditor
      block={block}
      titleHtml={titleHtml}
      onUpdate={(updates) => editor?.onUpdateBlock(block.id, updates)}
      isTitleEmpty={!titleText && !metaTitle}
    />
  ) : clampedTitleHtml ? (
    <div className={styles.title} dangerouslySetInnerHTML={{ __html: clampedTitleHtml }} />
  ) : (
    <div className={styles.title}>{displayUrl}</div>
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

  const cardClasses = `${styles.card} ${styles[widthPreset] || ""} ${!PreviewElement ? styles.noPreview : ""}`;

  if (isEditable) {
    return <div className={cardClasses}>{ContentBody}</div>;
  }

  return (
    <a className={cardClasses} href={displayUrl} target="_blank" rel="noopener noreferrer">
      {ContentBody}
    </a>
  );
};
