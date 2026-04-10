"use client";

import * as Label from "@radix-ui/react-label";
import React, { useState, useId } from "react";
import { ArrowRight } from "lucide-react";
import { useRouter } from "next/navigation";
import { ThemeButton } from "../ThemeButton/ThemeButton";
import { VISUALLY_HIDDEN_STYLE } from "@/lib/utils/visuallyHidden";
import styles from "./ClaimInput.module.css";

export const ClaimInput = () => {
  const router = useRouter();
  const generatedId = useId();
  const [username, setUsername] = useState("");
  const inputId = `claim-username-input-${generatedId}`;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, "");

    setUsername(value);
  };

  const handleSubmit = (e?: React.FormEvent<HTMLFormElement>) => {
    e?.preventDefault();
    if (!username) return;
    router.push(`/auth?username=${encodeURIComponent(username)}`);
  };

  return (
    <form className={styles.form} onSubmit={handleSubmit}>
      <Label.Root className={styles.inputWrapper} htmlFor={inputId}>
        <span className={styles.prefix}>pagecraft.me/</span>
        <span style={VISUALLY_HIDDEN_STYLE}>Username</span>

        <input
          id={inputId}
          type="text"
          value={username}
          onChange={handleChange}
          placeholder="your-name"
          className={styles.input}
          required
        />
      </Label.Root>

      <div className={styles.buttonWrapper}>
        <ThemeButton
          label="Claim"
          cta={handleSubmit}
          trackingEvent="claim_cta_click"
          icon={ArrowRight}
          bgColor="var(--color-yellow)"
          size="large"
        />
      </div>
    </form>
  );
};
