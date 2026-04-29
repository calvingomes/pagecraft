"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { ArrowRight, Eye, EyeOff } from "lucide-react";
import type { AuthMode, AuthViewProps } from "./AuthView.types";
import { ThemeButton } from "@/components/ui/ThemeButton/ThemeButton";
import { TogglePill } from "@/components/ui/TogglePill/TogglePill";
import { useUsernameAvailability } from "@/hooks/useUsernameAvailability";
import { useAuthStore } from "@/stores/auth-store";
import { AuthService } from "@/lib/services/auth.client";
import { PageService } from "@/lib/services/page.client";
import { BlockService } from "@/lib/services/block.client";
import styles from "./AuthView.module.css";

const GoogleIcon = (props: Partial<React.ComponentProps<typeof Image>>) => (
  <Image
    src="/svg/google.svg"
    alt="Google"
    width={18}
    height={18}
    {...props}
  />
);
const GithubIcon = (props: Partial<React.ComponentProps<typeof Image>>) => (
  <Image
    src="/svg/github.svg"
    alt="GitHub"
    width={18}
    height={18}
    {...props}
  />
);
// const FigmaIcon = (props: Partial<React.ComponentProps<typeof Image>>) => (
//   <Image
//     src="/svg/figma.svg"
//     alt="Figma"
//     width={18}
//     height={18}
//     {...props}
//   />
// );

const AuthView = (props: AuthViewProps) => {
  const { initialUsername, initialMode } = props;
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { user, setUsername: setUsernameInStore } = useAuthStore();

  const [mode, setMode] = useState<AuthMode>(() => {
    if (user && !user.user_metadata?.username) return "on-boarding";
    if (initialMode) return initialMode;
    if (initialUsername) return "signup";
    return "signin";
  });
  const [username, setUsername] = useState(initialUsername ?? "");
  const [isCompleting, setIsCompleting] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [unconfirmedEmail, setUnconfirmedEmail] = useState<string | null>(null);
  const availabilityStatus = useUsernameAvailability(username);

  // Clear error message when switching modes or typing
  useEffect(() => {
    setError(null);
  }, [mode, email, password, username]);

  // Keep mode reflected in query params for direct links and refresh persistence.
  useEffect(() => {
    if (mode === "on-boarding") return;

    const currentMode = searchParams.get("mode");
    if (currentMode === mode) return;

    const next = new URLSearchParams(searchParams.toString());
    next.set("mode", mode);
    router.replace(`${pathname}?${next.toString()}`, { scroll: false });
  }, [mode, pathname, router, searchParams]);

  const handleOAuthSignIn = async (provider: "google" | "github" | "figma", username?: string) => {
    const usernameToClaim = mode === "signup" ? username : undefined;
    await AuthService.signInWithOAuth(provider, usernameToClaim);
  };

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!email || !password) {
      setError("Please fill in all fields.");
      return;
    }

    setIsLoading(true);

    try {
      if (mode === "signup") {
        if (!username || availabilityStatus !== "available") {
          setError("Please choose a valid username first.");
          setIsLoading(false);
          return;
        }

        const { data, error: signUpError } = await AuthService.signUpWithEmail(
          email,
          password,
          username
        );

        if (signUpError) throw signUpError;

        if (data.session) {
          // Instantly logged in (email confirmation disabled in Supabase)
          // Ensure we claim the username and create starter blocks
          await PageService.claimUsername(username, data.session.user.id);
          await BlockService.createStarterBlocks(username, data.session.user.id);
          await AuthService.updateUserMetadata({ username });

          setUsernameInStore(username);
          router.replace("/editor");
        } else {
          // Email confirmation required
          setUnconfirmedEmail(email);
        }
      } else {
        const { error: signInError } = await AuthService.signInWithEmail(
          email,
          password
        );

        if (signInError) throw signInError;
        router.replace("/editor");
      }
    } catch (err: unknown) {
      const error = err as { message?: string };
      setError(error.message || "Authentication failed.");
    } finally {
      setIsLoading(false);
    }
  };

  const isSignUp = mode === "signup";
  const isOnboarding = mode === "on-boarding";
  const isSignIn = mode === "signin";

  const hasValidUsername = username.trim().length >= 3 && availabilityStatus === "available";
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const hasValidEmail = emailRegex.test(email.trim());
  const hasValidSignInPassword = password.length >= 6;
  const hasValidSignUpPassword = password.length >= 8;

  const canSubmitEmail = isSignIn
    ? (hasValidEmail && hasValidSignInPassword)
    : (hasValidEmail && hasValidSignUpPassword && hasValidUsername);

  const canSubmitSocial = isSignIn ? true : hasValidUsername;
  const canSubmitOnboarding = hasValidUsername;

  const handleCompleteOnboarding = async () => {
    if (!user || !canSubmitOnboarding || isCompleting) return;

    setIsCompleting(true);
    try {
      await PageService.claimUsername(username, user.id);
      await BlockService.createStarterBlocks(username, user.id);
      await AuthService.updateUserMetadata({ username });

      setUsernameInStore(username);
      router.replace("/editor");
    } catch (error) {
      console.error("Onboarding failed:", error);
      setIsCompleting(false);
    }
  };

  const handleSignOut = async () => {
    await AuthService.signOut();
    setUsername("");
    setEmail("");
    setPassword("");
    setError(null);
    setUnconfirmedEmail(null);
    setMode("signin");
  };

  const handleUsernameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ""));
  };

  return (
    <div className={styles.authPageWrapper}>
      {/* Left Panel */}
      <div className={styles.leftPanel}>
        <Image
          src="/svg/hero-arcs.svg"
          alt=""
          fill
          className={styles.arcSvg}
          aria-hidden
        />

        <div className={styles.leftContent}>
          <h1 className={styles.tagline}>
            Your page
            <br />
            <span className={styles.taglineAccent}>is waiting.</span>
          </h1>
          <p className={styles.leftSubtitle}>Build a page that actually looks like you</p>
        </div>

        <div className={styles.rectStack}>
          <Image
            src="/svg/stacked-cards.svg"
            alt=""
            fill
            className={styles.rectImage}
            aria-hidden
          />
        </div>
      </div>

      <div className={styles.rightPanel}>
        <div className={styles.formContainer}>
          {!isOnboarding && (
            <TogglePill<AuthMode>
              value={mode}
              onChange={setMode}
              variant="dark"
              options={[
                { value: "signup", label: "Sign up" },
                { value: "signin", label: "Sign in" },
              ]}
            />
          )}

          <div className={styles.header}>
            <h1 className={styles.title}>
              {isOnboarding
                ? "One last thing!"
                : isSignUp
                  ? "Create your page"
                  : "Welcome back"}
            </h1>
            <p className={styles.subtitle}>
              {isOnboarding
                ? "Your page lives at pagecraft.me/you. What's it going to be?"
                : isSignUp
                  ? "Your page lives at pagecraft.me/you. What's it going to be?"
                  : "Sign in to continue to your PageCraft"}
            </p>
          </div>

          {unconfirmedEmail ? (
            <div className={styles.confirmationState}>
              <div className={styles.statusMessageAvailable}>
                Check your email! We&apos;ve sent a confirmation link to <strong>{unconfirmedEmail}</strong>.
              </div>
              <button className={styles.signOutLink} onClick={() => setUnconfirmedEmail(null)}>
                Back to sign in
              </button>
            </div>
          ) : (
            <div className={styles.formContent}>
              <form onSubmit={handleEmailAuth} className={styles.emailForm}>
                {/* Username input — sign-up or onboarding */}
                {(isSignUp || isOnboarding) && (
                  <>
                    <div
                      className={`${styles.usernameInputWrapper} ${availabilityStatus === "available" ? styles.statusAvailable : ""
                        } ${availabilityStatus === "taken" ? styles.statusTaken : ""}`}
                    >
                      <span className={styles.usernamePrefix}>pagecraft.me/</span>
                      <input
                        type="text"
                        value={username}
                        onChange={handleUsernameChange}
                        placeholder="your-name"
                        className={styles.usernameInput}
                        autoComplete="off"
                        spellCheck={false}
                      />
                    </div>

                    {/* Status Message */}
                    <div
                      className={`${styles.statusMessage} ${availabilityStatus === "available"
                        ? styles.statusMessageAvailable
                        : ""
                        } ${availabilityStatus === "taken"
                          ? styles.statusMessageTaken
                          : ""
                        } ${availabilityStatus === "checking"
                          ? styles.statusMessageChecking
                          : ""
                        }`}
                    >
                      {availabilityStatus === "checking" && "Checking availability..."}
                      {availabilityStatus === "available" && "Username available!"}
                      {availabilityStatus === "taken" && "This handle is already taken."}
                      {availabilityStatus === "error" && "Error checking availability."}
                    </div>
                  </>
                )}

                {/* Email and Password Fields */}
                {false && !isOnboarding && (
                  <div className={styles.credentialFields}>
                    <div className={styles.standardInputWrapper}>
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="Email address"
                        className={styles.usernameInput}
                        required
                      />
                    </div>
                    <div className={styles.standardInputWrapper}>
                      <input
                        type={showPassword ? "text" : "password"}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Password"
                        className={styles.usernameInput}
                        required
                        minLength={isSignUp ? 8 : 6}
                      />
                      <button
                        type="button"
                        className={styles.passwordToggle}
                        onClick={() => setShowPassword(!showPassword)}
                        aria-label={showPassword ? "Hide password" : "Show password"}
                      >
                        {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                      </button>
                    </div>

                    {error && (
                      <div className={styles.statusMessageTaken} style={{ marginTop: 0, marginBottom: 16 }}>
                        {error}
                      </div>
                    )}

                    <div className={styles.authSubmitButton}>
                      <ThemeButton
                        label={isSignUp ? (isLoading ? "Creating your account..." : "Create account") : (isLoading ? "Signing in..." : "Sign in")}
                        cta={() => { }}
                        type="submit"
                        bgColor="var(--color-yellow)"
                        textColor="var(--color-black)"
                        size="large"
                        disabled={!canSubmitEmail || isLoading}
                        icon={ArrowRight}
                      />
                    </div>

                    <div className={styles.divider}>
                      <span className={styles.dividerText}>or</span>
                    </div>
                  </div>
                )}
              </form>

              {isOnboarding ? (
                <div className={styles.onboardingActions}>
                  <ThemeButton
                    label={isCompleting ? "Creating your page..." : "Claim & Continue"}
                    cta={handleCompleteOnboarding}
                    bgColor="var(--color-yellow)"
                    textColor="var(--color-black)"
                    size="large"
                    disabled={!canSubmitOnboarding || isCompleting}
                    icon={ArrowRight}
                  />
                  <button className={styles.signOutLink} onClick={handleSignOut}>
                    Sign in with a different account
                  </button>
                </div>
              ) : (
                <div className={styles.socialContainer}>
                  <ThemeButton
                    label="Google"
                    cta={() => handleOAuthSignIn("google", username)}
                    bgColor="var(--color-white)"
                    textColor="var(--color-darker-grey)"
                    borderColor="color-mix(in srgb, #ea4335 15%, #dcdcdc)"
                    icon={GoogleIcon}
                    size="medium"
                    buttonWidth="full"
                    disabled={!canSubmitSocial || isLoading}
                  />
                  <ThemeButton
                    label="GitHub"
                    cta={() => handleOAuthSignIn("github", username)}
                    bgColor="var(--color-white)"
                    textColor="var(--color-darker-grey)"
                    borderColor="color-mix(in srgb, #0070f3 15%, #dcdcdc)"
                    icon={GithubIcon}
                    size="medium"
                    buttonWidth="full"
                    disabled={!canSubmitSocial || isLoading}
                  />
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AuthView;
