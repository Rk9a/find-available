"use client";

import { useMemo } from "react";
import type { Section } from "@/lib/types";
import type { DayCode } from "@/lib/time";
import { getRoomAvailability } from "@/lib/availability";

export function useRoomStatuses(
  sections: Section[],
  selectedBuilding: string,
  selectedDay: DayCode,
  startTime: string,
  endTime: string
) {
  return useMemo(
    () =>
      getRoomAvailability(
        sections,
        selectedBuilding,
        selectedDay,
        Number(startTime),
        Number(endTime)
      ),
    [sections, selectedBuilding, selectedDay, startTime, endTime]
  );
}
