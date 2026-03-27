"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Laptop, Smartphone } from "lucide-react";
import {
  selectActiveViewportBlocks,
  useEditorStore,
} from "@/stores/editor-store";
import { useAuthStore } from "@/stores/auth-store";
import { PageService } from "@/lib/services/page.client";
import { BlockService } from "@/lib/services/block.client";
import type { Block, BlockType, BlockViewportMode } from "@/types/editor";
import { EditorProvider } from "@/contexts/EditorContext";
import type {
  AvatarShape,
  PageBackgroundId,
  SidebarPosition,
} from "@/types/page";
import { AuthService } from "@/lib/services/auth.client";
import { ProfileSidebar } from "@/components/layout/ProfileSidebar/ProfileSidebar";
import { ThemeButton } from "@/components/ui/ThemeButton/ThemeButton";
import { BlockCanvas } from "@/components/builder/BlockCanvas/BlockCanvas";
import { Toolbar } from "@/components/builder/Toolbars/Toolbar";
import { PageLayout } from "@/components/layout/PageLayout/PageLayout";
import { MobileEditorGuard } from "@/components/layout/MobileEditorGuard/MobileEditorGuard";
import { OverlayPopup } from "@/components/layout/OverlayPopup/OverlayPopup";
import { compactEmptyRows } from "@/lib/editor-engine/grid/compact";
import { findFirstFreeSpot } from "@/lib/editor-engine/layout/collision";
import {
  DESKTOP_GRID,
  MOBILE_GRID,
} from "@/lib/editor-engine/grid/grid-config";
import { useAuthGuard } from "@/hooks/useAuthGuard";
import { useEditorViewportPreview } from "@/hooks/useEditorViewportPreview";
import type { AddBlockOptions } from "@/components/builder/Toolbars/Toolbar.types";
import { saveEditorPage } from "@/lib/editor/saveEditorPage";
import { prepareImageBlockOptions } from "@/lib/editor/prepareImageBlockOptions";
import { TogglePill } from "@/components/ui/TogglePill/TogglePill";
import styles from "./editor.module.css";

type EditorSnapshotPayload = {
  background: PageBackgroundId;
  sidebarPosition: SidebarPosition;
  displayName: string;
  bioHtml: string;
  avatarUrl: string;
  persistedAvatarUrl: string;
  avatarShape: AvatarShape;
  desktopBlocks: Block[];
  mobileBlocks: Block[];
};

const serializeSnapshot = (payload: EditorSnapshotPayload) =>
  JSON.stringify(payload);

export default function EditorPage() {
  const router = useRouter();
  const { username, user, loading, setLoading } = useAuthStore();
  const logout = useAuthStore((s) => s.logout);
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
  const [lastSavedPayload, setLastSavedPayload] =
    useState<EditorSnapshotPayload | null>(null);

  const currentSnapshot = useMemo(
    () =>
      serializeSnapshot({
        background,
        sidebarPosition: desktopSidebarPosition,
        displayName,
        bioHtml,
        avatarUrl,
        persistedAvatarUrl,
        avatarShape,
        desktopBlocks,
        mobileBlocks,
      }),
    [
      background,
      desktopSidebarPosition,
      displayName,
      bioHtml,
      avatarUrl,
      persistedAvatarUrl,
      avatarShape,
      desktopBlocks,
      mobileBlocks,
    ],
  );

  const hasUnsavedChanges =
    lastSavedPayload !== null &&
    currentSnapshot !== serializeSnapshot(lastSavedPayload);

  const handleLogout = async () => {
    await AuthService.signOut();
    logout();
    router.replace("/auth");
  };

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
      const pageData = await PageService.getPageByUsername(username);
      let nextBackground: PageBackgroundId = "page-bg-1";
      let nextSidebarPosition: SidebarPosition = "left";
      let nextDisplayName = username;
      let nextBioHtml = "";
      let nextAvatarUrl = "";
      let nextAvatarShape: AvatarShape = "circle";

      if (pageData) {
        if (pageData.background) {
          nextBackground = pageData.background;
        }
        if (pageData.sidebar_position) {
          nextSidebarPosition = pageData.sidebar_position;
        }
        if (pageData.display_name) {
          nextDisplayName = pageData.display_name;
        }
        if (pageData.bio_html) {
          nextBioHtml = pageData.bio_html;
        }
        if (pageData.avatar_url) {
          nextAvatarUrl = pageData.avatar_url;
        }
        if (
          pageData.avatar_shape === "circle" ||
          pageData.avatar_shape === "square"
        ) {
          nextAvatarShape = pageData.avatar_shape;
        }
      }

      setBackground(nextBackground);
      setDesktopSidebarPosition(nextSidebarPosition);
      setDisplayName(nextDisplayName);
      setBioHtml(nextBioHtml);
      setAvatarUrl(nextAvatarUrl);
      setPersistedAvatarUrl(nextAvatarUrl);
      setAvatarShape(nextAvatarShape);

      const blocks = await BlockService.getBlocksForPage(username);

      setAllBlocks(blocks);

      const initialPayload: EditorSnapshotPayload = {
        background: nextBackground,
        sidebarPosition: nextSidebarPosition,
        displayName: nextDisplayName,
        bioHtml: nextBioHtml,
        avatarUrl: nextAvatarUrl,
        persistedAvatarUrl: nextAvatarUrl,
        avatarShape: nextAvatarShape,
        desktopBlocks: blocks.desktop,
        mobileBlocks: blocks.mobile,
      };

      setLastSavedPayload(initialPayload);

      setLoading(false);
    };

    loadPageData();
  }, [username, user?.id, setAllBlocks, setLoading, setLastSavedPayload]);

  useEffect(() => {
    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      if (!hasUnsavedChanges) return;
      event.preventDefault();
      event.returnValue = "";
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [hasUnsavedChanges]);

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

    const gridConfig =
      activeBlockViewportMode === "mobile" ? MOBILE_GRID : DESKTOP_GRID;
    const pos = findFirstFreeSpot(
      tempBlockForPlacement,
      activeBlocks,
      gridConfig,
    );

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

      const resolvedAvatarUrl = result.avatarUrl;

      if (resolvedAvatarUrl !== avatarUrl) {
        setAvatarUrl(resolvedAvatarUrl);
      }
      setPersistedAvatarUrl(resolvedAvatarUrl);
      setAllBlocks(result.blocksByViewport);

      const latestPayload: EditorSnapshotPayload = {
        background,
        sidebarPosition: desktopSidebarPosition,
        displayName,
        bioHtml,
        avatarUrl: resolvedAvatarUrl,
        persistedAvatarUrl: resolvedAvatarUrl,
        avatarShape,
        desktopBlocks: result.blocksByViewport.desktop,
        mobileBlocks: result.blocksByViewport.mobile,
      };

      setLastSavedPayload(latestPayload);
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
      <div className={styles.saveButtonContainer}>
        <ThemeButton
          label={isSaving ? "Saving..." : "Save"}
          cta={handleSave}
          bgColor="#f6d045"
          disabled={isSaving}
        />
      </div>
      <div className={styles.logoutButtonContainer}>
        <ThemeButton
          label="Sign out"
          cta={handleLogout}
          bgColor="transparent"
          textColor="#0e220e"
        />
      </div>
      {canTogglePreview && (
        <div className={styles.previewToggle}>
          <TogglePill
            value={previewView}
            onChange={setPreviewView}
            options={[
              {
                value: "desktop",
                label: <Laptop size={20} />,
                ariaLabel: "Preview desktop view",
              },
              {
                value: "mobile",
                label: <Smartphone size={20} />,
                ariaLabel: "Preview mobile view",
              },
            ]}
          />
        </div>
      )}
      <PageLayout
        background={background}
        sidebarPosition={effectiveSidebarPosition}
        previewViewport={previewView}
        framedMobilePreview
        isEditor
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
