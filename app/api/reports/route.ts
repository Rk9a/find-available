import { getCurrentSchedule } from "@/lib/banner";
import { createReport, getReportsForBuilding, RateLimitError } from "@/lib/reports";
import type { CreateReportInput } from "@/lib/reportTypes";
import type { DayCode } from "@/lib/time";

const VALID_DAY_CODES: DayCode[] = ["U", "M", "T", "W", "R"];

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const building = searchParams.get("building");
  const deviceId = searchParams.get("deviceId") ?? undefined;

  if (!building) {
    return Response.json({ error: "building is required" }, { status: 400 });
  }

  try {
    const schedule = await getCurrentSchedule();
    const reports = await getReportsForBuilding(
      building,
      schedule.semesterEnd,
      deviceId
    );

    return Response.json({ reports });
  } catch (error) {
    console.error("Reports GET error:", error);

    return Response.json(
      { error: "Failed to load reports" },
      { status: 500 }
    );
  }
}

function isValidInput(body: unknown): body is CreateReportInput {
  if (!body || typeof body !== "object") return false;

  const input = body as Record<string, unknown>;

  return (
    typeof input.building === "string" &&
    input.building.length > 0 &&
    typeof input.room === "string" &&
    input.room.length > 0 &&
    typeof input.day === "string" &&
    VALID_DAY_CODES.includes(input.day as DayCode) &&
    typeof input.startTime === "string" &&
    /^\d{4}$/.test(input.startTime) &&
    typeof input.endTime === "string" &&
    /^\d{4}$/.test(input.endTime) &&
    Number(input.endTime) > Number(input.startTime) &&
    typeof input.subject === "string" &&
    input.subject.length > 0 &&
    typeof input.courseNumber === "string" &&
    input.courseNumber.length > 0 &&
    typeof input.reporterId === "string" &&
    input.reporterId.length > 0
  );
}

export async function POST(request: Request) {
  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  if (!isValidInput(body)) {
    return Response.json(
      { error: "Missing or invalid report fields" },
      { status: 400 }
    );
  }

  try {
    const report = await createReport(body);

    return Response.json({ report }, { status: 201 });
  } catch (error) {
    if (error instanceof RateLimitError) {
      return Response.json({ error: error.message }, { status: 429 });
    }

    console.error("Reports POST error:", error);

    return Response.json(
      { error: "Failed to create report" },
      { status: 500 }
    );
  }
}
