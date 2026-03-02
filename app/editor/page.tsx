"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useEditorStore } from "@/stores/editor-store";
import { useAuthStore } from "@/stores/auth-store";
import { auth } from "@/lib/auth";
import { db } from "@/lib/firebase";
import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  collection,
  getDocs,
  orderBy,
  query,
  serverTimestamp,
} from "firebase/firestore";
import type { Block, BlockType } from "@/types/editor";
import { EditorProvider } from "@/contexts/EditorContext";
import type { PageBackgroundId, SidebarPosition } from "@/types/page";
import { ProfileSidebar } from "@/components/layout/ProfileSidebar/ProfileSidebar";
import { LogoutButton } from "@/components/layout/LogoutButton/LogoutButton";
import { BlockCanvas } from "@/components/builder/BlockCanvas/BlockCanvas";
import { BlockToolbar } from "@/components/builder/BlockToolbar/BlockToolbar";
import { PageLayout } from "@/components/layout/PageLayout/PageLayout";
import { compactEmptyRows } from "@/lib/compactEmptyRows";
import { findFirstFreeSpot } from "@/lib/blockPlacement";
import {
  ensureBlocksHaveValidLayouts,
  isValidLayout,
  normalizeFirestoreBlocks,
  type RawFirestoreBlock,
} from "@/lib/normalizeBlocks";

export default function EditorPage() {
  const router = useRouter();

  const { username, loading, setUser, setUsername, setLoading } =
    useAuthStore();
  const blocks = useEditorStore((s) => s.blocks);
  const setBlocks = useEditorStore((s) => s.setBlocks);
  const addBlock = useEditorStore((s) => s.addBlock);
  const updateBlock = useEditorStore((s) => s.updateBlock);
  const [background, setBackground] = useState<PageBackgroundId>("page-bg-1");
  const [sidebarPosition, setSidebarPosition] =
    useState<SidebarPosition>("left");
  const [displayName, setDisplayName] = useState<string>("");
  const [bioHtml, setBioHtml] = useState<string>("");
  const [pageSettingsLoaded, setPageSettingsLoaded] = useState(false);

  /* auth & username guard */
  useEffect(() => {
    const unsub = auth.onAuthStateChanged(async (user) => {
      if (!user) {
        router.replace("/auth");
        return;
      }

      setUser(user);

      const userRef = doc(db, "users", user.uid);
      const userSnap = await getDoc(userRef);

      if (!userSnap.exists() || !userSnap.data().username) {
        router.replace("/claim");
        return;
      }

      setUsername(userSnap.data().username);
    });

    return () => unsub();
  }, [router, setUser, setUsername]);

  /* load page settings and blocks once the username is known */
  useEffect(() => {
    if (!username) return;

    const loadPageData = async () => {
      setPageSettingsLoaded(false);

      // Defaults (used if the page doc doesn't have these fields yet)
      setDisplayName(username);
      setBioHtml("");

      // load page settings first so the UI can render them as early as possible
      const pageRef = doc(db, "pages", username);
      const pageSnap = await getDoc(pageRef);
      if (pageSnap.exists()) {
        const data = pageSnap.data() as
          | {
              background?: PageBackgroundId;
              sidebarPosition?: SidebarPosition;
              displayName?: string;
              bioHtml?: string;
            }
          | undefined;

        if (data?.background) setBackground(data.background);
        if (data?.sidebarPosition) setSidebarPosition(data.sidebarPosition);
        if (typeof data?.displayName === "string" && data.displayName.trim()) {
          setDisplayName(data.displayName);
        }
        if (typeof data?.bioHtml === "string") setBioHtml(data.bioHtml);
      }

      setPageSettingsLoaded(true);

      // then load blocks
      const blocksRef = collection(db, "pages", username, "blocks");
      const q = query(blocksRef, orderBy("order"));
      const snap = await getDocs(q);

      const rawBlocks: RawFirestoreBlock[] = snap.docs.map((docSnap) => ({
        id: docSnap.id,
        ...docSnap.data(),
      }));

      const normalizedBlocks = normalizeFirestoreBlocks(rawBlocks);

      // Ensure every block has a stable grid position. Blocks keep their
      // own (x,y) independent of any previous block's size.
      const withLayouts = ensureBlocksHaveValidLayouts(normalizedBlocks);

      const compactedAfterLoad = compactEmptyRows(withLayouts).blocks;
      setBlocks(compactedAfterLoad);

      // Write back any missing/corrected layouts so public view stays consistent.
      await Promise.all(
        compactedAfterLoad.map(async (b) => {
          const orig = rawBlocks.find((o) => o.id === b.id);
          const origLayout = orig?.layout;

          if (!isValidLayout(origLayout)) {
            await updateDoc(doc(db, "pages", username, "blocks", b.id), {
              layout: b.layout,
            });
            return;
          }

          if (origLayout.x !== b.layout?.x || origLayout.y !== b.layout?.y) {
            await updateDoc(doc(db, "pages", username, "blocks", b.id), {
              layout: b.layout,
            });
          }
        }),
      );
      setLoading(false);
    };

    loadPageData();
  }, [username, setBlocks, setLoading]);

  /* add‑block helper used by the toolbar */
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
    await setDoc(doc(db, "pages", username, "blocks", id), newBlock);
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
    const block = blocks.find((b) => b.id === id);
    if (!block) return;
    const updated = { ...block, ...updates };
    await updateDoc(doc(db, "pages", username, "blocks", id), updated);
  };

  const handleRemoveBlock = async (id: string) => {
    if (!username) return;

    const remaining = blocks.filter((b) => b.id !== id);
    const compacted = compactEmptyRows(remaining);
    setBlocks(compacted.blocks);

    await deleteDoc(doc(db, "pages", username, "blocks", id));

    if (compacted.changedIds.size > 0) {
      await Promise.all(
        Array.from(compacted.changedIds).map(async (changedId) => {
          const b = compacted.blocks.find((x) => x.id === changedId);
          if (!b?.layout) return;
          await updateDoc(doc(db, "pages", username, "blocks", changedId), {
            layout: b.layout,
          });
        }),
      );
    }
  };

  /* persist re‑ordering whenever blocks change */
  useEffect(() => {
    if (!username) return;

    const timeout = setTimeout(() => {
      blocks.forEach((block, index) => {
        updateDoc(doc(db, "pages", username, "blocks", block.id), {
          ...block,
          order: index,
        });
      });
    }, 800);

    return () => clearTimeout(timeout);
  }, [blocks, username]);

  /* persist background changes */
  useEffect(() => {
    if (!username || !pageSettingsLoaded) return;
    const pageRef = doc(db, "pages", username);
    setDoc(
      pageRef,
      {
        background,
        updatedAt: serverTimestamp(),
      },
      { merge: true },
    ).catch(console.error);
  }, [background, username, pageSettingsLoaded]);

  /* persist sidebar position changes */
  useEffect(() => {
    if (!username || !pageSettingsLoaded) return;
    const pageRef = doc(db, "pages", username);
    setDoc(
      pageRef,
      {
        sidebarPosition,
        updatedAt: serverTimestamp(),
      },
      { merge: true },
    ).catch(console.error);
  }, [sidebarPosition, username, pageSettingsLoaded]);

  /* persist profile changes (display name + bio) */
  useEffect(() => {
    if (!username || !pageSettingsLoaded) return;

    const timeout = setTimeout(() => {
      const pageRef = doc(db, "pages", username);
      setDoc(
        pageRef,
        {
          displayName,
          bioHtml,
          updatedAt: serverTimestamp(),
        },
        { merge: true },
      ).catch(console.error);
    }, 500);

    return () => clearTimeout(timeout);
  }, [bioHtml, displayName, pageSettingsLoaded, username]);

  if (loading) {
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
      />
      <EditorProvider
        username={username ?? null}
        onUpdateBlock={handleUpdateBlock}
        onRemoveBlock={handleRemoveBlock}
      >
        <LogoutButton />
        <BlockCanvas editable />
        <BlockToolbar
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
