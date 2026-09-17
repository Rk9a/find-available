"use client";

import { useEffect, useState } from "react";
import type { Section } from "@/lib/types";

export type ScheduleInfo = {
  shortTerm: string;
  status: string;
};

export function useSchedule() {
  const [sections, setSections] = useState<Section[]>([]);
  const [scheduleInfo, setScheduleInfo] = useState<ScheduleInfo>({
    shortTerm: "",
    status: "",
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadSchedule() {
      try {
        const response = await fetch("/api/schedule");

        if (!response.ok) {
          throw new Error("Failed to load schedule");
        }

        const result = await response.json();

        setSections(result.data ?? []);

        setScheduleInfo({
          shortTerm: result.shortTerm,
          status: result.status,
        });
      } catch (error) {
        console.error("Schedule loading error:", error);
      } finally {
        setLoading(false);
      }
    }

    loadSchedule();
  }, []);

  return { sections, scheduleInfo, loading };
}
