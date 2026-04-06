"use client";

import React, { useState } from "react";
import { Copy, Check } from "lucide-react";
import styles from "./LinkShare.module.css";
import { LinkShareProps } from "./LinkShare.types";
import { Tooltip } from "@/components/ui/Tooltip/Tooltip";

export const LinkShare = ({ username, isSaving }: LinkShareProps) => {
  const [isCopied, setIsCopied] = useState(false);

  const handleCopy = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!username) return;

    const url = `${window.location.protocol}//${window.location.host}/${username}`;
    navigator.clipboard.writeText(url);

    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  if (!username) return null;

  const displayUrl = `${window.location.host}/${username}`.replace(/^www\./, "");

  return (
    <div 
      className={`${styles.container} ${isSaving ? styles.saving : ""}`} 
      onClick={handleCopy}
    >
      <span className={styles.urlText}>{displayUrl}</span>

      <Tooltip content={isCopied ? "Copied!" : "Copy public link"} side="top">
        <div className={`${styles.copyButton} ${isCopied ? styles.copied : ""}`}>
          {isCopied ? <Check size={16} /> : <Copy size={16} />}
        </div>
      </Tooltip>
    </div>
  );
};
