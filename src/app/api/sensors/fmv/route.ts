import { NextRequest, NextResponse } from 'next/server';
import { updateSensor } from '@/lib/sensor-store';
import { parseMisbST0601 } from '@/lib/fmv/klv-parser';
import { calculateCameraFootprint } from '@/lib/fmv/footprint-calculator';
import { LiveSensor } from '@/app/api/sensors/types';

export async function POST(req: NextRequest) {
  try {
    const contentType = req.headers.get('content-type') || '';
    let sensorId = req.nextUrl.searchParams.get('id') || 'drone-fmv-01';
    let sensorName = req.nextUrl.searchParams.get('name') || 'Aerial Drone FMV-1';
    let streamUrl = req.nextUrl.searchParams.get('stream_url') || 'http://localhost:8889/drone1';
    let streamType = (req.nextUrl.searchParams.get('stream_type') || 'webrtc') as 'webrtc' | 'hls' | 'mjpeg';

    let lat = 42.7012;
    let lng = 23.3219;
    let alt = 500;
    let heading = 90;
    let pitch = -45;
    let roll = 0;
    let hfov = 40;

    if (contentType.includes('application/octet-stream')) {
      const buffer = new Uint8Array(await req.arrayBuffer());
      const decoded = parseMisbST0601(buffer);

      if (decoded.sensorLatitude !== undefined) lat = decoded.sensorLatitude;
      if (decoded.sensorLongitude !== undefined) lng = decoded.sensorLongitude;
      if (decoded.sensorTrueAltitude !== undefined) alt = decoded.sensorTrueAltitude;
      if (decoded.sensorYaw !== undefined) heading = decoded.sensorYaw;
      if (decoded.sensorPitch !== undefined) pitch = decoded.sensorPitch;
      if (decoded.sensorRoll !== undefined) roll = decoded.sensorRoll;
      if (decoded.horizontalFov !== undefined) hfov = decoded.horizontalFov;
    } else {
      const body = await req.json();
      if (body.id) sensorId = body.id;
      if (body.name) sensorName = body.name;
      if (body.stream_url) streamUrl = body.stream_url;
      if (body.stream_type) streamType = body.stream_type;

      if (body.telemetry) {
        if (body.telemetry.lat !== undefined) lat = body.telemetry.lat;
        if (body.telemetry.lng !== undefined) lng = body.telemetry.lng;
        if (body.telemetry.alt !== undefined) alt = body.telemetry.alt;
        if (body.telemetry.heading !== undefined) heading = body.telemetry.heading;
        if (body.telemetry.pitch !== undefined) pitch = body.telemetry.pitch;
        if (body.telemetry.roll !== undefined) roll = body.telemetry.roll;
        if (body.telemetry.hfov !== undefined) hfov = body.telemetry.hfov;
      }
    }

    // Compute dynamic camera ground footprint
    const footprint = calculateCameraFootprint({
      sensorLat: lat,
      sensorLng: lng,
      sensorAltMeters: alt,
      headingDeg: heading,
      pitchDeg: pitch,
      rollDeg: roll,
      hfovDeg: hfov
    });

    const sensor: LiveSensor = {
      id: sensorId,
      name: sensorName,
      type: 'drone',
      status: 'active',
      telemetry: {
        lat,
        lng,
        alt,
        heading,
        speed: 15.5,
        battery: 88,
        signal_strength: 95
      },
      stream_url: streamUrl,
      stream_type: streamType,
      source: 'FMV_MISB_FEED',
      last_seen: new Date().toISOString(),
      metadata: {
        pitch,
        roll,
        hfov,
        footprintPolygon: footprint.footprintPolygon,
        targetCenterLocation: footprint.targetCenterLocation,
        slantRangeMeters: footprint.slantRangeMeters
      }
    };

    updateSensor(sensor);

    return NextResponse.json({
      success: true,
      sensor,
      footprint
    });

  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to process FMV telemetry' }, { status: 400 });
  }
}
