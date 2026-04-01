"use client";

import * as Toolbar from "@radix-ui/react-toolbar";
import { EditorContent } from "@tiptap/react";
import { Link2, Trash2, Upload } from "lucide-react";
import { useMemo, useCallback, useRef, type ChangeEvent } from "react";
import { fileToWebpDataUrl } from "@/lib/uploads/imageWebp";
import { LinkBlock as LinkBlockType } from "@/types/editor";
import { useEditorContext } from "@/contexts/EditorContext";
import {
  getLinkHostOrUrl,
  isSupportedLinkUrl,
  resolveLinkTitle,
  shouldAutoApplyFetchedTitle,
  type LinkMetadataResponse,
} from "@/lib/utils/linkBlock";
import {
  minimalRTHtmlToInlineForClamp,
  sanitizeMinimalRTH,
} from "@/lib/utils/sanitizeRichText";
import { useLinkMetadata } from "@/hooks/useLinkMetadata";
import { useBlockEditor } from "@/hooks/useBlockEditor";
import styles from "./LinkBlock.module.css";

export const LinkBlock = ({ block }: { block: LinkBlockType }) => {
  const editor = useEditorContext();
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const content = block.content;
  const blockUrl = content.url ?? "";
  const titleHtml = sanitizeMinimalRTH(resolveLinkTitle(content));

  const urlTrimmed = useMemo(() => blockUrl.trim(), [blockUrl]);
  const canFetch = useMemo(() => isSupportedLinkUrl(urlTrimmed), [urlTrimmed]);

  const handleRemoveMetaImage = () => {
    if (!editor?.onUpdateBlock) return;

    editor.onUpdateBlock(block.id, {
      content: {
        ...content,
        imageUrl: "",
        metaImageRemoved: true,
      },
    });
  };

  const handlePickFile = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !editor?.onUpdateBlock) return;

    try {
      const dataUrl = await fileToWebpDataUrl(file, "link-preview.webp");
      editor.onUpdateBlock(block.id, {
        content: {
          ...content,
          imageUrl: dataUrl,
          metaImageRemoved: false,
        },
      });
    } catch (error) {
      console.error("Failed to process image:", error);
    } finally {
      event.target.value = "";
    }
  };

  const { editor: titleEditor, isEmpty: isTitleEmpty } = useBlockEditor({
    content: titleHtml,
    placeholder: "Write Title...",
    editable: !!editor,
    onUpdate: (html) => {
      editor?.onUpdateBlock(block.id, {
        content: {
          ...content,
          title: html,
        },
      });
    },
  });

  const handleMetadataSuccess = useCallback(
    (meta: LinkMetadataResponse) => {
      if (!editor?.onUpdateBlock) return;

      const nextMetaTitle = (meta.title ?? "").trim();
      const shouldUpdateTitle = shouldAutoApplyFetchedTitle({
        currentTitle: content.title,
        currentMetaTitle: content.metaTitle,
      });

      editor.onUpdateBlock(block.id, {
        content: {
          ...content,
          url: urlTrimmed,
          metaUrl: urlTrimmed,
          metaTitle: nextMetaTitle,
          imageUrl: content.metaImageRemoved ? "" : (meta.imageUrl ?? ""),
          iconUrl: meta.iconUrl ?? "",
          ...(shouldUpdateTitle && nextMetaTitle
            ? { title: sanitizeMinimalRTH(nextMetaTitle) }
            : {}),
        },
      });
    },
    [editor, block.id, content, urlTrimmed],
  );

  useLinkMetadata({
    url: urlTrimmed,
    initialUrl: content.metaUrl,
    enabled: !!editor && canFetch,
    onSuccess: handleMetadataSuccess,
  });

  const isEditable = !!editor;
  const showPreviewImage = true;

  const displayUrl = blockUrl.trim();
  if (!isEditable && !displayUrl) return null;

  const titleText = resolveLinkTitle(content).trim();
  const metaTitle = (content.metaTitle ?? "").trim();
  const clampedTitleHtml = minimalRTHtmlToInlineForClamp(
    titleText || metaTitle,
  );
  const imageUrl = content.imageUrl;
  const iconUrl = content.iconUrl;

  const urlSubtext = getLinkHostOrUrl(displayUrl);

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

  const TitleElement = isEditable ? (
    <div className={styles.titleEditorContainer}>
      {titleEditor ? (
        <EditorContent editor={titleEditor} className={styles.titleEditor} />
      ) : null}
      {isTitleEmpty ? (
        <span className={styles.titlePlaceholder}>Write Title...</span>
      ) : null}
    </div>
  ) : clampedTitleHtml ? (
    <div
      className={styles.title}
      dangerouslySetInnerHTML={{ __html: clampedTitleHtml }}
    />
  ) : (
    <div className={styles.title}>{displayUrl}</div>
  );

  const UrlElement = (
    <div className={styles.url} title={displayUrl}>
      {urlSubtext}
    </div>
  );

  const HeaderElement = (
    <div className={styles.header}>
      {IconElement}
      <div className={styles.text}>
        {TitleElement}
        {UrlElement}
      </div>
    </div>
  );

  const PreviewElement =
    (showPreviewImage && imageUrl) || isEditable ? (
      <div
        className={`${styles.preview} ${isEditable ? styles.previewEditable : ""} ${!imageUrl && isEditable ? styles.previewEmpty : ""}`}
      >
        {imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img className={styles.previewImg} src={imageUrl} alt="" />
        ) : null}
        
        {isEditable ? (
          <>
            <div className={styles.previewOverlay} aria-hidden />
            <Toolbar.Root className={styles.previewActions} aria-label="Preview image actions">
              <Toolbar.Button
                type="button"
                className={styles.previewIconButton}
                onClick={handlePickFile}
                aria-label="Upload custom image"
                title="Upload custom image"
              >
                <Upload size={18} />
              </Toolbar.Button>
              
              {imageUrl ? (
                <Toolbar.Button
                  type="button"
                  className={styles.previewIconButton}
                  onClick={handleRemoveMetaImage}
                  aria-label="Remove preview image"
                  title="Remove preview image"
                >
                  <Trash2 size={18} />
                </Toolbar.Button>
              ) : null}
            </Toolbar.Root>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/png,image/jpeg"
              onChange={handleFileChange}
              hidden
            />
          </>
        ) : null}
      </div>
    ) : null;

  if (isEditable) {
    return (
      <div className={styles.card} data-editing>
        {HeaderElement}
        {PreviewElement}
      </div>
    );
  }

  return (
    <a
      className={styles.card}
      href={displayUrl}
      target="_blank"
      rel="noopener noreferrer"
    >
      {HeaderElement}
      {PreviewElement}
    </a>
  );
};
