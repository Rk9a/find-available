"use client";
import Image from "next/image";
import styles from "./page.module.css";
import { useState, useMemo } from "react";
import classesDataJson from "../data/classes.json";

const classesData = classesDataJson as any;

export default function Home() {
  const [selectedBuilding, setSelectedBuilding] = useState("");
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
  }, []);


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
  <div className={styles.container}>
    <div className={styles.wrapper}>
<div className={styles.logoContainer}>
<div
  style={{
    display: "flex",
    justifyContent: "center",
    marginBottom: "20px",
  }}
>
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
</div>
      <div className={styles.card}>
        <form onSubmit={handleSearch} className={styles.form}>
          <select
            value={selectedBuilding}
            onChange={e => setSelectedBuilding(e.target.value)}
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
            <option value="U">Sun</option>
            <option value="M">Mon</option>
            <option value="T">Tue</option>
            <option value="W">Wed</option>
            <option value="R">Thu</option>
          </select>

          <div className={styles.timeRow}>
            <input
              type="time"
              step="1800"
              value={`${startTime.slice(0, 2)}:${startTime.slice(2)}`}
              onChange={e =>
                setStartTime(e.target.value.replace(":", ""))
              }
            />

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
    </div>
  </div>
);
}