"use client";

import React, { useState } from "react";
import { ArrowRight } from "lucide-react";
import { useRouter } from "next/navigation";
import { ThemeButton } from "../ThemeButton/ThemeButton";
import styles from "./ClaimInput.module.css";

export const ClaimInput = () => {
  const router = useRouter();
  const [username, setUsername] = useState("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
      .toLowerCase()
      .replace(/[^a-z0-9-]/g, "");

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
        <span className={styles.prefix}>pagecraft.com/</span>

        <input
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
          label="Claim Page"
          cta={handleSubmit}
          icon={ArrowRight}
          bgColor="#f6d045"
          iconCircle={false}
        />
      </div>
    </form>
  );
};