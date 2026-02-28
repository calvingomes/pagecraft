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
import { PageView } from "@/components/system/PageView/PageView";

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

  const blocks: Block[] = blocksSnap.docs.map((docSnap) => {
    const docData = docSnap.data();
    return {
      id: docSnap.id,
      type: docData.type,
      order: docData.order,
      content: docData.content,
      styles: docData.styles,
    } as Block;
  });

  const page = pageSnap.data();

  return (
    <PageView
      username={username}
      title={page?.title}
      blocks={blocks}
    />
  );
}
