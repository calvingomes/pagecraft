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
import { BlockCanvas } from "@/components/builder/BlockCanvas/BlockCanvas";
import { BlockToolbar } from "@/components/builder/BlockToolbar/BlockToolbar";
import { PageLayout } from "@/components/layout/PageLayout/PageLayout";

export default function EditorPage() {
  const router = useRouter();

  const { user, username, loading, setUser, setUsername, setLoading } =
    useAuthStore();
  const blocks = useEditorStore((s) => s.blocks);
  const setBlocks = useEditorStore((s) => s.setBlocks);
  const addBlock = useEditorStore((s) => s.addBlock);
  const updateBlock = useEditorStore((s) => s.updateBlock);
  const removeBlock = useEditorStore((s) => s.removeBlock);
  const [background, setBackground] = useState<PageBackgroundId>("page-bg-1");
  const [sidebarPosition, setSidebarPosition] =
    useState<SidebarPosition>("left");

  const spanForPreset = (preset: string): number => {
    switch (preset) {
      case "narrow":
        return 1;
      case "medium":
        return 2;
      case "wide":
        return 3;
      case "full":
      default:
        return 3;
    }
  };

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

  /* load page metadata (background/sidebar) and blocks once the username is known */
  useEffect(() => {
    if (!username) return;

    const loadPageData = async () => {
      // load page settings first so the UI can render them as early as possible
      const pageRef = doc(db, "pages", username);
      const pageSnap = await getDoc(pageRef);

      if (pageSnap.exists()) {
        const data = pageSnap.data() as
          | {
              background?: PageBackgroundId;
              sidebarPosition?: SidebarPosition;
            }
          | undefined;

        if (data?.background) setBackground(data.background);
        if (data?.sidebarPosition) setSidebarPosition(data.sidebarPosition);
      }

      // then load blocks
      const blocksRef = collection(db, "pages", username, "blocks");
      const q = query(blocksRef, orderBy("order"));
      const snap = await getDocs(q);

      const rawBlocks = snap.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Block[];

      // ensure every block has a layout entry; for existing data we fall back to
      // a simple row-major placement based on its index and width preset
      const blocksWithLayout = rawBlocks.map((b, idx) => {
        if (b.layout && typeof b.layout.x === "number") {
          return b;
        }
        const preset = b.styles?.widthPreset ?? "full";
        const w = spanForPreset(preset);
        const x = idx % 3;
        const y = Math.floor(idx / 3);
        return {
          ...b,
          layout: { x, y, w, h: 1 },
        } as Block;
      });

      setBlocks(blocksWithLayout);
      // write any newly generated layouts back to Firestore so future loads
      // don't have to recompute them
      await Promise.all(
        blocksWithLayout.map(async (b) => {
          if (!b.layout) return;
          const orig = rawBlocks.find((o) => o.id === b.id);
          if (orig && !orig.layout) {
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
    options?: { url?: string; label?: string },
  ) => {
    if (!username) return;

    const id = crypto.randomUUID();
    const defaultContent = getDefaultContent(blockType, options);

    // each block starts with a simple 1x1 layout; x/y will be
    // managed by react-grid-layout when the user drags or resizes
    const newBlock: Block = {
      id,
      type: blockType,
      content: defaultContent,
      order: blocks.length,
      layout: { x: 0, y: Infinity, w: spanForPreset("full"), h: 1 },
    } as Block;

    addBlock(newBlock);
    await setDoc(doc(db, "pages", username, "blocks", id), newBlock);
  };

  const getDefaultContent = (
    type: BlockType,
    options?: { url?: string; label?: string },
  ): Block["content"] => {
    switch (type) {
      case "text":
        return { text: "New text block" };
      case "link":
        return {
          url: options?.url ?? "",
          label: options?.label ?? options?.url ?? "New link",
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
    removeBlock(id);
    await deleteDoc(doc(db, "pages", username, "blocks", id));
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
    if (!username) return;
    const pageRef = doc(db, "pages", username);
    updateDoc(pageRef, {
      background,
      updatedAt: serverTimestamp(),
    }).catch(console.error);
  }, [background, username]);

  /* persist sidebar position changes */
  useEffect(() => {
    if (!username) return;
    const pageRef = doc(db, "pages", username);
    updateDoc(pageRef, {
      sidebarPosition,
      updatedAt: serverTimestamp(),
    }).catch(console.error);
  }, [sidebarPosition, username]);

  if (loading) {
    return <div>Loading editor…</div>;
  }

  return (
    <PageLayout background={background} sidebarPosition={sidebarPosition}>
      <ProfileSidebar variant="editor" position={sidebarPosition} />
      <EditorProvider
        username={username ?? null}
        onUpdateBlock={handleUpdateBlock}
        onRemoveBlock={handleRemoveBlock}
      >
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
