import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  orderBy,
} from "firebase/firestore";
import { db } from "@/lib/firebase";

import { Block } from "@/types/editor";
import BlockRenderer from "@/components/system/BlockRenderer";

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

  const blocks: Block[] = blocksSnap.docs.map((doc) => {
    const docData = doc.data();
    return {
      id: doc.id,
      type: docData.type,
      order: docData.order,
      content: docData.content, // Change 'data' to 'content'
    } as Block;
  });

  const page = pageSnap.data();

  return (
    <main>
      <h1>{page.title}</h1>
      {blocks.map((block) => (
        <BlockRenderer key={block.id} block={block} />
      ))}
    </main>
  );
}
