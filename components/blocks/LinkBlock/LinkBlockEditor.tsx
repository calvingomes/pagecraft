"use client";
/* eslint-disable css-modules/no-unused-class */

import * as Toolbar from "@radix-ui/react-toolbar";
import { EditorContent } from "@tiptap/react";
import { Trash2, Upload } from "lucide-react";
import { useCallback, useRef, type ChangeEvent } from "react";
import { fileToWebpDataUrl } from "@/lib/uploads/imageWebp";
import { LinkBlock as LinkBlockType } from "@/types/editor";
import {
  isSupportedLinkUrl,
  shouldAutoApplyFetchedTitle,
  type LinkMetadataResponse,
} from "@/lib/utils/linkBlock";
import { sanitizeMinimalRTH } from "@/lib/utils/sanitizeRichText";
import { useLinkMetadata } from "@/hooks/useLinkMetadata";
import { useBlockEditor } from "@/hooks/useBlockEditor";
import styles from "./LinkBlock.module.css";

type LinkBlockEditorProps = {
  block: LinkBlockType;
  onUpdate: (updates: Partial<LinkBlockType>) => void;
  titleHtml: string;
  isTitleEmpty: boolean;
};

export const LinkBlockEditor = ({ block, onUpdate, titleHtml }: LinkBlockEditorProps) => {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const content = block.content;
  const blockUrl = (content.url ?? "").trim();
  const canFetch = isSupportedLinkUrl(blockUrl);

  const { editor: titleEditor, isEmpty: isTitleEmpty } = useBlockEditor({
    content: titleHtml,
    placeholder: "Write Title...",
    editable: true,
    onUpdate: (html) => {
      onUpdate({ content: { ...content, title: html } });
    },
  });

  const handleMetadataSuccess = useCallback(
    (meta: LinkMetadataResponse) => {
      const nextMetaTitle = (meta.title ?? "").trim();
      const shouldUpdateTitle = shouldAutoApplyFetchedTitle({
        currentTitle: content.title,
        currentMetaTitle: content.metaTitle,
      });

      onUpdate({
        content: {
          ...content,
          url: blockUrl,
          metaUrl: blockUrl,
          metaTitle: nextMetaTitle,
          imageUrl: content.metaImageRemoved ? "" : (meta.imageUrl ?? ""),
          iconUrl: meta.iconUrl ?? "",
          ...(shouldUpdateTitle && nextMetaTitle
            ? { title: sanitizeMinimalRTH(nextMetaTitle) }
            : {}),
        },
      });
    },
    [onUpdate, content, blockUrl]
  );

  useLinkMetadata({
    url: blockUrl,
    initialUrl: content.metaUrl,
    enabled: canFetch,
    onSuccess: handleMetadataSuccess,
  });

  const handlePickFile = () => fileInputRef.current?.click();

  const handleFileChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    try {
      const dataUrl = await fileToWebpDataUrl(file, "link-preview.webp");
      onUpdate({
        content: { ...content, imageUrl: dataUrl, metaImageRemoved: false },
      });
    } catch (e) {
      console.error(e);
    } finally {
      event.target.value = "";
    }
  };

  const handleRemoveMetaImage = () => {
    onUpdate({ content: { ...content, imageUrl: "", metaImageRemoved: true } });
  };

  return (
    <>
      <div className={styles.titleEditorContainer}>
        {titleEditor && <EditorContent editor={titleEditor} className={styles.titleEditor} />}
        {isTitleEmpty && <span className={styles.titlePlaceholder}>Write Title...</span>}
      </div>
      <div className={styles.previewOverlay} />
      <Toolbar.Root className={styles.previewActions}>
        <Toolbar.Button className={styles.previewIconButton} onClick={handlePickFile}>
          <Upload size={18} />
        </Toolbar.Button>
        {content.imageUrl && (
          <Toolbar.Button className={styles.previewIconButton} onClick={handleRemoveMetaImage}>
            <Trash2 size={18} />
          </Toolbar.Button>
        )}
      </Toolbar.Root>
      <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFileChange} hidden />
    </>
  );
};
