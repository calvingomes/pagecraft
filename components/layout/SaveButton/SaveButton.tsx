"use client";

import { Save } from "lucide-react";
import { Button } from "@/components/ui/Button/Button";

type SaveButtonProps = {
  onSave: () => Promise<void>;
  saving: boolean;
};

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
