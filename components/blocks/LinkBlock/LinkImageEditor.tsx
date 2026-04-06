"use client";
/* eslint-disable css-modules/no-unused-class */

import * as Toolbar from "@radix-ui/react-toolbar";
import { Loader2, Trash2, Upload } from "lucide-react";
import { useRef, useState, type ChangeEvent } from "react";
import { fileToWebpDataUrl } from "@/lib/uploads/imageWebp";
import { LinkBlock as LinkBlockType } from "@/types/editor";
import styles from "./LinkBlock.module.css";

type LinkImageEditorProps = {
  block: LinkBlockType;
  onUpdate: (updates: Partial<LinkBlockType>) => void;
};

export const LinkImageEditor = ({ block, onUpdate }: LinkImageEditorProps) => {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const content = block.content;

  const handlePickFile = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    fileInputRef.current?.click();
  };

  const handleFileChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setIsUploading(true);
    try {
      const dataUrl = await fileToWebpDataUrl(file, "link-preview.webp");
      onUpdate({
        content: { ...content, imageUrl: dataUrl, metaImageRemoved: false },
      });
    } catch (e) {
      console.error(e);
    } finally {
      setIsUploading(false);
      event.target.value = "";
    }
  };

  const handleRemoveMetaImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    onUpdate({ content: { ...content, imageUrl: "", metaImageRemoved: true } });
  };

  return (
    <>
      <div className={styles.previewOverlay} />
      <Toolbar.Root className={styles.previewActions}>
        <Toolbar.Button
          className={styles.previewIconButton}
          onClick={handlePickFile}
          disabled={isUploading}
          title="Upload Custom Preview"
        >
          {isUploading ? (
            <Loader2 size={18} className={styles.spin} />
          ) : (
            <Upload size={18} />
          )}
        </Toolbar.Button>
        {content.imageUrl && (
          <Toolbar.Button
            className={styles.previewIconButton}
            onClick={handleRemoveMetaImage}
            disabled={isUploading}
            title="Remove Preview Image"
          >
            <Trash2 size={18} />
          </Toolbar.Button>
        )}
      </Toolbar.Root>
      <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFileChange} hidden />
    </>
  );
};
