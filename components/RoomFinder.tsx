"use client";

import { useEffect, useRef, useState } from "react";
import { Flag, RotateCcw } from "lucide-react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { DAY_LABELS, SEARCH_DAY_CODES, dayCodeToWeekdayKey, type DayCode } from "@/lib/time";
import type { RoomStatus, DaySchedule } from "@/lib/availability";
import type { ClassReport, DraftReport, ReportVote } from "@/features/reports/reportTypes";
import {
  reportOverlaps,
  roomsWithOverlappingReports,
  type ReportedDaySchedule,
} from "@/features/reports/reportAvailability";
import { ReportedClassCard } from "@/features/reports/ReportedClassCard";
import { ReportClassForm } from "@/features/reports/ReportClassForm";
import { BuildingCombobox } from "./BuildingCombobox";
import { DaySelect } from "./DaySelect";
import { WeeklyScheduleGrid } from "./WeeklyScheduleGrid";

const fieldLabelClass =
  "text-xs font-semibold tracking-wide text-muted-foreground uppercase";

const timeInputClass = "h-10 bg-surface dark:bg-surface";

type RoomCardSectionProps = {
  title: string;
  rooms: RoomStatus[];
  variantClass: string;
  emptyMessage: string;
  selectedRoom: string;
  reportedRooms: Set<string>;
  onSelect: (room: string) => void;
};

function RoomCardSection({
  title,
  rooms,
  variantClass,
  emptyMessage,
  selectedRoom,
  reportedRooms,
  onSelect,
}: RoomCardSectionProps) {
  return (
    <section className="mt-5 sm:mt-6">
      <div className="mb-3 flex items-center gap-2">
        <h2 className="text-sm font-semibold">{title}</h2>
        <Badge variant="secondary">{rooms.length}</Badge>
      </div>
      {rooms.length === 0 ? (
        <p className="text-sm text-muted-foreground">{emptyMessage}</p>
      ) : (
        <div className="grid grid-cols-3 gap-2 sm:grid-cols-[repeat(auto-fill,minmax(120px,1fr))] sm:gap-3 animate-in fade-in-0 slide-in-from-bottom-1 duration-300">
          {rooms.map(({ room }) => (
            <Button
              key={room}
              type="button"
              variant="outline"
              onClick={() => onSelect(room)}
              aria-pressed={room === selectedRoom}
              className={cn(
                "h-10 gap-1.5 border-l-[3px] bg-surface px-1 text-[13px] shadow-none sm:h-12 sm:gap-2 sm:border-l-4 sm:px-2.5 sm:text-sm sm:shadow-xs sm:hover:shadow-md dark:bg-surface",
                variantClass,
                room === selectedRoom &&
                  "ring-2 ring-primary ring-offset-2 ring-offset-card"
              )}
            >
              Room {room}
              {reportedRooms.has(room) && (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <span
                      className="size-2 rounded-full bg-reported"
                      aria-label="Reported by a student"
                    />
                  </TooltipTrigger>
                  <TooltipContent>Reported by a student</TooltipContent>
                </Tooltip>
              )}
            </Button>
          ))}
        </div>
      )}
    </section>
  );
}

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
  nowActive: boolean;
  onToggleNow: () => void;
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
  nowActive,
  onToggleNow,
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
        lastActivityAt: 0,
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
    <Card className="mb-8 gap-0 overflow-visible py-4 shadow-lg ring-border sm:py-6">
      <CardHeader className="flex items-center justify-between px-4 sm:px-6">
        <CardTitle className="text-lg font-semibold">Find a room</CardTitle>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="text-primary dark:text-accent-foreground"
          onClick={onReset}
        >
          <RotateCcw />
          Reset
        </Button>
      </CardHeader>

      <CardContent className="mt-3 px-4 sm:mt-4 sm:px-6">
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <Label className={fieldLabelClass}>Building</Label>
            <BuildingCombobox
              buildings={buildings}
              selectedBuilding={selectedBuilding}
              onChange={onBuildingChange}
            />
          </div>

          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <div className="flex flex-col gap-2">
              <Label className={fieldLabelClass}>Day</Label>
              <DaySelect
                days={SEARCH_DAY_CODES}
                selectedDay={selectedDay}
                onChange={onDayChange}
                todayCode={todayCode}
                disabled={nowActive}
              />
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="start-time" className={fieldLabelClass}>
                Start
              </Label>
              <Input
                id="start-time"
                type="time"
                step="1800"
                className={timeInputClass}
                value={`${startTime.slice(0, 2)}:${startTime.slice(2)}`}
                onChange={e => onStartTimeChange(e.target.value.replace(":", ""))}
                disabled={nowActive}
              />
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="end-time" className={fieldLabelClass}>
                End
              </Label>
              <Input
                id="end-time"
                type="time"
                step="1800"
                className={timeInputClass}
                value={`${endTime.slice(0, 2)}:${endTime.slice(2)}`}
                onChange={e => onEndTimeChange(e.target.value.replace(":", ""))}
                disabled={nowActive}
              />
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="now-toggle" className={fieldLabelClass}>
                Now
              </Label>
              <label
                htmlFor="now-toggle"
                className={cn(
                  "flex h-10 cursor-pointer items-center justify-between gap-2 rounded-lg border border-input bg-surface px-3 text-sm transition-colors",
                  nowActive && "border-primary bg-accent text-accent-foreground"
                )}
                title={
                  nowActive
                    ? "Showing live availability — switch off to unlock day/time"
                    : "Lock to live availability right now"
                }
              >
                <span className="flex items-center gap-2 font-medium">
                  <span
                    className={cn(
                      "size-2 rounded-full",
                      nowActive
                        ? "bg-live animate-[liveGlow_2s_ease-in-out_infinite]"
                        : "bg-muted-foreground/40"
                    )}
                  />
                  {nowActive ? "Live" : "Off"}
                </span>
                <Switch
                  id="now-toggle"
                  checked={nowActive}
                  onCheckedChange={onToggleNow}
                />
              </label>
            </div>
          </div>

          {invalidRange && (
            <p className="text-sm text-destructive">
              End time must be after start time.
            </p>
          )}
        </div>

        {selectedBuilding && !invalidRange && (
          <>
            <RoomCardSection
              title="Available"
              rooms={availableRooms}
              variantClass="border-l-available"
              emptyMessage="No rooms available for this time."
              selectedRoom={selectedRoom}
              reportedRooms={reportedRoomsInWindow}
              onSelect={toggleRoom}
            />

            <RoomCardSection
              title="Busy"
              rooms={busyRooms}
              variantClass="border-l-busy opacity-65"
              emptyMessage="All rooms are free at this time."
              selectedRoom={selectedRoom}
              reportedRooms={reportedRoomsInWindow}
              onSelect={toggleRoom}
            />
          </>
        )}

        {selectedRoom && selectedStatus && (
          <div
            ref={detailRef}
            className="mt-6 scroll-mt-6 animate-in fade-in-0 slide-in-from-bottom-1 duration-300"
          >
            <Separator className="mb-6" />

            <div className="flex flex-col items-center gap-3 rounded-xl bg-surface p-4 text-center ring-1 ring-border sm:p-6">
              <p className="text-sm text-muted-foreground">
                Room {selectedRoom} · {DAY_LABELS[selectedDay]}{" "}
                {startTime.slice(0, 2)}:{startTime.slice(2)}
                {" – "}
                {endTime.slice(0, 2)}:{endTime.slice(2)}
              </p>

              <p
                className={cn(
                  "text-2xl font-bold tracking-tight sm:text-3xl",
                  selectedStatus.available ? "text-available" : "text-busy"
                )}
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
              <Button
                type="button"
                variant="outline"
                className="mt-4 h-auto min-h-10 w-full border-dashed py-2 whitespace-normal border-reported bg-transparent text-reported hover:bg-reported/10 hover:text-reported dark:border-reported dark:bg-transparent dark:hover:bg-reported/10"
                onClick={() => setShowReportForm(true)}
              >
                <Flag />
                See a class here that isn&apos;t shown? Report it
              </Button>
            )}

            <WeeklyScheduleGrid
              weeklySchedule={weeklySchedule}
              reportedSchedule={scheduleForGrid}
              showNowPointer={showNowPointer}
              nowPosition={nowPosition}
              currentDay={currentDay}
              focusDayKey={dayCodeToWeekdayKey(selectedDay)}
            />
          </div>
        )}
      </CardContent>
    </Card>
  );
}
