export interface PhotogrammetryJob {
  id: string;
  name: string;
  status: 'queued' | 'processing' | 'completed' | 'failed' | 'canceled';
  progress: number;
  imagesCount: number;
  createdAt: string;
  completedAt?: string;
  nodeOdmTaskId?: string;
  error?: string;
  bounds?: [number, number, number, number]; // [minLng, minLat, maxLng, maxLat]
  orthoTileUrl?: string;
  options?: Record<string, unknown>;
}

class PhotogrammetryJobStore {
  private jobs: Map<string, PhotogrammetryJob> = new Map();

  public createJob(data: Omit<PhotogrammetryJob, 'id' | 'createdAt' | 'status' | 'progress'>): PhotogrammetryJob {
    const id = `job_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;
    const job: PhotogrammetryJob = {
      ...data,
      id,
      status: 'queued',
      progress: 0,
      createdAt: new Date().toISOString(),
    };
    this.jobs.set(id, job);
    return job;
  }

  public getJob(id: string): PhotogrammetryJob | undefined {
    return this.jobs.get(id);
  }

  public getAllJobs(): PhotogrammetryJob[] {
    return Array.from(this.jobs.values()).sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }

  public updateJob(id: string, updates: Partial<PhotogrammetryJob>): PhotogrammetryJob | undefined {
    const job = this.jobs.get(id);
    if (!job) return undefined;

    const updatedJob: PhotogrammetryJob = {
      ...job,
      ...updates,
      ...(updates.status === 'completed' && !job.completedAt ? { completedAt: new Date().toISOString() } : {}),
    };

    this.jobs.set(id, updatedJob);
    return updatedJob;
  }

  public deleteJob(id: string): boolean {
    return this.jobs.delete(id);
  }

  public clear(): void {
    this.jobs.clear();
  }
}

// Global singleton for Next.js hot-reloading preservation
const globalForJobs = globalThis as unknown as {
  photogrammetryJobStore?: PhotogrammetryJobStore;
};

export const photogrammetryJobStore =
  globalForJobs.photogrammetryJobStore ?? new PhotogrammetryJobStore();

if (process.env.NODE_ENV !== 'production') {
  globalForJobs.photogrammetryJobStore = photogrammetryJobStore;
}
