import { getUnsyncedReports, markReportSynced, OfflineQueuedReport } from './db';

export async function flushOfflineSyncQueue(): Promise<{ syncedCount: number; errors: number }> {
  let syncedCount = 0;
  let errors = 0;

  try {
    const unsynced = await getUnsyncedReports();

    for (const report of unsynced) {
      try {
        if (report.type === 'telemetry') {
          const res = await fetch('/api/sensors', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(report.payload)
          });
          if (res.ok) {
            await markReportSynced(report.id);
            syncedCount++;
          } else {
            errors++;
          }
        } else {
          // Other report types
          await markReportSynced(report.id);
          syncedCount++;
        }
      } catch (err) {
        errors++;
      }
    }
  } catch {
    errors++;
  }

  return { syncedCount, errors };
}

export function registerOfflineSyncListener(onSyncComplete?: (count: number) => void) {
  if (typeof window === 'undefined') return;

  const handleOnline = async () => {
    const result = await flushOfflineSyncQueue();
    if (result.syncedCount > 0 && onSyncComplete) {
      onSyncComplete(result.syncedCount);
    }
  };

  window.addEventListener('online', handleOnline);
  return () => window.removeEventListener('online', handleOnline);
}
