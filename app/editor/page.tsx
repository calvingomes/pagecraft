"use client";

import { useEffect, useState } from "react";
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
import { findFirstFreeSpot } from "@/lib/blockPlacement";
import {
  ensureBlocksHaveValidLayouts,
  normalizeStoredBlocks,
  type RawStoredBlock,
} from "@/lib/normalizeBlocks";
import { useAuthGuard } from "@/hooks/useAuthGuard";
import {
  deletePageImage,
  uploadPageImage,
} from "@/lib/uploads/pageImageStorage";
import styles from "./editor.module.css";

type DbLikeError = {
  message?: string;
  details?: string;
  hint?: string;
  code?: string;
};

type UnknownRecord = Record<string, unknown>;

function isPlainObject(value: unknown): value is UnknownRecord {
  return (
    typeof value === "object" &&
    value !== null &&
    Object.getPrototypeOf(value) === Object.prototype
  );
}

function stripUndefinedDeep<T>(value: T): T {
  if (Array.isArray(value)) {
    return value
      .map((item) => stripUndefinedDeep(item))
      .filter((item) => item !== undefined) as T;
  }

  if (isPlainObject(value)) {
    const out: UnknownRecord = {};
    for (const [key, nested] of Object.entries(value)) {
      if (nested === undefined) continue;
      out[key] = stripUndefinedDeep(nested);
    }
    return out as T;
  }

  return value;
}

function toBlockRow(block: Block, username: string, uid?: string) {
  return {
    id: block.id,
    page_username: username,
    uid: uid ?? null,
    type: block.type,
    order: block.order,
    content: block.content,
    layout: block.layout ?? null,
    styles: block.styles ?? null,
  };
}

export default function EditorPage() {
  const { username, user, loading, setLoading } = useAuthStore();
  const { authChecked } = useAuthGuard("editor");
  const blocks = useEditorStore((s) => s.blocks);
  const setBlocks = useEditorStore((s) => s.setBlocks);
  const addBlock = useEditorStore((s) => s.addBlock);
  const updateBlock = useEditorStore((s) => s.updateBlock);

  const [background, setBackground] = useState<PageBackgroundId>("page-bg-1");
  const [sidebarPosition, setSidebarPosition] =
    useState<SidebarPosition>("left");
  const [displayName, setDisplayName] = useState<string>("");
  const [bioHtml, setBioHtml] = useState<string>("");
  const [avatarUrl, setAvatarUrl] = useState<string>("");
  const [avatarShape, setAvatarShape] = useState<AvatarShape>("circle");
  const [persistedAvatarUrl, setPersistedAvatarUrl] = useState<string>("");
  const [isSaving, setIsSaving] = useState(false);

  const isDataUrl = (value: string) => value.startsWith("data:");

  const formatErrorMessage = (error: unknown) => {
    if (error instanceof Error && error.message) {
      return error.message;
    }

    if (typeof error === "string") {
      return error;
    }

    if (error && typeof error === "object") {
      const maybe = error as DbLikeError;
      const parts = [maybe.message, maybe.details, maybe.hint].filter(
        (value): value is string => Boolean(value),
      );

      if (maybe.code) {
        parts.push(`code=${maybe.code}`);
      }

      if (parts.length > 0) {
        return parts.join(" | ");
      }
    }

    return "Unknown save error.";
  };

  const throwIfError = (error: DbLikeError | null, step: string) => {
    if (!error) return;
    throw new Error(`${step}: ${formatErrorMessage(error)}`);
  };

  const dataUrlToFile = (dataUrl: string, fileName: string) => {
    const parts = dataUrl.split(",");
    if (parts.length !== 2) {
      throw new Error("Invalid image data URL.");
    }

    const mimeMatch = parts[0].match(/data:(.*?);base64/);
    const mimeType = mimeMatch?.[1] ?? "image/png";
    const base64 = parts[1];
    const binary = atob(base64);
    const bytes = new Uint8Array(binary.length);

    for (let i = 0; i < binary.length; i += 1) {
      bytes[i] = binary.charCodeAt(i);
    }

    return new File([bytes], fileName, { type: mimeType });
  };

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
          setSidebarPosition(pageData.sidebar_position as SidebarPosition);
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

  const handleAddBlock = (
    blockType: BlockType,
    options?: { url?: string; title?: string },
  ) => {
    const id = crypto.randomUUID();
    const defaultContent = getDefaultContent(blockType, options);

    const tempBlockForPlacement = {
      id,
      type: blockType,
      content: defaultContent,
      order: blocks.length,
      styles: { widthPreset: "small" },
    } as Block;
    const pos = findFirstFreeSpot(tempBlockForPlacement, blocks);

    const newBlock: Block = {
      id,
      type: blockType,
      content: defaultContent,
      order: blocks.length,
      layout: pos,
    } as Block;

    addBlock(newBlock);
  };

  const getDefaultContent = (
    type: BlockType,
    options?: { url?: string; title?: string },
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
        return { url: "", alt: "" };
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
      const { error: profileError } = await supabase.from("profiles").upsert(
        {
          id: user.id,
          username,
        },
        { onConflict: "id" },
      );
      throwIfError(profileError, "Saving profile failed");

      let resolvedAvatarUrl = avatarUrl;

      if (avatarUrl === "" && persistedAvatarUrl) {
        await deletePageImage({
          uid: user.id,
          username,
          scope: { kind: "avatar" },
        });
        resolvedAvatarUrl = "";
      } else if (isDataUrl(avatarUrl)) {
        const file = dataUrlToFile(avatarUrl, `avatar-${username}.png`);
        const upload = await uploadPageImage({
          uid: user.id,
          username,
          file,
          scope: { kind: "avatar" },
        });
        resolvedAvatarUrl = upload.downloadUrl;
      }

      const { error: pageError } = await supabase.from("pages").upsert(
        stripUndefinedDeep({
          username,
          uid: user.id,
          published: true,
          background,
          sidebar_position: sidebarPosition,
          display_name: displayName,
          bio_html: bioHtml,
          avatar_url: resolvedAvatarUrl,
          avatar_shape: avatarShape,
        }),
        { onConflict: "username" },
      );
      throwIfError(pageError, "Saving page settings failed");

      if (resolvedAvatarUrl !== avatarUrl) {
        setAvatarUrl(resolvedAvatarUrl);
      }
      setPersistedAvatarUrl(resolvedAvatarUrl);

      const blockRows = blocks.map((block, index) =>
        stripUndefinedDeep({
          ...toBlockRow(block, username, user.id),
          order: index,
        }),
      );

      if (blockRows.length > 0) {
        const { error: upsertBlocksError } = await supabase
          .from("blocks")
          .upsert(blockRows, { onConflict: "id" });

        throwIfError(upsertBlocksError, "Saving blocks failed");
      }

      const { data: existingBlockRows, error: existingBlocksError } =
        await supabase
          .from("blocks")
          .select("id")
          .eq("page_username", username);
      throwIfError(existingBlocksError, "Fetching existing blocks failed");

      const currentBlockIds = new Set(blocks.map((block) => block.id));
      const staleIds = (existingBlockRows ?? [])
        .map((row) => String(row.id))
        .filter((id) => !currentBlockIds.has(id));

      if (staleIds.length > 0) {
        const { error: deleteStaleError } = await supabase
          .from("blocks")
          .delete()
          .eq("page_username", username)
          .in("id", staleIds);

        throwIfError(deleteStaleError, "Deleting removed blocks failed");
      }
    } catch (error) {
      console.error("Save failed:", formatErrorMessage(error), error);
    } finally {
      setIsSaving(false);
    }
  };

  if (loading || !authChecked) {
    return <div>Loading editor…</div>;
  }

  return (
    <PageLayout background={background} sidebarPosition={sidebarPosition}>
      <ProfileSidebar
        variant="editor"
        position={sidebarPosition}
        displayName={displayName}
        bioHtml={bioHtml}
        onChangeDisplayName={setDisplayName}
        onChangeBioHtml={setBioHtml}
        avatarUrl={avatarUrl}
        avatarShape={avatarShape}
        onChangeAvatarUrl={setAvatarUrl}
        onChangeAvatarShape={setAvatarShape}
      />
      <EditorProvider
        username={username ?? null}
        onUpdateBlock={handleUpdateBlock}
        onRemoveBlock={handleRemoveBlock}
      >
        <div className={styles.actions}>
          <SaveButton onSave={handleSave} saving={isSaving} />
          <LogoutButton />
        </div>
        <BlockCanvas editable />
        <Toolbar
          onAddBlock={handleAddBlock}
          onChangeBackground={setBackground}
          onChangeSidebarPosition={setSidebarPosition}
          background={background}
          sidebarPosition={sidebarPosition}
        />
      </EditorProvider>
    </PageLayout>
  );
}
