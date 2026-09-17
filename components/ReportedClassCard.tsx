"use client";

import styles from "@/app/page.module.css";
import { DAY_LABELS } from "@/lib/time";
import type { ClassReport, ReportVote } from "@/lib/reportTypes";

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

  return (
    <div className={styles.reportCard}>
      <div className={styles.reportHeader}>
        <span className={styles.reportBadge}>⚠︎ Reported</span>
        <span className={styles.reportConfidence}>
          {confidencePercent}% confidence
        </span>
      </div>

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

      {isOwnReport ? (
        <p className={styles.reportMeta}>You reported this class.</p>
      ) : (
        <div className={styles.reportVotes}>
          <span className={styles.reportVotePrompt}>Is this accurate?</span>

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
