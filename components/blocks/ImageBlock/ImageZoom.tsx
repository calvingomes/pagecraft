"use client";
/* eslint-disable css-modules/no-unused-class */

import * as Dialog from "@radix-ui/react-dialog";
import { Maximize2 } from "lucide-react";
import Image from "next/image";
import styles from "./ImageBlock.module.css";

interface ImageZoomProps {
  url: string;
  alt?: string;
  showTrigger?: boolean;
  isEditable?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export function ImageZoom({ url, alt, showTrigger, isEditable, onOpenChange }: ImageZoomProps) {
  if (isEditable) return null;
  return (
    <Dialog.Root onOpenChange={onOpenChange}>
      <Dialog.Trigger asChild>
        <button 
          className={`${styles.zoomTrigger} ${showTrigger ? styles.zoomTriggerVisible : ""}`}
          aria-label="Expand image"
        >
          <Maximize2 size={15} />
        </button>
      </Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Overlay className={styles.zoomOverlay} />
        <Dialog.Content className={styles.zoomContent} asChild>
          <Dialog.Close>
            <div className={styles.zoomImageContainer}>
              <Image
                src={url}
                alt={alt ?? "Expanded image"}
                fill
                className={styles.expandedImage}
                sizes="90vw"
                priority
              />
            </div>
          </Dialog.Close>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
