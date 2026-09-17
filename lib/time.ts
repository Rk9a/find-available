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

const WEEKDAY_NAME_TO_DAY_CODE: Partial<Record<string, DayCode>> = {
  Sunday: "U",
  Monday: "M",
  Tuesday: "T",
  Wednesday: "W",
  Thursday: "R",
};

export function meetsOnDayCode(
  meetingTime: MeetingTime,
  dayCode: DayCode
): boolean {
  return Boolean(meetingTime[DAY_CODE_TO_KEY[dayCode]]);
}

export function dayCodeToWeekdayKey(dayCode: DayCode): WeekdayKey {
  return DAY_CODE_TO_KEY[dayCode];
}

export const DAY_LABELS: Record<DayCode, string> = {
  U: "Sun",
  M: "Mon",
  T: "Tue",
  W: "Wed",
  R: "Thu",
};

// KFUPM has no classes Fri/Sat, so those weekday names have no Banner day code.
export function dayNameToDayCode(name?: string): DayCode | undefined {
  return name ? WEEKDAY_NAME_TO_DAY_CODE[name] : undefined;
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

function minutesToTimeCode(totalMinutes: number): string {
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;

  return `${String(hours).padStart(2, "0")}${String(minutes).padStart(2, "0")}`;
}

// Rounds "now" down to the nearest 30-minute step and gives it a 1-hour
// window, clamped to the schedule's displayed hours (07:00-22:00).
export function getNowTimeWindow(
  hour: number,
  minute: number
): { start: string; end: string } {
  const nowMinutes = Math.min(
    Math.max(hour * 60 + minute, SCHEDULE_START),
    SCHEDULE_END
  );
  const start = Math.floor(nowMinutes / 30) * 30;
  const end = Math.min(start + 60, SCHEDULE_END);

  return { start: minutesToTimeCode(start), end: minutesToTimeCode(end) };
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
