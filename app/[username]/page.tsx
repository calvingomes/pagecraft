import {
  collection,
  doc,
  getDoc,
  getDocs,
  orderBy,
  query,
} from "firebase/firestore";
import { db } from "@/lib/firebase";

import type { Block, BlockType } from "@/types/editor";
import type { PageBackgroundId, SidebarPosition } from "@/types/page";
import { PageView } from "@/components/views/PageView/PageView";
import { canPlaceBlockAt, findFirstFreeSpot } from "@/lib/blockPlacement";

type Props = {
  params: Promise<{ username: string }>;
};

export default async function UserPage({ params }: Props) {
  const { username } = await params;

  const pageRef = doc(db, "pages", username);
  const pageSnap = await getDoc(pageRef);

  if (!pageSnap.exists()) {
    return <div>Page not found</div>;
  }

  const blocksRef = collection(db, "pages", username, "blocks");
  const blocksQuery = query(blocksRef, orderBy("order"));
  const blocksSnap = await getDocs(blocksQuery);

  const isValidLayout = (
    layout: unknown,
  ): layout is { x: number; y: number; slot?: 0 | 1 } => {
    if (!layout || typeof layout !== "object") return false;
    const anyLayout = layout as Record<string, unknown>;
    return (
      typeof anyLayout.x === "number" &&
      Number.isFinite(anyLayout.x) &&
      typeof anyLayout.y === "number" &&
      Number.isFinite(anyLayout.y)
    );
  };

  const rawBlocks: Array<{ id: string } & Record<string, unknown>> =
    blocksSnap.docs.map((docSnap) => ({
      id: docSnap.id,
      ...docSnap.data(),
    }));

  // Normalize older Firestore shapes (e.g. `data` instead of `content`).
  const normalizedBlocks: Block[] = rawBlocks.map((raw, index) => {
    const type = raw.type as BlockType;
    const order = typeof raw.order === "number" ? raw.order : index;

    if (raw.content) {
      return { ...(raw as unknown as Block), order } as Block;
    }

    const data =
      raw.data && typeof raw.data === "object" && raw.data !== null
        ? (raw.data as Record<string, unknown>)
        : undefined;

    switch (type) {
      case "text":
        return {
          ...(raw as unknown as Block),
          order,
          content: {
            text: typeof data?.text === "string" ? data.text : "",
          },
        } as Block;
      case "link":
        return {
          ...(raw as unknown as Block),
          order,
          content: {
            url: typeof data?.url === "string" ? data.url : "",
            label:
              typeof data?.label === "string"
                ? data.label
                : typeof data?.url === "string"
                  ? data.url
                  : "New link",
          },
        } as Block;
      case "image":
        return {
          ...(raw as unknown as Block),
          order,
          content: {
            url: typeof data?.url === "string" ? data.url : "",
            alt: typeof data?.alt === "string" ? data.alt : "",
          },
        } as Block;
      default:
        return { ...(raw as unknown as Block), order } as Block;
    }
  });

  // Ensure every block has a stable grid position matching the editor.
  const placed: Block[] = [];
  const blocks: Block[] = [...normalizedBlocks]
    .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
    .map((b) => {
      if (isValidLayout(b.layout)) {
        const candidate = {
          x: b.layout!.x,
          y: b.layout!.y,
          slot: b.layout!.slot,
        };
        if (canPlaceBlockAt(b, candidate, placed)) {
          placed.push(b);
          return b;
        }
      }

      const pos = findFirstFreeSpot(b, placed);
      const next = { ...b, layout: pos } as Block;
      placed.push(next);
      return next;
    });

  const page = pageSnap.data() as
    | {
        title?: string;
        background?: PageBackgroundId;
        sidebarPosition?: SidebarPosition;
      }
    | undefined;

  return (
    <PageView
      username={username}
      title={page?.title}
      background={page?.background}
      sidebarPosition={page?.sidebarPosition}
      blocks={blocks}
    />
  );
}
