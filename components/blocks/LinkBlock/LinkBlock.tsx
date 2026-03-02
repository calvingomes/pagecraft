"use client";

import { useEffect, useMemo, useRef, useState, useCallback } from "react";
import { Link2 } from "lucide-react";
import { LinkBlock as LinkBlockType } from "@/types/editor";
import { useEditorContext } from "@/contexts/EditorContext";
import styles from "./LinkBlock.module.css";

export const LinkBlock = ({ block }: { block: LinkBlockType }) => {
  const editor = useEditorContext();
  const blockUrl = block.content?.url ?? "";
  const blockTitle =
    block.content?.title ??
    block.content?.label ??
    block.content?.metaTitle ??
    "";

  const [draftUrl, setDraftUrl] = useState(blockUrl);
  const [draftTitle, setDraftTitle] = useState(blockTitle);
  const [urlDirty, setUrlDirty] = useState(false);
  const [titleDirty, setTitleDirty] = useState(false);

  const metadataFetchTimer = useRef<number | null>(null);
  const lastFetchedUrl = useRef<string>(block.content?.metaUrl ?? "");

  const urlTrimmed = useMemo(() => blockUrl.trim(), [blockUrl]);
  const canFetch = useMemo(() => {
    if (!urlTrimmed) return false;
    try {
      const u = new URL(urlTrimmed);
      return u.protocol === "http:" || u.protocol === "https:";
    } catch {
      return false;
    }
  }, [urlTrimmed]);

  const onSave = useCallback(() => {
    if (!editor?.onUpdateBlock) return;

    const nextUrl = (urlDirty ? draftUrl : blockUrl).trim();
    const nextTitle = (titleDirty ? draftTitle : blockTitle).trim();

    editor.onUpdateBlock(block.id, {
      content: {
        ...(block.content ?? {}),
        url: nextUrl,
        title: nextTitle,
      },
    });
    setUrlDirty(false);
    setTitleDirty(false);
  }, [
    editor,
    block.id,
    block.content,
    urlDirty,
    titleDirty,
    draftUrl,
    draftTitle,
    blockUrl,
    blockTitle,
  ]);

  useEffect(() => {
    if (!editor?.onUpdateBlock) return;
    if (!canFetch) return;

    // Avoid repeated fetches for the same url.
    const currentMetaUrl = block.content?.metaUrl ?? "";
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
        const meta = (await res.json()) as {
          title: string | null;
          imageUrl: string | null;
          iconUrl: string | null;
        };

        lastFetchedUrl.current = urlTrimmed;

        const prevMetaTitle = (block.content?.metaTitle ?? "").trim();
        const prevTitle =
          (block.content?.title ?? block.content?.label ?? "").trim() || "";
        const nextMetaTitle = (meta.title ?? "").trim();

        const shouldUpdateTitle =
          !prevTitle || (prevMetaTitle && prevTitle === prevMetaTitle);

        editor.onUpdateBlock(block.id, {
          content: {
            ...(block.content ?? {}),
            url: urlTrimmed,
            metaUrl: urlTrimmed,
            metaTitle: nextMetaTitle || undefined,
            imageUrl: meta.imageUrl ?? undefined,
            iconUrl: meta.iconUrl ?? undefined,
            ...(shouldUpdateTitle && nextMetaTitle
              ? { title: nextMetaTitle }
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
  }, [editor, canFetch, urlTrimmed, block.id, block.content]);

  const isEditable = !!editor;
  const preset = block.styles?.widthPreset ?? "small";
  const showPreviewImage =
    preset === "large" || preset === "tall" || preset === "wide";

  const displayUrl = (block.content?.url ?? "").trim();
  if (!isEditable && !displayUrl) return null;

  const titleText =
    (
      block.content?.title ??
      block.content?.label ??
      block.content?.metaTitle ??
      ""
    ).trim() || "";
  const metaTitle = (block.content?.metaTitle ?? "").trim();
  const imageUrl = block.content?.imageUrl;
  const iconUrl = block.content?.iconUrl;

  const effectiveTitle = titleDirty ? draftTitle : titleText || metaTitle;
  const effectiveUrl = urlDirty ? draftUrl : displayUrl;

  const TitleElement = isEditable ? (
    <input
      type="text"
      className={styles.titleInput}
      placeholder="Title"
      value={effectiveTitle}
      onFocus={() => {
        if (!titleDirty) setDraftTitle(titleText || metaTitle);
      }}
      onChange={(e) => {
        setTitleDirty(true);
        setDraftTitle(e.target.value);
      }}
      onBlur={() => {
        if (!titleDirty) return;
        onSave();
      }}
      onKeyDown={(e) => {
        if (e.key === "Enter") {
          e.preventDefault();
          onSave();
        }
      }}
    />
  ) : (
    <div className={styles.title} title={titleText || metaTitle}>
      {titleText || metaTitle || displayUrl}
    </div>
  );

  if (isEditable) {
    return (
      <div className={styles.card} data-editing>
        <div className={styles.header}>
          <div className={styles.iconWrap} aria-hidden>
            {iconUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img className={styles.iconImg} src={iconUrl} alt="" />
            ) : (
              <Link2 className={styles.iconFallback} />
            )}
          </div>
          <div className={styles.text}>
            {TitleElement}
            <input
              type="url"
              className={styles.urlInput}
              placeholder="https://example.com"
              value={effectiveUrl}
              onFocus={() => {
                if (!urlDirty) setDraftUrl(displayUrl);
              }}
              onChange={(e) => {
                setUrlDirty(true);
                setDraftUrl(e.target.value);
              }}
              onBlur={() => {
                if (!urlDirty) return;
                onSave();
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  onSave();
                }
              }}
            />
          </div>
        </div>
        {showPreviewImage && imageUrl ? (
          <div className={styles.preview}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img className={styles.previewImg} src={imageUrl} alt="" />
          </div>
        ) : null}
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
      <div className={styles.header}>
        <div className={styles.iconWrap} aria-hidden>
          {iconUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img className={styles.iconImg} src={iconUrl} alt="" />
          ) : (
            <Link2 className={styles.iconFallback} />
          )}
        </div>
        <div className={styles.text}>
          {TitleElement}
          <div className={styles.url} title={displayUrl}>
            {(() => {
              try {
                return new URL(displayUrl).host;
              } catch {
                return displayUrl;
              }
            })()}
          </div>
        </div>
      </div>
      {showPreviewImage && imageUrl ? (
        <div className={styles.preview}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img className={styles.previewImg} src={imageUrl} alt="" />
        </div>
      ) : null}
    </a>
  );
};
