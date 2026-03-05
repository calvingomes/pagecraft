"use client";

import { useEffect, useState } from "react";
import { Laptop, Smartphone } from "lucide-react";
import {
  selectActiveViewportBlocks,
  useEditorStore,
} from "@/stores/editor-store";
import { useAuthStore } from "@/stores/auth-store";
import { PageService } from "@/lib/services/page-service";
import { BlockService } from "@/lib/services/block-service";
import type { Block, BlockType, BlockViewportMode } from "@/types/editor";
import { EditorProvider } from "@/contexts/EditorContext";
import type {
  AvatarShape,
  PageBackgroundId,
  SidebarPosition,
} from "@/types/page";
import { ProfileSidebar } from "@/components/layout/ProfileSidebar/ProfileSidebar";
import { LogoutButton } from "@/components/layout/LogoutButton/LogoutButton";
import { SaveButton } from "@/components/layout/SaveButton/SaveButton";
import { BlockCanvas } from "@/components/builder/BlockCanvas/BlockCanvas";
import { Toolbar } from "@/components/builder/Toolbars/Toolbar";
import { PageLayout } from "@/components/layout/PageLayout/PageLayout";
import { MobileEditorGuard } from "@/components/layout/MobileEditorGuard/MobileEditorGuard";
import { OverlayPopup } from "@/components/layout/OverlayPopup/OverlayPopup";
import { compactEmptyRows } from "@/lib/editor-engine/grid/compact";
import { findFirstFreeSpot } from "@/lib/editor-engine/layout/collision";
import { useAuthGuard } from "@/hooks/useAuthGuard";
import { useEditorViewportPreview } from "@/hooks/useEditorViewportPreview";
import type { AddBlockOptions } from "@/components/builder/Toolbars/Toolbar.types";
import { saveEditorPage } from "@/lib/editor/saveEditorPage";
import { prepareImageBlockOptions } from "@/lib/editor/prepareImageBlockOptions";
import styles from "./editor.module.css";

export default function EditorPage() {
  const { username, user, loading, setLoading } = useAuthStore();
  const { authChecked } = useAuthGuard("editor");
  const desktopBlocks = useEditorStore((s) => s.desktopBlocks);
  const mobileBlocks = useEditorStore((s) => s.mobileBlocks);
  const activeBlocks = useEditorStore(selectActiveViewportBlocks);
  const setAllBlocks = useEditorStore((s) => s.setAllBlocks);
  const setBlocksForViewport = useEditorStore((s) => s.setBlocksForViewport);
  const setActiveViewportMode = useEditorStore((s) => s.setActiveViewportMode);
  const addBlock = useEditorStore((s) => s.addBlock);
  const updateBlock = useEditorStore((s) => s.updateBlock);

  const [background, setBackground] = useState<PageBackgroundId>("page-bg-1");
  const [desktopSidebarPosition, setDesktopSidebarPosition] =
    useState<SidebarPosition>("left");
  const [displayName, setDisplayName] = useState<string>("");
  const [bioHtml, setBioHtml] = useState<string>("");
  const [avatarUrl, setAvatarUrl] = useState<string>("");
  const [avatarShape, setAvatarShape] = useState<AvatarShape>("circle");
  const [persistedAvatarUrl, setPersistedAvatarUrl] = useState<string>("");
  const [isSaving, setIsSaving] = useState(false);
  const [showSaveOverlay, setShowSaveOverlay] = useState(false);
  const { screenView, previewView, setPreviewView, canTogglePreview } =
    useEditorViewportPreview();

  const activeEditorMode =
    screenView === "mobile"
      ? "mobile"
      : previewView === "mobile"
        ? "mobile"
        : screenView === "tablet"
          ? "tablet"
          : "desktop";

  const activeBlockViewportMode: BlockViewportMode =
    previewView === "mobile" ? "mobile" : "desktop";

  const isDesktopEditing = activeEditorMode === "desktop";
  const effectiveSidebarPosition: SidebarPosition = isDesktopEditing
    ? desktopSidebarPosition
    : "center";
  const isMobileScreen = screenView === "mobile";

  useEffect(() => {
    setActiveViewportMode(activeBlockViewportMode);
  }, [activeBlockViewportMode, setActiveViewportMode]);

  useEffect(() => {
    if (!username || !user?.id) return;

    const loadPageData = async () => {
      setDisplayName(username);
      setBioHtml("");
      setAvatarUrl("");
      setPersistedAvatarUrl("");
      setAvatarShape("circle");

      const pageData = await PageService.getPageByUsername(username);

      let incomingDisplayName: string | undefined;

      if (pageData) {
        if (pageData.background) {
          setBackground(pageData.background);
        }
        if (pageData.sidebar_position) {
          setDesktopSidebarPosition(pageData.sidebar_position);
        }
        if (pageData.display_name) {
          incomingDisplayName = pageData.display_name;
        }
        if (pageData.bio_html) {
          setBioHtml(pageData.bio_html);
        }
        if (pageData.avatar_url) {
          setAvatarUrl(pageData.avatar_url);
          setPersistedAvatarUrl(pageData.avatar_url);
        }
        if (
          pageData.avatar_shape === "circle" ||
          pageData.avatar_shape === "square"
        ) {
          setAvatarShape(pageData.avatar_shape);
        }
      }

      setDisplayName(incomingDisplayName ?? username);

      const blocks = await BlockService.getBlocksForPage(username);

      setAllBlocks(blocks);

      setLoading(false);
    };

    loadPageData();
  }, [username, user?.id, setAllBlocks, setLoading]);

  const handleAddBlock = async (
    blockType: BlockType,
    options?: AddBlockOptions,
  ) => {
    if (blockType === "image" && !options?.file) {
      return;
    }

    const id = crypto.randomUUID();
    let resolvedOptions = options;

    if (blockType === "image" && options?.file) {
      try {
        resolvedOptions = await prepareImageBlockOptions(id, options);
      } catch (error) {
        const message =
          error instanceof Error ? error.message : "Image block prep failed.";
        console.error("Image block prep failed:", message, error);
        return;
      }
    }

    const defaultContent = getDefaultContent(blockType, resolvedOptions);
    const widthPreset = blockType === "sectionTitle" ? "full" : "small";

    const tempBlockForPlacement = {
      id,
      type: blockType,
      content: defaultContent,
      order: activeBlocks.length,
      styles: { widthPreset },
    } as Block;
    const pos = findFirstFreeSpot(tempBlockForPlacement, activeBlocks);

    const newBlock: Block = {
      id,
      type: blockType,
      content: defaultContent,
      order: activeBlocks.length,
      styles: { widthPreset },
      layout: pos,
    } as Block;

    addBlock(newBlock, activeBlockViewportMode);
  };

  const getDefaultContent = (
    type: BlockType,
    options?: AddBlockOptions,
  ): Block["content"] => {
    switch (type) {
      case "text":
        return { text: "" };
      case "link":
        return {
          url: options?.url ?? "",
          title: options?.title ?? "",
        };
      case "image":
        return { url: options?.url ?? "", alt: options?.alt ?? "" };
      case "sectionTitle":
        return { title: "" };
    }
  };

  const handleUpdateBlock = async (id: string, updates: Partial<Block>) => {
    updateBlock(id, updates, activeBlockViewportMode);
  };

  const handleRemoveBlock = async (id: string) => {
    const remaining = activeBlocks.filter((block) => block.id !== id);
    const compacted = compactEmptyRows(remaining);
    setBlocksForViewport(activeBlockViewportMode, compacted.blocks);
  };

  const handleSave = async () => {
    if (!username || !user?.id || isSaving) return;

    setIsSaving(true);
    setShowSaveOverlay(true);

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
        blocksByViewport: {
          desktop: desktopBlocks,
          mobile: mobileBlocks,
        },
      });

      if (result.avatarUrl !== avatarUrl) {
        setAvatarUrl(result.avatarUrl);
      }
      setPersistedAvatarUrl(result.avatarUrl);
      setAllBlocks(result.blocksByViewport);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Unknown save error.";
      console.error("Save failed:", message, error);
    } finally {
      setIsSaving(false);
      setShowSaveOverlay(false);
    }
  };

  if (loading || !authChecked) {
    return <div>Loading editor…</div>;
  }

  return (
    <EditorProvider
      username={username ?? null}
      onUpdateBlock={handleUpdateBlock}
      onRemoveBlock={handleRemoveBlock}
    >
      <div className={styles.actions}>
        <SaveButton onSave={handleSave} saving={isSaving} />
        <LogoutButton />
      </div>
      {canTogglePreview && (
        <div className={styles.previewToggle}>
          <button
            type="button"
            className={`${styles.previewToggleBtn} ${
              previewView === "desktop" ? styles.previewToggleBtnActive : ""
            }`}
            onClick={() => setPreviewView("desktop")}
            aria-label="Preview desktop view"
            title="Preview desktop view"
          >
            <Laptop size={20} />
          </button>
          <button
            type="button"
            className={`${styles.previewToggleBtn} ${
              previewView === "mobile" ? styles.previewToggleBtnActive : ""
            }`}
            onClick={() => setPreviewView("mobile")}
            aria-label="Preview mobile view"
            title="Preview mobile view"
          >
            <Smartphone size={20} />
          </button>
        </div>
      )}
      <PageLayout
        background={background}
        sidebarPosition={effectiveSidebarPosition}
        previewViewport={previewView}
        framedMobilePreview
      >
        <ProfileSidebar
          variant="editor"
          position={effectiveSidebarPosition}
          displayName={displayName}
          bioHtml={bioHtml}
          onChangeDisplayName={setDisplayName}
          onChangeBioHtml={setBioHtml}
          avatarUrl={avatarUrl}
          avatarShape={avatarShape}
          onChangeAvatarUrl={setAvatarUrl}
          onChangeAvatarShape={setAvatarShape}
        />
        <BlockCanvas editable />
      </PageLayout>
      <Toolbar
        onAddBlock={handleAddBlock}
        onChangeBackground={setBackground}
        onChangeSidebarPosition={setDesktopSidebarPosition}
        background={background}
        sidebarPosition={desktopSidebarPosition}
        showSidebarPositionControls={isDesktopEditing}
      />
      <OverlayPopup
        open={showSaveOverlay}
        title="Saving changes"
        message="Your page is being saved."
      />
      <MobileEditorGuard open={isMobileScreen} />
    </EditorProvider>
  );
}
