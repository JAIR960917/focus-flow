// Sync engine: pushes offline changes to Supabase when online

import { supabase } from "@/integrations/supabase/client";
import { getSyncQueue, removeFromSyncQueue, getAll, put, STORES, type SyncAction } from "./offlineDb";
import { getDeviceId } from "./deviceId";

let isSyncing = false;

export async function syncToCloud(): Promise<void> {
  if (isSyncing || !navigator.onLine) return;
  isSyncing = true;

  try {
    const queue = await getSyncQueue();
    
    for (const entry of queue) {
      try {
        if (entry.action === "upsert") {
          const { error } = await supabase
            .from(entry.store as any)
            .upsert(entry.data as any, { onConflict: "id" });
          if (error) throw error;
        } else if (entry.action === "delete") {
          const { error } = await supabase
            .from(entry.store as any)
            .delete()
            .eq("id", entry.data.id);
          if (error) throw error;
        }
        await removeFromSyncQueue(entry.id);
      } catch (err) {
        console.error("Sync error for entry:", entry.id, err);
        // Keep in queue for retry
      }
    }
  } finally {
    isSyncing = false;
  }
}

export async function pullFromCloud(): Promise<void> {
  if (!navigator.onLine) return;
  const deviceId = getDeviceId();

  try {
    // Pull tasks
    const { data: tasks } = await supabase
      .from("tasks")
      .select("*")
      .eq("device_id", deviceId);
    if (tasks) {
      for (const task of tasks) {
        await put(STORES.tasks, task);
      }
    }

    // Pull workout completions
    const { data: workouts } = await supabase
      .from("workout_completions")
      .select("*")
      .eq("device_id", deviceId);
    if (workouts) {
      for (const w of workouts) {
        await put(STORES.workout_completions, w);
      }
    }

    // Pull running sessions
    const { data: sessions } = await supabase
      .from("running_sessions")
      .select("*")
      .eq("device_id", deviceId);
    if (sessions) {
      for (const s of sessions) {
        await put(STORES.running_sessions, s);
      }
    }
  } catch (err) {
    console.error("Pull from cloud error:", err);
  }
}

// Initialize sync listeners
export function initSync(): void {
  // Sync when coming online
  window.addEventListener("online", () => {
    syncToCloud();
  });

  // Initial sync on app load
  if (navigator.onLine) {
    syncToCloud().then(() => pullFromCloud());
  }
}
