"use client";

import { useEffect, useRef, useState } from "react";
import styles from "@/app/page.module.css";

type BuildingComboboxProps = {
  buildings: string[];
  selectedBuilding: string;
  onChange: (building: string) => void;
};

export function BuildingCombobox({
  buildings,
  selectedBuilding,
  onChange,
}: BuildingComboboxProps) {
  const [query, setQuery] = useState(
    selectedBuilding ? `Building ${selectedBuilding}` : ""
  );
  const [open, setOpen] = useState(false);
  const [highlighted, setHighlighted] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setQuery(selectedBuilding ? `Building ${selectedBuilding}` : "");
  }, [selectedBuilding]);

  useEffect(() => {
    function handleOutsideClick(e: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
        setQuery(selectedBuilding ? `Building ${selectedBuilding}` : "");
      }
    }

    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, [selectedBuilding]);

  const normalizedQuery = query.trim().toLowerCase().replace(/^building\s*/, "");
  const filtered = normalizedQuery
    ? buildings.filter(b => b.toLowerCase().includes(normalizedQuery))
    : buildings;

  const selectBuilding = (building: string) => {
    onChange(building);
    setQuery(`Building ${building}`);
    setOpen(false);
  };

  const clearSelection = () => {
    onChange("");
    setQuery("");
    setOpen(true);
    inputRef.current?.focus();
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!open) {
      if (e.key === "ArrowDown" || e.key === "Enter") setOpen(true);
      return;
    }

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setHighlighted(i => Math.min(i + 1, filtered.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setHighlighted(i => Math.max(i - 1, 0));
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (filtered[highlighted]) selectBuilding(filtered[highlighted]);
    } else if (e.key === "Escape") {
      setOpen(false);
      setQuery(selectedBuilding ? `Building ${selectedBuilding}` : "");
    }
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
