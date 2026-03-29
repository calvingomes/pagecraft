import type { PageBackgroundId } from "@/types/page";

export type PageTheme = {
  bg: string;
  avatarBg: string;
};

export const PAGE_THEMES: Record<PageBackgroundId, PageTheme> = {
  "page-bg-1": {
    bg: "var(--color-editor-page-bg-1)",
    avatarBg: "var(--color-editor-page-avatar-1)",
  },
  "page-bg-2": {
    bg: "var(--color-editor-page-bg-2)",
    avatarBg: "var(--color-editor-page-avatar-2)",
  },
  "page-bg-3": {
    bg: "var(--color-editor-page-bg-3)",
    avatarBg: "var(--color-editor-page-avatar-3)",
  },
  "page-bg-4": {
    bg: "var(--color-editor-page-bg-4)",
    avatarBg: "var(--color-editor-page-avatar-4)",
  },
  "page-bg-5": {
    bg: "var(--color-editor-page-bg-5)",
    avatarBg: "var(--color-editor-page-avatar-5)",
  },
  "page-bg-6": {
    bg: "var(--color-editor-page-bg-6)",
    avatarBg: "var(--color-editor-page-avatar-6)",
  },
};

export const DEFAULT_PAGE_THEME = PAGE_THEMES["page-bg-1"];
