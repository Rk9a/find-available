"use client";

import Image from "next/image";
import Link from "next/link";
import styles from "./page.module.css";
import { useState } from "react";
import { useDarkMode } from "@/hooks/useDarkMode";
import { useKfupmClock } from "@/hooks/useKfupmClock";
import { useSchedule } from "@/hooks/useSchedule";
import { useRoomAvailability } from "@/hooks/useRoomAvailability";
import { findAvailableRooms } from "@/lib/availability";
import {
  SCHEDULE_START,
  SCHEDULE_END,
  SCHEDULE_DURATION,
  type DayCode,
} from "@/lib/time";
import { ThemeToggle } from "@/components/ThemeToggle";
import { ModeSwitch, type Mode } from "@/components/ModeSwitch";
import { LiveIndicator } from "@/components/LiveIndicator";
import { BuildingAvailability } from "@/components/BuildingAvailability";
import { RoomAvailability } from "@/components/RoomAvailability";

export default function Home() {
  const [mode, setMode] = useState<Mode>("room");
  const { darkMode, toggleDarkMode } = useDarkMode();
  const kfupmNow = useKfupmClock();
  const { sections, scheduleInfo, loading: scheduleLoading } = useSchedule();

  const [selectedBuilding, setSelectedBuilding] = useState("");
  const [selectedRoom, setSelectedRoom] = useState("");
  const [selectedDay, setSelectedDay] = useState<DayCode>("U");
  const [startTime, setStartTime] = useState("1300");
  const [endTime, setEndTime] = useState("1500");
  const [availableRooms, setAvailableRooms] = useState<string[]>([]);

  const { buildings, rooms, weeklySchedule, currentMeeting } =
    useRoomAvailability(sections, selectedBuilding, selectedRoom, kfupmNow);

  const currentMinutes = kfupmNow.hour * 60 + kfupmNow.minute;

  const nowPosition =
    ((currentMinutes - SCHEDULE_START) / SCHEDULE_DURATION) * 100;

  const showNowPointer =
    currentMinutes >= SCHEDULE_START && currentMinutes <= SCHEDULE_END;

  const handleBuildingChange = (building: string) => {
    setSelectedBuilding(building);
    setSelectedRoom("");
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();

    const userStart = Number(startTime);
    const userEnd = Number(endTime);

    if (userEnd <= userStart) {
      alert("End time must be after start time.");
      return;
    }

    setAvailableRooms(
      findAvailableRooms(sections, selectedBuilding, selectedDay, userStart, userEnd)
    );
  };

  return (
    <div className={`${styles.container} ${darkMode ? styles.dark : ""}`}>
      <div className={styles.wrapper}>
        <ThemeToggle darkMode={darkMode} onToggle={toggleDarkMode} />

        <Link
          href="/info"
          className={styles.infoButton}
          aria-label="About Find Available"
          title="About"
        >
          i
        </Link>

        <div className={styles.logoContainer}>
          <Image
            src="/logo4.svg"
            alt="Find Available Logo"
            width={0}
            height={0}
            sizes="100vw"
            style={{
              width: "200px",
              height: "auto",
            }}
            priority
          />
        </div>

        {scheduleLoading && (
          <div className={styles.loadingSkeleton}>
            <div className={styles.skeletonMode} />

            <div className={styles.skeletonText} />

            <div className={styles.skeletonCard}>
              <div className={styles.skeletonInput} />
              <div className={styles.skeletonInput} />
            </div>
          </div>
        )}

        <ModeSwitch mode={mode} onChange={setMode} />

        <LiveIndicator loading={scheduleLoading} shortTerm={scheduleInfo.shortTerm} />

        <p className={styles.modeDescription}>
          {mode === "room"
            ? "Check a specific room and view its weekly schedule."
            : "Find available rooms in a building for a selected time."}
        </p>

        {mode === "building" && (
          <BuildingAvailability
            buildings={buildings}
            selectedBuilding={selectedBuilding}
            onBuildingChange={handleBuildingChange}
            selectedDay={selectedDay}
            onDayChange={setSelectedDay}
            startTime={startTime}
            onStartTimeChange={setStartTime}
            endTime={endTime}
            onEndTimeChange={setEndTime}
            availableRooms={availableRooms}
            onSubmit={handleSearch}
          />
        )}

        {mode === "room" && (
          <RoomAvailability
            buildings={buildings}
            rooms={rooms}
            selectedBuilding={selectedBuilding}
            onBuildingChange={handleBuildingChange}
            selectedRoom={selectedRoom}
            onRoomChange={setSelectedRoom}
            currentMeeting={currentMeeting}
            weeklySchedule={weeklySchedule}
            showNowPointer={showNowPointer}
            nowPosition={nowPosition}
            currentDay={kfupmNow.day}
          />
        )}
      </div>
    </div>
  );
}
