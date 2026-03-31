export type AuthMode = "signup" | "signin";

export type AuthViewProps = {
  handleGoogleSignIn: (username?: string) => Promise<void>;
  initialUsername?: string;
};
