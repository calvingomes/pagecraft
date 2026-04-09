"use client";

import { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { ArrowRight } from "lucide-react";
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
  const { initialUsername } = props;
  const router = useRouter();
  const { user, setUsername: setUsernameInStore } = useAuthStore();

  const [mode, setMode] = useState<AuthMode>(() => {
    if (user && !user.user_metadata?.username) return "on-boarding";
    if (initialUsername) return "signup";
    return "signin";
  });
  const [username, setUsername] = useState(initialUsername ?? "");
  const [isCompleting, setIsCompleting] = useState(false);
  const availabilityStatus = useUsernameAvailability(username);

  const handleOAuthSignIn = async (provider: "google" | "github" | "figma", username?: string) => {
    const usernameToClaim = mode === "signup" ? username : undefined;
    await AuthService.signInWithOAuth(provider, usernameToClaim);
  };

  const isSignUp = mode === "signup";
  const isOnboarding = mode === "on-boarding";
  const isSignIn = mode === "signin";

  const canProceed =
    isSignIn ||
    (username.trim().length >= 3 && availabilityStatus === "available");

  const handleCompleteOnboarding = async () => {
    if (!user || !canProceed || isCompleting) return;

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

          {isOnboarding ? (
            <div className={styles.onboardingActions}>
              <ThemeButton
                label={isCompleting ? "Creating your page..." : "Claim & Continue"}
                cta={handleCompleteOnboarding}
                bgColor="var(--color-yellow)"
                textColor="var(--color-black)"
                size="medium"
                buttonWidth="full"
                disabled={!canProceed || isCompleting}
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
                bgColor="color-mix(in srgb, #ea4335 5%, white)"
                textColor="var(--color-darker-grey)"
                borderColor="color-mix(in srgb, #ea4335 15%, #dcdcdc)"
                icon={GoogleIcon}
                size="medium"
                buttonWidth="full"
                disabled={!canProceed}
              />
              <ThemeButton
                label="GitHub"
                cta={() => handleOAuthSignIn("github", username)}
                bgColor="color-mix(in srgb, #0070f3 5%, white)"
                textColor="var(--color-darker-grey)"
                borderColor="color-mix(in srgb, #0070f3 15%, #dcdcdc)"
                icon={GithubIcon}
                size="medium"
                buttonWidth="full"
                disabled={!canProceed}
              />
              {/* will enable it once figma approves app */}
              {/* <ThemeButton
              label="Figma"
              cta={() => handleOAuthSignIn("figma", username)}
              bgColor="color-mix(in srgb, #a259ff 5%, white)"
              textColor="var(--color-darker-grey)"
              borderColor="color-mix(in srgb, #a259ff 15%, #dcdcdc)"
              icon={FigmaIcon}
              size="medium"
              buttonWidth="full"
              disabled={!canProceed}
            /> */}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AuthView;
