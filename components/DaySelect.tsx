"use client";

import { Check, ChevronDown } from "lucide-react";
import { DAY_LABELS, type DayCode } from "@/lib/time";
import { useDropdown } from "@/hooks/useDropdown";
import { Button } from "@/components/ui/button";
import { dropdownListClass, dropdownOptionClass } from "./dropdownStyles";

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
    <div className="relative" ref={containerRef}>
      <Button
        type="button"
        variant="outline"
        role="combobox"
        aria-expanded={open}
        aria-haspopup="listbox"
        className="h-10 w-full justify-between border-input bg-surface px-3 font-normal dark:bg-surface"
        disabled={disabled}
        onClick={() => setOpen(o => !o)}
        onKeyDown={handleKeyDown}
      >
        <span className="truncate">
          {DAY_LABELS[selectedDay]}
          {selectedDay === todayCode ? " (Today)" : ""}
        </span>
        <ChevronDown className="text-muted-foreground" />
      </Button>

      {open && (
        <ul className={dropdownListClass} role="listbox">
          {days.map((code, i) => (
            <li
              key={code}
              role="option"
              aria-selected={code === selectedDay}
              className={dropdownOptionClass(i === highlighted)}
              onMouseEnter={() => setHighlighted(i)}
              onMouseDown={e => {
                e.preventDefault();
                selectDay(code);
              }}
            >
              <span>
                {DAY_LABELS[code]}
                {code === todayCode ? " (Today)" : ""}
              </span>
              {code === selectedDay && <Check className="size-4" />}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
