import { NextRequest, NextResponse } from 'next/server';
import { photogrammetryJobStore } from '@/lib/photogrammetry/job-store';
import { nodeOdmClient } from '@/lib/photogrammetry/nodeodm-client';

export async function POST(req: NextRequest) {
  try {
    const contentType = req.headers.get('content-type') || '';

    let name = 'Aerial Survey';
    let imagesCount = 10;
    let bounds: [number, number, number, number] = [-122.4194, 37.7749, -122.4094, 37.7849]; // [minLng, minLat, maxLng, maxLat]
    let options: Record<string, unknown> = {};

    if (contentType.includes('application/json')) {
      const body = await req.json();
      name = body.name || name;
      imagesCount = body.imagesCount || imagesCount;
      if (body.bounds) bounds = body.bounds;
      if (body.options) options = body.options;
    } else if (contentType.includes('multipart/form-data')) {
      const formData = await req.formData();
      name = (formData.get('name') as string) || name;
      const images = formData.getAll('images');
      if (images.length > 0) {
        imagesCount = images.length;
      }
      const boundsStr = formData.get('bounds') as string;
      if (boundsStr) {
        try {
          bounds = JSON.parse(boundsStr);
        } catch {
          // Keep default
        }
      }
    }

    // Create job in store
    const job = photogrammetryJobStore.createJob({
      name,
      imagesCount,
      bounds,
      options,
    });

    // Dispatch to NodeODM Client
    const taskRes = await nodeOdmClient.createTask([], options);

    // Update job with NodeODM task ID and status
    const updatedJob = photogrammetryJobStore.updateJob(job.id, {
      nodeOdmTaskId: taskRes.uuid,
      status: 'processing',
      progress: 15,
      orthoTileUrl: `/api/tiles/ortho/${job.id}/{z}/{x}/{y}`,
    });

    return NextResponse.json({
      success: true,
      job: updatedJob,
    }, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error during upload';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
