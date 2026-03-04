export type OverlayPopupProps = {
  open: boolean;
  title: string;
  message: string;
  showCloseButton?: boolean;
  onClose?: () => void;
};
