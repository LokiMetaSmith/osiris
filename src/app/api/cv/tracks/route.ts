import { NextResponse } from 'next/server';
import { getActiveTargetTracks, geolocateBoundingBox, BoundingBoxDetection } from '@/lib/cv/target-tracker';
import { sensorStore } from '@/lib/sensor-store';

export async function GET() {
  const tracks = getActiveTargetTracks();
  return NextResponse.json({
    tracks,
    total: tracks.length,
    timestamp: new Date().toISOString()
  });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { sensor_id, detections } = body as {
      sensor_id: string;
      detections: BoundingBoxDetection[];
    };

    const sensor = sensorStore.get(sensor_id);
    if (!sensor) {
      return NextResponse.json({ error: 'Sensor not found' }, { status: 404 });
    }

    const tracks = detections.map(det => geolocateBoundingBox(det, sensor));
    return NextResponse.json({ success: true, tracks });
  } catch (err) {
    return NextResponse.json({ error: 'Invalid payload' }, { status: 400 });
  }
}
