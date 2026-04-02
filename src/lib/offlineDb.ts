// Simple IndexedDB wrapper for offline-first storage

const DB_NAME = "focusflow_offline";
const DB_VERSION = 1;

const STORES = {
  tasks: "tasks",
  workout_completions: "workout_completions",
  running_sessions: "running_sessions",
  sync_queue: "sync_queue",
} as const;

export type SyncAction = {
  id: string;
  store: string;
  action: "upsert" | "delete";
  data: any;
  timestamp: number;
};

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION);
    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains(STORES.tasks)) {
        db.createObjectStore(STORES.tasks, { keyPath: "id" });
      }
      if (!db.objectStoreNames.contains(STORES.workout_completions)) {
        db.createObjectStore(STORES.workout_completions, { keyPath: "id" });
      }
      if (!db.objectStoreNames.contains(STORES.running_sessions)) {
        db.createObjectStore(STORES.running_sessions, { keyPath: "id" });
      }
      if (!db.objectStoreNames.contains(STORES.sync_queue)) {
        db.createObjectStore(STORES.sync_queue, { keyPath: "id" });
      }
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

export async function getAll<T>(storeName: string): Promise<T[]> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(storeName, "readonly");
    const store = tx.objectStore(storeName);
    const req = store.getAll();
    req.onsuccess = () => resolve(req.result as T[]);
    req.onerror = () => reject(req.error);
  });
}

export async function put<T>(storeName: string, data: T): Promise<void> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(storeName, "readwrite");
    const store = tx.objectStore(storeName);
    store.put(data);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

export async function remove(storeName: string, id: string): Promise<void> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(storeName, "readwrite");
    const store = tx.objectStore(storeName);
    store.delete(id);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

export async function clear(storeName: string): Promise<void> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(storeName, "readwrite");
    const store = tx.objectStore(storeName);
    store.clear();
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

// Sync queue operations
export async function addToSyncQueue(entry: SyncAction): Promise<void> {
  await put(STORES.sync_queue, entry);
}

export async function getSyncQueue(): Promise<SyncAction[]> {
  return getAll<SyncAction>(STORES.sync_queue);
}

export async function clearSyncQueue(): Promise<void> {
  await clear(STORES.sync_queue);
}

export async function removeFromSyncQueue(id: string): Promise<void> {
  await remove(STORES.sync_queue, id);
}

export { STORES };
