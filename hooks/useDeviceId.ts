"use client";

import { useState } from "react";

const STORAGE_KEY = "deviceId";

function getOrCreateDeviceId(): string {
  try {
    const existing = localStorage.getItem(STORAGE_KEY);

    if (existing) return existing;

    const id = crypto.randomUUID();

    localStorage.setItem(STORAGE_KEY, id);

    return id;
  } catch {
    return crypto.randomUUID();
  }
}

export function useDeviceId(): string {
  const [deviceId] = useState(getOrCreateDeviceId);

  return deviceId;
}
