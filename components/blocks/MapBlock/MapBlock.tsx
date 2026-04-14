"use client";

import { useRef, useEffect } from "react";
import dynamic from "next/dynamic";
import { useEditorContext } from "@/contexts/EditorContext";
import type { MapBlock as MapBlockType } from "@/types/editor";
import type { GridConfig } from "@/types/grid";
import { DESKTOP_GRID } from "@/lib/editor-engine/grid/grid-config";
import { sizePxForBlock } from "@/lib/editor-engine/grid/grid-math";
import styles from "./MapBlock.module.css";

const MapInterface = dynamic(() => import("./MapInterface"), {
  ssr: false,
});

type MapBlockProps = {
  block: MapBlockType;
  isMapUnlocked?: boolean;
  gridConfig?: GridConfig;
};

export function MapBlock({ block, isMapUnlocked = false, gridConfig = DESKTOP_GRID }: MapBlockProps) {
  const { address, lat = 0, lng = 0, zoom = 12 } = block.content || {};
  const editor = useEditorContext();
  const { widthPx, heightPx } = sizePxForBlock(block as any, gridConfig);


  const pendingCoordsRef = useRef({ lat, lng, zoom });
  const wasUnlockedRef = useRef(isMapUnlocked);

  useEffect(() => {
    if (wasUnlockedRef.current && !isMapUnlocked) {
      if (editor?.onUpdateBlock) {
        editor.onUpdateBlock(block.id, {
          content: {
            ...block.content,
            ...pendingCoordsRef.current
          },
        });
      }
    }
    wasUnlockedRef.current = isMapUnlocked;
  }, [isMapUnlocked, block.id, block.content, editor]);

  // Sync pending ref with database/props (e.g. after a search result selection)
  useEffect(() => {
    pendingCoordsRef.current = { lat, lng, zoom };
  }, [lat, lng, zoom]);

  const handleMoveEnd = (newLat: number, newLng: number, newZoom: number) => {
    pendingCoordsRef.current = { lat: newLat, lng: newLng, zoom: newZoom };
  };

  const CenterIndicator = (
    <div className={styles.centerIndicator}>
      <div className={styles.pulse} />
      <div className={styles.dot} />
    </div>
  );

  if (!editor) {

    const reqW = (Math.max(widthPx, 400) + 120);
    const reqH = (Math.max(heightPx, 400) + 120);

    const staticUrl = `/api/map/static?lat=${lat}&lng=${lng}&zoom=${zoom + 0.1}&w=${reqW}&h=${reqH}`;

    return (
      <div 
        data-testid="map-block-container"
        className={styles.container}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          key={`${staticUrl}-${reqW}x${reqH}`}
          src={staticUrl}
          alt={address || "Map view"}
          className={styles.staticImage}
          style={{ width: `${reqW}px`, height: `${reqH}px` }}
          loading="lazy"
        />
        {CenterIndicator}
        {address && <div className={styles.addressLabel}>{address}</div>}
      </div>
    );
  }

  return (
    <div
      data-testid="map-block-container"
      className={`${styles.container} ${isMapUnlocked ? styles.unlocked : ""}`}
    >
      <MapInterface
        lat={lat}
        lng={lng}
        zoom={zoom}
        isUnlocked={isMapUnlocked}
        onMoveEnd={handleMoveEnd}
        width={widthPx}
        height={heightPx}
      />
      {CenterIndicator}
      {(address || editor) && (
        <input
          className={styles.addressLabel}
          value={address || ""}
          onChange={(e) => {
            if (editor?.onUpdateBlock) {
              editor.onUpdateBlock(block.id, {
                content: { ...block.content, address: e.target.value }
              });
            }
          }}
          placeholder="Label this location..."
          onPointerDown={(e) => e.stopPropagation()}
          spellCheck={false}
        />
      )}
      {!isMapUnlocked && <div className={styles.clickShield} />}
    </div>
  );
}
