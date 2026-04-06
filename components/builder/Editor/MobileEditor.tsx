"use client";

import { ProfileSidebar } from "@/components/layout/ProfileSidebar/ProfileSidebar";
import { BlockCanvas } from "@/components/builder/BlockCanvas/BlockCanvas";
import { PageLayout } from "@/components/layout/PageLayout/PageLayout";
import { LinkShare } from "@/components/builder/LinkShare/LinkShare";
import { MobileBlockToolbar } from "@/components/builder/HoverToolbar/MobileBlockToolbar/MobileBlockToolbar";
import { Toolbar } from "@/components/builder/Toolbars/Toolbar";
import { useEditorStore } from "@/stores/editor-store";
import type { EditorLayoutProps } from "./Editor.types";
import styles from "../../../app/editor/editor.module.css";

export const MobileEditor = ({
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
  onAddBlock,
  onLogout,
  setBackground,
  setSidebarPosition,
}: EditorLayoutProps) => {
  const selectedBlockId = useEditorStore((s) => s.selectedBlockId);

  return (
    <div className={styles.editorRoot}>
      <PageLayout
        background={background}
        sidebarPosition={sidebarPosition}
        previewViewport="mobile"
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
      
      {!!selectedBlockId && (
        <MobileBlockToolbar />
      )}
      
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
        showSidebarPositionControls={false}
        onLogout={onLogout}
      />
    </div>
  );
};
