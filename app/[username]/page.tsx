import {
  collection,
  doc,
  getDoc,
  getDocs,
  orderBy,
  query,
} from "firebase/firestore";
import { db } from "@/lib/firebase";

import type { Block } from "@/types/editor";
import type { PageBackgroundId, SidebarPosition } from "@/types/page";
import { PageView } from "@/components/views/PageView/PageView";
import {
  ensureBlocksHaveValidLayouts,
  normalizeFirestoreBlocks,
  type RawFirestoreBlock,
} from "@/lib/normalizeBlocks";

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

  const rawBlocks: RawFirestoreBlock[] = blocksSnap.docs.map((docSnap) => ({
    id: docSnap.id,
    ...docSnap.data(),
  }));

  const normalizedBlocks = normalizeFirestoreBlocks(rawBlocks);

  // Ensure every block has a stable grid position matching the editor.
  const blocks: Block[] = ensureBlocksHaveValidLayouts(normalizedBlocks);

  const page = pageSnap.data() as
    | {
        title?: string;
        background?: PageBackgroundId;
        sidebarPosition?: SidebarPosition;
        displayName?: string;
        bioHtml?: string;
      }
    | undefined;

  return (
    <PageView
      username={username}
      title={page?.title}
      background={page?.background}
      sidebarPosition={page?.sidebarPosition}
      displayName={page?.displayName}
      bioHtml={page?.bioHtml}
      blocks={blocks}
    />
  );
}
