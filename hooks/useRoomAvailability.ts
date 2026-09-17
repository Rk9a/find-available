"use client";

import { useMemo } from "react";
import type { Section } from "@/lib/types";
import {
  getBuildings,
  getRoomsForBuilding,
  getRoomMeetings,
  buildWeeklySchedule,
} from "@/lib/availability";

export function useRoomAvailability(
  sections: Section[],
  selectedBuilding: string,
  selectedRoom: string
) {
  const buildings = useMemo(() => getBuildings(sections), [sections]);

  const rooms = useMemo(
    () => getRoomsForBuilding(sections, selectedBuilding),
    [sections, selectedBuilding]
  );

  const roomMeetings = useMemo(
    () => getRoomMeetings(sections, selectedBuilding, selectedRoom),
    [sections, selectedBuilding, selectedRoom]
  );

  const weeklySchedule = useMemo(
    () => buildWeeklySchedule(roomMeetings),
    [roomMeetings]
  );

  return { buildings, rooms, roomMeetings, weeklySchedule };
}
