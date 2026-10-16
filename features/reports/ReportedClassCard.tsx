"use client";

import { Flag, ThumbsDown, ThumbsUp } from "lucide-react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { DAY_LABELS } from "@/lib/time";
import type { ClassReport, ReportVote } from "./reportTypes";

type ReportedClassCardProps = {
  report: ClassReport;
  deviceId: string;
  onVote: (reportId: string, vote: ReportVote) => void;
  voting: boolean;
};

const voteButtonClass =
  "border-reported bg-surface font-semibold text-reported-foreground hover:bg-reported/10 hover:text-reported-foreground dark:border-reported dark:bg-surface dark:hover:bg-reported/15";

function formatTime(time: string): string {
  return `${time.slice(0, 2)}:${time.slice(2)}`;
}

export function ReportedClassCard({
  report,
  deviceId,
  onVote,
  voting,
}: ReportedClassCardProps) {
  const isOwnReport = report.reporterId === deviceId;
  const confidencePercent = Math.round(report.confidence * 100);
  const confirmationLabel = `${report.confirms} confirmation${report.confirms === 1 ? "" : "s"}`;
  const disputeLabel = report.denies > 0 ? `, ${report.denies} disputed` : "";

  return (
    <Card className="mt-4 gap-2 border border-reported-border bg-reported-surface px-4 py-4 text-reported-foreground ring-0">
      <Badge
        variant="outline"
        className="border-reported/40 font-bold tracking-wide text-reported uppercase"
      >
        <Flag />
        Reported
      </Badge>

      <p className="text-[15px] font-bold">
        {report.subject} {report.courseNumber}
        {report.section ? `-${report.section}` : ""}
      </p>

      <p className="text-sm">
        {DAY_LABELS[report.day]} {formatTime(report.startTime)}
        {" – "}
        {formatTime(report.endTime)}
        {report.instructor ? ` · ${report.instructor}` : ""}
      </p>

      {report.note && <p className="text-sm italic">&ldquo;{report.note}&rdquo;</p>}

      <p className="text-sm font-semibold">
        {confidencePercent}% reliable
        <span className="font-normal opacity-85">
          {" "}
          ({confirmationLabel}
          {disputeLabel})
        </span>
      </p>

      {isOwnReport ? (
        <p className="text-sm">You reported this class.</p>
      ) : (
        <div className="mt-1 flex flex-wrap items-center gap-2">
          <span className="mr-1 text-sm">Is this still happening?</span>

          <Button
            type="button"
            size="sm"
            variant="outline"
            disabled={voting}
            onClick={() => onVote(report.id, "confirm")}
            className={cn(
              voteButtonClass,
              report.userVote === "confirm" &&
                "border-primary bg-primary text-primary-foreground hover:bg-primary/90 hover:text-primary-foreground dark:border-primary dark:bg-primary dark:hover:bg-primary/90"
            )}
          >
            <ThumbsUp />
            Yes ({report.confirms})
          </Button>

          <Button
            type="button"
            size="sm"
            variant="outline"
            disabled={voting}
            onClick={() => onVote(report.id, "deny")}
            className={cn(
              voteButtonClass,
              report.userVote === "deny" &&
                "border-deny bg-deny text-white hover:bg-deny/90 hover:text-white dark:border-deny dark:bg-deny dark:hover:bg-deny/90"
            )}
          >
            <ThumbsDown />
            No ({report.denies})
          </Button>
        </div>
      )}
    </Card>
  );
}
