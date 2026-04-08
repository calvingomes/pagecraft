"use client";

import { useRouter } from "next/navigation";
import { useAuthStore } from "@/stores/auth-store";
import { useEditorStore } from "@/stores/editor-store";
import { EditorProvider } from "@/contexts/EditorContext";
import { AuthService } from "@/lib/services/auth.client";
import { useViewportEditor } from "@/hooks/useViewportEditor";
import { useEditorData } from "@/hooks/useEditorData";
import { PageLoader } from "@/components/ui/PageLoader/PageLoader";
import { DesktopEditor } from "@/components/builder/Editor/DesktopEditor";
import { MobileEditor } from "@/components/builder/Editor/MobileEditor";

export default function EditorPage() {
  const router = useRouter();
  const { username, logout } = useAuthStore();
  const { 
    selectedBlockId, 
    focusedBlockId, 
    selectBlock, 
    focusBlock 
  } = useEditorStore();

  const data = useEditorData();
  const viewport = useViewportEditor(data.desktopSidebarPosition);

  const handleLogout = async () => {
    await AuthService.signOut();
    logout();
    router.replace("/auth");
  };

  if (!viewport.viewportResolved || !data.isEditorDataReady) {
    return (
      <PageLoader 
        label="Loading editor" 
        backgroundColor="var(--color-lighter-grey)" 
      />
    );
  }

  const editorProps = {
    username: username ?? null,
    isSaving: data.isSaving,
    background: data.background,
    sidebarPosition: viewport.effectiveSidebarPosition,
    displayName: data.displayName,
    bioHtml: data.bioHtml,
    avatarUrl: data.avatarUrl,
    avatarShape: data.avatarShape,
    updatedAt: data.updatedAt,
    setDisplayName: data.setDisplayName,
    setBioHtml: data.setBioHtml,
    setAvatarUrl: data.setAvatarUrl,
    setAvatarShape: data.setAvatarShape,
    setBackground: data.setBackground,
    setSidebarPosition: data.setDesktopSidebarPosition,
    onAddBlock: data.onAddBlock,
    onSave: data.onSave,
    onLogout: handleLogout,
  };

  return (
    <EditorProvider
      username={username ?? null}
      selectedBlockId={selectedBlockId}
      focusedBlockId={focusedBlockId}
      onUpdateBlock={data.onUpdateBlock}
      onRemoveBlock={data.onRemoveBlock}
      onSelectBlock={selectBlock}
      onFocusBlock={focusBlock}
      isActualMobile={viewport.isActualMobile}
    >
      {viewport.isActualMobile ? (
        <MobileEditor {...editorProps} />
      ) : (
        <DesktopEditor
          {...editorProps}
          previewView={viewport.previewView}
          setPreviewView={viewport.setPreviewView}
          isDesktopEditing={viewport.isDesktopEditing}
        />
      )}
    </EditorProvider>
  );
}
