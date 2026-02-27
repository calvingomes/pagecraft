"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useEditorStore } from "@/stores/editor-store";
import { useAuthStore } from "@/stores/auth-store";
import { auth } from "@/lib/auth";
import { db } from "@/lib/firebase";
import { signOut } from "firebase/auth";
import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  collection,
  getDocs,
  orderBy,
  query,
} from "firebase/firestore";
import type { Block, BlockType } from "@/types/editor";
import { ProfileSidebar } from "@/components/system/ProfileSidebar/ProfileSidebar";
import { BlockCanvas } from "@/components/system/BlockCanvas/BlockCanvas";
import { BlockToolbar } from "@/components/system/BlockToolbar/BlockToolbar";
import styles from "./editor.module.css";

export default function EditorPage() {
  const router = useRouter();

  const { user, username, loading, setUser, setUsername, setLoading } =
    useAuthStore();
  const blocks = useEditorStore((s) => s.blocks);
  const setBlocks = useEditorStore((s) => s.setBlocks);
  const addBlock = useEditorStore((s) => s.addBlock);

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

  /* load blocks once the username is known */
  useEffect(() => {
    if (!username) return;

    const loadBlocks = async () => {
      const blocksRef = collection(db, "pages", username, "blocks");
      const q = query(blocksRef, orderBy("order"));
      const snap = await getDocs(q);

      const data = snap.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Block[];

      setBlocks(data);
      setLoading(false);
    };

    loadBlocks();
  }, [username, setBlocks, setLoading]);

  /* add‑block helper used by the toolbar */
  const handleAddBlock = async (blockType: BlockType) => {
    if (!username) return;

    const id = crypto.randomUUID();
    const defaultContent = getDefaultContent(blockType);

    const newBlock: Block = {
      id,
      type: blockType,
      content: defaultContent,
      order: blocks.length,
    } as Block;

    addBlock(newBlock);
    await setDoc(doc(db, "pages", username, "blocks", id), newBlock);
  };

  const getDefaultContent = (type: BlockType): Block["content"] => {
    switch (type) {
      case "text":
        return { text: "New text block" };
      case "link":
        return { url: "", label: "New link" };
      case "image":
        return { url: "", alt: "" };
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

  if (loading) {
    return <div>Loading editor…</div>;
  }

  return (
    <main className={styles.editorLayout}>
      <ProfileSidebar />
      <BlockCanvas />
      <BlockToolbar onAddBlock={handleAddBlock} />
    </main>
  );
}
