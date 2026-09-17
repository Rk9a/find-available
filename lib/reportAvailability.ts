import type { ClassReport } from "./reportTypes";
import { dayCodeToWeekdayKey, weekDays, type DayCode, type WeekDay } from "./time";

export function reportOverlaps(
  report: ClassReport,
  dayCode: DayCode,
  startTime: number,
  endTime: number
): boolean {
  if (report.day !== dayCode) return false;

  const reportStart = Number(report.startTime);
  const reportEnd = Number(report.endTime);

  return startTime < reportEnd && endTime > reportStart;
}

export function findOverlappingReport(
  reports: ClassReport[],
  room: string,
  dayCode: DayCode,
  startTime: number,
  endTime: number
): ClassReport | undefined {
  return reports.find(
    report =>
      report.room === room && reportOverlaps(report, dayCode, startTime, endTime)
  );
}

export function roomsWithOverlappingReports(
  reports: ClassReport[],
  dayCode: DayCode,
  startTime: number,
  endTime: number
): Set<string> {
  const rooms = new Set<string>();

  reports.forEach(report => {
    if (reportOverlaps(report, dayCode, startTime, endTime)) {
      rooms.add(report.room);
    }
  });

  return rooms;
}

export type ReportedDaySchedule = WeekDay & { reports: ClassReport[] };

export function buildReportedWeeklySchedule(
  reports: ClassReport[],
  room: string
): ReportedDaySchedule[] {
  const roomReports = reports.filter(report => report.room === room);

  return weekDays.map(day => ({
    ...day,
    reports: roomReports.filter(
      report => dayCodeToWeekdayKey(report.day) === day.key
    ),
  }));
}
