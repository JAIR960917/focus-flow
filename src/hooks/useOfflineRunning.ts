import { useCallback } from "react";
import { put, addToSyncQueue, STORES } from "@/lib/offlineDb";
import { getDeviceId } from "@/lib/deviceId";
import { syncToCloud } from "@/lib/syncEngine";
import type { GeoPoint } from "@/pages/Running";

export interface OfflineRunningSession {
  id: string;
  device_id: string;
  distance_meters: number;
  duration_seconds: number;
  avg_pace: string;
  gps_points: GeoPoint[];
  created_at: string;
}

export function useOfflineRunning() {
  const saveSession = useCallback(async (data: {
    distance_meters: number;
    duration_seconds: number;
    avg_pace: string;
    gps_points: GeoPoint[];
  }) => {
    const session: OfflineRunningSession = {
      id: crypto.randomUUID(),
      device_id: getDeviceId(),
      ...data,
      created_at: new Date().toISOString(),
    };
    await put(STORES.running_sessions, session);
    await addToSyncQueue({
      id: crypto.randomUUID(),
      store: "running_sessions",
      action: "upsert",
      data: session,
      timestamp: Date.now(),
    });
    syncToCloud();
  }, []);

  return { saveSession };
}
