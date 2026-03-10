import { PageBackgroundId } from "@/types/page";

export type PageTheme = {
  bg: string;
  avatarBg: string;
};

export const PAGE_THEMES: Record<PageBackgroundId, PageTheme> = {
  "page-bg-1": { bg: "#f5f5f5", avatarBg: "#b8b8b8" },
  "page-bg-2": { bg: "#f4f9f2", avatarBg: "#b7c9ad" },
  "page-bg-3": { bg: "#fefce8", avatarBg: "#d1c578" },
  "page-bg-4": { bg: "#eff6ff", avatarBg: "#a9c2e8" },
  "page-bg-5": { bg: "#fdf2ff", avatarBg: "#cfa6d6" },
  "page-bg-6": { bg: "#fef2f2", avatarBg: "#e0a7a7" },
};

export const DEFAULT_PAGE_THEME = PAGE_THEMES["page-bg-1"];
