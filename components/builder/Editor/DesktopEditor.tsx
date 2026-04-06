"use client";

import { ProfileSidebar } from "@/components/layout/ProfileSidebar/ProfileSidebar";
import { BlockCanvas } from "@/components/builder/BlockCanvas/BlockCanvas";
import { Toolbar } from "@/components/builder/Toolbars/Toolbar";
import { PageLayout } from "@/components/layout/PageLayout/PageLayout";
import { LinkShare } from "@/components/builder/LinkShare/LinkShare";
import type { EditorLayoutProps } from "./Editor.types";
import styles from "../../../app/editor/editor.module.css";

export const DesktopEditor = ({
  username,
  isSaving,
  background,
  sidebarPosition,
  displayName,
  bioHtml,
  avatarUrl,
  avatarShape,
  setDisplayName,
  setBioHtml,
  setAvatarUrl,
  setAvatarShape,
  setBackground,
  setSidebarPosition,
  onAddBlock,
  onLogout,
  previewView = "desktop",
  setPreviewView,
  isDesktopEditing = true,
}: EditorLayoutProps) => {
  return (
    <div className={styles.editorRoot}>
      <PageLayout
        background={background}
        sidebarPosition={sidebarPosition}
        previewViewport={previewView}
        framedMobilePreview
        isEditor
      >
        <ProfileSidebar
          variant="editor"
          displayName={displayName}
          bioHtml={bioHtml}
          onChangeDisplayName={setDisplayName}
          onChangeBioHtml={setBioHtml}
          avatarUrl={avatarUrl}
          avatarShape={avatarShape}
          onChangeAvatarUrl={setAvatarUrl}
          onChangeAvatarShape={setAvatarShape}
        />
        <BlockCanvas editable />
      </PageLayout>
      <LinkShare 
        username={username} 
        isSaving={isSaving} 
      />
      <Toolbar
        onAddBlock={onAddBlock}
        onChangeBackground={setBackground}
        onChangeSidebarPosition={setSidebarPosition}
        background={background}
        sidebarPosition={sidebarPosition}
        showSidebarPositionControls={isDesktopEditing}
        previewViewport={previewView}
        onViewportChange={setPreviewView}
        onLogout={onLogout}
      />
    </div>
  );
};
