import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";

type Props = {
  params: Promise<{ username: string }>;
};

export default async function UserPage({ params }: Props) {
  const { username } = await params;

  const ref = doc(db, "pages", username);
  const snap = await getDoc(ref);

  if (!snap.exists()) {
    return <div>Page not found</div>;
  }

  const page = snap.data();

  return (
    <main>
      <h1>{page.title}</h1>
      <p>{page.bio}</p>
    </main>
  );
}
