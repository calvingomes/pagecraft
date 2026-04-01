"use client";
/* eslint-disable css-modules/no-unused-class */

import * as Toolbar from "@radix-ui/react-toolbar";
import { Trash2, Upload } from "lucide-react";
import { useRef, type ChangeEvent } from "react";
import { fileToWebpDataUrl } from "@/lib/uploads/imageWebp";
import { LinkBlock as LinkBlockType } from "@/types/editor";
import styles from "./LinkBlock.module.css";

type LinkImageEditorProps = {
  block: LinkBlockType;
  onUpdate: (updates: Partial<LinkBlockType>) => void;
};

export const LinkImageEditor = ({ block, onUpdate }: LinkImageEditorProps) => {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const content = block.content;

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
      <div className={styles.previewOverlay} />
      <Toolbar.Root className={styles.previewActions}>
        <Toolbar.Button className={styles.previewIconButton} onClick={handlePickFile} title="Upload Custom Preview">
          <Upload size={18} />
        </Toolbar.Button>
        {content.imageUrl && (
          <Toolbar.Button className={styles.previewIconButton} onClick={handleRemoveMetaImage} title="Remove Preview Image">
            <Trash2 size={18} />
          </Toolbar.Button>
        )}
      </Toolbar.Root>
      <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFileChange} hidden />
    </>
  );
};
