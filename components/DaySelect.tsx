"use client";

import styles from "@/app/page.module.css";
import { DAY_LABELS, type DayCode } from "@/lib/time";
import { useDropdown } from "@/hooks/useDropdown";

type DaySelectProps = {
  days: DayCode[];
  selectedDay: DayCode;
  onChange: (day: DayCode) => void;
  todayCode?: DayCode;
  disabled?: boolean;
};

export function DaySelect({
  days,
  selectedDay,
  onChange,
  todayCode,
  disabled,
}: DaySelectProps) {
  const selectDay = (code: DayCode) => {
    onChange(code);
    setOpen(false);
  };

  const {
    open,
    setOpen,
    highlighted,
    setHighlighted,
    containerRef,
    handleKeyDown,
  } = useDropdown({
    itemCount: days.length,
    initialHighlighted: Math.max(days.indexOf(selectedDay), 0),
    selectKeys: ["Enter", " "],
    onSelect: index => selectDay(days[index]),
  });

  return (
    <div className={styles.combobox} ref={containerRef}>
      <div className={styles.comboboxInputRow}>
        <button
          type="button"
          role="combobox"
          aria-expanded={open}
          aria-haspopup="listbox"
          className={styles.comboboxTrigger}
          disabled={disabled}
          onClick={() => setOpen(o => !o)}
          onKeyDown={handleKeyDown}
        >
          {DAY_LABELS[selectedDay]}
          {selectedDay === todayCode ? " (Today)" : ""}
        </button>
        <span className={styles.comboboxCaret}>▾</span>
      </div>

      {open && (
        <ul className={styles.comboboxList} role="listbox">
          {days.map((code, i) => (
            <li
              key={code}
              role="option"
              aria-selected={code === selectedDay}
              className={`${styles.comboboxOption} ${
                i === highlighted ? styles.comboboxOptionActive : ""
              }`}
              onMouseEnter={() => setHighlighted(i)}
              onMouseDown={e => {
                e.preventDefault();
                selectDay(code);
              }}
            >
              {DAY_LABELS[code]}
              {code === todayCode ? " (Today)" : ""}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
