type Props = {
  params: Promise<{ username: string }>;
};

export default async function UserPage({ params }: Props) {
  const { username } = await params;

  return (
    <main>
      <div>User Page: {username}</div>
      <p>This is your public link-in-bio page!</p>
    </main>
  );
}
