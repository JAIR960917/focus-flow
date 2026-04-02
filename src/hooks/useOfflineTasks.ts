import { useState, useEffect, useCallback } from "react";
import { getAll, put, remove, addToSyncQueue, STORES, type SyncAction } from "@/lib/offlineDb";
import { getDeviceId } from "@/lib/deviceId";
import { syncToCloud } from "@/lib/syncEngine";

export interface OfflineTask {
  id: string;
  device_id: string;
  title: string;
  completed: boolean;
  created_at: string;
  updated_at: string;
}

export function useOfflineTasks() {
  const [tasks, setTasks] = useState<OfflineTask[]>([]);
  const [loaded, setLoaded] = useState(false);

  const loadTasks = useCallback(async () => {
    const all = await getAll<OfflineTask>(STORES.tasks);
    const deviceId = getDeviceId();
    setTasks(all.filter((t) => t.device_id === deviceId).sort((a, b) => 
      new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    ));
    setLoaded(true);
  }, []);

  useEffect(() => { loadTasks(); }, [loadTasks]);

  const addTask = useCallback(async (title: string) => {
    const task: OfflineTask = {
      id: crypto.randomUUID(),
      device_id: getDeviceId(),
      title,
      completed: false,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    await put(STORES.tasks, task);
    await addToSyncQueue({
      id: crypto.randomUUID(),
      store: "tasks",
      action: "upsert",
      data: task,
      timestamp: Date.now(),
    });
    await loadTasks();
    syncToCloud();
  }, [loadTasks]);

  const toggleTask = useCallback(async (id: string) => {
    const all = await getAll<OfflineTask>(STORES.tasks);
    const task = all.find((t) => t.id === id);
    if (!task) return;
    const updated = { ...task, completed: !task.completed, updated_at: new Date().toISOString() };
    await put(STORES.tasks, updated);
    await addToSyncQueue({
      id: crypto.randomUUID(),
      store: "tasks",
      action: "upsert",
      data: updated,
      timestamp: Date.now(),
    });
    await loadTasks();
    syncToCloud();
  }, [loadTasks]);

  const deleteTask = useCallback(async (id: string) => {
    await remove(STORES.tasks, id);
    await addToSyncQueue({
      id: crypto.randomUUID(),
      store: "tasks",
      action: "delete",
      data: { id },
      timestamp: Date.now(),
    });
    await loadTasks();
    syncToCloud();
  }, [loadTasks]);

  return { tasks, loaded, addTask, toggleTask, deleteTask };
}
