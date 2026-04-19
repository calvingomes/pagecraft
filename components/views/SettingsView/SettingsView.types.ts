import type { User } from "@supabase/supabase-js";
import type { CSSProperties } from "react";
import type { BlockWidthPreset } from "@/types/editor";

export type SettingsViewProps = {
  user: User;
  username: string;
  onLogout: () => Promise<void>;
};

export type FeedbackStatus = {
  kind: "success" | "error";
  message: string;
} | null;

export type FeedbackFormCardProps = {
  username: string;
  feedbackSubject: string;
  feedbackBody: string;
  isSubmitting: boolean;
  status: FeedbackStatus;
  onSubjectChange: (value: string) => void;
  onBodyChange: (value: string) => void;
  onSubmit: () => void;
  style?: CSSProperties;
};

export type CardPreset = BlockWidthPreset;
