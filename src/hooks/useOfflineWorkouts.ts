import { useState, useEffect, useCallback } from "react";
import { getAll, put, remove, addToSyncQueue, STORES } from "@/lib/offlineDb";
import { getDeviceId } from "@/lib/deviceId";
import { syncToCloud } from "@/lib/syncEngine";

export interface OfflineWorkoutCompletion {
  id: string;
  device_id: string;
  workout_id: string;
  completed_at: string;
}

export function useOfflineWorkouts() {
  const [completedIds, setCompletedIds] = useState<Set<string>>(new Set());
  const [loaded, setLoaded] = useState(false);

  const loadCompletions = useCallback(async () => {
    const all = await getAll<OfflineWorkoutCompletion>(STORES.workout_completions);
    const deviceId = getDeviceId();
    const ids = new Set(all.filter((w) => w.device_id === deviceId).map((w) => w.workout_id));
    setCompletedIds(ids);
    setLoaded(true);
  }, []);

  useEffect(() => { loadCompletions(); }, [loadCompletions]);

  const toggleWorkout = useCallback(async (workoutId: string) => {
    const all = await getAll<OfflineWorkoutCompletion>(STORES.workout_completions);
    const deviceId = getDeviceId();
    const existing = all.find((w) => w.device_id === deviceId && w.workout_id === workoutId);

    if (existing) {
      await remove(STORES.workout_completions, existing.id);
      await addToSyncQueue({
        id: crypto.randomUUID(),
        store: "workout_completions",
        action: "delete",
        data: { id: existing.id },
        timestamp: Date.now(),
      });
    } else {
      const entry: OfflineWorkoutCompletion = {
        id: crypto.randomUUID(),
        device_id: deviceId,
        workout_id: workoutId,
        completed_at: new Date().toISOString(),
      };
      await put(STORES.workout_completions, entry);
      await addToSyncQueue({
        id: crypto.randomUUID(),
        store: "workout_completions",
        action: "upsert",
        data: entry,
        timestamp: Date.now(),
      });
    }
    await loadCompletions();
    syncToCloud();
  }, [loadCompletions]);

  return { completedIds, loaded, toggleWorkout };
}
