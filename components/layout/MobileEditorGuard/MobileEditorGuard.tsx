import { OverlayPopup } from "@/components/layout/OverlayPopup/OverlayPopup";
import type { MobileEditorGuardProps } from "./MobileEditorGuard.types";

export const MobileEditorGuard = ({
  open,
  message = "Open the editor page on a tablet or a desktop to edit.",
  onClose,
}: MobileEditorGuardProps) => {
  return (
    <OverlayPopup
      open={open}
      title="Editor unavailable on mobile"
      message={message}
      onClose={onClose}
    />
  );
};
