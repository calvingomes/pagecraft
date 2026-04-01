"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { LogOut } from "lucide-react";
import { useEditorStore } from "@/stores/editor-store";
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
import { OverlayPopup } from "@/components/layout/OverlayPopup/OverlayPopup";
import { ensureBlocksHaveValidLayoutsForAllViewports } from "@/lib/editor-engine/data/normalization";
import { useAuthGuard } from "@/hooks/useAuthGuard";
import { useEditorViewportPreview } from "@/hooks/useEditorViewportPreview";
import type { AddBlockOptions } from "@/components/builder/Toolbars/Toolbar.types";
import { saveEditorPage } from "@/lib/editor/saveEditorPage";
import { prepareImageBlockOptions } from "@/lib/editor/prepareImageBlockOptions";
import { PageLoader } from "@/components/ui/PageLoader/PageLoader";
import styles from "./editor.module.css";

type EditorSnapshotPayload = {
  background: PageBackgroundId;
  sidebarPosition: SidebarPosition;
  displayName: string;
  bioHtml: string;
  avatarUrl: string;
  persistedAvatarUrl: string;
  avatarShape: AvatarShape;
  blocks: Block[];
};

const serializeSnapshot = (payload: EditorSnapshotPayload) =>
  JSON.stringify(payload);

export default function EditorPage() {
  const router = useRouter();
  const { username, user, loading, setLoading } = useAuthStore();
  const logout = useAuthStore((s) => s.logout);
  const { authChecked } = useAuthGuard("editor");
  const blocks = useEditorStore((s) => s.blocks);
  const setAllBlocks = useEditorStore((s) => s.setAllBlocks);
  const setActiveViewportMode = useEditorStore((s) => s.setActiveViewportMode);
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
  const [isEditorDataReady, setIsEditorDataReady] = useState(false);
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
        blocks,
      }),
    [
      background,
      desktopSidebarPosition,
      displayName,
      bioHtml,
      avatarUrl,
      persistedAvatarUrl,
      avatarShape,
      blocks,
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

  const {
    screenView,
    canUseEditor,
    previewView,
    setPreviewView,
    viewportResolved,
  } = useEditorViewportPreview();

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

  useEffect(() => {
    setActiveViewportMode(activeBlockViewportMode);
  }, [activeBlockViewportMode, setActiveViewportMode]);

  useEffect(() => {
    if (!username || !user?.id) {
      setIsEditorDataReady(false);
      return;
    }

    setIsEditorDataReady(false);
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

        // Run full normalization for BOTH viewports during hydration
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
        if (!active) return;
        setIsEditorDataReady(true);
        setLoading(false);
      }
    };

    loadPageData();

    return () => {
      active = false;
    };
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

  const handleSave = useCallback(async () => {
    if (!username || !user?.id || isSaving) return;

    setIsSaving(true);
    const hasPageChanges =
      !lastSavedPayload ||
      background !== lastSavedPayload.background ||
      desktopSidebarPosition !== lastSavedPayload.sidebarPosition ||
      displayName !== lastSavedPayload.displayName ||
      bioHtml !== lastSavedPayload.bioHtml ||
      avatarUrl !== lastSavedPayload.avatarUrl ||
      avatarShape !== lastSavedPayload.avatarShape;

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
      });

      const resolvedAvatarUrl = result.avatarUrl;

      if (resolvedAvatarUrl !== avatarUrl) {
        setAvatarUrl(resolvedAvatarUrl);
      }
      setPersistedAvatarUrl(resolvedAvatarUrl);

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
      setAllBlocks(result.blocks);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Unknown save error.";
      console.error("Save failed:", message, error);
    } finally {
      setIsSaving(false);
    }
  }, [
    username,
    user?.id,
    isSaving,
    background,
    desktopSidebarPosition,
    displayName,
    bioHtml,
    avatarUrl,
    persistedAvatarUrl,
    avatarShape,
    blocks,
    setAllBlocks,
    lastSavedPayload,
  ]);

  useEffect(() => {
    if (!hasUnsavedChanges || isSaving || !isEditorDataReady) return;

    const timer = setTimeout(() => {
      handleSave();
    },1500);

    return () => clearTimeout(timer);
  }, [currentSnapshot, hasUnsavedChanges, isSaving, isEditorDataReady, handleSave]);

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

    const newBlock: Block = {
      id,
      type: blockType,
      content: defaultContent,
      order: blocks.length,
      styles: { widthPreset },
    } as Block;

    // Use the robust normalization engine to calculate safe layouts for both
    // viewports simultaneously and resolve any existing collisions instantly.
    const nextBlocks = [...blocks, newBlock];
    const normalized = ensureBlocksHaveValidLayoutsForAllViewports(nextBlocks);
    setAllBlocks(normalized);
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
    updateBlock(id, updates);
  };

  const handleRemoveBlock = async (id: string) => {
    const remaining = blocks.filter((b) => b.id !== id);
    const normalized = ensureBlocksHaveValidLayoutsForAllViewports(remaining);
    setAllBlocks(normalized);
  };


  if (loading || !authChecked || !viewportResolved || !isEditorDataReady) {
    return (
      <PageLoader label="Loading editor..." backgroundColor="var(--color-lighter-grey)" />
    );
  }

  if (!canUseEditor) {
    return (
      <OverlayPopup
        open={true}
        title="Editor is desktop-only!"
        message="Open this page on desktop to continue."
      />
    );
  }

  return (
    <EditorProvider
      username={username ?? null}
      onUpdateBlock={handleUpdateBlock}
      onRemoveBlock={handleRemoveBlock}
    >
      <div className={styles.editorRoot}>
        <div className={styles.logoutButtonContainer}>
          <ThemeButton
            label="Logout"
            cta={handleLogout}
            // bgColor="color-mix(in srgb, var(--color-danger) 12%, var(--color-white))"
            bgColor="color-mix(in srgb, var(--color-danger) 12%, var(--color-white))"
            textColor="var(--color-dark-grey)"
            borderColor="var(--color-light-grey)"
            icon={LogOut}
            size="small"
          />
        </div>
        <PageLayout
          background={background}
          sidebarPosition={effectiveSidebarPosition}
          previewViewport={previewView}
          framedMobilePreview
          isEditor
        >
          <ProfileSidebar
            variant="editor"
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
          previewViewport={previewView}
          onViewportChange={setPreviewView}
          username={username}
          isSaving={isSaving}
        />
      </div>
    </EditorProvider>
  );
}
