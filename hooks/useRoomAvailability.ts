"use client";

import { useMemo } from "react";
import type { Section } from "@/lib/types";
import type { KfupmNow } from "@/lib/time";
import {
  getBuildings,
  getRoomsForBuilding,
  getRoomMeetings,
  buildWeeklySchedule,
  findCurrentMeeting,
} from "@/lib/availability";

export function useRoomAvailability(
  sections: Section[],
  selectedBuilding: string,
  selectedRoom: string,
  kfupmNow: KfupmNow
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

  const currentTime = kfupmNow.hour * 100 + kfupmNow.minute;

  const currentMeeting = useMemo(
    () => findCurrentMeeting(roomMeetings, kfupmNow.day, currentTime),
    [roomMeetings, kfupmNow.day, currentTime]
  );

  return { buildings, rooms, roomMeetings, weeklySchedule, currentMeeting, currentTime };
}
