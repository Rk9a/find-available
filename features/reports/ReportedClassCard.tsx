"use client";

import styles from "@/app/page.module.css";
import { DAY_LABELS } from "@/lib/time";
import type { ClassReport, ReportVote } from "./reportTypes";

type ReportedClassCardProps = {
  report: ClassReport;
  deviceId: string;
  onVote: (reportId: string, vote: ReportVote) => void;
  voting: boolean;
};

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
    <div className={styles.reportCard}>
      <span className={styles.reportBadge}>Reported</span>

      <p className={styles.reportCourse}>
        {report.subject} {report.courseNumber}
        {report.section ? `-${report.section}` : ""}
      </p>

      <p className={styles.reportMeta}>
        {DAY_LABELS[report.day]} {formatTime(report.startTime)}
        {" – "}
        {formatTime(report.endTime)}
        {report.instructor ? ` · ${report.instructor}` : ""}
      </p>

      {report.note && <p className={styles.reportNote}>&ldquo;{report.note}&rdquo;</p>}

      <p className={styles.reportConfidence}>
        {confidencePercent}% reliable
        <span className={styles.reportConfidenceDetail}>
          {" "}
          ({confirmationLabel}
          {disputeLabel})
        </span>
      </p>

      {isOwnReport ? (
        <p className={styles.reportMeta}>You reported this class.</p>
      ) : (
        <div className={styles.reportVotes}>
          <span className={styles.reportVotePrompt}>Is this still happening?</span>

          <button
            type="button"
            disabled={voting}
            onClick={() => onVote(report.id, "confirm")}
            className={`${styles.voteButton} ${
              report.userVote === "confirm" ? styles.voteButtonConfirmActive : ""
            }`}
          >
            Yes ({report.confirms})
          </button>

          <button
            type="button"
            disabled={voting}
            onClick={() => onVote(report.id, "deny")}
            className={`${styles.voteButton} ${
              report.userVote === "deny" ? styles.voteButtonDenyActive : ""
            }`}
          >
            No ({report.denies})
          </button>
        </div>
      )}
    </div>
  );
}
