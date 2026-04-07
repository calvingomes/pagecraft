"use client";

import React, { useState } from "react";
import Image from "next/image";
import { Copy, Check } from "lucide-react";
import styles from "./LinkShare.module.css";
import { LinkShareProps } from "./LinkShare.types";
import { Tooltip } from "@/components/ui/Tooltip/Tooltip";
import { useEditorContext } from "@/contexts/EditorContext";

export const LinkShare = ({ username, isSaving }: LinkShareProps) => {
  const [isCopied, setIsCopied] = useState(false);
  const [showDesktopReminder, setShowDesktopReminder] = useState(false);
  const editor = useEditorContext();
  const isActualMobile = editor?.isActualMobile ?? false;

  const handleCopy = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!username) return;

    const url = `${window.location.protocol}//${window.location.host}/${username}`;
    navigator.clipboard.writeText(url);

    setIsCopied(true);
    if (isActualMobile) {
      setShowDesktopReminder(true);
    }
    
    setTimeout(() => {
      setIsCopied(false);
      setShowDesktopReminder(false);
    }, 4000);
  };

  if (!username) return null;

  const displayUrl = `${window.location.host}/${username}`.replace(/^www\./, "");

  return (
    <div 
      className={`
        ${styles.container} 
        ${isSaving ? styles.saving : ""} 
        ${isActualMobile ? styles.isActualMobile : ""}
      `} 
      onClick={handleCopy}
    >
      <Image
        src="/logo/pagecraft-logo.svg"
        alt=""
        width={20}
        height={20}
        className={styles.logoImage}
      />
      <span className={styles.urlText}>{displayUrl}</span>

      <Tooltip content={isCopied ? "Copied!" : "Copy public link"} side="top">
        <div className={`${styles.copyButton} ${isCopied ? styles.copied : ""}`}>
          {isCopied ? <Check size={16} /> : <Copy size={16} />}
        </div>
      </Tooltip>

      {showDesktopReminder && (
        <div className={styles.mobileToast}>
          Open on desktop/laptop to edit desktop view
        </div>
      )}
    </div>
  );
};
