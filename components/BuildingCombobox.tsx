"use client";

import { useEffect, useRef, useState } from "react";
import styles from "@/app/page.module.css";
import { useDropdown } from "@/hooks/useDropdown";

type BuildingComboboxProps = {
  buildings: string[];
  selectedBuilding: string;
  onChange: (building: string) => void;
};

function labelFor(building: string): string {
  return building ? `Building ${building}` : "";
}

export function BuildingCombobox({
  buildings,
  selectedBuilding,
  onChange,
}: BuildingComboboxProps) {
  const [query, setQuery] = useState(labelFor(selectedBuilding));
  const inputRef = useRef<HTMLInputElement>(null);

  const normalizedQuery = query.trim().toLowerCase().replace(/^building\s*/, "");
  const filtered = normalizedQuery
    ? buildings.filter(b => b.toLowerCase().includes(normalizedQuery))
    : buildings;

  const selectBuilding = (building: string) => {
    onChange(building);
    setQuery(labelFor(building));
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
    itemCount: filtered.length,
    onSelect: index => {
      if (filtered[index]) selectBuilding(filtered[index]);
    },
  });

  // Whenever the dropdown closes — by picking an option, pressing Escape,
  // or clicking outside — fall back to showing the current selection, so
  // stray unsubmitted search text never lingers in the input.
  useEffect(() => {
    if (!open) setQuery(labelFor(selectedBuilding));
  }, [open, selectedBuilding]);

  const clearSelection = () => {
    onChange("");
    setQuery("");
    setOpen(true);
    inputRef.current?.focus();
  };

  return (
    <div className={styles.combobox} ref={containerRef}>
      <div className={styles.comboboxInputRow}>
        <input
          ref={inputRef}
          type="text"
          role="combobox"
          aria-expanded={open}
          aria-autocomplete="list"
          autoComplete="off"
          placeholder="Search building (e.g. 22, 24)"
          value={query}
          onChange={e => {
            setQuery(e.target.value);
            setOpen(true);
            setHighlighted(0);
            if (selectedBuilding) onChange("");
          }}
          onFocus={() => setOpen(true)}
          onKeyDown={handleKeyDown}
        />
        {selectedBuilding && (
          <button
            type="button"
            className={styles.comboboxClear}
            onClick={clearSelection}
            aria-label="Clear building"
          >
            ×
          </button>
        )}
      </div>

      {open && (
        <ul className={styles.comboboxList}>
          {filtered.length === 0 && (
            <li className={styles.comboboxEmpty}>No matching buildings</li>
          )}
          {filtered.map((b, i) => (
            <li
              key={b}
              className={`${styles.comboboxOption} ${
                i === highlighted ? styles.comboboxOptionActive : ""
              }`}
              onMouseEnter={() => setHighlighted(i)}
              onMouseDown={e => {
                e.preventDefault();
                selectBuilding(b);
              }}
            >
              Building {b}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
