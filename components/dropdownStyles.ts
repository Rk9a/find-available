import { cn } from "@/lib/utils";

// Shared popover-style classes for the custom dropdowns (BuildingCombobox,
// DaySelect), matching shadcn's popover/command look.
export const dropdownListClass =
  "absolute inset-x-0 top-[calc(100%+6px)] z-20 max-h-56 overflow-y-auto rounded-lg bg-popover p-1 text-popover-foreground shadow-md ring-1 ring-foreground/10 animate-in fade-in-0 zoom-in-95 duration-100";

export function dropdownOptionClass(active: boolean) {
  return cn(
    "flex cursor-pointer items-center justify-between rounded-md px-2.5 py-2 text-sm select-none",
    active && "bg-accent text-accent-foreground"
  );
}
