export type AuthMode = "signup" | "signin";

export type AuthViewProps = {
  handleGoogleSignIn: () => Promise<void>;
  initialUsername?: string;
};
