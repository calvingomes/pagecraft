import { supabase } from "@/lib/supabase/client";
import type {
  AvatarShape,
  PageBackgroundId,
  SidebarPosition,
} from "@/types/page";
import type { Block } from "@/types/editor";
import {
  deletePageImage,
  uploadPageImage,
} from "@/lib/uploads/pageImageStorage";
import { dataUrlToFile } from "@/lib/uploads/imageProcessing";
import { dataUrlToWebpFile } from "@/lib/uploads/imageWebp";
import { IMAGE_LIMITS } from "@/lib/uploads/uploadConfig";

type DbLikeError = {
  message?: string;
  details?: string;
  hint?: string;
  code?: string;
};

type UnknownRecord = Record<string, unknown>;

export type SaveEditorPageInput = {
  userId: string;
  username: string;
  background: PageBackgroundId;
  sidebarPosition: SidebarPosition;
  displayName: string;
  bioHtml: string;
  avatarUrl: string;
  persistedAvatarUrl: string;
  avatarShape: AvatarShape;
  blocks: Block[];
  skipPageUpdate?: boolean;
};

export type SaveEditorPageResult = {
  avatarUrl: string;
  blocks: Block[];
};

function isPlainObject(value: unknown): value is UnknownRecord {
  return (
    typeof value === "object" &&
    value !== null &&
    Object.getPrototypeOf(value) === Object.prototype
  );
}

function stripUndefinedDeep<T>(value: T): T {
  if (Array.isArray(value)) {
    return value
      .map((item) => stripUndefinedDeep(item))
      .filter((item) => item !== undefined) as T;
  }

  if (isPlainObject(value)) {
    const output: UnknownRecord = {};

    for (const [key, nested] of Object.entries(value)) {
      if (nested === undefined) continue;
      output[key] = stripUndefinedDeep(nested);
    }

    return output as T;
  }

  return value;
}

function formatErrorMessage(error: unknown) {
  if (error instanceof Error && error.message) {
    return error.message;
  }

  if (typeof error === "string") {
    return error;
  }

  if (error && typeof error === "object") {
    const maybe = error as DbLikeError;
    const parts = [maybe.message, maybe.details, maybe.hint].filter(
      (value): value is string => Boolean(value),
    );

    if (maybe.code) {
      parts.push(`code=${maybe.code}`);
    }

    if (parts.length > 0) {
      return parts.join(" | ");
    }
  }

  return "Unknown save error.";
}

function throwIfError(error: DbLikeError | null, step: string) {
  if (!error) return;
  throw new Error(`${step}: ${formatErrorMessage(error)}`);
}

function isDataUrl(value: string) {
  return value.startsWith("data:");
}

function toBlockRow(block: Block, username: string, userId: string) {
  return {
    id: block.id,
    page_username: username,
    uid: userId,
    viewport_mode: "desktop", // Unified blocks always use desktop as the row anchor
    type: block.type,
    order: block.order,
    content: block.content,
    layout: block.layout ?? null,
    // Pack mobile data inside the existing 'styles' JSONB column to avoid schema changes
    styles: {
      ...(block.styles || {}),
      mobileLayout: block.mobileLayout ?? null,
      mobileStyles: block.mobileStyles ?? null,
      visibility: block.visibility ?? null,
    },
  };
}

export async function saveEditorPage({
  userId,
  username,
  background,
  sidebarPosition,
  displayName,
  bioHtml,
  avatarUrl,
  persistedAvatarUrl,
  avatarShape,
  blocks,
  skipPageUpdate,
}: SaveEditorPageInput): Promise<SaveEditorPageResult> {
  const { error: profileError } = await supabase.from("profiles").upsert(
    {
      id: userId,
      username,
    },
    { onConflict: "id" },
  );
  throwIfError(profileError, "Saving profile failed");

  let resolvedAvatarUrl = avatarUrl.split("?")[0];

  if (avatarUrl === "" && persistedAvatarUrl) {
    try {
      await deletePageImage({
        uid: userId,
        username,
        scope: { kind: "avatar" },
      });
    } catch (error) {
      throw new Error(`Deleting avatar failed: ${formatErrorMessage(error)}`);
    }
    resolvedAvatarUrl = "";
  } else if (isDataUrl(avatarUrl)) {
    const file = await dataUrlToWebpFile(avatarUrl, `avatar-${username}.webp`, {
      maxWidthOrHeight: IMAGE_LIMITS.AVATAR,
    });
    try {
      const upload = await uploadPageImage({
        uid: userId,
        username,
        file,
        scope: { kind: "avatar" },
      });
      resolvedAvatarUrl = upload.downloadUrl;
    } catch (error) {
      throw new Error(`Uploading avatar failed: ${formatErrorMessage(error)}`);
    }
  }

  if (!skipPageUpdate) {
    const { error: pageError } = await supabase.from("pages").upsert(
      stripUndefinedDeep({
        username,
        uid: userId,
        published: true,
        background,
        sidebar_position: sidebarPosition,
        display_name: displayName,
        bio_html: bioHtml,
        avatar_url: resolvedAvatarUrl,
        avatar_shape: avatarShape,
      }),
      { onConflict: "username" },
    );
    throwIfError(pageError, "Saving page settings failed");
  }

  const resolvedBlocks = await Promise.all(
    blocks.map(async (block) => {
      if (block.type !== "image") return block;

      const contentUrl = (block.content?.url ?? "").split("?")[0];
      if (!contentUrl || !isDataUrl(contentUrl)) {
        return {
          ...block,
          content: {
            ...block.content,
            url: contentUrl,
          },
        } as Block;
      }

      try {
        const file = dataUrlToFile(contentUrl, `block-${block.id}.webp`);
        const uploaded = await uploadPageImage({
          uid: userId,
          username,
          file,
          scope: { kind: "block-image", blockId: block.id },
        });

        return {
          ...block,
          content: {
            ...block.content,
            url: uploaded.downloadUrl,
          },
        } as Block;
      } catch (error) {
        throw new Error(
          `Uploading image block failed (${block.id}): ${formatErrorMessage(error)}`,
        );
      }
    }),
  );

  const blockRows = resolvedBlocks.map((block, index) =>
    stripUndefinedDeep({
      ...toBlockRow(block, username, userId),
      order: index,
    }),
  );

  if (blockRows.length > 0) {
    const { error: upsertBlocksError } = await supabase
      .from("blocks")
      .upsert(blockRows, { onConflict: "id" });

    throwIfError(upsertBlocksError, "Saving blocks failed");
  }

  // Cleanup stale blocks
  const { data: existingBlockRows, error: existingBlocksError } = await supabase
    .from("blocks")
    .select("id, type")
    .eq("page_username", username);
  throwIfError(existingBlocksError, "Fetching existing blocks failed");

  const currentBlockIds = new Set(resolvedBlocks.map((block) => block.id));
  const staleRows = (existingBlockRows ?? []).filter(
    (row) => !currentBlockIds.has(String(row.id)),
  );
  const staleIds = staleRows.map((row) => String(row.id));

  const staleImageBlockIds = staleRows
    .filter((row) => String(row.type) === "image")
    .map((row) => String(row.id));

  if (staleImageBlockIds.length > 0) {
    await Promise.all(
      staleImageBlockIds.map((blockId) =>
        deletePageImage({
          uid: userId,
          username,
          scope: { kind: "block-image", blockId },
        }),
      ),
    );
  }

  if (staleIds.length > 0) {
    const { error: deleteStaleError } = await supabase
      .from("blocks")
      .delete()
      .eq("page_username", username)
      .in("id", staleIds);

    throwIfError(deleteStaleError, "Deleting removed blocks failed");
  }

  return {
    avatarUrl: resolvedAvatarUrl,
    blocks: resolvedBlocks,
  };
}
