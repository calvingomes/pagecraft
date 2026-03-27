"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight } from "lucide-react";
import type { AuthMode, AuthViewProps } from "./AuthView.types";
import { ThemeButton } from "@/components/ui/ThemeButton/ThemeButton";
import { TogglePill } from "@/components/ui/TogglePill/TogglePill";
import styles from "./AuthView.module.css";

const AuthView = ({ handleGoogleSignIn, initialUsername }: AuthViewProps) => {
  const [mode, setMode] = useState<AuthMode>(
    initialUsername ? "signup" : "signin"
  );
  const [username, setUsername] = useState(initialUsername ?? "");

  const isSignUp = mode === "signup";
  const canProceed = !isSignUp || username.trim().length > 0;

  const handleUsernameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUsername(
      e.target.value
        .toLowerCase()
        .replace(/[^a-z0-9-]/g, "")
    );
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

        <div className={styles.topLeftRow}>
          <div className={styles.wordmark}>PageCraft</div>
          <Link href="/home" className={styles.backLink}>
            ← Back to home
          </Link>
        </div>

        <div className={styles.leftContent}>
          <h1 className={styles.tagline}>
            Your link.<br />
            <span className={styles.taglineAccent}>Your brand.</span>
          </h1>
          <p className={styles.leftSubtitle}>
            One link for everything you do.
          </p>
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
            <div className={styles.usernameInputWrapper}>
              <span className={styles.usernamePrefix}>pagecraft-psi.vercel.app/</span>
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
          )}

          <ThemeButton
            label={isSignUp ? "Create an account with Google" : "Continue with Google"}
            cta={handleGoogleSignIn}
            bgColor={canProceed ? "#EF9F27" : "#e5e7eb"}
            textColor={canProceed ? "#ffffff" : "#0e220e"}
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
