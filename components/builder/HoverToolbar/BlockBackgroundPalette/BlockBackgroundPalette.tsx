"use client";

import React, { useState } from "react";
import * as RadioGroup from "@radix-ui/react-radio-group";
import { Ban } from "lucide-react";
import styles from "./BlockBackgroundPalette.module.css";

const PREDEFINED_COLORS = [
  { id: "white", value: "var(--color-block-bg-white)" },
  { id: "light-grey", value: "var(--color-block-bg-light-grey)" },
  { id: "sky", value: "var(--color-block-bg-sky)" },
  { id: "blue", value: "var(--color-block-bg-blue)" },
  { id: "indigo", value: "var(--color-block-bg-indigo)" },
  { id: "yellow", value: "var(--color-block-bg-yellow)" },
  { id: "orange", value: "var(--color-block-bg-orange)" },
  { id: "red", value: "var(--color-block-bg-red)" },
  { id: "dark-grey", value: "var(--color-block-bg-dark-grey)" },
  { id: "black", value: "var(--color-block-bg-black)" },
  { id: "lavender", value: "var(--color-block-bg-lavender)" },
  { id: "purple", value: "var(--color-block-bg-purple)" },
  { id: "pink", value: "var(--color-block-bg-pink)" },
  { id: "mint", value: "var(--color-block-bg-mint)" },
  { id: "green", value: "var(--color-block-bg-green)" },
  { id: "dark-green", value: "var(--color-block-bg-dark-green)" },
];

interface BlockBackgroundPaletteProps {
  currentValue?: string;
  onChange: (value: string | null) => void;
  showTransparentOption?: boolean;
}

export function BlockBackgroundPalette({
  currentValue,
  onChange,
  showTransparentOption = false,
}: BlockBackgroundPaletteProps) {
  const [hexInput, setHexInput] = useState(currentValue?.startsWith("#") ? currentValue : "");
  const [prevValue, setPrevValue] = useState(currentValue);

  if (currentValue !== prevValue) {
    setPrevValue(currentValue);
    setHexInput(currentValue?.startsWith("#") ? currentValue : "");
  }

  const handleHexChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const next = e.target.value;
    setHexInput(next);
    if (next.match(/^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/)) {
      onChange(next);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.grid}>

        <RadioGroup.Root
          className={styles.radioGroup}
          value={currentValue === undefined ? "transparent" : (currentValue || "")}
          onValueChange={(val) => {
            if (val === "transparent") {
              onChange(null);
            } else {
              onChange(val);
            }
            setHexInput("");
          }}
        >
          {showTransparentOption && (
            <RadioGroup.Item
              key="transparent"
              value="transparent"
              className={`${styles.swatch} ${styles.transparentSwatch} ${
                currentValue === undefined ? styles.selected : ""
              }`}
              aria-label="No background"
            >
              <Ban size={16} className={styles.noneIcon} />
            </RadioGroup.Item>
          )}
          {PREDEFINED_COLORS.map((color) => (
            <RadioGroup.Item
              key={color.id}
              value={color.value}
              className={`${styles.swatch} ${
                currentValue === color.value ? styles.selected : ""
              }`}
              style={{ backgroundColor: color.value }}
              aria-label={`Select ${color.id}`}
            />
          ))}
        </RadioGroup.Root>
      </div>

      <div className={styles.inputContainer}>
        <input
          type="text"
          className={styles.hexInput}
          value={hexInput}
          onChange={handleHexChange}
          placeholder="#FFFFFF"
          spellCheck={false}
        />
      </div>
    </div>
  );
}
