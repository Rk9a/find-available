"use client";

import styles from "@/app/page.module.css";
import type { RoomMeeting } from "@/lib/types";
import type { DaySchedule } from "@/lib/availability";
import { WeeklyScheduleGrid } from "./WeeklyScheduleGrid";

type RoomAvailabilityProps = {
  buildings: string[];
  rooms: string[];
  selectedBuilding: string;
  onBuildingChange: (building: string) => void;
  selectedRoom: string;
  onRoomChange: (room: string) => void;
  currentMeeting: RoomMeeting | undefined;
  weeklySchedule: DaySchedule[];
  showNowPointer: boolean;
  nowPosition: number;
  currentDay?: string;
};

export function RoomAvailability({
  buildings,
  rooms,
  selectedBuilding,
  onBuildingChange,
  selectedRoom,
  onRoomChange,
  currentMeeting,
  weeklySchedule,
  showNowPointer,
  nowPosition,
  currentDay,
}: RoomAvailabilityProps) {
  return (
    <div className={styles.card}>
      <div className={styles.form}>
        <select
          value={selectedBuilding}
          onChange={e => onBuildingChange(e.target.value)}
        >
          <option value="">Select Building</option>

          {buildings.map(b => (
            <option key={b} value={b}>
              Building {b}
            </option>
          ))}
        </select>

        <select
          value={selectedRoom}
          onChange={e => onRoomChange(e.target.value)}
          disabled={!selectedBuilding}
        >
          <option value="">Select Room</option>

          {rooms.map(room => (
            <option key={room} value={room}>
              Room {room}
            </option>
          ))}
        </select>
        {selectedRoom && (
          <>
            <div className={styles.statusCard}>
              <p className={styles.statusRoom}>
                Room {selectedRoom + " is now"}
              </p>

              <p
                className={
                  currentMeeting ? styles.statusBusy : styles.statusAvailable
                }
              >
                {currentMeeting ? "BUSY " : "AVAILABLE"}
              </p>

              {currentMeeting && (
                <p className={styles.statusDetails}>
                  {currentMeeting.subject} {currentMeeting.courseNumber}
                  {" · "}
                  {currentMeeting.meetingTime.beginTime}
                  {" – "}
                  {currentMeeting.meetingTime.endTime}
                </p>
              )}
            </div>
            <WeeklyScheduleGrid
              weeklySchedule={weeklySchedule}
              showNowPointer={showNowPointer}
              nowPosition={nowPosition}
              currentDay={currentDay}
            />
          </>
        )}
      </div>
    </div>
  );
}
