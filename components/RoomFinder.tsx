"use client";

import { useEffect, useRef, useState } from "react";
import styles from "@/app/page.module.css";
import { DAY_LABELS, dayCodeToWeekdayKey, type DayCode } from "@/lib/time";
import type { RoomStatus, DaySchedule } from "@/lib/availability";
import type { ClassReport, DraftReport, ReportVote } from "@/lib/reportTypes";
import {
  reportOverlaps,
  roomsWithOverlappingReports,
  type ReportedDaySchedule,
} from "@/lib/reportAvailability";
import { BuildingCombobox } from "./BuildingCombobox";
import { DaySelect } from "./DaySelect";
import { WeeklyScheduleGrid } from "./WeeklyScheduleGrid";
import { ReportedClassCard } from "./ReportedClassCard";
import { ReportClassForm } from "./ReportClassForm";

type RoomFinderProps = {
  buildings: string[];
  selectedBuilding: string;
  onBuildingChange: (building: string) => void;
  selectedDay: DayCode;
  onDayChange: (day: DayCode) => void;
  todayCode?: DayCode;
  startTime: string;
  onStartTimeChange: (time: string) => void;
  endTime: string;
  onEndTimeChange: (time: string) => void;
  onNow: () => void;
  onReset: () => void;
  roomStatuses: RoomStatus[];
  selectedRoom: string;
  onRoomChange: (room: string) => void;
  weeklySchedule: DaySchedule[];
  showNowPointer: boolean;
  nowPosition: number;
  currentDay?: string;
  reports: ClassReport[];
  reportedSchedule: ReportedDaySchedule[];
  deviceId: string;
  onVote: (reportId: string, vote: ReportVote) => void;
  votingReportId: string | null;
  onReportSubmitted: () => void;
};

export function RoomFinder({
  buildings,
  selectedBuilding,
  onBuildingChange,
  selectedDay,
  onDayChange,
  todayCode,
  startTime,
  onStartTimeChange,
  endTime,
  onEndTimeChange,
  onNow,
  onReset,
  roomStatuses,
  selectedRoom,
  onRoomChange,
  weeklySchedule,
  showNowPointer,
  nowPosition,
  currentDay,
  reports,
  reportedSchedule,
  deviceId,
  onVote,
  votingReportId,
  onReportSubmitted,
}: RoomFinderProps) {
  const invalidRange = Number(endTime) <= Number(startTime);
  const availableRooms = roomStatuses.filter(r => r.available);
  const busyRooms = roomStatuses.filter(r => !r.available);
  const selectedStatus = roomStatuses.find(r => r.room === selectedRoom);
  const detailRef = useRef<HTMLDivElement>(null);
  const [showReportForm, setShowReportForm] = useState(false);
  const [draftReport, setDraftReport] = useState<DraftReport | null>(null);
  const [lastRoom, setLastRoom] = useState(selectedRoom);

  if (selectedRoom !== lastRoom) {
    setLastRoom(selectedRoom);
    setShowReportForm(false);
  }

  useEffect(() => {
    if (selectedRoom) {
      detailRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, [selectedRoom]);

  const toggleRoom = (room: string) => {
    onRoomChange(room === selectedRoom ? "" : room);
  };

  const reportedRoomsInWindow = invalidRange
    ? new Set<string>()
    : roomsWithOverlappingReports(
        reports,
        selectedDay,
        Number(startTime),
        Number(endTime)
      );

  const matchingReports = selectedRoom
    ? reports.filter(
        report =>
          report.room === selectedRoom &&
          !invalidRange &&
          reportOverlaps(report, selectedDay, Number(startTime), Number(endTime))
      )
    : [];

  const draftPreview: ClassReport | null = draftReport
    ? {
        id: "__draft__",
        building: selectedBuilding,
        room: selectedRoom,
        day: draftReport.day,
        startTime: draftReport.startTime,
        endTime: draftReport.endTime,
        subject: draftReport.subject.trim() || "?",
        courseNumber: draftReport.courseNumber.trim() || "?",
        section: draftReport.section.trim() || undefined,
        reporterId: deviceId,
        createdAt: 0,
        confirms: 0,
        denies: 0,
        confidence: 0.5,
        userVote: null,
      }
    : null;

  const scheduleForGrid = draftPreview
    ? reportedSchedule.map(day =>
        day.key === dayCodeToWeekdayKey(draftPreview.day)
          ? { ...day, reports: [...day.reports, draftPreview] }
          : day
      )
    : reportedSchedule;

  return (
    <div className={styles.card}>
      <div className={styles.filterHeader}>
        <span className={styles.heading}>Find a room</span>
        <button type="button" className={styles.resetLink} onClick={onReset}>
          Reset
        </button>
      </div>

      <div className={styles.form}>
        <label className={styles.fieldLabel}>
          Building
          <BuildingCombobox
            buildings={buildings}
            selectedBuilding={selectedBuilding}
            onChange={onBuildingChange}
          />
        </label>

        <label className={styles.fieldLabel}>
          Day
          <DaySelect
            selectedDay={selectedDay}
            onChange={onDayChange}
            todayCode={todayCode}
          />
        </label>

        <div className={styles.timeRow}>
          <label className={styles.fieldLabel}>
            Start
            <input
              type="time"
              step="1800"
              value={`${startTime.slice(0, 2)}:${startTime.slice(2)}`}
              onChange={e => onStartTimeChange(e.target.value.replace(":", ""))}
            />
          </label>

          <label className={styles.fieldLabel}>
            End
            <input
              type="time"
              step="1800"
              value={`${endTime.slice(0, 2)}:${endTime.slice(2)}`}
              onChange={e => onEndTimeChange(e.target.value.replace(":", ""))}
            />
          </label>

          <button
            type="button"
            className={styles.nowButton}
            onClick={onNow}
            title="Check availability right now"
          >
            Now
          </button>
        </div>

        {invalidRange && (
          <p className={styles.validationHint}>
            End time must be after start time.
          </p>
        )}
      </div>

      {selectedBuilding && !invalidRange && (
        <>
          <h2 className={styles.heading}>Available ({availableRooms.length})</h2>
          {availableRooms.length === 0 ? (
            <p className={styles.emptyState}>No rooms available for this time.</p>
          ) : (
            <div className={`${styles.grid} ${styles.fadeIn}`}>
              {availableRooms.map(({ room }) => (
                <button
                  key={room}
                  type="button"
                  onClick={() => toggleRoom(room)}
                  className={`${styles.roomCard} ${styles.roomCardAvailable} ${
                    room === selectedRoom ? styles.roomCardSelected : ""
                  }`}
                >
                  Room {room}
                  {reportedRoomsInWindow.has(room) && (
                    <span className={styles.reportDot} title="Reported by a student">
                      ⚠︎
                    </span>
                  )}
                </button>
              ))}
            </div>
          )}

          <h2 className={styles.heading}>Busy ({busyRooms.length})</h2>
          {busyRooms.length === 0 ? (
            <p className={styles.emptyState}>All rooms are free at this time.</p>
          ) : (
            <div className={`${styles.grid} ${styles.fadeIn}`}>
              {busyRooms.map(({ room }) => (
                <button
                  key={room}
                  type="button"
                  onClick={() => toggleRoom(room)}
                  className={`${styles.roomCard} ${styles.roomCardBusy} ${
                    room === selectedRoom ? styles.roomCardSelected : ""
                  }`}
                >
                  Room {room}
                  {reportedRoomsInWindow.has(room) && (
                    <span className={styles.reportDot} title="Reported by a student">
                      ⚠︎
                    </span>
                  )}
                </button>
              ))}
            </div>
          )}
        </>
      )}

      {selectedRoom && selectedStatus && (
        <div ref={detailRef} className={styles.fadeIn}>
          <div className={styles.statusCard}>
            <p className={styles.statusRoom}>
              Room {selectedRoom} · {DAY_LABELS[selectedDay]}{" "}
              {startTime.slice(0, 2)}:{startTime.slice(2)}
              {" – "}
              {endTime.slice(0, 2)}:{endTime.slice(2)}
            </p>

            <p
              className={
                selectedStatus.available
                  ? styles.statusAvailable
                  : styles.statusBusy
              }
            >
              {selectedStatus.available ? "AVAILABLE" : "BUSY"}
            </p>
          </div>

          {matchingReports.map(report => (
            <ReportedClassCard
              key={report.id}
              report={report}
              deviceId={deviceId}
              onVote={onVote}
              voting={votingReportId === report.id}
            />
          ))}

          {showReportForm ? (
            <ReportClassForm
              building={selectedBuilding}
              room={selectedRoom}
              defaultDay={selectedDay}
              defaultStartTime={startTime}
              defaultEndTime={endTime}
              deviceId={deviceId}
              onDraftChange={setDraftReport}
              onCancel={() => setShowReportForm(false)}
              onSubmitted={() => {
                setShowReportForm(false);
                onReportSubmitted();
              }}
            />
          ) : (
            <button
              type="button"
              className={styles.reportTrigger}
              onClick={() => setShowReportForm(true)}
            >
              See a class here that isn&apos;t shown? Report it
            </button>
          )}

          <WeeklyScheduleGrid
            weeklySchedule={weeklySchedule}
            reportedSchedule={scheduleForGrid}
            showNowPointer={showNowPointer}
            nowPosition={nowPosition}
            currentDay={currentDay}
          />
        </div>
      )}
    </div>
  );
}
