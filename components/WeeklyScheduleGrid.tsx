"use client";

import styles from "@/app/page.module.css";
import type { DaySchedule } from "@/lib/availability";
import {
  SCHEDULE_START,
  SCHEDULE_DURATION,
  scheduleHours,
  timeToMinutes,
} from "@/lib/time";

type WeeklyScheduleGridProps = {
  weeklySchedule: DaySchedule[];
  showNowPointer: boolean;
  nowPosition: number;
  currentDay?: string;
};

export function WeeklyScheduleGrid({
  weeklySchedule,
  showNowPointer,
  nowPosition,
  currentDay,
}: WeeklyScheduleGridProps) {
  return (
    <div className={styles.scheduleCard}>
      <div className={styles.scheduleHeader}>
        <div />

        {weeklySchedule.map(day => (
          <div key={day.key} className={styles.scheduleHeaderDay}>
            {day.label}
          </div>
        ))}
      </div>

      <div className={styles.scheduleBody}>
        {scheduleHours.map(hour => {
          const position =
            ((hour * 60 - SCHEDULE_START) / SCHEDULE_DURATION) * 100;

          return (
            <div key={hour}>
              <div
                className={styles.hourLine}
                style={{ top: `${position}%` }}
              />

              <div className={styles.hourLabel} style={{ top: `${position}%` }}>
                {hour}:00
              </div>
            </div>
          );
        })}

        <div className={styles.dayColumns}>
          {weeklySchedule.map(day => (
            <div key={day.key} className={styles.dayColumn}>
              {showNowPointer && currentDay?.toLowerCase() === day.key && (
                <div className={styles.nowLine} style={{ top: `${nowPosition}%` }}>
                  <span className={styles.nowDot} />
                  <span className={styles.nowLabel}>NOW</span>
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
                    className={styles.meetingBlock}
                    style={{ top: `${top}%`, height: `${height}%` }}
                  >
                    <p className={styles.meetingCourse}>
                      {meeting.subject} {meeting.courseNumber}-{meeting.section}
                    </p>

                    <p className={styles.meetingTime}>
                      {meeting.meetingTime.beginTime}
                      {" – "}
                      {meeting.meetingTime.endTime}
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
