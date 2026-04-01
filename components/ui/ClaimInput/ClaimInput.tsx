"use client";

import * as Label from "@radix-ui/react-label";
import React, { useState } from "react";
import { ArrowRight } from "lucide-react";
import { useRouter } from "next/navigation";
import { ThemeButton } from "../ThemeButton/ThemeButton";
import { VISUALLY_HIDDEN_STYLE } from "@/lib/utils/visuallyHidden";
import styles from "./ClaimInput.module.css";

export const ClaimInput = () => {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const inputId = "claim-username-input";

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, "");

    setUsername(value);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!username) return;
    router.push(`/auth?username=${encodeURIComponent(username)}`);
  };

  return (
    <form className={styles.form} onSubmit={handleSubmit}>
      <div className={styles.inputWrapper}>
        <span className={styles.prefix}>pagecraft.me/</span>
        <Label.Root htmlFor={inputId} style={VISUALLY_HIDDEN_STYLE}>
          Username
        </Label.Root>

        <input
          id={inputId}
          type="text"
          value={username}
          onChange={handleChange}
          placeholder="your-name"
          className={styles.input}
          required
        />
      </div>

      <div className={styles.buttonWrapper}>
        <ThemeButton
          label="Claim"
          cta={handleSubmit}
          icon={ArrowRight}
          bgColor="var(--color-yellow)"
        />
      </div>
    </form>
  );
};
