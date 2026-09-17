"use client";

import { useEffect, useState } from "react";
import styles from "@/app/page.module.css";
import { type DayCode } from "@/lib/time";
import type { DraftReport } from "@/lib/reportTypes";
import { DaySelect } from "./DaySelect";

type ReportClassFormProps = {
  building: string;
  room: string;
  defaultDay: DayCode;
  defaultStartTime: string;
  defaultEndTime: string;
  deviceId: string;
  onDraftChange: (draft: DraftReport | null) => void;
  onSubmitted: () => void;
  onCancel: () => void;
};

export function ReportClassForm({
  building,
  room,
  defaultDay,
  defaultStartTime,
  defaultEndTime,
  deviceId,
  onDraftChange,
  onSubmitted,
  onCancel,
}: ReportClassFormProps) {
  const [day, setDay] = useState<DayCode>(defaultDay);
  const [startTime, setStartTime] = useState(defaultStartTime);
  const [endTime, setEndTime] = useState(defaultEndTime);
  const [subject, setSubject] = useState("");
  const [courseNumber, setCourseNumber] = useState("");
  const [section, setSection] = useState("");
  const [instructor, setInstructor] = useState("");
  const [note, setNote] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

  const invalidRange = Number(endTime) <= Number(startTime);

  useEffect(() => {
    onDraftChange({ day, startTime, endTime, subject, courseNumber, section });

    return () => onDraftChange(null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [day, startTime, endTime, subject, courseNumber, section]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!subject.trim() || !courseNumber.trim() || invalidRange) return;

    setSubmitting(true);
    setError("");

    try {
      const response = await fetch("/api/reports", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          building,
          room,
          day,
          startTime,
          endTime,
          subject: subject.trim().toUpperCase(),
          courseNumber: courseNumber.trim(),
          section: section.trim() || undefined,
          instructor: instructor.trim() || undefined,
          note: note.trim() || undefined,
          reporterId: deviceId,
        }),
      });

      if (!response.ok) {
        const result = await response.json().catch(() => ({}));
        throw new Error(result.error ?? "Failed to submit report");
      }

      onDraftChange(null);
      setSubmitted(true);
      setTimeout(onSubmitted, 1600);
    } catch (submitError) {
      setError(
        submitError instanceof Error ? submitError.message : "Something went wrong"
      );
    } finally {
      setSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div className={`${styles.reportFormCard} ${styles.fadeIn}`}>
        <p className={styles.reportSuccess}>
          ✓ Thanks! Your report was submitted and is now visible to other
          students.
        </p>
      </div>
    );
  }

  return (
    <form className={styles.reportFormCard} onSubmit={handleSubmit}>
      <p className={styles.reportFormTitle}>
        Report a class in Room {room}
      </p>

      <div className={styles.reportFormRow}>
        <label className={styles.fieldLabel}>
          Subject
          <input
            type="text"
            placeholder="e.g. MATH"
            value={subject}
            onChange={e => setSubject(e.target.value)}
            required
          />
        </label>

        <label className={styles.fieldLabel}>
          Course #
          <input
            type="text"
            placeholder="e.g. 101"
            value={courseNumber}
            onChange={e => setCourseNumber(e.target.value)}
            required
          />
        </label>

        <label className={styles.fieldLabel}>
          Section
          <input
            type="text"
            placeholder="optional"
            value={section}
            onChange={e => setSection(e.target.value)}
          />
        </label>
      </div>

      <label className={styles.fieldLabel}>
        Instructor
        <input
          type="text"
          placeholder="optional"
          value={instructor}
          onChange={e => setInstructor(e.target.value)}
        />
      </label>

      <label className={styles.fieldLabel}>
        Day
        <DaySelect selectedDay={day} onChange={setDay} />
      </label>

      <div className={styles.timeRow}>
        <label className={styles.fieldLabel}>
          Start
          <input
            type="time"
            step="1800"
            value={`${startTime.slice(0, 2)}:${startTime.slice(2)}`}
            onChange={e => setStartTime(e.target.value.replace(":", ""))}
          />
        </label>

        <label className={styles.fieldLabel}>
          End
          <input
            type="time"
            step="1800"
            value={`${endTime.slice(0, 2)}:${endTime.slice(2)}`}
            onChange={e => setEndTime(e.target.value.replace(":", ""))}
          />
        </label>
      </div>

      <label className={styles.fieldLabel}>
        Note
        <textarea
          placeholder="optional details (e.g. makeup class, moved section)"
          value={note}
          onChange={e => setNote(e.target.value)}
          rows={2}
        />
      </label>

      {invalidRange && (
        <p className={styles.validationHint}>
          End time must be after start time.
        </p>
      )}

      {error && <p className={styles.validationHint}>{error}</p>}

      <div className={styles.reportFormActions}>
        <button
          type="button"
          className={styles.resetLink}
          onClick={onCancel}
          disabled={submitting}
        >
          Cancel
        </button>

        <button type="submit" className={styles.button} disabled={submitting}>
          {submitting ? "Submitting…" : "Submit report"}
        </button>
      </div>
    </form>
  );
}
