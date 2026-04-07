export type AuthMode = "signup" | "signin";

export type AuthViewProps = {
  handleOAuthSignIn: (provider: "google" | "github" | "figma", username?: string) => Promise<void>;
  initialUsername?: string;
};
