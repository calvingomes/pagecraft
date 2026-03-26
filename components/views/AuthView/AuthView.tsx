"use client";

import { useState } from "react";
import Link from "next/link";
import type { AuthMode, AuthViewProps } from "./AuthView.types";
import { ThemeButton } from "@/components/ui/ThemeButton/ThemeButton";
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
        <Link href="/home" className={styles.backLink}>
          ← Back to home
        </Link>

        <div className={styles.leftContent}>
          <div className={styles.wordmark}>PageCraft</div>
          <p className={styles.tagline}>
            Your link.<br />Your brand.
          </p>
        </div>

        {/* Decorative stacked cards */}
        <div className={styles.cardStack}>
          <div className={`${styles.decorCard} ${styles.decorCard1}`} />
          <div className={`${styles.decorCard} ${styles.decorCard2}`} />
          <div className={`${styles.decorCard} ${styles.decorCard3}`} />
        </div>
      </div>

      {/* Right Panel */}
      <div className={styles.rightPanel}>
        {/* Mode Toggle */}
        <div className={styles.modeToggle}>
          <button
            type="button"
            className={`${styles.toggleBtn} ${isSignUp ? styles.toggleBtnActive : ""}`}
            onClick={() => setMode("signup")}
          >
            Sign up
          </button>
          <button
            type="button"
            className={`${styles.toggleBtn} ${!isSignUp ? styles.toggleBtnActive : ""}`}
            onClick={() => setMode("signin")}
          >
            Sign in
          </button>
        </div>

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
            <span className={styles.usernamePrefix}>pagecraft.com/</span>
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

        {/* Email/password inputs — UI only, uncomment when ready
        {isSignUp && (
          <div className={styles.emailInputWrapper}>
            <input type="email" placeholder="Email address" className={styles.emailInput} />
            <input type="password" placeholder="Password" className={styles.emailInput} />
            <input type="password" placeholder="Confirm password" className={styles.emailInput} />
          </div>
        )}
        {!isSignUp && (
          <div className={styles.emailInputWrapper}>
            <input type="email" placeholder="Email address" className={styles.emailInput} />
            <input type="password" placeholder="Password" className={styles.emailInput} />
          </div>
        )}
        */}

        <ThemeButton
          label={isSignUp ? "Create an account with Google" : "Continue with Google"}
          cta={handleGoogleSignIn}
          bgColor={canProceed ? "#f6d045" : "#e5e7eb"}
          textColor="#0e220e"
          iconCircle={false}
          disabled={!canProceed}
        />
      </div>
    </div>
  );
};

export default AuthView;
