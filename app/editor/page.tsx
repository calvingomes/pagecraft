"use client";

import { useEffect, useState } from "react";
import { auth } from "@/lib/auth";
import { db } from "@/lib/firebase";
import {
  doc,
  getDoc,
  collection,
  getDocs,
  orderBy,
  query,
} from "firebase/firestore";
import { useRouter } from "next/navigation";
import BlockRenderer from "@/components/BlockRenderer";
import type { Block } from "@/types/block";

export default function EditorPage() {
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [username, setUsername] = useState<string | null>(null);
  const [blocks, setBlocks] = useState<Block[]>([]);

  /**
   * Auth + username guard
   */
  useEffect(() => {
    const unsub = auth.onAuthStateChanged(async (user) => {
      if (!user) {
        router.replace("/auth");
        return;
      }

      const userRef = doc(db, "users", user.uid);
      const userSnap = await getDoc(userRef);

      if (!userSnap.exists() || !userSnap.data().username) {
        router.replace("/claim");
        return;
      }

      setUsername(userSnap.data().username);
    });

    return () => unsub();
  }, [router]);

  /**
   * Load blocks once username is known
   */
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
  }, [username]);

  /**
   * Prevent render flicker
   */
  if (loading) {
    return <div>Loading editor..</div>;
  }

  return (
    <main>
      <h1>Welcome to the Editor</h1>
      {blocks.map((block) => (
        <BlockRenderer key={block.id} block={block} />
      ))}
    </main>
  );
}
