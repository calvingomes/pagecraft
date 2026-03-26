"use client";

import { Save } from "lucide-react";
import { Button } from "@/components/ui/Button/Button";
import type { SaveButtonProps } from "./SaveButton.types";

export function SaveButton({ onSave, saving }: SaveButtonProps) {
  return (
    <Button
      variant="secondary"
      onClick={onSave}
      isLoading={saving}
      rightIcon={!saving ? <Save size={18} /> : undefined}
    >
      Save
    </Button>
  );
}
