import type { MeetingTime } from "./types";

export type WeekdayKey =
  | "sunday"
  | "monday"
  | "tuesday"
  | "wednesday"
  | "thursday"
  | "friday"
  | "saturday";

export type WeekDay = { key: WeekdayKey; label: string };

export const weekDays: WeekDay[] = [
  { key: "sunday", label: "SUN" },
  { key: "monday", label: "MON" },
  { key: "tuesday", label: "TUE" },
  { key: "wednesday", label: "WED" },
  { key: "thursday", label: "THU" },
  { key: "friday", label: "FRI" },
  { key: "saturday", label: "SAT" },
];

// Banner's building-search form uses single-letter day codes for Sun-Thu (KFUPM's work week).
export type DayCode = "U" | "M" | "T" | "W" | "R";

const DAY_CODE_TO_KEY: Record<DayCode, WeekdayKey> = {
  U: "sunday",
  M: "monday",
  T: "tuesday",
  W: "wednesday",
  R: "thursday",
};

const WEEKDAY_NAME_TO_KEY: Partial<Record<string, WeekdayKey>> = {
  Sunday: "sunday",
  Monday: "monday",
  Tuesday: "tuesday",
  Wednesday: "wednesday",
  Thursday: "thursday",
  Friday: "friday",
  Saturday: "saturday",
};

export function meetsOnDayCode(
  meetingTime: MeetingTime,
  dayCode: DayCode
): boolean {
  return Boolean(meetingTime[DAY_CODE_TO_KEY[dayCode]]);
}

export function meetsOnWeekdayName(
  meetingTime: MeetingTime,
  weekdayName: string | undefined
): boolean {
  const key = weekdayName ? WEEKDAY_NAME_TO_KEY[weekdayName] : undefined;
  return key ? Boolean(meetingTime[key]) : false;
}

export const SCHEDULE_START = 7 * 60; // 07:00
export const SCHEDULE_END = 22 * 60; // 22:00
export const SCHEDULE_DURATION = SCHEDULE_END - SCHEDULE_START;
export const scheduleHours = Array.from({ length: 16 }, (_, i) => 7 + i);

export function timeToMinutes(time: string): number {
  const padded = time.padStart(4, "0");
  const hours = Number(padded.slice(0, 2));
  const minutes = Number(padded.slice(2));

  return hours * 60 + minutes;
}

export type KfupmNow = {
  day?: string;
  hour: number;
  minute: number;
};

export function getKFUPMNow(): KfupmNow {
  const now = new Date();

  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: "Asia/Riyadh",
    weekday: "long",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).formatToParts(now);

  const get = (type: string) => parts.find(part => part.type === type)?.value;

  return {
    day: get("weekday"),
    hour: Number(get("hour")),
    minute: Number(get("minute")),
  };
}
