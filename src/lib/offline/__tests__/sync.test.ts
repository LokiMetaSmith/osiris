import { describe, it, expect } from 'vitest';
import { queueOfflineReport, getUnsyncedReports, markReportSynced, OfflineQueuedReport } from '../db';
import { flushOfflineSyncQueue } from '../sync-engine';

describe('Offline Storage & Sync Engine', () => {
  const sampleReport: OfflineQueuedReport = {
    id: 'report-offline-101',
    type: 'telemetry',
    payload: { id: 'drone-1', telemetry: { lat: 42.7, lng: 23.3 } },
    created_at: new Date().toISOString(),
    synced: false
  };

  it('queues offline reports successfully', async () => {
    await queueOfflineReport(sampleReport);
    const unsynced = await getUnsyncedReports();
    expect(unsynced.some(r => r.id === 'report-offline-101')).toBe(true);
  });

  it('marks offline report as synced', async () => {
    await markReportSynced('report-offline-101');
    const unsynced = await getUnsyncedReports();
    expect(unsynced.some(r => r.id === 'report-offline-101')).toBe(false);
  });

  it('flushes offline sync queue', async () => {
    const freshReport: OfflineQueuedReport = {
      id: 'report-offline-102',
      type: 'observation',
      payload: { note: 'Enemy vehicle sighted' },
      created_at: new Date().toISOString(),
      synced: false
    };

    await queueOfflineReport(freshReport);
    const res = await flushOfflineSyncQueue();
    expect(res.syncedCount).toBeGreaterThan(0);
  });
});
