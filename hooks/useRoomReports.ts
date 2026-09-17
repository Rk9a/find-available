"use client";

import { useCallback, useEffect, useState } from "react";
import type { ClassReport } from "@/lib/reportTypes";

export function useRoomReports(building: string, deviceId: string) {
  const [reports, setReports] = useState<ClassReport[]>([]);
  const [loading, setLoading] = useState(false);

  const refetch = useCallback(async () => {
    if (!building) {
      setReports([]);
      return;
    }

    setLoading(true);

    try {
      const params = new URLSearchParams({ building, deviceId });
      const response = await fetch(`/api/reports?${params.toString()}`);

      if (!response.ok) throw new Error("Failed to load reports");

      const result = await response.json();

      setReports(result.reports ?? []);
    } catch (error) {
      console.error("Room reports loading error:", error);
    } finally {
      setLoading(false);
    }
  }, [building, deviceId]);

  useEffect(() => {
    refetch();
  }, [refetch]);

  return { reports, loading, refetch };
}
