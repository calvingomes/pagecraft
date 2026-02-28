import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  orderBy,
} from "firebase/firestore";
import { db } from "@/lib/firebase";

import type { Block, BlockType } from "@/types/editor";
import type { PageBackgroundId, SidebarPosition } from "@/types/page";
import { PageView } from "@/components/views/PageView/PageView";

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
    b: { x: number; y: number; w: number; h: number },
  ) => {
    return (
      a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y
    );
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

  const rectFor = (b: Block, at?: { x: number; y: number }) => {
    const { w, h } = spansForPreset(b.styles?.widthPreset);
    const x = at?.x ?? b.layout?.x ?? 0;
    const y = at?.y ?? b.layout?.y ?? 0;
    return { x, y, w, h };
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

  const rawBlocks = blocksSnap.docs.map((docSnap) => ({
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

  // Ensure every block has a stable grid position matching the editor.
  const placed: Block[] = [];
  const blocks: Block[] = [...normalizedBlocks]
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
