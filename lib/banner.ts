import { unstable_cache } from "next/cache";
const BASE_TERM = "202610";
const BANNER_BASE =
  "https://banner9-registration.kfupm.edu.sa/StudentRegistrationSsb/ssb";

export type BannerTerm = {
  code: string;
  description: string;
};

export async function getTerms(): Promise<BannerTerm[]> {
  const response = await fetch(
    `${BANNER_BASE}/classSearch/getTerms?searchTerm=&offset=1&max=10`,
    {
      cache: "no-store",
    }
  );

  if (!response.ok) {
    throw new Error(
      `Failed to fetch Banner terms: ${response.status}`
    );
  }

  return response.json();
}
function extractCookies(response: Response): string {
  const setCookies = response.headers.getSetCookie();

  return setCookies
    .map(cookie => cookie.split(";")[0])
    .join("; ");
}

export async function createBannerSession(): Promise<string> {
  const response = await fetch(
    `${BANNER_BASE}/term/termSelection?mode=search`,
    {
      method: "GET",
      cache: "no-store",
      redirect: "manual",
    }
  );

  if (!response.ok && ![301, 302, 303, 307, 308].includes(response.status)) {
    throw new Error(
      `Failed to initialize Banner session: ${response.status}`
    );
  }

  const cookies = extractCookies(response);

  if (!cookies) {
    throw new Error("Banner did not return session cookies.");
  }

  return cookies;
}
export async function selectBannerTerm(
  term: string,
  cookies: string
): Promise<void> {
  const body = new URLSearchParams({
    term,
    studyPath: "",
    studyPathText: "",
    startDatepicker: "",
    endDatepicker: "",
    uniqueSessionId: "",
  });

  const response = await fetch(
    `${BANNER_BASE}/term/search?mode=search`,
    {
      method: "POST",
      cache: "no-store",
      redirect: "manual",

      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        Cookie: cookies,
      },

      body: body.toString(),
    }
  );

  if (
    !response.ok &&
    ![301, 302, 303, 307, 308].includes(response.status)
  ) {
    throw new Error(
      `Failed to select Banner term ${term}: ${response.status}`
    );
  }
}
export async function fetchBannerPage(
  term: string,
  cookies: string,
  offset = 0,
  pageSize = 10
) {
  const params = new URLSearchParams({
    txt_term: term,
    startDatepicker: "",
    endDatepicker: "",
    pageOffset: String(offset),
    pageMaxSize: String(pageSize),
    sortColumn: "subjectDescription",
    sortDirection: "asc",
  });

  const response = await fetch(
    `${BANNER_BASE}/searchResults/searchResults?${params}`,
    {
      cache: "no-store",
      headers: {
        Cookie: cookies,
      },
    }
  );

  if (!response.ok) {
    throw new Error(
      `Failed to fetch Banner sections: ${response.status}`
    );
  }

  return response.json();
}
export async function fetchAllBannerSections(
  term: string,
  cookies: string
) {
  const pageSize = 500;

  const firstPage = await fetchBannerPage(
    term,
    cookies,
    0,
    pageSize
  );

  const totalCount = firstPage.totalCount ?? 0;
  const sections = [...(firstPage.data ?? [])];

  for (
    let offset = pageSize;
    offset < totalCount;
    offset += pageSize
  ) {
    const page = await fetchBannerPage(
      term,
      cookies,
      offset,
      pageSize
    );

    sections.push(...(page.data ?? []));
  }

  return {
    totalCount,
    sections,
  };
}
export async function getSectionsForTerm(term: string) {
  const cookies = await createBannerSession();

  await selectBannerTerm(term, cookies);

  const result = await fetchAllBannerSections(
    term,
    cookies
  );

  return result.sections;
}
export function getSemesterEndDate(
  sections: any[]
): Date {
  const endDates: Date[] = [];

  for (const section of sections) {
    for (const meeting of section.meetingsFaculty ?? []) {
      const endDate = meeting.meetingTime?.endDate;

      if (!endDate) continue;

      const [month, day, year] = endDate
        .split("/")
        .map(Number);

      endDates.push(
        new Date(year, month - 1, day)
      );
    }
  }

  if (endDates.length === 0) {
    throw new Error(
      "Could not determine semester end date."
    );
  }

  return new Date(
    Math.max(...endDates.map(date => date.getTime()))
  );
}

export function formatDateOnly(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}
export function getNextTermCode(term: string): string {
  const year = Number(term.slice(0, 4));
  const semester = term.slice(4);

  if (semester === "10") {
    return `${year}20`;
  }

  if (semester === "20") {
    return `${year}30`;
  }

  if (semester === "30") {
    return `${year + 1}10`;
  }

  throw new Error(`Unknown Banner term format: ${term}`);
}
export function findNextPublishedTerm(
  currentTerm: string,
  terms: BannerTerm[]
): BannerTerm | null {
  const nextCode = getNextTermCode(currentTerm);

  return (
    terms.find(term => term.code === nextCode) ??
    null
  );
}
export function compactSections(sections: any[]) {
  return sections
    .map(section => ({
      subject: section.subject,
      courseNumber: section.courseNumber,
      sequenceNumber: section.sequenceNumber,

      meetingsFaculty: (section.meetingsFaculty ?? [])
        .filter((meeting: any) => meeting.meetingTime)
        .map((meeting: any) => {
          const mt = meeting.meetingTime;

          return {
            meetingTime: {
              building: mt.building,
              room: mt.room,
              beginTime: mt.beginTime,
              endTime: mt.endTime,

              sunday: mt.sunday,
              monday: mt.monday,
              tuesday: mt.tuesday,
              wednesday: mt.wednesday,
              thursday: mt.thursday,
              friday: mt.friday,
              saturday: mt.saturday,

              startDate: mt.startDate,
              endDate: mt.endDate,
            },
          };
        }),
    }))
    .filter(section => section.meetingsFaculty.length > 0);
}
async function fetchCurrentSchedule() {
  const terms = await getTerms();

  let term = BASE_TERM;

  let sections = await getSectionsForTerm(term);
  let semesterEnd = getSemesterEndDate(sections);

  const today = formatDateOnly(new Date());

  while (today > formatDateOnly(semesterEnd)) {
    const nextTerm = findNextPublishedTerm(
      term,
      terms
    );

    if (!nextTerm) {
      break;
    }

    term = nextTerm.code;

    sections = await getSectionsForTerm(term);
    semesterEnd = getSemesterEndDate(sections);
  }

  const shortTerm =
    term.slice(2, 4) + term.slice(4, 5);

  const compactedSections =
    compactSections(sections);

  return {
    term,
    shortTerm,
    status: "live",
    semesterEnd: formatDateOnly(semesterEnd),
    sections: compactedSections,
  };
}
export const getCurrentSchedule = unstable_cache(
  fetchCurrentSchedule,
  ["current-kfupm-schedule-v4"],
  {
    revalidate: 60 * 60 * 24 * 7,
  }
);