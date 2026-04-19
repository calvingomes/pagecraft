"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { PageLayout } from "@/components/layout/PageLayout/PageLayout";
import { PageLoader } from "@/components/ui/PageLoader/PageLoader";
import { SettingsSidebar } from "@/components/views/SettingsView/SettingsSidebar";
import { SettingsView } from "@/components/views/SettingsView/SettingsView";
import { SettingsNavToolbar } from "@/components/builder/Toolbars/SettingsNavToolbar";
import { AuthService } from "@/lib/services/auth.client";
import { PageService } from "@/lib/services/page.client";
import { useAuthStore } from "@/stores/auth-store";
import type { AvatarShape, PageBackgroundId } from "@/types/page";

export default function SettingsPage() {
  const router = useRouter();
  const { user, username, logout } = useAuthStore();
  const [background, setBackground] = useState<PageBackgroundId>("page-bg-1");
  const [displayName, setDisplayName] = useState<string>("");
  const [avatarUrl, setAvatarUrl] = useState<string>("");
  const [avatarShape, setAvatarShape] = useState<AvatarShape>("circle");
  const [updatedAt, setUpdatedAt] = useState<string>("");
  const [backgroundReady, setBackgroundReady] = useState(false);

  useEffect(() => {
    if (!username) return;

    let active = true;

    const loadBackground = async () => {
      try {
        const pageData = await PageService.getPageByUsername(username);
        if (!active) return;
        if (pageData?.background) {
          setBackground(pageData.background);
        }
        setDisplayName(pageData?.display_name ?? "");
        setAvatarUrl(pageData?.avatar_url ?? "");
        setAvatarShape(
          pageData?.avatar_shape === "square" ? "square" : "circle",
        );
        setUpdatedAt(pageData?.updated_at ?? "");
      } catch (error) {
        console.error("[SettingsPage] Failed to load page background:", error);
      } finally {
        if (active) setBackgroundReady(true);
      }
    };

    loadBackground();
    return () => {
      active = false;
    };
  }, [username]);

  if (!user || !username || !backgroundReady) {
    return (
      <PageLoader
        label="Loading settings"
        backgroundColor="var(--color-lighter-grey)"
      />
    );
  }

  const handleLogout = async () => {
    await AuthService.signOut();
    logout();
    router.replace("/auth");
  };

  return (
    <>
      <PageLayout
        background={background}
        sidebarPosition="left"
        previewViewport="desktop"
      >
        <SettingsSidebar
          username={username}
          displayName={displayName}
          avatarUrl={avatarUrl}
          avatarShape={avatarShape}
          updatedAt={updatedAt}
        />
        <SettingsView user={user} username={username} onLogout={handleLogout} />
      </PageLayout>
      <SettingsNavToolbar onLogout={handleLogout} />
    </>
  );
}
