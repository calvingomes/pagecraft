"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Swiper, SwiperSlide } from "swiper/react";
import { Pagination, Autoplay, EffectFade } from "swiper/modules";
import "swiper/css";
import "swiper/css/pagination";
import "swiper/css/effect-fade";

import styles from "./AuthView.module.css";
import type { AuthMode, AuthViewProps } from "./AuthView.types";

const CAROUSEL_SLIDES = [
  {
    id: 1,
    image:
      "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=2564&auto=format&fit=crop",
    title: "Capturing Moments, Creating Memories",
  },
  {
    id: 2,
    image:
      "https://images.unsplash.com/photo-1614850523459-c2f4c699c52e?q=80&w=2670&auto=format&fit=crop",
    title: "Design Your Perfect Space",
  },
  {
    id: 3,
    image:
      "https://images.unsplash.com/photo-1618005198919-d3d4b5a92ead?q=80&w=2574&auto=format&fit=crop",
    title: "Share Your Story With The World",
  },
];

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
      {/* Left Side: Carousel */}
      <div className={styles.carouselSection}>
          <div className={styles.carouselLogo}>PageCraft</div>
          <Link href="/home" className={styles.backLink}>
            Back to website →
          </Link>

          <Swiper
            modules={[Pagination, Autoplay, EffectFade]}
            pagination={{ clickable: true }}
            autoplay={{ delay: 5000 }}
            effect="fade"
            loop={true}
            className={styles.swiperContainer}
          >
            {CAROUSEL_SLIDES.map((slide) => (
              <SwiperSlide key={slide.id}>
                <Image
                  src={slide.image}
                  alt={slide.title}
                  fill
                  className={styles.slideImage}
                  priority={slide.id === 1}
                />
                <div className={styles.slideOverlay} />
                <div className={styles.slideContent}>
                  <h2 className={styles.slideTitle}>{slide.title}</h2>
                </div>
              </SwiperSlide>
            ))}
          </Swiper>
      </div>

      {/* Right Side: Form */}
      <div className={styles.formSection}>
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

          {/* Username input — Sign Up only, always shown */}
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
              <input
                type="email"
                placeholder="Email address"
                className={styles.emailInput}
              />
              <input
                type="password"
                placeholder="Password"
                className={styles.emailInput}
              />
              <input
                type="password"
                placeholder="Confirm password"
                className={styles.emailInput}
              />
            </div>
          )}
          {!isSignUp && (
            <div className={styles.emailInputWrapper}>
              <input
                type="email"
                placeholder="Email address"
                className={styles.emailInput}
              />
              <input
                type="password"
                placeholder="Password"
                className={styles.emailInput}
              />
            </div>
          )}
          */}

          {/* Divider */}
          {/* <div className={styles.divider}>
            <span className={styles.dividerLine} />
            <span className={styles.dividerText}>or</span>
            <span className={styles.dividerLine} />
          </div> */}

          {/* Google button */}
          <button
            onClick={handleGoogleSignIn}
            className={styles.googleButton}
            disabled={!canProceed}
          >
            {isSignUp ? "Create an account with Google" : "Continue with Google"}
          </button>
        </div>
    </div>
  );
};

export default AuthView;
