"use client";
import Image from "next/image";
import styles from "./page.module.css";
import { useState, useMemo, useEffect } from "react";
import Link from "next/dist/client/link";

function getKFUPMNow() {
  const now = new Date();

  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: "Asia/Riyadh",
    weekday: "long",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).formatToParts(now);

  const get = (type: string) =>
    parts.find(part => part.type === type)?.value;

  return {
    day: get("weekday"),
    hour: Number(get("hour")),
    minute: Number(get("minute")),
  };
}
const weekDays = [
  { key: "sunday", label: "SUN" },
  { key: "monday", label: "MON" },
  { key: "tuesday", label: "TUE" },
  { key: "wednesday", label: "WED" },
  { key: "thursday", label: "THU" },
  { key: "friday", label: "FRI" },
  { key: "saturday", label: "SAT" },
];
const SCHEDULE_START = 7 * 60;  // 07:00
const SCHEDULE_END = 22 * 60;   // 22:00

const scheduleHours = Array.from(
  { length: 16 },
  (_, i) => 7 + i
);

const SCHEDULE_DURATION = SCHEDULE_END - SCHEDULE_START;
function timeToMinutes(time: string) {
  const padded = time.padStart(4, "0");

  const hours = Number(padded.slice(0, 2));
  const minutes = Number(padded.slice(2));

  return hours * 60 + minutes;
}


export default function Home() {
  const [mode, setMode] = useState<"room" | "building">("room");
  const [kfupmNow, setKfupmNow] = useState(getKFUPMNow);
  const [darkMode, setDarkMode] = useState(false);
  const [classesData, setClassesData] = useState<any>({
    data: [],
  });

  const [scheduleInfo, setScheduleInfo] = useState({
    shortTerm: "",
    status: "",
  });

  const [scheduleLoading, setScheduleLoading] =
    useState(true);



  useEffect(() => {
    const interval = setInterval(() => {
      setKfupmNow(getKFUPMNow());
    }, 60_000);

    return () => clearInterval(interval);
  }, []);
  useEffect(() => {
    const savedTheme = localStorage.getItem("theme");

    if (savedTheme === "dark") {
      setDarkMode(true);
    } else if (savedTheme === "light") {
      setDarkMode(false);
    } else {
      setDarkMode(
        window.matchMedia("(prefers-color-scheme: dark)").matches
      );
    }
  }, []);
  useEffect(() => {
    document.documentElement.dataset.theme =
      darkMode ? "dark" : "light";
  }, [darkMode]);
  const toggleDarkMode = () => {
    setDarkMode(prev => {
      const next = !prev;

      localStorage.setItem(
        "theme",
        next ? "dark" : "light"
      );

      return next;
    });
  };


  useEffect(() => {
    async function loadSchedule() {
      try {
        const response = await fetch("/api/schedule");

        if (!response.ok) {
          throw new Error("Failed to load schedule");
        }

        const result = await response.json();

        setClassesData({
          data: result.data ?? [],
        });

        setScheduleInfo({
          shortTerm: result.shortTerm,
          status: result.status,
        });
      } catch (error) {
        console.error("Schedule loading error:", error);
      } finally {
        setScheduleLoading(false);
      }
    }

    loadSchedule();
  }, []);

  const currentTime = kfupmNow.hour * 100 + kfupmNow.minute;
  const currentMinutes =
    kfupmNow.hour * 60 + kfupmNow.minute;

  const nowPosition =
    ((currentMinutes - SCHEDULE_START) /
      SCHEDULE_DURATION) *
    100;

  const showNowPointer =
    currentMinutes >= SCHEDULE_START &&
    currentMinutes <= SCHEDULE_END;
  const [selectedBuilding, setSelectedBuilding] = useState("");
  const [selectedRoom, setSelectedRoom] = useState("");
  const [selectedDay, setSelectedDay] = useState("U");
  const [startTime, setStartTime] = useState("1300");
  const [endTime, setEndTime] = useState("1500");
  const [availableRooms, setAvailableRooms] = useState<string[]>([]);

  const buildings = useMemo(() => {
    const set = new Set<string>();

    classesData.data.forEach((cls: any) => {
      cls.meetingsFaculty?.forEach((meeting: any) => {
        const mt = meeting.meetingTime;
        if (mt?.building) {
          set.add(mt.building);
        }
      });
    });

    return Array.from(set).sort((a, b) => Number(a) - Number(b));
  }, [classesData]);

  const rooms = useMemo(() => {
    if (!selectedBuilding) return [];

    const set = new Set<string>();

    classesData.data.forEach((cls: any) => {
      cls.meetingsFaculty?.forEach((meeting: any) => {
        const mt = meeting.meetingTime;

        if (
          mt?.building === selectedBuilding &&
          mt?.room
        ) {
          set.add(mt.room);
        }
      });
    });

    return Array.from(set).sort((a, b) =>
      a.localeCompare(b, undefined, { numeric: true })
    );
  }, [selectedBuilding, classesData]);
  const roomMeetings = useMemo(() => {
    if (!selectedBuilding || !selectedRoom) return [];

    const meetings: any[] = [];

    classesData.data.forEach((cls: any) => {
      cls.meetingsFaculty?.forEach((meeting: any) => {
        const mt = meeting.meetingTime;

        if (!mt) return;

        if (
          mt.building === selectedBuilding &&
          mt.room === selectedRoom
        ) {
          meetings.push({
            course: cls.courseReferenceNumber,
            subject: cls.subject,
            courseNumber: cls.courseNumber,
            section: cls.sequenceNumber,
            meetingTime: mt,
          });
        }
      });
    });

    return meetings;
  }, [selectedBuilding, selectedRoom, classesData]);

  const weeklySchedule = useMemo(() => {
    return weekDays.map(day => ({
      ...day,

      meetings: roomMeetings
        .filter((meeting: any) => meeting.meetingTime[day.key])
        .sort(
          (a: any, b: any) =>
            Number(a.meetingTime.beginTime) -
            Number(b.meetingTime.beginTime)
        ),
    }));
  }, [roomMeetings]);
  const currentMeeting = roomMeetings.find((meeting: any) => {
    const mt = meeting.meetingTime;

    const dayMatch =
      (kfupmNow.day === "Sunday" && mt.sunday) ||
      (kfupmNow.day === "Monday" && mt.monday) ||
      (kfupmNow.day === "Tuesday" && mt.tuesday) ||
      (kfupmNow.day === "Wednesday" && mt.wednesday) ||
      (kfupmNow.day === "Thursday" && mt.thursday) ||
      (kfupmNow.day === "Friday" && mt.friday) ||
      (kfupmNow.day === "Saturday" && mt.saturday);

    if (!dayMatch) return false;

    const classStart = Number(mt.beginTime);
    const classEnd = Number(mt.endTime);

    return currentTime >= classStart && currentTime < classEnd;
  });

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();

    const userStart = Number(startTime);
    const userEnd = Number(endTime);

    if (userEnd <= userStart) {
      alert("End time must be after start time.");
      return;
    }

    const allRooms = new Set<string>();
    const occupiedRooms = new Set<string>();

    classesData.data.forEach((cls: any) => {
      cls.meetingsFaculty?.forEach((meeting: any) => {
        const mt = meeting.meetingTime;
        if (!mt) return;

        if (mt.building !== selectedBuilding) return;

        const room = mt.room;
        if (!room) return;

        allRooms.add(room);

        const classStart = Number(mt.beginTime);
        const classEnd = Number(mt.endTime);

        const dayMatch =
          (selectedDay === "U" && mt.sunday) ||
          (selectedDay === "M" && mt.monday) ||
          (selectedDay === "T" && mt.tuesday) ||
          (selectedDay === "W" && mt.wednesday) ||
          (selectedDay === "R" && mt.thursday);

        if (
          dayMatch &&
          userStart < classEnd &&
          userEnd > classStart
        ) {
          occupiedRooms.add(room);
        }
      });
    });

    const free = [...allRooms]
      .filter(room => !occupiedRooms.has(room))
      .sort();

    setAvailableRooms(free);
  };
  return (
    <div
      className={`${styles.container} ${darkMode ? styles.dark : ""
        }`}
    >
      <div className={styles.wrapper}>
        <button
          type="button"
          className={styles.themeToggle}
          onClick={toggleDarkMode}
          aria-label={
            darkMode
              ? "Switch to light mode"
              : "Switch to dark mode"
          }
        >
          {darkMode ? (
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="12" cy="12" r="4" />
              <path d="M12 2v2" />
              <path d="M12 20v2" />
              <path d="m4.93 4.93 1.41 1.41" />
              <path d="m17.66 17.66 1.41 1.41" />
              <path d="M2 12h2" />
              <path d="M20 12h2" />
              <path d="m6.34 17.66-1.41 1.41" />
              <path d="m19.07 4.93-1.41 1.41" />
            </svg>
          ) : (
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79Z" />
            </svg>
          )}
        </button>
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
        <div className={styles.modeSwitch}>
          <button
            type="button"
            className={`${styles.modeButton} ${mode === "room" ? styles.activeMode : ""
              }`}
            onClick={() => setMode("room")}
          >
            By Room
          </button>

          <button
            type="button"
            className={`${styles.modeButton} ${mode === "building" ? styles.activeMode : ""
              }`}
            onClick={() => setMode("building")}
          >
            By Building
          </button>
        </div>
        <div
          className={`${styles.liveIndicator} ${scheduleLoading ? styles.loadingIndicator : ""
            }`}
        >
          <span
            className={
              scheduleLoading
                ? styles.loadingDot
                : styles.liveDot
            }
          />

          {scheduleLoading
            ? "Loading Semester ···"
            : `Live · ${scheduleInfo.shortTerm}`}
        </div>
        <p className={styles.modeDescription}>
          {mode === "room"
            ? "Check a specific room and view its weekly schedule."
            : "Find available rooms in a building for a selected time."}
        </p>
        {mode === "building" && (
          <>
            <div className={styles.card}>
              <form onSubmit={handleSearch} className={styles.form}>
                <select
                  value={selectedBuilding}
                  onChange={e => {
                    setSelectedBuilding(e.target.value);
                    setSelectedRoom("");
                  }}
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
                  onChange={e => setSelectedDay(e.target.value)}
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
                    onChange={e =>
                      setStartTime(e.target.value.replace(":", ""))
                    }
                  />
                  <p>end:</p>
                  <input
                    type="time"
                    step="1800"
                    value={`${endTime.slice(0, 2)}:${endTime.slice(2)}`}
                    onChange={e =>
                      setEndTime(e.target.value.replace(":", ""))
                    }
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

        )}
        {mode === "room" && (
          <div className={styles.card}>
            <div className={styles.form}>
              <select
                value={selectedBuilding}
                onChange={e => {
                  setSelectedBuilding(e.target.value);
                  setSelectedRoom("");
                }}
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
                onChange={e => setSelectedRoom(e.target.value)}
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
                        currentMeeting
                          ? styles.statusBusy
                          : styles.statusAvailable
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
                  <div className={styles.scheduleCard}>
                    <div className={styles.scheduleHeader}>
                      <div />

                      {weeklySchedule.map(day => (
                        <div
                          key={day.key}
                          className={styles.scheduleHeaderDay}
                        >
                          {day.label}
                        </div>
                      ))}
                    </div>

                    <div className={styles.scheduleBody}>
                      {scheduleHours.map(hour => {
                        const position =
                          ((hour * 60 - SCHEDULE_START) /
                            SCHEDULE_DURATION) *
                          100;

                        return (
                          <div key={hour}>
                            <div
                              className={styles.hourLine}
                              style={{ top: `${position}%` }}
                            />

                            <div
                              className={styles.hourLabel}
                              style={{ top: `${position}%` }}
                            >
                              {hour}:00
                            </div>
                          </div>
                        );
                      })}

                      <div className={styles.dayColumns}>
                        {weeklySchedule.map(day => (
                          <div
                            key={day.key}
                            className={styles.dayColumn}
                          >
                            {showNowPointer &&
                              kfupmNow.day?.toLowerCase() === day.key && (
                                <div
                                  className={styles.nowLine}
                                  style={{ top: `${nowPosition}%` }}
                                >
                                  <span className={styles.nowDot} />

                                  <span className={styles.nowLabel}>
                                    NOW
                                  </span>
                                </div>
                              )}
                            {day.meetings.map((meeting: any, index: number) => {
                              const start =
                                timeToMinutes(meeting.meetingTime.beginTime);

                              const end =
                                timeToMinutes(meeting.meetingTime.endTime);

                              const top =
                                ((start - SCHEDULE_START) /
                                  SCHEDULE_DURATION) *
                                100;

                              const height =
                                ((end - start) /
                                  SCHEDULE_DURATION) *
                                100;

                              return (
                                <div
                                  key={`${meeting.course}-${index}`}
                                  className={styles.meetingBlock}
                                  style={{
                                    top: `${top}%`,
                                    height: `${height}%`,
                                  }}
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
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
