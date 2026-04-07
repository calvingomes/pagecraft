import type { EditorSnapshotPayload } from "@/types/editor";

export const serializeSnapshot = (payload: EditorSnapshotPayload) =>
  JSON.stringify(payload);
