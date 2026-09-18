"use client";

import { useEffect, useRef, useState } from "react";

type UseDropdownOptions = {
  itemCount: number;
  initialHighlighted?: number;
  /** Keys (besides ArrowDown/ArrowUp/Escape) that select the highlighted item when open, or open the list when closed. Defaults to ["Enter"] — pass ["Enter", " "] for button-style triggers, where Space is also expected to activate. */
  selectKeys?: string[];
  onSelect: (highlightedIndex: number) => void;
  onEscape?: () => void;
};

/**
 * Shared open/highlight/keyboard-nav/outside-click state for the small
 * custom dropdowns in this app (BuildingCombobox, DaySelect). Both render
 * their own trigger and list markup; this just owns the interaction state
 * so it isn't duplicated between them.
 */
export function useDropdown({
  itemCount,
  initialHighlighted = 0,
  selectKeys = ["Enter"],
  onSelect,
  onEscape,
}: UseDropdownOptions) {
  const [open, setOpen] = useState(false);
  const [highlighted, setHighlighted] = useState(initialHighlighted);
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

  function handleKeyDown(e: React.KeyboardEvent) {
    if (!open) {
      if (e.key === "ArrowDown" || selectKeys.includes(e.key)) {
        e.preventDefault();
        setOpen(true);
      }
      return;
    }

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setHighlighted(i => Math.min(i + 1, itemCount - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setHighlighted(i => Math.max(i - 1, 0));
    } else if (selectKeys.includes(e.key)) {
      e.preventDefault();
      onSelect(highlighted);
    } else if (e.key === "Escape") {
      setOpen(false);
      onEscape?.();
    }
  }

  return { open, setOpen, highlighted, setHighlighted, containerRef, handleKeyDown };
}
