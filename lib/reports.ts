import { redis } from "./redis";
import type { DayCode } from "./time";
import type { ClassReport, CreateReportInput, ReportVote } from "./reportTypes";

const CONFIDENCE_CAP = 0.95;
const RETIRE_MIN_VOTES = 2;
const RETIRE_THRESHOLD = 0.25;
const RATE_LIMIT_MAX = 5;
const RATE_LIMIT_WINDOW_SECONDS = 60 * 60;

export class RateLimitError extends Error {}
export class ReportNotFoundError extends Error {}
export class SelfVoteError extends Error {}

export function computeConfidence(confirms: number, denies: number): number {
  const raw = (confirms + 1) / (confirms + denies + 2);

  return Math.min(CONFIDENCE_CAP, raw);
}

export function isRetired(confirms: number, denies: number): boolean {
  const confidence = computeConfidence(confirms, denies);

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
    confirms,
    denies,
    confidence: computeConfidence(confirms, denies),
    userVote,
  };
}

export async function createReport(
  input: CreateReportInput
): Promise<ClassReport> {
  const rateLimitKey = `ratelimit:report:${input.reporterId}`;
  const count = await redis.incr(rateLimitKey);

  if (count === 1) {
    await redis.expire(rateLimitKey, RATE_LIMIT_WINDOW_SECONDS);
  }

  if (count > RATE_LIMIT_MAX) {
    throw new RateLimitError(
      "Too many reports from this device. Try again later."
    );
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
  };

  await redis.hset(`report:${id}`, encodeHash(hash));
  await redis.sadd(`reports:building:${input.building}`, id);

  return {
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
    confirms: 0,
    denies: 0,
    confidence: computeConfidence(0, 0),
    userVote: null,
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
      report !== null && !isRetired(report.confirms, report.denies)
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

  const confirmsKey = `report:${reportId}:confirms`;
  const deniesKey = `report:${reportId}:denies`;

  if (vote === "confirm") {
    await redis.srem(deniesKey, deviceId);
    await redis.sadd(confirmsKey, deviceId);
  } else {
    await redis.srem(confirmsKey, deviceId);
    await redis.sadd(deniesKey, deviceId);
  }

  const report = await hydrateReport(reportId, deviceId);

  if (!report) {
    throw new ReportNotFoundError("Report not found");
  }

  return report;
}
