"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { EditorContent, useEditor } from "@tiptap/react";
import { Link2, Trash2 } from "lucide-react";
import { LinkBlock as LinkBlockType } from "@/types/editor";
import { useEditorContext } from "@/contexts/EditorContext";
import {
  getLinkHostOrUrl,
  isSupportedLinkUrl,
  resolveLinkTitle,
  shouldAutoApplyFetchedTitle,
  shouldShowLinkPreviewImage,
  type LinkMetadataResponse,
} from "@/helper/linkBlock";
import {
  minimalRTHtmlToInlineForClamp,
  sanitizeMinimalRTH,
} from "@/helper/sanitizeRichText";
import { minimalRTEWithPlaceholder } from "@/lib/tiptap/minimalRichText";
import styles from "./LinkBlock.module.css";

export const LinkBlock = ({ block }: { block: LinkBlockType }) => {
  const editor = useEditorContext();
  const content = block.content;
  const blockUrl = content.url ?? "";
  const titleHtml = sanitizeMinimalRTH(resolveLinkTitle(content));

  const metadataFetchTimer = useRef<number | null>(null);
  const lastFetchedUrl = useRef<string>(content.metaUrl ?? "");
  const lastSyncedTitle = useRef(titleHtml);
  const [isTitleEmpty, setIsTitleEmpty] = useState(
    titleHtml.trim().length === 0,
  );

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

  const titleEditor = useEditor({
    extensions: minimalRTEWithPlaceholder({
      placeholder: "Write Title...",
      showOnlyWhenEditable: true,
    }),
    content: titleHtml,
    editable: !!editor,
    immediatelyRender: false,
    editorProps: {
      attributes: {
        spellcheck: "false",
        autocorrect: "off",
        autocapitalize: "off",
      },
    },
    onCreate: ({ editor: rte }) => {
      setIsTitleEmpty(rte.isEmpty);
    },
    onUpdate: ({ editor: rte }) => {
      setIsTitleEmpty(rte.isEmpty);
    },
    onBlur: ({ editor: rte }) => {
      if (!editor?.onUpdateBlock) return;

      const html = rte.isEmpty ? "" : rte.getHTML();
      const finalTitle = sanitizeMinimalRTH(html);

      if (finalTitle !== lastSyncedTitle.current) {
        lastSyncedTitle.current = finalTitle;
        editor.onUpdateBlock(block.id, {
          content: {
            ...content,
            title: finalTitle,
          },
        });
      }
    },
  });

  useEffect(() => {
    if (!titleEditor) return;

    const incoming = sanitizeMinimalRTH(resolveLinkTitle(content));
    if (incoming !== lastSyncedTitle.current) {
      lastSyncedTitle.current = incoming;
      titleEditor.commands.setContent(incoming);
    }
  }, [content, titleEditor, block.id]);

  useEffect(() => {
    if (!titleEditor) return;
    titleEditor.setEditable(!!editor);
  }, [titleEditor, editor]);

  useEffect(() => {
    if (!editor?.onUpdateBlock) return;
    if (!canFetch) return;

    // Avoid repeated fetches for the same url.
    const currentMetaUrl = content.metaUrl ?? "";
    if (currentMetaUrl === urlTrimmed && lastFetchedUrl.current === urlTrimmed)
      return;

    if (metadataFetchTimer.current) {
      window.clearTimeout(metadataFetchTimer.current);
    }

    metadataFetchTimer.current = window.setTimeout(async () => {
      try {
        const res = await fetch(
          `/api/link-metadata?url=${encodeURIComponent(urlTrimmed)}`,
        );
        if (!res.ok) return;
        const meta = (await res.json()) as LinkMetadataResponse;

        lastFetchedUrl.current = urlTrimmed;

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
      } catch {
        // ignore
      }
    }, 400);

    return () => {
      if (metadataFetchTimer.current) {
        window.clearTimeout(metadataFetchTimer.current);
      }
    };
  }, [
    editor,
    canFetch,
    urlTrimmed,
    block.id,
    content,
    content.metaUrl,
    content.metaTitle,
    content.title,
    content.metaImageRemoved,
  ]);

  const isEditable = !!editor;
  const preset = block.styles?.widthPreset ?? "small";
  const showPreviewImage = shouldShowLinkPreviewImage(preset);

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
    showPreviewImage && imageUrl ? (
      <div
        className={`${styles.preview} ${isEditable ? styles.previewEditable : ""}`}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img className={styles.previewImg} src={imageUrl} alt="" />
        {isEditable ? (
          <>
            <div className={styles.previewOverlay} aria-hidden />
            <button
              type="button"
              className={styles.previewDeleteButton}
              onClick={handleRemoveMetaImage}
              aria-label="Remove preview image"
              title="Remove preview image"
            >
              <Trash2 size={18} />
            </button>
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
