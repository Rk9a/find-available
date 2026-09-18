import { redis } from "./redis";
import type { DayCode } from "@/lib/time";
import type { ClassReport, CreateReportInput, ReportVote } from "./reportTypes";

const CONFIDENCE_CAP = 0.95;
const RETIRE_MIN_VOTES = 2;
const RETIRE_THRESHOLD = 0.25;

// One report (new or matching-existing) per device per exact room+day+time
// slot, per half day — this is what actually stops someone from spamming
// duplicate reports onto the same class, regardless of what course details
// they type in.
const REPORT_RATE_LIMIT_WINDOW_SECONDS = 12 * 60 * 60;

// A report that isn't being re-confirmed drifts back toward "unproven"
// (50%) the longer it goes without any new vote, rather than sitting at
// its peak confidence forever. Decay only ever pulls confidence *down*
// toward neutral — it never rehabilitates a report that's already been
// denied below 50%, so a disputed report can't quietly resurface just
// because nobody looked at it for a while.
const DECAY_HALF_LIFE_MS = 14 * 24 * 60 * 60 * 1000; // 14 days

export class RateLimitError extends Error {}
export class ReportNotFoundError extends Error {}
export class SelfVoteError extends Error {}

export function computeConfidence(confirms: number, denies: number): number {
  const raw = (confirms + 1) / (confirms + denies + 2);

  return Math.min(CONFIDENCE_CAP, raw);
}

export function applyRecencyDecay(
  confidence: number,
  lastActivityAt: number,
  now: number = Date.now()
): number {
  if (confidence <= 0.5) return confidence;

  const elapsedMs = Math.max(0, now - lastActivityAt);
  const decayFactor = 0.5 ** (elapsedMs / DECAY_HALF_LIFE_MS);

  return 0.5 + (confidence - 0.5) * decayFactor;
}

export function getDisplayConfidence(
  confirms: number,
  denies: number,
  lastActivityAt: number,
  now: number = Date.now()
): number {
  return applyRecencyDecay(computeConfidence(confirms, denies), lastActivityAt, now);
}

export function isRetired(
  confirms: number,
  denies: number,
  confidence: number
): boolean {
  return confirms + denies >= RETIRE_MIN_VOTES && confidence < RETIRE_THRESHOLD;
}

function formatDateOnly(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

export function isSemesterOver(semesterEnd: string): boolean {
  if (!semesterEnd) return false;

  return formatDateOnly(new Date()) > semesterEnd;
}

type ReportHash = {
  building: string;
  room: string;
  day: DayCode;
  startTime: string;
  endTime: string;
  subject: string;
  courseNumber: string;
  section: string;
  instructor: string;
  note: string;
  reporterId: string;
  createdAt: string;
  lastActivityAt: string;
};

// Upstash's hgetall tries to JSON.parse every field value it reads back
// (e.g. so a stored "42" comes back as the number 42), which silently
// corrupts numeric-looking strings we need to stay strings (room "121",
// startTime "1300", ...). JSON-encoding each field ourselves on write makes
// every value round-trip through that auto-parse as the exact string we
// stored (`JSON.parse('"121"') === "121"`).
function encodeHash(hash: ReportHash): Record<string, string> {
  return Object.fromEntries(
    Object.entries(hash).map(([field, value]) => [field, JSON.stringify(value)])
  );
}

async function hydrateReport(
  id: string,
  viewerId?: string
): Promise<ClassReport | null> {
  const [hash, confirms, denies] = await Promise.all([
    redis.hgetall<ReportHash>(`report:${id}`),
    redis.scard(`report:${id}:confirms`),
    redis.scard(`report:${id}:denies`),
  ]);

  if (!hash || !hash.building) return null;

  let userVote: ReportVote | null = null;

  if (viewerId) {
    const [isConfirm, isDeny] = await Promise.all([
      redis.sismember(`report:${id}:confirms`, viewerId),
      redis.sismember(`report:${id}:denies`, viewerId),
    ]);

    userVote = isConfirm ? "confirm" : isDeny ? "deny" : null;
  }

  const lastActivityAt = Number(hash.lastActivityAt);

  return {
    id,
    building: hash.building,
    room: hash.room,
    day: hash.day,
    startTime: hash.startTime,
    endTime: hash.endTime,
    subject: hash.subject,
    courseNumber: hash.courseNumber,
    section: hash.section || undefined,
    instructor: hash.instructor || undefined,
    note: hash.note || undefined,
    reporterId: hash.reporterId,
    createdAt: Number(hash.createdAt),
    lastActivityAt,
    confirms,
    denies,
    confidence: getDisplayConfidence(confirms, denies, lastActivityAt),
    userVote,
  };
}

async function applyVote(
  reportId: string,
  deviceId: string,
  vote: ReportVote
): Promise<void> {
  const confirmsKey = `report:${reportId}:confirms`;
  const deniesKey = `report:${reportId}:denies`;

  if (vote === "confirm") {
    await redis.srem(deniesKey, deviceId);
    await redis.sadd(confirmsKey, deviceId);
  } else {
    await redis.srem(confirmsKey, deviceId);
    await redis.sadd(deniesKey, deviceId);
  }

  // Any fresh vote — confirm or deny — counts as a check-in, resetting the
  // recency clock the decay above is measured against.
  await redis.hset(`report:${reportId}`, {
    lastActivityAt: JSON.stringify(Date.now()),
  });
}

type MatchCriteria = Pick<
  CreateReportInput,
  "room" | "day" | "startTime" | "endTime" | "subject" | "courseNumber"
>;

// A report is "the same class" as an existing one if it names the same
// room, day, time window, and course — regardless of who's reporting it or
// what section/instructor/note they added. Retired reports don't count, so
// a fresh report about a previously-denied slot starts clean rather than
// reviving a discredited one.
async function findMatchingReport(
  building: string,
  criteria: MatchCriteria
): Promise<ClassReport | null> {
  const ids = await redis.smembers(`reports:building:${building}`);

  if (ids.length === 0) return null;

  const candidates = await Promise.all(ids.map(id => hydrateReport(id)));
  const subject = criteria.subject.trim().toUpperCase();
  const courseNumber = criteria.courseNumber.trim();

  return (
    candidates.find(
      (report): report is ClassReport =>
        report !== null &&
        !isRetired(report.confirms, report.denies, report.confidence) &&
        report.room === criteria.room &&
        report.day === criteria.day &&
        report.startTime === criteria.startTime &&
        report.endTime === criteria.endTime &&
        report.subject.toUpperCase() === subject &&
        report.courseNumber === courseNumber
    ) ?? null
  );
}

export type CreateReportResult = { report: ClassReport; merged: boolean };

export async function createReport(
  input: CreateReportInput
): Promise<CreateReportResult> {
  const slotKey = [
    "ratelimit:report",
    input.reporterId,
    input.building,
    input.room,
    input.day,
    input.startTime,
    input.endTime,
  ].join(":");

  const count = await redis.incr(slotKey);

  if (count === 1) {
    await redis.expire(slotKey, REPORT_RATE_LIMIT_WINDOW_SECONDS);
  }

  if (count > 1) {
    throw new RateLimitError(
      "You've already reported this room and time recently. Try again in 12 hours."
    );
  }

  const existing = await findMatchingReport(input.building, input);

  if (existing) {
    if (existing.reporterId !== input.reporterId) {
      await applyVote(existing.id, input.reporterId, "confirm");
    }

    const refreshed = await hydrateReport(existing.id, input.reporterId);

    return { report: refreshed ?? existing, merged: true };
  }

  const id = crypto.randomUUID();
  const createdAt = Date.now();

  const hash: ReportHash = {
    building: input.building,
    room: input.room,
    day: input.day,
    startTime: input.startTime,
    endTime: input.endTime,
    subject: input.subject,
    courseNumber: input.courseNumber,
    section: input.section ?? "",
    instructor: input.instructor ?? "",
    note: input.note ?? "",
    reporterId: input.reporterId,
    createdAt: String(createdAt),
    lastActivityAt: String(createdAt),
  };

  await redis.hset(`report:${id}`, encodeHash(hash));
  await redis.sadd(`reports:building:${input.building}`, id);

  return {
    report: {
      id,
      building: input.building,
      room: input.room,
      day: input.day,
      startTime: input.startTime,
      endTime: input.endTime,
      subject: input.subject,
      courseNumber: input.courseNumber,
      section: input.section,
      instructor: input.instructor,
      note: input.note,
      reporterId: input.reporterId,
      createdAt,
      lastActivityAt: createdAt,
      confirms: 0,
      denies: 0,
      confidence: computeConfidence(0, 0),
      userVote: null,
    },
    merged: false,
  };
}

export async function getReportsForBuilding(
  building: string,
  semesterEnd: string,
  viewerId?: string
): Promise<ClassReport[]> {
  if (isSemesterOver(semesterEnd)) return [];

  const ids = await redis.smembers(`reports:building:${building}`);

  if (ids.length === 0) return [];

  const reports = await Promise.all(ids.map(id => hydrateReport(id, viewerId)));

  return reports.filter(
    (report): report is ClassReport =>
      report !== null && !isRetired(report.confirms, report.denies, report.confidence)
  );
}

export async function voteOnReport(
  reportId: string,
  deviceId: string,
  vote: ReportVote
): Promise<ClassReport> {
  const hash = await redis.hgetall<ReportHash>(`report:${reportId}`);

  if (!hash || !hash.building) {
    throw new ReportNotFoundError("Report not found");
  }

  if (hash.reporterId === deviceId) {
    throw new SelfVoteError("You can't vote on your own report");
  }

  await applyVote(reportId, deviceId, vote);

  const report = await hydrateReport(reportId, deviceId);

  if (!report) {
    throw new ReportNotFoundError("Report not found");
  }

  return report;
}
