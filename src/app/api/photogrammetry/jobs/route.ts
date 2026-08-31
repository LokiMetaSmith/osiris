import { NextRequest, NextResponse } from 'next/server';
import { photogrammetryJobStore } from '@/lib/photogrammetry/job-store';
import { nodeOdmClient } from '@/lib/photogrammetry/nodeodm-client';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const jobId = searchParams.get('id');

  if (jobId) {
    const job = photogrammetryJobStore.getJob(jobId);
    if (!job) {
      return NextResponse.json({ success: false, error: 'Job not found' }, { status: 404 });
    }

    // Refresh status from NodeODM if in progress
    if (job.status === 'processing' && job.nodeOdmTaskId) {
      const nodeStatus = await nodeOdmClient.getTaskStatus(job.nodeOdmTaskId);
      if (nodeStatus.status.name === 'COMPLETED') {
        photogrammetryJobStore.updateJob(jobId, {
          status: 'completed',
          progress: 100,
        });
      } else if (nodeStatus.status.name === 'FAILED') {
        photogrammetryJobStore.updateJob(jobId, {
          status: 'failed',
          error: nodeStatus.error || 'Photogrammetry processing failed',
        });
      } else {
        photogrammetryJobStore.updateJob(jobId, {
          progress: Math.max(job.progress, nodeStatus.progress),
        });
      }
    }

    return NextResponse.json({ success: true, job: photogrammetryJobStore.getJob(jobId) });
  }

  // Sync all processing jobs
  const jobs = photogrammetryJobStore.getAllJobs();
  for (const j of jobs) {
    if (j.status === 'processing' && j.nodeOdmTaskId) {
      const nodeStatus = await nodeOdmClient.getTaskStatus(j.nodeOdmTaskId);
      if (nodeStatus.status.name === 'COMPLETED') {
        photogrammetryJobStore.updateJob(j.id, {
          status: 'completed',
          progress: 100,
        });
      }
    }
  }

  return NextResponse.json({
    success: true,
    jobs: photogrammetryJobStore.getAllJobs(),
  });
}

export async function DELETE(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const jobId = searchParams.get('id');

  if (!jobId) {
    return NextResponse.json({ success: false, error: 'Missing job ID' }, { status: 400 });
  }

  const job = photogrammetryJobStore.getJob(jobId);
  if (!job) {
    return NextResponse.json({ success: false, error: 'Job not found' }, { status: 404 });
  }

  if (job.nodeOdmTaskId) {
    await nodeOdmClient.cancelTask(job.nodeOdmTaskId);
  }

  photogrammetryJobStore.deleteJob(jobId);

  return NextResponse.json({ success: true, message: `Job ${jobId} deleted` });
}
