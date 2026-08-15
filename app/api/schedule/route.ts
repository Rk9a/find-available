import { getCurrentSchedule } from "../../../lib/banner";

export async function GET() {
  try {
    const schedule = await getCurrentSchedule();

    return Response.json({
      term: schedule.term,
      shortTerm: schedule.shortTerm,
      status: schedule.status,
      semesterEnd: schedule.semesterEnd,
      data: schedule.sections,
    });
  } catch (error) {
    console.error("Schedule API error:", error);

    return Response.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Failed to load schedule",
      },
      { status: 500 }
    );
  }
}