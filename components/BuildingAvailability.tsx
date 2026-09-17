"use client";

import styles from "@/app/page.module.css";
import type { DayCode } from "@/lib/time";

type BuildingAvailabilityProps = {
  buildings: string[];
  selectedBuilding: string;
  onBuildingChange: (building: string) => void;
  selectedDay: DayCode;
  onDayChange: (day: DayCode) => void;
  startTime: string;
  onStartTimeChange: (time: string) => void;
  endTime: string;
  onEndTimeChange: (time: string) => void;
  availableRooms: string[];
  onSubmit: (e: React.FormEvent) => void;
};

export function BuildingAvailability({
  buildings,
  selectedBuilding,
  onBuildingChange,
  selectedDay,
  onDayChange,
  startTime,
  onStartTimeChange,
  endTime,
  onEndTimeChange,
  availableRooms,
  onSubmit,
}: BuildingAvailabilityProps) {
  return (
    <>
      <div className={styles.card}>
        <form onSubmit={onSubmit} className={styles.form}>
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
            value={selectedDay}
            onChange={e => onDayChange(e.target.value as DayCode)}
          >
            <option value="U">Select Day</option>
            <option value="U">Sun</option>
            <option value="M">Mon</option>
            <option value="T">Tue</option>
            <option value="W">Wed</option>
            <option value="R">Thu</option>
          </select>

          <div className={styles.timeRow}>
            <p>start:</p>
            <input
              type="time"
              step="1800"
              value={`${startTime.slice(0, 2)}:${startTime.slice(2)}`}
              onChange={e => onStartTimeChange(e.target.value.replace(":", ""))}
            />
            <p>end:</p>
            <input
              type="time"
              step="1800"
              value={`${endTime.slice(0, 2)}:${endTime.slice(2)}`}
              onChange={e => onEndTimeChange(e.target.value.replace(":", ""))}
            />
          </div>

          <button type="submit" className={styles.button}>
            Search
          </button>
        </form>
      </div>
      <h2>Available Rooms ({availableRooms.length})</h2>

      <div className={styles.grid}>
        {availableRooms.map(room => (
          <div key={room} className={styles.roomCard}>
            Room {room}
          </div>
        ))}
      </div>
    </>
  );
}
