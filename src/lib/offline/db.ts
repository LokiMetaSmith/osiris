export interface OfflineQueuedReport {
  id: string;
  type: 'telemetry' | 'observation' | 'geofence';
  payload: any;
  created_at: string;
  synced: boolean;
}

const DB_NAME = 'osint_offline_db';
const DB_VERSION = 1;
const STORE_NAME = 'queued_reports';

export function openOfflineDb(): Promise<IDBDatabase | null> {
  if (typeof window === 'undefined' || !('indexedDB' in window)) {
    return Promise.resolve(null);
  }

  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (event: any) => {
      const db = event.target.result as IDBDatabase;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'id' });
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

// In-memory fallback for SSG / non-browser / test environments
const inMemoryQueue = new Map<string, OfflineQueuedReport>();

export async function queueOfflineReport(report: OfflineQueuedReport): Promise<void> {
  inMemoryQueue.set(report.id, report);
  const db = await openOfflineDb();
  if (!db) return;

  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readwrite');
    const store = tx.objectStore(STORE_NAME);
    const req = store.put(report);
    req.onsuccess = () => resolve();
    req.onerror = () => reject(req.error);
  });
}

export async function getUnsyncedReports(): Promise<OfflineQueuedReport[]> {
  const db = await openOfflineDb();
  if (!db) {
    return Array.from(inMemoryQueue.values()).filter(r => !r.synced);
  }

  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readonly');
    const store = tx.objectStore(STORE_NAME);
    const req = store.getAll();
    req.onsuccess = () => {
      const all = (req.result as OfflineQueuedReport[]) || [];
      resolve(all.filter(r => !r.synced));
    };
    req.onerror = () => reject(req.error);
  });
}

export async function markReportSynced(id: string): Promise<void> {
  const report = inMemoryQueue.get(id);
  if (report) {
    report.synced = true;
  }

  const db = await openOfflineDb();
  if (!db) return;

  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readwrite');
    const store = tx.objectStore(STORE_NAME);
    const getReq = store.get(id);
    getReq.onsuccess = () => {
      if (getReq.result) {
        const updated = { ...getReq.result, synced: true };
        store.put(updated);
      }
      resolve();
    };
    getReq.onerror = () => reject(getReq.error);
  });
}
