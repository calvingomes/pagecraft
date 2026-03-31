import type React from "react";
import type { LucideIcon } from "lucide-react";

export interface ThemeButtonProps {
  label: string;
  cta: (() => void) | ((e: React.FormEvent) => void) | string;
  icon?: LucideIcon | React.ElementType;
  bgColor: string;
  textColor?: string;
  iconCircle?: boolean;
  buttonWidth?: string;
  disabled?: boolean;
}
