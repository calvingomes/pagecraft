import type { ReactNode } from "react";

export type TogglePillOption<T extends string> = {
  value: T;
  label: ReactNode;
  ariaLabel?: string;
};

export type TogglePillProps<T extends string> = {
  options: TogglePillOption<T>[];
  value: T;
  onChange: (value: T) => void;
  variant?: "default" | "dark" | "toolbar";
  showBackground?: boolean;
  fullWidth?: boolean;
};
