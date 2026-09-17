"use client";

import { useEffect, useState } from "react";
import { getKFUPMNow, type KfupmNow } from "@/lib/time";

export function useKfupmClock(intervalMs = 60_000): KfupmNow {
  const [kfupmNow, setKfupmNow] = useState<KfupmNow>(getKFUPMNow);

  useEffect(() => {
    const interval = setInterval(() => {
      setKfupmNow(getKFUPMNow());
    }, intervalMs);

    return () => clearInterval(interval);
  }, [intervalMs]);

  return kfupmNow;
}
