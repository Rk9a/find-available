"use client";

import { cn } from "@/lib/utils";
import type { DaySchedule } from "@/lib/availability";
import type { ReportedDaySchedule } from "@/features/reports/reportAvailability";
import {
  SCHEDULE_START,
  SCHEDULE_DURATION,
  scheduleHours,
  timeToMinutes,
} from "@/lib/time";

type WeeklyScheduleGridProps = {
  weeklySchedule: DaySchedule[];
  reportedSchedule?: ReportedDaySchedule[];
  showNowPointer: boolean;
  nowPosition: number;
  currentDay?: string;
};

export function WeeklyScheduleGrid({
  weeklySchedule,
  reportedSchedule,
  showNowPointer,
  nowPosition,
  currentDay,
}: WeeklyScheduleGridProps) {
  return (
    <div className="mt-5 overflow-x-auto rounded-xl bg-surface p-5 ring-1 ring-border">
      <div className="grid min-w-[800px] grid-cols-[60px_repeat(7,1fr)]">
        <div />

        {weeklySchedule.map(day => (
          <div
            key={day.key}
            className={cn(
              "pb-3 text-center text-sm font-semibold",
              currentDay?.toLowerCase() === day.key && "text-primary dark:text-accent-foreground"
            )}
          >
            {day.label}
          </div>
        ))}
      </div>

      <div className="relative h-[1200px] min-w-[800px]">
        {scheduleHours.map(hour => {
          const position =
            ((hour * 60 - SCHEDULE_START) / SCHEDULE_DURATION) * 100;

          return (
            <div key={hour}>
              <div
                className="absolute right-0 left-[60px] border-t border-border"
                style={{ top: `${position}%` }}
              />

              <div
                className="absolute left-0 w-[50px] -translate-y-1/2 pr-2.5 text-right text-xs text-muted-foreground"
                style={{ top: `${position}%` }}
              >
                {hour}:00
              </div>
            </div>
          );
        })}

        <div className="absolute inset-y-0 right-0 left-[60px] grid grid-cols-7">
          {weeklySchedule.map(day => (
            <div key={day.key} className="relative border-l border-border/60 last:border-r">
              {showNowPointer && currentDay?.toLowerCase() === day.key && (
                <div
                  className="pointer-events-none absolute inset-x-0 z-10 h-0.5 bg-now"
                  style={{ top: `${nowPosition}%` }}
                >
                  <span className="absolute top-1/2 -left-[5px] size-2.5 -translate-y-1/2 rounded-full bg-now" />
                  <span className="absolute -top-[18px] right-1 rounded bg-surface px-1 text-[10px] font-bold text-now">
                    NOW
                  </span>
                </div>
              )}
              {day.meetings.map((meeting, index) => {
                const start = timeToMinutes(meeting.meetingTime.beginTime);
                const end = timeToMinutes(meeting.meetingTime.endTime);

                const top = ((start - SCHEDULE_START) / SCHEDULE_DURATION) * 100;
                const height = ((end - start) / SCHEDULE_DURATION) * 100;

                return (
                  <div
                    key={`${meeting.subject}-${meeting.courseNumber}-${meeting.section}-${index}`}
                    className="absolute inset-x-1 z-[5] overflow-hidden rounded-lg bg-primary px-2 py-1.5 text-primary-foreground shadow-xs"
                    style={{ top: `${top}%`, height: `${height}%` }}
                  >
                    <p className="text-[13px] leading-tight font-bold">
                      {meeting.subject} {meeting.courseNumber}-{meeting.section}
                    </p>

                    <p className="mt-1 text-[11px] leading-tight opacity-85">
                      {meeting.meetingTime.beginTime}
                      {" – "}
                      {meeting.meetingTime.endTime}
                    </p>
                  </div>
                );
              })}

              {reportedSchedule
                ?.find(reportedDay => reportedDay.key === day.key)
                ?.reports.map(report => {
                  const start = timeToMinutes(report.startTime);
                  const end = timeToMinutes(report.endTime);

                  const top = ((start - SCHEDULE_START) / SCHEDULE_DURATION) * 100;
                  const height = ((end - start) / SCHEDULE_DURATION) * 100;

                  const isDraft = report.id === "__draft__";

                  return (
                    <div
                      key={report.id}
                      className={cn(
                        "absolute inset-x-1 z-[4] overflow-hidden rounded-lg border border-dashed border-reported bg-reported/15 px-2 py-1.5 text-reported-foreground",
                        isDraft &&
                          "bg-transparent animate-[draftPulse_1.6s_ease-in-out_infinite]"
                      )}
                      style={{ top: `${top}%`, height: `${height}%` }}
                    >
                      <p className="text-[13px] leading-tight font-bold">
                        {report.subject} {report.courseNumber}
                        {report.section ? `-${report.section}` : ""}
                        {" · "}
                        {Math.round(report.confidence * 100)}%
                        {isDraft ? " (preview)" : ""}
                      </p>

                      <p className="mt-1 text-[11px] leading-tight opacity-85">
                        {report.startTime}
                        {" – "}
                        {report.endTime}
                      </p>
                    </div>
                  );
                })}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
