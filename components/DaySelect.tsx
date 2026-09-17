"use client";

import { useEffect, useRef, useState } from "react";
import styles from "@/app/page.module.css";
import type { DayCode } from "@/lib/time";

const DAY_OPTIONS: { code: DayCode; label: string }[] = [
  { code: "U", label: "Sun" },
  { code: "M", label: "Mon" },
  { code: "T", label: "Tue" },
  { code: "W", label: "Wed" },
  { code: "R", label: "Thu" },
];

type DaySelectProps = {
  selectedDay: DayCode;
  onChange: (day: DayCode) => void;
  todayCode?: DayCode;
};

export function DaySelect({ selectedDay, onChange, todayCode }: DaySelectProps) {
  const [open, setOpen] = useState(false);
  const [highlighted, setHighlighted] = useState(() =>
    Math.max(DAY_OPTIONS.findIndex(d => d.code === selectedDay), 0)
  );
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleOutsideClick(e: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
      }
    }

    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, []);

  const selectDay = (code: DayCode) => {
    onChange(code);
    setOpen(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLButtonElement>) => {
    if (!open) {
      if (e.key === "ArrowDown" || e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        setOpen(true);
      }
      return;
    }

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setHighlighted(i => Math.min(i + 1, DAY_OPTIONS.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setHighlighted(i => Math.max(i - 1, 0));
    } else if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      selectDay(DAY_OPTIONS[highlighted].code);
    } else if (e.key === "Escape") {
      setOpen(false);
    }
  };

  const current = DAY_OPTIONS.find(d => d.code === selectedDay);

  return (
    <div className={styles.combobox} ref={containerRef}>
      <div className={styles.comboboxInputRow}>
        <button
          type="button"
          role="combobox"
          aria-expanded={open}
          aria-haspopup="listbox"
          className={styles.comboboxTrigger}
          onClick={() => setOpen(o => !o)}
          onKeyDown={handleKeyDown}
        >
          {current?.label}
          {current?.code === todayCode ? " (Today)" : ""}
        </button>
        <span className={styles.comboboxCaret}>▾</span>
      </div>

      {open && (
        <ul className={styles.comboboxList} role="listbox">
          {DAY_OPTIONS.map((d, i) => (
            <li
              key={d.code}
              role="option"
              aria-selected={d.code === selectedDay}
              className={`${styles.comboboxOption} ${
                i === highlighted ? styles.comboboxOptionActive : ""
              }`}
              onMouseEnter={() => setHighlighted(i)}
              onMouseDown={e => {
                e.preventDefault();
                selectDay(d.code);
              }}
            >
              {d.label}
              {d.code === todayCode ? " (Today)" : ""}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
