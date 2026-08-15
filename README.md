# Find Available

Find Available is a web application for finding available rooms at King Fahd University of Petroleum and Minerals (KFUPM).

The application uses public course schedule data from KFUPM Banner to determine when classrooms are occupied and when they are available.

**Live:** https://find-available.vercel.app/

## Features

### By Room

Select a building and room to:

- Check whether the room is currently available.
- View the room's weekly schedule.
- See the courses occupying the room.
- View course and section numbers such as `COE 501-02`.

### By Building

Select a building, day, and time range to find rooms that are available during that period.

The availability calculation checks for schedule overlap between the requested period and all meetings assigned to rooms in the selected building.

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
- Vercel

## Project Structure

```text
app/
├── api/
│   └── schedule/
│       └── route.ts
├── globals.css
├── layout.tsx
├── page.module.css
└── page.tsx

lib/
└── banner.ts

public/
└── ...
```

`lib/banner.ts` contains the server-side Banner integration, pagination, semester progression, schedule compaction, and caching logic.

`app/api/schedule/route.ts` exposes the processed schedule to the frontend.

`app/page.tsx` contains the room availability and user-interface logic.

## Running Locally

Clone the repository and install dependencies:

```bash
git clone https://github.com/Rk9a/find-available.git
cd find-available
npm install
```

Start the development server:

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

## Disclaimer

Find Available is an independent project and is not an official KFUPM service.

Schedule and room information ultimately depends on data published through KFUPM Banner and may contain delays, omissions, or changes.

## Author

Designed and developed by Rayan.
