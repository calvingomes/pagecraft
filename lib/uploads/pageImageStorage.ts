import { supabase } from "@/lib/supabase/client";

export const MAX_TOTAL_UPLOAD_BYTES = 25 * 1024 * 1024;
const ALLOWED_MIME_TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);
const ALLOWED_EXTENSIONS = [".jpg", ".jpeg", ".png", ".webp"];
const STORAGE_BUCKET =
  process.env.NEXT_PUBLIC_SUPABASE_STORAGE_BUCKET ??
  process.env.NEXT_PUBLIC_SUPABASE_BUCKET ??
  "pagecraft-bucket";

export type PageImageScope =
  | { kind: "avatar" }
  | { kind: "block-image"; blockId: string }
  | { kind: "og-image" };

export type UploadedPageImage = {
  downloadUrl: string;
  storagePath: string;
  sizeBytes: number;
  totalBytesUsed: number;
};

type UploadPageImageArgs = {
  uid: string;
  username: string;
  file: File;
  scope: PageImageScope;
  previousSizeBytes?: number;
};

type DeletePageImageArgs = {
  uid: string;
  username: string;
  scope: PageImageScope;
  previousSizeBytes?: number;
};

function ensureAllowedImage(file: File) {
  const lowerName = file.name.toLowerCase();
  const hasAllowedExtension = ALLOWED_EXTENSIONS.some((ext) =>
    lowerName.endsWith(ext),
  );

  if (!ALLOWED_MIME_TYPES.has(file.type) || !hasAllowedExtension) {
    throw new Error("Only .jpg, .jpeg, .png, and .webp images are allowed.");
  }
}

function getScopePath(uid: string, username: string, scope: PageImageScope) {
  const base = `users/${uid}/pages/${username}`;
  if (scope.kind === "avatar") return `${base}/avatar_${Date.now()}.webp`;
  if (scope.kind === "og-image") return `${base}/social_preview.jpg`;
  return `${base}/blocks/${scope.blockId}.webp`;
}

async function cleanUpOldAvatars(uid: string, username: string) {
  const base = `users/${uid}/pages/${username}`;
  const { data: files } = await supabase.storage
    .from(STORAGE_BUCKET)
    .list(base);

  if (files) {
    const avatarFiles = files
      .filter((f) => f.name.startsWith("avatar") && f.name.endsWith(".webp"))
      .map((f) => `${base}/${f.name}`);

    if (avatarFiles.length > 0) {
      await supabase.storage.from(STORAGE_BUCKET).remove(avatarFiles);
    }
  }
}

async function getQuotaBytes(username: string) {
  const { data } = await supabase
    .from("pages")
    .select("storage_bytes_used")
    .eq("username", username)
    .maybeSingle();

  return (data?.storage_bytes_used as number | null) ?? 0;
}

export async function uploadPageImage({
  uid,
  username,
  file,
  scope,
  previousSizeBytes = 0,
}: UploadPageImageArgs): Promise<UploadedPageImage> {
  ensureAllowedImage(file);

  const previousBytes = Math.max(0, previousSizeBytes);
  const currentUsed = await getQuotaBytes(username);
  const projected = currentUsed - previousBytes + file.size;

  if (projected > MAX_TOTAL_UPLOAD_BYTES) {
    throw new Error("Total upload limit reached (25MB).");
  }

  // Cleanup old avatars before uploading new one to avoid orphans
  if (scope.kind === "avatar") {
    await cleanUpOldAvatars(uid, username);
  }

  const storagePath = getScopePath(uid, username, scope);
  const { error: uploadError } = await supabase.storage
    .from(STORAGE_BUCKET)
    .upload(storagePath, file, {
      upsert: true,
      contentType: file.type,
      cacheControl: "31536000",
    });

  if (uploadError) {
    throw uploadError;
  }

  const {
    data: { publicUrl },
  } = supabase.storage.from(STORAGE_BUCKET).getPublicUrl(storagePath);

  const nextBytes = Math.max(0, currentUsed - previousBytes + file.size);

  const { error: pageUpdateError } = await supabase
    .from("pages")
    .update({ storage_bytes_used: nextBytes })
    .eq("username", username);

  if (pageUpdateError) {
    throw pageUpdateError;
  }

  return {
    downloadUrl: publicUrl,
    storagePath,
    sizeBytes: file.size,
    totalBytesUsed: nextBytes,
  };
}

export async function deletePageImage({
  uid,
  username,
  scope,
  previousSizeBytes = 0,
}: DeletePageImageArgs): Promise<number> {
  const storagePath = getScopePath(uid, username, scope);

  const { error: removeError } = await supabase.storage
    .from(STORAGE_BUCKET)
    .remove([storagePath]);

  if (removeError) {
    // Ignore missing files; continue byte accounting update.
  }

  const released = Math.max(0, previousSizeBytes);
  const currentUsed = await getQuotaBytes(username);
  const nextBytes = Math.max(0, currentUsed - released);

  const { error: pageUpdateError } = await supabase
    .from("pages")
    .update({ storage_bytes_used: nextBytes })
    .eq("username", username);

  if (pageUpdateError) {
    throw pageUpdateError;
  }

  return nextBytes;
}
