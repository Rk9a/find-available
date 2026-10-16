"use client";

import { useEffect, useState } from "react";
import { CircleCheck, LoaderCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { REPORT_DAY_CODES, type DayCode } from "@/lib/time";
import { DaySelect } from "@/components/DaySelect";
import type { DraftReport } from "./reportTypes";

const formCardClass =
  "mt-4 gap-4 overflow-visible border border-reported-border bg-reported-surface p-4 ring-0 sm:p-5";

const fieldLabelClass =
  "text-xs font-semibold tracking-wide text-muted-foreground uppercase";

const fieldClass = "h-10 bg-surface dark:bg-surface";

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
  const [merged, setMerged] = useState(false);
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

      const result = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(result.error ?? "Failed to submit report");
      }

      onDraftChange(null);
      setMerged(Boolean(result.merged));
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
      <Card className={cn(formCardClass, "animate-in fade-in-0 slide-in-from-bottom-1 duration-300")}>
        <p className="flex items-center justify-center gap-2 py-2 text-center font-semibold text-primary dark:text-accent-foreground">
          <CircleCheck className="size-5 shrink-0" />
          {merged
            ? "Thanks for confirming! This matches an existing report, so it now counts as a confirmation."
            : "Thanks! Your report was submitted and is now visible to other students."}
        </p>
      </Card>
    );
  }

  return (
    <Card className={formCardClass}>
      <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
        <p className="text-[15px] font-bold text-reported-foreground">
          Report a class in Room {room}
        </p>

        <div className="grid grid-cols-3 gap-2 sm:gap-3">
          <div className="flex flex-col gap-2">
            <Label htmlFor="report-subject" className={fieldLabelClass}>
              Subject
            </Label>
            <Input
              id="report-subject"
              type="text"
              placeholder="MATH"
              className={fieldClass}
              value={subject}
              onChange={e => setSubject(e.target.value)}
              required
            />
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="report-course" className={fieldLabelClass}>
              Course #
            </Label>
            <Input
              id="report-course"
              type="text"
              placeholder="101"
              className={fieldClass}
              value={courseNumber}
              onChange={e => setCourseNumber(e.target.value)}
              required
            />
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="report-section" className={fieldLabelClass}>
              Section
            </Label>
            <Input
              id="report-section"
              type="text"
              placeholder="optional"
              className={fieldClass}
              value={section}
              onChange={e => setSection(e.target.value)}
            />
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <Label htmlFor="report-instructor" className={fieldLabelClass}>
            Instructor
          </Label>
          <Input
            id="report-instructor"
            type="text"
            placeholder="optional"
            className={fieldClass}
            value={instructor}
            onChange={e => setInstructor(e.target.value)}
          />
        </div>

        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 sm:gap-3">
          <div className="col-span-2 flex flex-col gap-2 sm:col-span-1">
            <Label className={fieldLabelClass}>Day</Label>
            <DaySelect days={REPORT_DAY_CODES} selectedDay={day} onChange={setDay} />
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="report-start" className={fieldLabelClass}>
              Start
            </Label>
            <Input
              id="report-start"
              type="time"
              step="1800"
              className={fieldClass}
              value={`${startTime.slice(0, 2)}:${startTime.slice(2)}`}
              onChange={e => setStartTime(e.target.value.replace(":", ""))}
            />
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="report-end" className={fieldLabelClass}>
              End
            </Label>
            <Input
              id="report-end"
              type="time"
              step="1800"
              className={fieldClass}
              value={`${endTime.slice(0, 2)}:${endTime.slice(2)}`}
              onChange={e => setEndTime(e.target.value.replace(":", ""))}
            />
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <Label htmlFor="report-note" className={fieldLabelClass}>
            Note
          </Label>
          <Textarea
            id="report-note"
            placeholder="optional details (e.g. makeup class, moved section)"
            className="min-h-16 bg-surface dark:bg-surface"
            value={note}
            onChange={e => setNote(e.target.value)}
            rows={2}
          />
        </div>

        {invalidRange && (
          <p className="text-sm text-destructive">
            End time must be after start time.
          </p>
        )}

        {error && <p className="text-sm text-destructive">{error}</p>}

        <div className="flex items-center justify-end gap-2">
          <Button
            type="button"
            variant="ghost"
            onClick={onCancel}
            disabled={submitting}
          >
            Cancel
          </Button>

          <Button type="submit" className="h-9 px-4" disabled={submitting}>
            {submitting ? (
              <>
                <LoaderCircle className="animate-spin" />
                Submitting…
              </>
            ) : (
              "Submit report"
            )}
          </Button>
        </div>
      </form>
    </Card>
  );
}
