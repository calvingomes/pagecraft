import { OverlayPopup } from "@/components/layout/OverlayPopup/OverlayPopup";

type MobileEditorGuardProps = {
  open: boolean;
  message?: string;
  showCloseButton?: boolean;
  onClose?: () => void;
};

export const MobileEditorGuard = ({
  open,
  message = "Open the editor page on a tablet or a desktop to edit.",
  showCloseButton = false,
  onClose,
}: MobileEditorGuardProps) => {
  return (
    <OverlayPopup
      open={open}
      title="Editor unavailable on mobile"
      message={message}
      showCloseButton={showCloseButton}
      onClose={onClose}
    />
  );
};
