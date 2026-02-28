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

  const spansForPreset = (preset?: string) => {
    switch (preset) {
      case "medium":
        return { w: 2, h: 2 };
      case "wide":
        return { w: 2, h: 1 };
      case "skinnyTall":
        return { w: 2, h: 1 };
      case "tall":
        return { w: 1, h: 2 };
      case "small":
      default:
        return { w: 1, h: 1 };
    }
  };

  const overlaps = (
    a: { x: number; y: number; w: number; h: number },
    b: {
      x: number;
      y: number;
      w: number;
      h: number;
    },
  ) => {
    return (
      a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y
    );
  };

  const rectFor = (b: Block, at?: { x: number; y: number }) => {
    const { w, h } = spansForPreset(b.styles?.widthPreset);
    const x = at?.x ?? b.layout?.x ?? 0;
    const y = at?.y ?? b.layout?.y ?? 0;
    return { x, y, w, h };
  };

  const isValidLayout = (layout: any): layout is { x: number; y: number } => {
    return (
      layout &&
      typeof layout.x === "number" &&
      Number.isFinite(layout.x) &&
      typeof layout.y === "number" &&
      Number.isFinite(layout.y)
    );
  };

  const canPlace = (
    candidate: { x: number; y: number; w: number; h: number },
    placed: Block[],
  ) => {
    if (candidate.x < 0 || candidate.y < 0) return false;
    if (candidate.x + candidate.w > 4) return false;
    return !placed.some((p) => overlaps(candidate, rectFor(p)));
  };

  const findFirstFreeSpot = (block: Block, placed: Block[]) => {
    const { w, h } = spansForPreset(block.styles?.widthPreset);
    for (let y = 0; y < 100; y++) {
      for (let x = 0; x <= 4 - w; x++) {
        const candidate = { x, y, w, h };
        if (canPlace(candidate, placed)) return { x, y };
      }
    }
    return { x: 0, y: 0 };
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

      const rawBlocks = snap.docs.map((docSnap) => ({
        id: docSnap.id,
        ...docSnap.data(),
      }));

      // Normalize older Firestore shapes (e.g. `data` instead of `content`).
      const normalizedBlocks: Block[] = rawBlocks.map((raw, index) => {
        const anyRaw = raw as any;
        const type = anyRaw.type as BlockType;
        const order = typeof anyRaw.order === "number" ? anyRaw.order : index;

        if (anyRaw.content) {
          return { ...anyRaw, order } as Block;
        }

        switch (type) {
          case "text":
            return {
              ...anyRaw,
              order,
              content: { text: anyRaw.data?.text ?? "<p>New text block</p>" },
            } as Block;
          case "link":
            return {
              ...anyRaw,
              order,
              content: {
                url: anyRaw.data?.url ?? "",
                label: anyRaw.data?.label ?? anyRaw.data?.url ?? "New link",
              },
            } as Block;
          case "image":
            return {
              ...anyRaw,
              order,
              content: {
                url: anyRaw.data?.url ?? "",
                alt: anyRaw.data?.alt ?? "",
              },
            } as Block;
          default:
            return { ...anyRaw, order } as Block;
        }
      });

      // Ensure every block has a stable grid position. Blocks keep their
      // own (x,y) independent of any previous block's size.
      const placed: Block[] = [];
      const withLayouts = [...normalizedBlocks]
        .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
        .map((b) => {
          const { w, h } = spansForPreset(b.styles?.widthPreset);

          if (isValidLayout((b as any).layout)) {
            const candidate = { x: b.layout!.x, y: b.layout!.y, w, h };
            if (canPlace(candidate, placed)) {
              placed.push(b);
              return b;
            }
          }

          const pos = findFirstFreeSpot(b, placed);
          const next = { ...b, layout: pos } as Block;
          placed.push(next);
          return next;
        });

      setBlocks(withLayouts);

      // Write back any missing/corrected layouts so public view stays consistent.
      await Promise.all(
        withLayouts.map(async (b) => {
          const orig = rawBlocks.find((o) => (o as any).id === b.id) as any;
          const origLayout = orig?.layout;
          if (
            !isValidLayout(origLayout) ||
            origLayout.x !== b.layout?.x ||
            origLayout.y !== b.layout?.y
          ) {
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
