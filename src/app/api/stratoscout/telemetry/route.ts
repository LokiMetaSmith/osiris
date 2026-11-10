import { NextRequest, NextResponse } from 'next/server';

export interface MavlinkTelemetryPacket {
  timeUsec?: number;
  lat: number; // In degrees or degE7
  lng: number; // In degrees or degE7
  altMslMeters: number;
  relativeAltMeters?: number;
  vxMps?: number;
  vyMps?: number;
  vzMps?: number;
  headingDeg: number;
  airspeedKts?: number;
  groundspeedKts?: number;
  gimbalPitchDeg?: number;
  gimbalRollDeg?: number;
  gimbalYawDeg?: number;
  batteryPct?: number;
  flightMode?: string;
}

// In-memory latest telemetry state
let latestMavlinkState: MavlinkTelemetryPacket = {
  lat: 36.12,
  lng: -97.06,
  altMslMeters: 19812, // ~65,000 ft
  headingDeg: 42,
  airspeedKts: 48,
  groundspeedKts: 62,
  gimbalPitchDeg: -35,
  batteryPct: 94,
  flightMode: 'AUTO_GLIDE',
};

/**
 * Normalizes incoming MAVLink packets (e.g. converting degE7 if needed)
 */
export function normalizeMavlinkPacket(body: any): MavlinkTelemetryPacket {
  let lat = Number(body.lat || body.latitude || 0);
  let lng = Number(body.lng || body.lon || body.longitude || 0);

  // If provided in 1e7 MAVLink format
  if (Math.abs(lat) > 90) lat = lat / 1e7;
  if (Math.abs(lng) > 180) lng = lng / 1e7;

  const altMslMeters = Number(body.altMslMeters || body.alt || (body.alt_msl ? body.alt_msl / 1000 : 0));
  const headingDeg = Number(body.headingDeg || body.heading || body.hdg || 0);

  const airspeedKts = Number(body.airspeedKts || (body.airspeed ? body.airspeed * 1.94384 : 45));
  const groundspeedKts = Number(body.groundspeedKts || (body.groundspeed ? body.groundspeed * 1.94384 : 58));

  return {
    timeUsec: body.timeUsec || Date.now() * 1000,
    lat,
    lng,
    altMslMeters,
    relativeAltMeters: body.relativeAltMeters,
    vxMps: body.vxMps,
    vyMps: body.vyMps,
    vzMps: body.vzMps,
    headingDeg,
    airspeedKts: Math.round(airspeedKts),
    groundspeedKts: Math.round(groundspeedKts),
    gimbalPitchDeg: body.gimbalPitchDeg !== undefined ? Number(body.gimbalPitchDeg) : -30,
    batteryPct: body.batteryPct !== undefined ? Number(body.batteryPct) : 95,
    flightMode: body.flightMode || 'AUTO_GLIDE',
  };
}

// GET: Returns current telemetry or SSE stream
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const stream = searchParams.get('stream');

  if (stream === 'true') {
    // Server-Sent Events stream
    const encoder = new TextEncoder();
    const readableStream = new ReadableStream({
      start(controller) {
        controller.enqueue(
          encoder.encode(`data: ${JSON.stringify(latestMavlinkState)}\n\n`)
        );
        controller.close();
      },
    });

    return new Response(readableStream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        Connection: 'keep-alive',
      },
    });
  }

  return NextResponse.json({
    status: 'ACTIVE',
    telemetry: latestMavlinkState,
    altFtMsl: Math.round(latestMavlinkState.altMslMeters * 3.28084),
  });
}

// POST: Ingest live MAVLink telemetry packet from SITL or GCS
export async function POST(request: NextRequest) {
  try {
    const raw = await request.json();
    latestMavlinkState = normalizeMavlinkPacket(raw);

    return NextResponse.json({
      success: true,
      message: 'MAVLink telemetry packet ingested',
      current: latestMavlinkState,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error?.message || 'Invalid packet format' },
      { status: 400 }
    );
  }
}
