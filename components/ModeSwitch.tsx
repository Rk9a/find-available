"use client";

import styles from "@/app/page.module.css";

export type Mode = "room" | "building";

type ModeSwitchProps = {
  mode: Mode;
  onChange: (mode: Mode) => void;
};

export function ModeSwitch({ mode, onChange }: ModeSwitchProps) {
  return (
    <div className={styles.modeSwitch}>
      <button
        type="button"
        className={`${styles.modeButton} ${mode === "room" ? styles.activeMode : ""}`}
        onClick={() => onChange("room")}
      >
        By Room
      </button>

      <button
        type="button"
        className={`${styles.modeButton} ${mode === "building" ? styles.activeMode : ""}`}
        onClick={() => onChange("building")}
      >
        By Building
      </button>
    </div>
  );
}
