import type { DayCode } from "@/lib/time";

export type ReportVote = "confirm" | "deny";

export type ClassReport = {
  id: string;
  building: string;
  room: string;
  day: DayCode;
  startTime: string;
  endTime: string;
  subject: string;
  courseNumber: string;
  section?: string;
  instructor?: string;
  note?: string;
  reporterId: string;
  createdAt: number;
  lastActivityAt: number;
  confirms: number;
  denies: number;
  confidence: number;
  userVote?: ReportVote | null;
};

export type DraftReport = {
  day: DayCode;
  startTime: string;
  endTime: string;
  subject: string;
  courseNumber: string;
  section: string;
};

export type CreateReportInput = {
  building: string;
  room: string;
  day: DayCode;
  startTime: string;
  endTime: string;
  subject: string;
  courseNumber: string;
  section?: string;
  instructor?: string;
  note?: string;
  reporterId: string;
};
