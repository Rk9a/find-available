import { revalidateTag } from "next/cache";
import {
  SCHEDULE_CACHE_TAG,
  formatDateOnly,
  getCurrentSchedule,
} from "../../../lib/banner";

const DAY = 60 * 60 * 24;

export async function GET() {
  try {
    const schedule = await getCurrentSchedule();

    // A cached schedule can outlive its semester (it's kept for a month).
    // Once the term has ended, mark it stale so the next fetch re-runs the
    // term lookup in the background and rolls over to the new semester.
    if (formatDateOnly(new Date()) > schedule.semesterEnd) {
      revalidateTag(SCHEDULE_CACHE_TAG, "max");
    }

    return Response.json(
      {
        term: schedule.term,
        shortTerm: schedule.shortTerm,
        status: schedule.status,
        semesterEnd: schedule.semesterEnd,
        data: schedule.sections,
      },
      {
        headers: {
          // Vercel's CDN keeps the response for a day (and serves it stale
          // for a week while refreshing), so most visits never start the
          // function at all. Browsers reuse their copy for an hour.
          "CDN-Cache-Control": `public, s-maxage=${DAY}, stale-while-revalidate=${7 * DAY}`,
          "Cache-Control": `public, max-age=3600, stale-while-revalidate=${DAY}`,
        },
      }
    );
  } catch (error) {
    console.error("Schedule API error:", error);

    return Response.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Failed to load schedule",
      },
      { status: 500, headers: { "Cache-Control": "no-store" } }
    );
  }
}
