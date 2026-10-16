"use client";

import { useEffect, useRef, useState } from "react";
import { Search, X } from "lucide-react";
import { useDropdown } from "@/hooks/useDropdown";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { dropdownListClass, dropdownOptionClass } from "./dropdownStyles";

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
    <div className="relative" ref={containerRef}>
      <div className="relative flex items-center">
        <Search className="pointer-events-none absolute left-3 size-4 text-muted-foreground" />
        <Input
          ref={inputRef}
          type="text"
          role="combobox"
          aria-expanded={open}
          aria-autocomplete="list"
          autoComplete="off"
          placeholder="Building, e.g. 22"
          value={query}
          className="h-10 bg-surface pr-10 pl-9 dark:bg-surface"
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
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            className="absolute right-1.5 rounded-full text-muted-foreground"
            onClick={clearSelection}
            aria-label="Clear building"
          >
            <X />
          </Button>
        )}
      </div>

      {open && (
        <ul className={dropdownListClass}>
          {filtered.length === 0 && (
            <li className="px-2.5 py-6 text-center text-sm text-muted-foreground">
              No matching buildings
            </li>
          )}
          {filtered.map((b, i) => (
            <li
              key={b}
              className={dropdownOptionClass(i === highlighted)}
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
