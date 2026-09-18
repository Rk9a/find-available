"use client";

import Image from "next/image";
import Link from "next/link";
import styles from "./page.module.css";
import { useEffect, useState } from "react";
import { useDarkMode } from "@/hooks/useDarkMode";
import { useKfupmClock } from "@/hooks/useKfupmClock";
import { useSchedule } from "@/hooks/useSchedule";
import { useRoomAvailability } from "@/hooks/useRoomAvailability";
import { useRoomStatuses } from "@/hooks/useRoomStatuses";
import { useDeviceId } from "@/features/reports/useDeviceId";
import { useRoomReports } from "@/features/reports/useRoomReports";
import {
  SCHEDULE_START,
  SCHEDULE_END,
  SCHEDULE_DURATION,
  dayNameToDayCode,
  getNowTimeWindow,
  type DayCode,
} from "@/lib/time";
import { buildReportedWeeklySchedule } from "@/features/reports/reportAvailability";
import type { ReportVote } from "@/features/reports/reportTypes";
import { ThemeToggle } from "@/components/ThemeToggle";
import { LiveIndicator } from "@/components/LiveIndicator";
import { RoomFinder } from "@/components/RoomFinder";

const DEFAULT_DAY: DayCode = "U";
const DEFAULT_START = "1300";
const DEFAULT_END = "1500";

export default function Home() {
  const { darkMode, toggleDarkMode } = useDarkMode();
  const kfupmNow = useKfupmClock();
  const { sections, scheduleInfo, loading: scheduleLoading } = useSchedule();
  const deviceId = useDeviceId();

  const [selectedBuilding, setSelectedBuilding] = useState("");
  const [selectedRoom, setSelectedRoom] = useState("");
  const [selectedDay, setSelectedDay] = useState<DayCode>(DEFAULT_DAY);
  const [startTime, setStartTime] = useState(DEFAULT_START);
  const [endTime, setEndTime] = useState(DEFAULT_END);
  const [nowActive, setNowActive] = useState(false);
  const [votingReportId, setVotingReportId] = useState<string | null>(null);

  const { buildings, weeklySchedule } = useRoomAvailability(
    sections,
    selectedBuilding,
    selectedRoom
  );

  const roomStatuses = useRoomStatuses(
    sections,
    selectedBuilding,
    selectedDay,
    startTime,
    endTime
  );

  const { reports, refetch: refetchReports } = useRoomReports(
    selectedBuilding,
    deviceId
  );

  const reportedSchedule = buildReportedWeeklySchedule(reports, selectedRoom);

  const currentMinutes = kfupmNow.hour * 60 + kfupmNow.minute;

  const nowPosition =
    ((currentMinutes - SCHEDULE_START) / SCHEDULE_DURATION) * 100;

  const showNowPointer =
    currentMinutes >= SCHEDULE_START && currentMinutes <= SCHEDULE_END;

  const todayCode = dayNameToDayCode(kfupmNow.day);

  // While the "Now" toggle is on, Day/Start/End are locked (disabled in
  // RoomFinder) and re-synced to the live KFUPM clock every time it ticks
  // (useKfupmClock polls every 60s), so the window keeps tracking "now"
  // for as long as the toggle stays on.
  useEffect(() => {
    if (!nowActive) return;

    if (todayCode) setSelectedDay(todayCode);

    const { start, end } = getNowTimeWindow(kfupmNow.hour, kfupmNow.minute);
    setStartTime(start);
    setEndTime(end);
  }, [nowActive, kfupmNow, todayCode]);

  const handleBuildingChange = (building: string) => {
    setSelectedBuilding(building);
    setSelectedRoom("");
  };

  const handleToggleNow = () => {
    setNowActive(active => !active);
  };

  const handleReset = () => {
    setSelectedBuilding("");
    setSelectedRoom("");
    setSelectedDay(DEFAULT_DAY);
    setStartTime(DEFAULT_START);
    setEndTime(DEFAULT_END);
    setNowActive(false);
  };

  const handleVote = async (reportId: string, vote: ReportVote) => {
    setVotingReportId(reportId);

    try {
      const response = await fetch(`/api/reports/${reportId}/vote`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ deviceId, vote }),
      });

      if (!response.ok) throw new Error("Failed to vote");

      await refetchReports();
    } catch (error) {
      console.error("Vote error:", error);
    } finally {
      setVotingReportId(null);
    }
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

        <LiveIndicator loading={scheduleLoading} shortTerm={scheduleInfo.shortTerm} />

        <p className={styles.pageIntro}>
          Select a building, day, and time to see room availability, then
          click a room for its weekly schedule.
        </p>

        <RoomFinder
          buildings={buildings}
          selectedBuilding={selectedBuilding}
          onBuildingChange={handleBuildingChange}
          selectedDay={selectedDay}
          onDayChange={setSelectedDay}
          todayCode={todayCode}
          startTime={startTime}
          onStartTimeChange={setStartTime}
          endTime={endTime}
          onEndTimeChange={setEndTime}
          nowActive={nowActive}
          onToggleNow={handleToggleNow}
          onReset={handleReset}
          roomStatuses={roomStatuses}
          selectedRoom={selectedRoom}
          onRoomChange={setSelectedRoom}
          weeklySchedule={weeklySchedule}
          showNowPointer={showNowPointer}
          nowPosition={nowPosition}
          currentDay={kfupmNow.day}
          reports={reports}
          reportedSchedule={reportedSchedule}
          deviceId={deviceId}
          onVote={handleVote}
          votingReportId={votingReportId}
          onReportSubmitted={refetchReports}
        />
      </div>
    </div>
  );
}
