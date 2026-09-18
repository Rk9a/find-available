# Find Available

Find Available is a web application for finding available rooms at King Fahd University of Petroleum and Minerals (KFUPM).

The application uses public course schedule data from KFUPM Banner to determine when classrooms are occupied and when they are available.

**Live:** https://find-available.vercel.app/

## Features

### Find a Room

Select a building, day, and time range to see every room in that building split into Available and Busy, live as you adjust the filters. A "Now" button jumps straight to the current KFUPM day/time. Click any room to see its full weekly schedule, with course and section numbers such as `COE 501-02`.

The availability calculation checks for schedule overlap between the requested period and all meetings assigned to rooms in the selected building.

### Reported Classes

Banner data can lag behind reality — a class can be happening in a room the schedule shows as free. Any student can report an unlisted class (course, section, day, time) directly from a room's detail view.

Reports aren't reviewed by an admin. Instead:

- A fresh report shows as a yellow "Reported" flag at 50% confidence, with a "Is this still happening?" Yes/No prompt shown to anyone else who looks at that same room/day/time.
- Confirming or denying moves the reliability percentage shown under the report accordingly (capped below 100%, since it's never treated as ground truth like Banner).
- If a report goes a while without a fresh confirmation, its reliability drifts back down toward 50% ("unproven") on its own — it only ever decays toward neutral, never back up, so a report that's already been denied can't quietly resurface just because nobody re-checked it.
- Enough denials automatically retire a report — no manual moderation needed.
- Reporting and voting are tied to an anonymous per-browser id, not an account.

See `features/reports/reports.ts` for the confidence/decay/retirement logic.

### Semester Detection

The interface displays the semester currently being used:

```text
● Live · 261
```

KFUPM Banner term codes are converted to the shorter KFUPM semester notation:

```text
202610 → 261
202620 → 262
202630 → 263
202710 → 271
```

Semester progression is sequential, including summer semesters:

```text
261 → 262 → 263 → 271 → ...
```

The application uses course meeting metadata to determine the end of a semester and moves to the immediate next published semester after the current one ends.

### Dynamic Banner Synchronization

Schedule data is retrieved server-side from the public KFUPM Banner registration system.

The synchronization process:

```text
KFUPM Banner
      ↓
Create Banner session
      ↓
Select semester
      ↓
Fetch paginated sections
      ↓
Combine section data
      ↓
Remove unnecessary fields
      ↓
Cache schedule
      ↓
/api/schedule
      ↓
Frontend
```

This means the application does not require a manually maintained course schedule file.

Changes published by KFUPM, such as new sections, room changes, or schedule changes, can be reflected when the cached schedule is refreshed.

The schedule is currently cached for seven days to avoid repeatedly requesting thousands of sections from Banner.

## Dark Mode

Find Available includes light and dark themes. The selected theme is stored locally in the browser.

## Tech Stack

- Next.js
- React
- TypeScript
- CSS Modules
- KFUPM Banner public registration data
- Upstash Redis (crowd-sourced class reports)
- Vercel

## Project Structure

```text
app/
├── api/
│   ├── reports/
│   │   ├── [id]/vote/route.ts
│   │   └── route.ts
│   └── schedule/
│       └── route.ts
├── info/
│   ├── page.tsx
│   └── info.module.css
├── globals.css
├── layout.tsx
├── page.module.css
└── page.tsx

components/
├── BuildingCombobox.tsx
├── DaySelect.tsx
├── LiveIndicator.tsx
├── RoomFinder.tsx
├── ThemeToggle.tsx
└── WeeklyScheduleGrid.tsx

hooks/
├── useDarkMode.ts
├── useDropdown.ts
├── useKfupmClock.ts
├── useRoomAvailability.ts
├── useRoomStatuses.ts
└── useSchedule.ts

lib/
├── availability.ts
├── banner.ts
├── time.ts
└── types.ts

features/
└── reports/
    ├── ReportClassForm.tsx
    ├── ReportedClassCard.tsx
    ├── redis.ts
    ├── reportAvailability.ts
    ├── reportTypes.ts
    ├── reports.ts
    └── useDeviceId.ts
    └── useRoomReports.ts

public/
└── ...
```

`lib/banner.ts` contains the server-side Banner integration, pagination, semester progression, schedule compaction, and caching logic.

`lib/availability.ts` and `lib/time.ts` contain the room/building availability calculations and shared time helpers, respectively.

`hooks/useDropdown.ts` holds the shared open/highlight/keyboard-nav/outside-click state behind both `BuildingCombobox` and `DaySelect`, so that interaction logic isn't duplicated between them.

Reporting is self-contained under `features/reports/`: `reports.ts` holds the confidence scoring/auto-retirement/rate-limiting logic against Upstash Redis (`redis.ts`); `reportAvailability.ts` mirrors `lib/availability.ts`'s overlap checks for reported classes; `ReportClassForm.tsx` / `ReportedClassCard.tsx` are its UI, and `useDeviceId.ts` / `useRoomReports.ts` are its hooks.

`app/api/schedule/route.ts` exposes the processed schedule to the frontend; `app/api/reports/` exposes report creation, listing, and voting.

`app/page.tsx` composes `components/RoomFinder.tsx` out of the state/data hooks in `hooks/` and `features/reports/`:

- `useSchedule` fetches and caches the schedule from `/api/schedule`.
- `useKfupmClock` tracks the current time in KFUPM's timezone.
- `useDarkMode` persists the selected theme and avoids a flash of the wrong theme on load.
- `useRoomAvailability` / `useRoomStatuses` derive buildings and per-room availability for the selected building/day/time.
- `useDeviceId` / `useRoomReports` back the reporting feature (anonymous device id, fetching/refetching reports for the selected building).

`app/info/page.tsx` is the About page, with a link to report issues on GitHub.

## Environment Variables

The reporting feature stores reports/votes in Upstash Redis. Create a free database at [upstash.com](https://upstash.com) (or via the "Upstash" integration in the Vercel Marketplace) and set:

```text
UPSTASH_REDIS_REST_URL=...
UPSTASH_REDIS_REST_TOKEN=...
```

Locally, put these in a `.env.local` file at the project root (already gitignored). On Vercel, add both under Project Settings → Environment Variables for every environment you deploy to (Production/Preview/Development), then redeploy.

Without these set, the rest of the app (schedule/availability) still works — only report creation/voting will fail gracefully with a "Failed to load/create report" error.

## Running Locally

Clone the repository and install dependencies:

```bash
git clone https://github.com/Rk9a/find-available.git
cd find-available
npm install
```

Set up the environment variables above, then start the development server:

```bash
npm run dev
```

Then open:

```text
http://localhost:3000
```

## Production Build

To verify the production build locally:

```bash
npm run build
```

Then run:

```bash
npm start
```

## Data and Security

Find Available uses publicly accessible KFUPM Banner schedule information.

Banner session cookies required for schedule requests are created dynamically on the server. Session cookie values are not hard-coded in the repository and are not exposed to the frontend.

The frontend communicates with the application's own `/api/schedule` endpoint rather than directly managing Banner sessions.

Reported classes are tied to a random device id generated in the browser and stored in `localStorage` — no accounts, names, or other identifying information are collected.

## Disclaimer

Find Available is an independent project and is not an official KFUPM service.

Schedule and room information ultimately depends on data published through KFUPM Banner and may contain delays, omissions, or changes.

## Author

Designed and developed by Rayan.
