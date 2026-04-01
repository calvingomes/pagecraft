"use client";
/* eslint-disable css-modules/no-unused-class */

import Image from "next/image";
import React, { useState, useRef, useEffect } from "react";
import { MOBILE_GRID } from "@/lib/editor-engine/grid/grid-config";
import { htmlToText } from "@/lib/utils/htmlToText";
import { sanitizeMinimalRTH } from "@/lib/utils/sanitizeRichText";
import styles from "./ProfileSidebar.module.css";

type ProfileSidebarViewProps = {
  username: string;
  displayName?: string;
  bioHtml?: string;
  avatarUrl?: string;
  avatarShape?: "circle" | "square";
};

export const ProfileSidebarView = (props: ProfileSidebarViewProps) => {
  const username = props.username;
  const displayNameRaw = typeof props.displayName === "string" ? props.displayName : username;
  const safeDisplayNameHtml = sanitizeMinimalRTH(displayNameRaw);
  const displayNameText = displayNameRaw.includes("<") ? htmlToText(displayNameRaw) : displayNameRaw;
  const safeBioHtml = sanitizeMinimalRTH(props.bioHtml ?? "");
  const avatarShape = props.avatarShape ?? "circle";
  const avatarUrl = props.avatarUrl ?? "";

  const wrapperRef = useRef<HTMLDivElement>(null);
  const [zoom, setZoom] = useState(1);

  useEffect(() => {
    const el = wrapperRef.current;
    if (!el) return;
    const observer = new ResizeObserver((entries) => {
      const width = entries[0].contentRect.width;
      if (!width) return;
      setZoom(width < MOBILE_GRID.canvasPx ? width / MOBILE_GRID.canvasPx : 1);
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const avatarLetter = (() => {
    const source = (displayNameText || username || "?").trim();
    return (source[0] ?? "?").toUpperCase();
  })();

  const avatarClassName = `${styles.avatar} ${avatarShape === "square" ? styles.avatarSquare : ""}`;
  const asideStyle = zoom < 1 ? ({ width: `${MOBILE_GRID.canvasPx}px`, zoom } as React.CSSProperties) : undefined;

  return (
    <div ref={wrapperRef}>
      <aside className={`${styles.sidebar} ${styles.sidebarCenter}`} style={asideStyle}>
        <div className={styles.profileCard}>
          <div className={styles.avatarWrap}>
            <div className={avatarClassName}>
              {avatarUrl ? (
                <Image
                  src={avatarUrl}
                  alt="Profile image"
                  width={200}
                  height={200}
                  className={styles.avatarImage}
                  priority
                />
              ) : (
                avatarLetter
              )}
            </div>
          </div>
          <div>
            <div
              className={styles.name}
              role="heading"
              aria-level={2}
              {...(safeDisplayNameHtml.includes("<")
                ? { dangerouslySetInnerHTML: { __html: safeDisplayNameHtml } }
                : {})}
            >
              {!safeDisplayNameHtml.includes("<") ? safeDisplayNameHtml : null}
            </div>
            {props.bioHtml ? (
              <div
                className={styles.bio}
                dangerouslySetInnerHTML={{ __html: safeBioHtml }}
              />
            ) : null}
          </div>
        </div>
      </aside>
    </div>
  );
};
