import type { Section, RoomMeeting } from "./types";
import {
  type DayCode,
  type WeekDay,
  meetsOnDayCode,
  meetsOnWeekdayName,
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

export function findCurrentMeeting(
  roomMeetings: RoomMeeting[],
  weekdayName: string | undefined,
  currentTime: number
): RoomMeeting | undefined {
  return roomMeetings.find(meeting => {
    if (!meetsOnWeekdayName(meeting.meetingTime, weekdayName)) return false;

    const classStart = Number(meeting.meetingTime.beginTime);
    const classEnd = Number(meeting.meetingTime.endTime);

    return currentTime >= classStart && currentTime < classEnd;
  });
}

export function findAvailableRooms(
  sections: Section[],
  building: string,
  dayCode: DayCode,
  startTime: number,
  endTime: number
): string[] {
  const allRooms = new Set<string>();
  const occupiedRooms = new Set<string>();

  sections.forEach(section => {
    section.meetingsFaculty?.forEach(meeting => {
      const mt = meeting.meetingTime;

      if (!mt || mt.building !== building || !mt.room) return;

      allRooms.add(mt.room);

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

  return [...allRooms].filter(room => !occupiedRooms.has(room)).sort();
}
