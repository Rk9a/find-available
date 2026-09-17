"use client";

import styles from "@/app/page.module.css";

type LiveIndicatorProps = {
  loading: boolean;
  shortTerm: string;
};

export function LiveIndicator({ loading, shortTerm }: LiveIndicatorProps) {
  return (
    <div
      className={`${styles.liveIndicator} ${loading ? styles.loadingIndicator : ""}`}
    >
      <span className={loading ? styles.loadingDot : styles.liveDot} />

      {loading ? "Loading Semester ···" : `Live · ${shortTerm}`}
    </div>
  );
}
