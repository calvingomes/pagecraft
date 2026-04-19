export type AuthMode = "signup" | "signin" | "on-boarding";
export type AuthQueryMode = Exclude<AuthMode, "on-boarding">;

export type AuthViewProps = {
  initialUsername?: string;
  initialMode?: AuthQueryMode;
};
