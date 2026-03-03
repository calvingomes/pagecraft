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
import { BlockCanvas } from "@/components/builder/BlockCanvas/BlockCanvas";
import { Toolbar } from "@/components/builder/Toolbars/Toolbar";
import { PageLayout } from "@/components/layout/PageLayout/PageLayout";
import { compactEmptyRows } from "@/lib/compactEmptyRows";
import { findFirstFreeSpot } from "@/lib/blockPlacement";
import { stripUndefinedDeep } from "@/lib/firestoreSafe";
import {
  ensureBlocksHaveValidLayouts,
  isValidLayout,
  normalizeFirestoreBlocks,
  type RawFirestoreBlock,
} from "@/lib/normalizeBlocks";
import { useAuthGuard } from "@/hooks/useAuthGuard";

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
  const [pageSettingsLoaded, setPageSettingsLoaded] = useState(false);

  useEffect(() => {
    if (!username || !user?.id) return;

    const loadPageData = async () => {
      setPageSettingsLoaded(false);

      setDisplayName(username);
      setBioHtml("");
      setAvatarUrl("");
      setAvatarShape("circle");

      const { error: profileBootstrapError } = await supabase
        .from("profiles")
        .upsert(
          {
            id: user.id,
            username,
          },
          { onConflict: "id" },
        );

      if (profileBootstrapError) {
        console.error(profileBootstrapError);
      }

      const { data: existingUsernameRow, error: usernameLookupError } =
        await supabase
          .from("usernames")
          .select("uid")
          .eq("username", username)
          .maybeSingle();

      if (usernameLookupError) {
        console.error(usernameLookupError);
      }

      if (!existingUsernameRow) {
        const { error: usernameBootstrapError } = await supabase
          .from("usernames")
          .insert({ username, uid: user.id });

        if (usernameBootstrapError) {
          console.error(usernameBootstrapError);
        }
      }

      const { error: pageBootstrapError } = await supabase.from("pages").upsert(
        {
          username,
          uid: user.id,
          published: true,
          background: "page-bg-1",
          sidebar_position: "left",
        },
        { onConflict: "username" },
      );

      if (pageBootstrapError) {
        console.error(pageBootstrapError);
      }

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
        }
        if (
          pageData.avatar_shape === "circle" ||
          pageData.avatar_shape === "square"
        ) {
          setAvatarShape(pageData.avatar_shape);
        }
      }

      setDisplayName(incomingDisplayName ?? username);
      setPageSettingsLoaded(true);

      const { data: blockRows } = await supabase
        .from("blocks")
        .select("id, type, order, content, layout, styles")
        .eq("page_username", username)
        .order("order", { ascending: true });

      const safeBlockRows = blockRows ?? [];

      const rawBlocks: RawFirestoreBlock[] = safeBlockRows.map((row) => ({
        id: String(row.id),
        type: row.type,
        order: row.order,
        content: row.content,
        layout: row.layout,
        styles: row.styles,
      }));

      const normalizedBlocks = normalizeFirestoreBlocks(rawBlocks);
      const withLayouts = ensureBlocksHaveValidLayouts(normalizedBlocks);
      const compactedAfterLoad = compactEmptyRows(withLayouts).blocks;
      setBlocks(compactedAfterLoad);

      await Promise.all(
        compactedAfterLoad.map(async (block) => {
          const original = rawBlocks.find((raw) => raw.id === block.id);
          const originalLayout = original?.layout;

          if (!isValidLayout(originalLayout)) {
            await supabase
              .from("blocks")
              .update({ layout: block.layout })
              .eq("id", block.id)
              .eq("page_username", username);
            return;
          }

          if (
            originalLayout.x !== block.layout?.x ||
            originalLayout.y !== block.layout?.y
          ) {
            await supabase
              .from("blocks")
              .update({ layout: block.layout })
              .eq("id", block.id)
              .eq("page_username", username);
          }
        }),
      );

      setLoading(false);
    };

    loadPageData();
  }, [username, user?.id, setBlocks, setLoading]);

  const handleAddBlock = async (
    blockType: BlockType,
    options?: { url?: string; title?: string },
  ) => {
    if (!username) return;

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

    const { error } = await supabase
      .from("blocks")
      .insert(stripUndefinedDeep(toBlockRow(newBlock, username, user?.id)));

    if (error) {
      console.error(error);
    }
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
    if (!username) return;
    updateBlock(id, updates);

    const current = blocks.find((block) => block.id === id);
    if (!current) return;

    const updated = { ...current, ...updates } as Block;

    const { error } = await supabase
      .from("blocks")
      .update(stripUndefinedDeep(toBlockRow(updated, username, user?.id)))
      .eq("id", id)
      .eq("page_username", username);

    if (error) {
      console.error(error);
    }
  };

  const handleRemoveBlock = async (id: string) => {
    if (!username) return;

    const remaining = blocks.filter((block) => block.id !== id);
    const compacted = compactEmptyRows(remaining);
    setBlocks(compacted.blocks);

    const { error } = await supabase
      .from("blocks")
      .delete()
      .eq("id", id)
      .eq("page_username", username);

    if (error) {
      console.error(error);
    }

    if (compacted.changedIds.size > 0) {
      await Promise.all(
        Array.from(compacted.changedIds).map(async (changedId) => {
          const block = compacted.blocks.find(
            (entry) => entry.id === changedId,
          );
          if (!block?.layout) return;

          await supabase
            .from("blocks")
            .update({ layout: block.layout })
            .eq("id", changedId)
            .eq("page_username", username);
        }),
      );
    }
  };

  useEffect(() => {
    if (!username) return;

    const timeout = setTimeout(() => {
      blocks.forEach((block, index) => {
        supabase
          .from("blocks")
          .update({
            ...stripUndefinedDeep(toBlockRow(block, username, user?.id)),
            order: index,
          })
          .eq("id", block.id)
          .eq("page_username", username);
      });
    }, 800);

    return () => clearTimeout(timeout);
  }, [blocks, username, user?.id]);

  useEffect(() => {
    if (!username || !pageSettingsLoaded) return;

    const persistBackground = async () => {
      const { error } = await supabase
        .from("pages")
        .update({ background, updated_at: new Date().toISOString() })
        .eq("username", username);

      if (error) {
        console.error(error);
      }
    };

    persistBackground();
  }, [background, username, pageSettingsLoaded]);

  useEffect(() => {
    if (!username || !pageSettingsLoaded) return;

    const persistSidebar = async () => {
      const { error } = await supabase
        .from("pages")
        .update({
          sidebar_position: sidebarPosition,
          updated_at: new Date().toISOString(),
        })
        .eq("username", username);

      if (error) {
        console.error(error);
      }
    };

    persistSidebar();
  }, [sidebarPosition, username, pageSettingsLoaded]);

  useEffect(() => {
    if (!username || !pageSettingsLoaded) return;

    const timeout = setTimeout(() => {
      const persistProfile = async () => {
        const { error } = await supabase
          .from("pages")
          .update(
            stripUndefinedDeep({
              display_name: displayName,
              bio_html: bioHtml,
              avatar_url: avatarUrl,
              avatar_shape: avatarShape,
              updated_at: new Date().toISOString(),
            }),
          )
          .eq("username", username);

        if (error) {
          console.error(error);
        }
      };

      persistProfile();
    }, 500);

    return () => clearTimeout(timeout);
  }, [
    avatarShape,
    avatarUrl,
    bioHtml,
    displayName,
    pageSettingsLoaded,
    username,
  ]);

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
        <LogoutButton />
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
