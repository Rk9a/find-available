import type { Section, RoomMeeting } from "./types";
import {
  type DayCode,
  type WeekDay,
  meetsOnDayCode,
  weekDays,
} from "./time";

export function getBuildings(sections: Section[]): string[] {
  const set = new Set<string>();

  sections.forEach(section => {
    section.meetingsFaculty?.forEach(meeting => {
      const building = meeting.meetingTime?.building;

      if (building) set.add(building);
    });
  });

  return Array.from(set).sort((a, b) => Number(a) - Number(b));
}

export function getRoomsForBuilding(
  sections: Section[],
  building: string
): string[] {
  if (!building) return [];

  const set = new Set<string>();

  sections.forEach(section => {
    section.meetingsFaculty?.forEach(meeting => {
      const mt = meeting.meetingTime;

      if (mt?.building === building && mt.room) set.add(mt.room);
    });
  });

  return Array.from(set).sort((a, b) =>
    a.localeCompare(b, undefined, { numeric: true })
  );
}

export function getRoomMeetings(
  sections: Section[],
  building: string,
  room: string
): RoomMeeting[] {
  if (!building || !room) return [];

  const meetings: RoomMeeting[] = [];

  sections.forEach(section => {
    section.meetingsFaculty?.forEach(meeting => {
      const mt = meeting.meetingTime;

      if (!mt) return;

      if (mt.building === building && mt.room === room) {
        meetings.push({
          subject: section.subject,
          courseNumber: section.courseNumber,
          section: section.sequenceNumber,
          meetingTime: mt,
        });
      }
    });
  });

  return meetings;
}

export type DaySchedule = WeekDay & { meetings: RoomMeeting[] };

export function buildWeeklySchedule(roomMeetings: RoomMeeting[]): DaySchedule[] {
  return weekDays.map(day => ({
    ...day,

    meetings: roomMeetings
      .filter(meeting => meeting.meetingTime[day.key])
      .sort(
        (a, b) =>
          Number(a.meetingTime.beginTime) - Number(b.meetingTime.beginTime)
      ),
  }));
}

export type RoomStatus = { room: string; available: boolean };

export function getRoomAvailability(
  sections: Section[],
  building: string,
  dayCode: DayCode,
  startTime: number,
  endTime: number
): RoomStatus[] {
  const occupiedRooms = new Set<string>();

  sections.forEach(section => {
    section.meetingsFaculty?.forEach(meeting => {
      const mt = meeting.meetingTime;

      if (!mt || mt.building !== building || !mt.room) return;

      const classStart = Number(mt.beginTime);
      const classEnd = Number(mt.endTime);

      if (
        meetsOnDayCode(mt, dayCode) &&
        startTime < classEnd &&
        endTime > classStart
      ) {
        occupiedRooms.add(mt.room);
      }
    });
  });

  const rooms = getRoomsForBuilding(sections, building);
  const available = rooms.filter(room => !occupiedRooms.has(room));
  const busy = rooms.filter(room => occupiedRooms.has(room));

  return [
    ...available.map(room => ({ room, available: true })),
    ...busy.map(room => ({ room, available: false })),
  ];
}
