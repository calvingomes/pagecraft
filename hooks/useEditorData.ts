"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { usePostHog } from 'posthog-js/react';
import { useAuthStore } from "@/stores/auth-store";
import { useEditorStore } from "@/stores/editor-store";
import { PageService } from "@/lib/services/page.client";
import { BlockService } from "@/lib/services/block.client";
import { saveEditorPage } from "@/lib/editor/saveEditorPage";
import { prepareImageBlockOptions } from "@/lib/editor/prepareImageBlockOptions";
import { ensureBlocksHaveValidLayoutsForAllViewports } from "@/lib/editor-engine/data/normalization";
import { serializeSnapshot } from "@/lib/editor/snapshot";
import { getDefaultContent } from "@/lib/editor-engine/blocks/block-defaults";
import type { 
  Block, 
  BlockType, 
  EditorSnapshotPayload 
} from "@/types/editor";
import type { 
  PageBackgroundId, 
  SidebarPosition, 
  AvatarShape 
} from "@/types/page";
import type { AddBlockOptions } from "@/components/builder/Toolbars/Toolbar.types";

export function useEditorData() {
  const { username, user } = useAuthStore();
  const posthog = usePostHog();
  const blocks = useEditorStore((s) => s.blocks);
  const setAllBlocks = useEditorStore((s) => s.setAllBlocks);
  const updateBlockInStore = useEditorStore((s) => s.updateBlock);

  // --- Local Page State ---
  const [background, setBackground] = useState<PageBackgroundId>("page-bg-1");
  const [desktopSidebarPosition, setDesktopSidebarPosition] =
    useState<SidebarPosition>("left");
  const [displayName, setDisplayName] = useState<string>("");
  const [bioHtml, setBioHtml] = useState<string>("");
  const [avatarUrl, setAvatarUrl] = useState<string>("");
  const [avatarShape, setAvatarShape] = useState<AvatarShape>("circle");
  const [persistedAvatarUrl, setPersistedAvatarUrl] = useState<string>("");
  const [updatedAt, setUpdatedAt] = useState<string>("");
  
  const [isSaving, setIsSaving] = useState(false);
  const [isEditorDataReady, setIsEditorDataReady] = useState(false);
  const [lastSavedPayload, setLastSavedPayload] =
    useState<EditorSnapshotPayload | null>(null);

  // --- Load Initial Data ---
  useEffect(() => {
    if (!username || !user?.id) {
      setIsEditorDataReady(false);
      return;
    }

    let active = true;
    const loadPageData = async () => {
      try {
        const pageData = await PageService.getPageByUsername(username);
        let nextBackground: PageBackgroundId = "page-bg-1";
        let nextSidebarPosition: SidebarPosition = "left";
        let nextDisplayName = username;
        let nextBioHtml = "";
        let nextAvatarUrl = "";
        let nextAvatarShape: AvatarShape = "circle";

        if (pageData) {
          if (pageData.background) nextBackground = pageData.background;
          if (pageData.sidebar_position) nextSidebarPosition = pageData.sidebar_position;
          if (pageData.display_name) nextDisplayName = pageData.display_name;
          if (pageData.bio_html) nextBioHtml = pageData.bio_html;
          if (pageData.avatar_url) nextAvatarUrl = pageData.avatar_url;
          if (pageData.avatar_shape === "circle" || pageData.avatar_shape === "square") {
            nextAvatarShape = pageData.avatar_shape;
          }
          if (pageData.updated_at) setUpdatedAt(pageData.updated_at);
        }

        if (!active) return;
        setBackground(nextBackground);
        setDesktopSidebarPosition(nextSidebarPosition);
        setDisplayName(nextDisplayName);
        setBioHtml(nextBioHtml);
        setAvatarUrl(nextAvatarUrl);
        setPersistedAvatarUrl(nextAvatarUrl);
        setAvatarShape(nextAvatarShape);

        const blocks = await BlockService.getBlocksForPage(username);
        if (!active) return;

        const normalized = ensureBlocksHaveValidLayoutsForAllViewports(blocks);
        setAllBlocks(normalized);

        const initialPayload: EditorSnapshotPayload = {
          background: nextBackground,
          sidebarPosition: nextSidebarPosition,
          displayName: nextDisplayName,
          bioHtml: nextBioHtml,
          avatarUrl: nextAvatarUrl,
          persistedAvatarUrl: nextAvatarUrl,
          avatarShape: nextAvatarShape,
          blocks: normalized,
        };
        setLastSavedPayload(initialPayload);
      } finally {
        if (active) setIsEditorDataReady(true);
      }
    };

    loadPageData();
    return () => { active = false; };
  }, [username, user?.id, setAllBlocks, setLastSavedPayload]);

  // --- Snapshot Logic ---
  const currentSnapshot = useMemo(
    () => serializeSnapshot({
      background,
      sidebarPosition: desktopSidebarPosition,
      displayName,
      bioHtml,
      avatarUrl,
      persistedAvatarUrl,
      avatarShape,
      blocks,
    }),
    [background, desktopSidebarPosition, displayName, bioHtml, avatarUrl, persistedAvatarUrl, avatarShape, blocks]
  );

  const hasUnsavedChanges = useMemo(() => 
    lastSavedPayload !== null && currentSnapshot !== serializeSnapshot(lastSavedPayload),
    [currentSnapshot, lastSavedPayload]
  );

  // --- Save Logic ---
  const handleSave = useCallback(async () => {
    if (!username || !user?.id || isSaving) return;

    const isFirstSave = !updatedAt;
    setIsSaving(true);

    const hasPageChanges =
      !lastSavedPayload ||
      background !== lastSavedPayload.background ||
      desktopSidebarPosition !== lastSavedPayload.sidebarPosition ||
      displayName !== lastSavedPayload.displayName ||
      bioHtml !== lastSavedPayload.bioHtml ||
      avatarUrl !== lastSavedPayload.avatarUrl ||
      avatarShape !== lastSavedPayload.avatarShape;

    const hasBrandingChanges =
      !lastSavedPayload ||
      displayName !== (lastSavedPayload?.displayName ?? "") ||
      avatarUrl !== (lastSavedPayload?.avatarUrl ?? "");

    try {
      const result = await saveEditorPage({
        userId: user.id,
        username,
        background,
        sidebarPosition: desktopSidebarPosition,
        displayName,
        bioHtml,
        avatarUrl,
        persistedAvatarUrl,
        avatarShape,
        blocks,
        skipPageUpdate: !hasPageChanges,
        skipOgUpdate: !hasBrandingChanges,
      });

      if (isFirstSave) {
        posthog.capture('first_save_complete');
      }

      const resolvedAvatarUrl = result.avatarUrl;
      if (resolvedAvatarUrl !== avatarUrl) setAvatarUrl(resolvedAvatarUrl);
      setPersistedAvatarUrl(resolvedAvatarUrl);
      setUpdatedAt(result.updatedAt);

      const latestPayload: EditorSnapshotPayload = {
        background,
        sidebarPosition: desktopSidebarPosition,
        displayName,
        bioHtml,
        avatarUrl: resolvedAvatarUrl,
        persistedAvatarUrl: resolvedAvatarUrl,
        avatarShape,
        blocks: result.blocks,
      };
      setLastSavedPayload(latestPayload);

      // Store patching
      const sentById = new Map(blocks.map((b) => [b.id, b]));
      const resolvedById = new Map(result.blocks.map((b) => [b.id, b]));
      const liveBlocks = useEditorStore.getState().blocks;
      const patched = liveBlocks.map((block) => {
        const sent = sentById.get(block.id);
        const saved = resolvedById.get(block.id);
        if (!sent || !saved) return block;
        
        // Sync content and updated_at from DB
        return { 
          ...block, 
          content: saved.content,
          updated_at: saved.updated_at
        } as Block;
      });
      setAllBlocks(patched);
    } catch (error) {
      console.error("Save failed:", error);
    } finally {
      setIsSaving(false);
    }
  }, [username, user?.id, isSaving, background, desktopSidebarPosition, displayName, bioHtml, avatarUrl, persistedAvatarUrl, avatarShape, blocks, setAllBlocks, lastSavedPayload, posthog, updatedAt]);

  // --- Auto-save ---
  useEffect(() => {
    if (!hasUnsavedChanges || isSaving || !isEditorDataReady) return;
    const timer = setTimeout(() => { handleSave(); }, 2000);
    return () => clearTimeout(timer);
  }, [currentSnapshot, hasUnsavedChanges, isSaving, isEditorDataReady, handleSave]);

  // --- Unload Guard ---
  useEffect(() => {
    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      if (!hasUnsavedChanges) return;
      event.preventDefault();
      event.returnValue = "";
    };
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [hasUnsavedChanges]);

  // --- Block Handlers ---
  const onAddBlock = useCallback(async (blockType: BlockType, options?: AddBlockOptions) => {
    if (blockType === "image" && !options?.file) return;

    const id = crypto.randomUUID();
    let resolvedOptions = options;

    if (blockType === "image" && options?.file) {
      try {
        resolvedOptions = await prepareImageBlockOptions(id, options);
      } catch (error) {
        console.error("Image block prep failed:", error);
        return;
      }
    }

    const newBlock: Block = {
      id,
      type: blockType,
      content: getDefaultContent(blockType, resolvedOptions),
      order: blocks.length,
      styles: { widthPreset: blockType === "sectionTitle" ? "full" : "small" },
    } as Block;

    const nextBlocks = [...blocks, newBlock];
    setAllBlocks(ensureBlocksHaveValidLayoutsForAllViewports(nextBlocks));
  }, [blocks, setAllBlocks]);

  const onUpdateBlock = useCallback(async (id: string, updates: Partial<Block>) => {
    updateBlockInStore(id, updates);
  }, [updateBlockInStore]);

  const onRemoveBlock = useCallback(async (id: string) => {
    const remaining = blocks.filter((b) => b.id !== id);
    setAllBlocks(ensureBlocksHaveValidLayoutsForAllViewports(remaining));
  }, [blocks, setAllBlocks]);

  return {
    background, setBackground,
    desktopSidebarPosition, setDesktopSidebarPosition,
    displayName, setDisplayName,
    bioHtml, setBioHtml,
    avatarUrl, setAvatarUrl,
    avatarShape, setAvatarShape,
    updatedAt,
    isSaving, isEditorDataReady,
    onAddBlock, onUpdateBlock, onRemoveBlock,
    onSave: handleSave,
  };
}
