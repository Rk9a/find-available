"use client";

import { useState } from "react";
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
  /** Day the user searched for; the phone view opens on it. */
  focusDayKey?: string;
};

type DayColumnProps = {
  day: DaySchedule;
  reports?: ReportedDaySchedule["reports"];
  showNow: boolean;
  nowPosition: number;
};

function DayColumn({ day, reports, showNow, nowPosition }: DayColumnProps) {
  return (
    <div className="relative border-l border-border/60 last:border-r">
      {showNow && (
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

      {reports?.map(report => {
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
  );
}

type TimelineProps = {
  days: DaySchedule[];
  reportedSchedule?: ReportedDaySchedule[];
  showNowPointer: boolean;
  nowPosition: number;
  currentDay?: string;
  className?: string;
};

// Hour lines and labels down the left, one column per day.
function Timeline({
  days,
  reportedSchedule,
  showNowPointer,
  nowPosition,
  currentDay,
  className,
}: TimelineProps) {
  return (
    <div className={cn("relative", className)}>
      {scheduleHours.map(hour => {
        const position =
          ((hour * 60 - SCHEDULE_START) / SCHEDULE_DURATION) * 100;

        return (
          <div key={hour}>
            <div
              className="absolute right-0 left-[52px] border-t border-border sm:left-[60px]"
              style={{ top: `${position}%` }}
            />

            <div
              className="absolute left-0 w-[44px] -translate-y-1/2 pr-2 text-right text-xs text-muted-foreground sm:w-[50px] sm:pr-2.5"
              style={{ top: `${position}%` }}
            >
              {hour}:00
            </div>
          </div>
        );
      })}

      <div
        className="absolute inset-y-0 right-0 left-[52px] grid sm:left-[60px]"
        style={{ gridTemplateColumns: `repeat(${days.length}, minmax(0, 1fr))` }}
      >
        {days.map(day => (
          <DayColumn
            key={day.key}
            day={day}
            reports={reportedSchedule?.find(r => r.key === day.key)?.reports}
            showNow={showNowPointer && currentDay?.toLowerCase() === day.key}
            nowPosition={nowPosition}
          />
        ))}
      </div>
    </div>
  );
}

export function WeeklyScheduleGrid({
  weeklySchedule,
  reportedSchedule,
  showNowPointer,
  nowPosition,
  currentDay,
  focusDayKey,
}: WeeklyScheduleGridProps) {
  const [mobileDayKey, setMobileDayKey] = useState(
    focusDayKey ?? currentDay?.toLowerCase()
  );
  const [lastFocusDayKey, setLastFocusDayKey] = useState(focusDayKey);

  // Follow the searched day when it changes, while still letting the user
  // tap through the other days in between.
  if (focusDayKey !== lastFocusDayKey) {
    setLastFocusDayKey(focusDayKey);
    if (focusDayKey) setMobileDayKey(focusDayKey);
  }

  const mobileDay =
    weeklySchedule.find(day => day.key === mobileDayKey) ?? weeklySchedule[0];

  const timelineProps = {
    reportedSchedule,
    showNowPointer,
    nowPosition,
    currentDay,
  };

  return (
    <div className="mt-5 rounded-xl bg-surface p-3 ring-1 ring-border sm:p-5">
      {/* Phones: one day at a time, picked from a row of day pills. */}
      <div className="sm:hidden">
        <div
          className="mb-4 grid grid-cols-7 gap-1"
          role="tablist"
          aria-label="Day"
        >
          {weeklySchedule.map(day => {
            const selected = day.key === mobileDay?.key;
            const hasReports = Boolean(
              reportedSchedule?.find(r => r.key === day.key)?.reports.length
            );

            return (
              <button
                key={day.key}
                type="button"
                role="tab"
                aria-selected={selected}
                onClick={() => setMobileDayKey(day.key)}
                className={cn(
                  "relative flex h-11 flex-col items-center justify-center gap-0.5 rounded-lg text-xs font-semibold transition-colors",
                  selected
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:bg-muted",
                  !selected &&
                    day.key === currentDay?.toLowerCase() &&
                    "text-primary dark:text-accent-foreground"
                )}
              >
                {day.label}
                <span className="flex h-1.5 gap-0.5">
                  {day.meetings.length > 0 && (
                    <span
                      className={cn(
                        "size-1.5 rounded-full",
                        selected ? "bg-primary-foreground/80" : "bg-primary/60"
                      )}
                    />
                  )}
                  {hasReports && (
                    <span className="size-1.5 rounded-full bg-reported" />
                  )}
                </span>
              </button>
            );
          })}
        </div>

        {mobileDay && (
          <div className="relative">
            {mobileDay.meetings.length === 0 &&
              !reportedSchedule?.find(r => r.key === mobileDay.key)?.reports
                .length && (
                <p className="absolute inset-x-0 top-6 z-10 ml-[52px] text-center text-sm text-muted-foreground">
                  No classes on {mobileDay.label}
                </p>
              )}

            <Timeline
              {...timelineProps}
              days={[mobileDay]}
              className="h-[900px]"
            />
          </div>
        )}
      </div>

      {/* Tablets and up: the full week side by side. */}
      <div className="hidden overflow-x-auto sm:block">
        <div className="grid min-w-[800px] grid-cols-[60px_repeat(7,1fr)]">
          <div />

          {weeklySchedule.map(day => (
            <div
              key={day.key}
              className={cn(
                "pb-3 text-center text-sm font-semibold",
                currentDay?.toLowerCase() === day.key &&
                  "text-primary dark:text-accent-foreground"
              )}
            >
              {day.label}
            </div>
          ))}
        </div>

        <Timeline
          {...timelineProps}
          days={weeklySchedule}
          className="h-[1200px] min-w-[800px]"
        />
      </div>
    </div>
  );
}
