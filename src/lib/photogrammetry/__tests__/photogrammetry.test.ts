import { describe, it, expect, beforeEach } from 'vitest';
import { photogrammetryJobStore } from '../job-store';
import { nodeOdmClient } from '../nodeodm-client';

describe('Photogrammetry Job Store', () => {
  beforeEach(() => {
    photogrammetryJobStore.clear();
  });

  it('creates a new photogrammetry job', () => {
    const job = photogrammetryJobStore.createJob({
      name: 'Test Recon Survey',
      imagesCount: 30,
      bounds: [-122.5, 37.7, -122.4, 37.8],
    });

    expect(job.id).toBeDefined();
    expect(job.name).toBe('Test Recon Survey');
    expect(job.status).toBe('queued');
    expect(job.progress).toBe(0);
    expect(job.imagesCount).toBe(30);
  });

  it('retrieves and updates a job status', () => {
    const job = photogrammetryJobStore.createJob({
      name: 'Alpha Grid',
      imagesCount: 15,
    });

    const updated = photogrammetryJobStore.updateJob(job.id, {
      status: 'processing',
      progress: 50,
      nodeOdmTaskId: 'task_123',
    });

    expect(updated?.status).toBe('processing');
    expect(updated?.progress).toBe(50);
    expect(updated?.nodeOdmTaskId).toBe('task_123');

    const retrieved = photogrammetryJobStore.getJob(job.id);
    expect(retrieved?.progress).toBe(50);
  });

  it('deletes a job from the store', () => {
    const job = photogrammetryJobStore.createJob({
      name: 'Delete Test',
      imagesCount: 10,
    });

    expect(photogrammetryJobStore.getJob(job.id)).toBeDefined();
    const deleted = photogrammetryJobStore.deleteJob(job.id);
    expect(deleted).toBe(true);
    expect(photogrammetryJobStore.getJob(job.id)).toBeUndefined();
  });
});

describe('NodeODM API Client', () => {
  it('fetches server status / fallback info', async () => {
    const info = await nodeOdmClient.getInfo();
    expect(info).toBeDefined();
    expect(info.version).toBeDefined();
  });

  it('creates a photogrammetry task and queries status', async () => {
    const taskRes = await nodeOdmClient.createTask([], { 'auto-boundary': true });
    expect(taskRes.uuid).toBeDefined();

    const taskStatus = await nodeOdmClient.getTaskStatus(taskRes.uuid);
    expect(taskStatus.uuid).toBe(taskRes.uuid);
    expect(taskStatus.status).toBeDefined();
    expect(taskStatus.progress).toBeGreaterThanOrEqual(0);
  });
});
