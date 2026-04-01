"use client";
/* eslint-disable css-modules/no-unused-class */

import { EditorContent } from "@tiptap/react";
import { useCallback } from "react";
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

type LinkTitleEditorProps = {
  block: LinkBlockType;
  onUpdate: (updates: Partial<LinkBlockType>) => void;
  titleHtml: string;
  isTitleEmpty: boolean;
};

export const LinkTitleEditor = ({ block, onUpdate, titleHtml }: LinkTitleEditorProps) => {
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

  return (
    <div className={styles.titleEditorContainer}>
      {titleEditor && <EditorContent editor={titleEditor} className={styles.titleEditor} />}
      {isTitleEmpty && <span className={styles.titlePlaceholder}>Write Title...</span>}
    </div>
  );
};
