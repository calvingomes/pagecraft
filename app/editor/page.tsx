"use client";

import { useEffect, useState } from "react";
import { Laptop, Smartphone } from "lucide-react";
import { useEditorStore } from "@/stores/editor-store";
import { useAuthStore } from "@/stores/auth-store";
import { supabase } from "@/lib/supabase";
import type { Block, BlockType } from "@/types/editor";
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
import { compactEmptyRows } from "@/lib/compactEmptyRows";
import { findFirstFreeSpot } from "@/lib/blockGrid";
import {
  ensureBlocksHaveValidLayouts,
  normalizeStoredBlocks,
  type RawStoredBlock,
} from "@/lib/normalizeBlocks";
import { useAuthGuard } from "@/hooks/useAuthGuard";
import { useEditorViewportPreview } from "@/hooks/useEditorViewportPreview";
import type { AddBlockOptions } from "@/components/builder/Toolbars/Toolbar.types";
import { saveEditorPage } from "@/lib/editor/saveEditorPage";
import { prepareImageBlockOptions } from "@/lib/editor/prepareImageBlockOptions";
import styles from "./editor.module.css";

export default function EditorPage() {
  const { username, user, loading, setLoading } = useAuthStore();
  const { authChecked } = useAuthGuard("editor");
  const blocks = useEditorStore((s) => s.blocks);
  const setBlocks = useEditorStore((s) => s.setBlocks);
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

  const isDesktopEditing = activeEditorMode === "desktop";
  const effectiveSidebarPosition: SidebarPosition = isDesktopEditing
    ? desktopSidebarPosition
    : "center";

  useEffect(() => {
    if (!username || !user?.id) return;

    const loadPageData = async () => {
      setDisplayName(username);
      setBioHtml("");
      setAvatarUrl("");
      setPersistedAvatarUrl("");
      setAvatarShape("circle");

      const { data: pageData } = await supabase
        .from("pages")
        .select(
          "background, sidebar_position, display_name, bio_html, avatar_url, avatar_shape",
        )
        .eq("username", username)
        .maybeSingle();

      let incomingDisplayName: string | undefined;

      if (pageData) {
        if (pageData.background) {
          setBackground(pageData.background as PageBackgroundId);
        }
        if (pageData.sidebar_position) {
          setDesktopSidebarPosition(
            pageData.sidebar_position as SidebarPosition,
          );
        }
        if (typeof pageData.display_name === "string") {
          incomingDisplayName = pageData.display_name;
        }
        if (typeof pageData.bio_html === "string") {
          setBioHtml(pageData.bio_html);
        }
        if (typeof pageData.avatar_url === "string") {
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

      const { data: blockRows } = await supabase
        .from("blocks")
        .select("id, type, order, content, layout, styles")
        .eq("page_username", username)
        .order("order", { ascending: true });

      const safeBlockRows = blockRows ?? [];

      const rawBlocks: RawStoredBlock[] = safeBlockRows.map((row) => ({
        id: String(row.id),
        type: row.type,
        order: row.order,
        content: row.content,
        layout: row.layout,
        styles: row.styles,
      }));

      const normalizedBlocks = normalizeStoredBlocks(rawBlocks);
      const withLayouts = ensureBlocksHaveValidLayouts(normalizedBlocks);
      const compactedAfterLoad = compactEmptyRows(withLayouts).blocks;
      setBlocks(compactedAfterLoad);

      setLoading(false);
    };

    loadPageData();
  }, [username, user?.id, setBlocks, setLoading]);

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
      order: blocks.length,
      styles: { widthPreset },
    } as Block;
    const pos = findFirstFreeSpot(tempBlockForPlacement, blocks);

    const newBlock: Block = {
      id,
      type: blockType,
      content: defaultContent,
      order: blocks.length,
      styles: { widthPreset },
      layout: pos,
    } as Block;

    addBlock(newBlock);
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
    const remaining = blocks.filter((block) => block.id !== id);
    const compacted = compactEmptyRows(remaining);
    setBlocks(compacted.blocks);
  };

  const handleSave = async () => {
    if (!username || !user?.id || isSaving) return;

    setIsSaving(true);

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
      });

      if (result.avatarUrl !== avatarUrl) {
        setAvatarUrl(result.avatarUrl);
      }
      setPersistedAvatarUrl(result.avatarUrl);
      setBlocks(result.blocks);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Unknown save error.";
      console.error("Save failed:", message, error);
    } finally {
      setIsSaving(false);
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
    </EditorProvider>
  );
}
