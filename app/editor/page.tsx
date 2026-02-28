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

      const blockData = snap.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Block[];

      setBlocks(blockData);
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

    const newBlock: Block = {
      id,
      type: blockType,
      content: defaultContent,
      order: blocks.length,
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
      <ProfileSidebar variant="editor" />
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
