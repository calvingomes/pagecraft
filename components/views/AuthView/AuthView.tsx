"use client";

import { useState } from "react";
import Image from "next/image";
import { ArrowRight } from "lucide-react";
import type { AuthMode, AuthViewProps } from "./AuthView.types";
import { ThemeButton } from "@/components/ui/ThemeButton/ThemeButton";
import { TogglePill } from "@/components/ui/TogglePill/TogglePill";
import { useUsernameAvailability } from "@/hooks/useUsernameAvailability";
import styles from "./AuthView.module.css";

const AuthView = ({ handleGoogleSignIn, initialUsername }: AuthViewProps) => {
  const [mode, setMode] = useState<AuthMode>(
    initialUsername ? "signup" : "signin",
  );
  const [username, setUsername] = useState(initialUsername ?? "");
  const availabilityStatus = useUsernameAvailability(username);

  const isSignUp = mode === "signup";
  const canProceed =
    !isSignUp ||
    (username.trim().length >= 3 && availabilityStatus === "available");

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
            Your link.
            <br />
            <span className={styles.taglineAccent}>Your brand.</span>
          </h1>
          <p className={styles.leftSubtitle}>One link for everything you do.</p>
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
          <TogglePill<AuthMode>
            value={mode}
            onChange={setMode}
            variant="dark"
            options={[
              { value: "signup", label: "Sign up" },
              { value: "signin", label: "Sign in" },
            ]}
          />

          <div className={styles.header}>
            <h1 className={styles.title}>
              {isSignUp ? "Create your page" : "Welcome back"}
            </h1>
            <p className={styles.subtitle}>
              {isSignUp
                ? "Get your own link-in-bio page in seconds."
                : "Sign in to continue to your PageCraft."}
            </p>
          </div>

          {/* Username input — sign-up only */}
          {isSignUp && (
            <>
              <div
                className={`${styles.usernameInputWrapper} ${
                  availabilityStatus === "available" ? styles.statusAvailable : ""
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
                className={`${styles.statusMessage} ${
                  availabilityStatus === "available"
                    ? styles.statusMessageAvailable
                    : ""
                } ${
                  availabilityStatus === "taken"
                    ? styles.statusMessageTaken
                    : ""
                } ${
                  availabilityStatus === "checking"
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

          <ThemeButton
            label={
              isSignUp
                ? "Create an account with Google"
                : "Continue with Google"
            }
            cta={() => handleGoogleSignIn(username)}
            bgColor={
              canProceed ? "var(--color-yellow)" : "var(--color-light-grey)"
            }
            textColor={
              canProceed ? "var(--color-white)" : "var(--color-mid-grey)"
            }
            iconCircle={false}
            icon={ArrowRight}
            disabled={!canProceed}
          />
        </div>
      </div>
    </div>
  );
};

export default AuthView;
