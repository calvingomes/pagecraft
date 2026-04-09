import type React from "react";
import type { LucideIcon } from "lucide-react";

export interface ThemeButtonProps {
  label: string;
  cta: (() => void) | ((e: React.FormEvent<HTMLFormElement>) => void) | string;
  icon?: LucideIcon | React.ElementType;
  bgColor: string;
  textColor?: string;
  borderColor?: string;
  buttonWidth?: string;
  disabled?: boolean;
  size?: "small" | "medium" | "large";
  trackingEvent?: string;
}
