import { NextResponse } from 'next/server';
import { updateSensor } from '@/lib/sensor-store';
import { LiveSensor } from '../types';

/**
 * DEBUG API: Spawns or resets a mock drone for testing the live sensor integration.
 * It simulates a drone starting in London and moving slowly.
 */

async function seed() {
  const droneId = 'DRONE-DEBUG-01';

  // Initial state: Start near London
  let lat = 51.5074;
  let lng = -0.1278;
  let alt = 150;
  let heading = 45;

  const sensor: LiveSensor = {
    id: droneId,
    name: 'APEX-1 MOCK DRONE',
    type: 'drone',
    status: 'active',
    telemetry: {
      lat, lng, alt: Math.round(alt), heading: Math.round(heading),
      speed: 12, battery: 84, signal_strength: 92
    },
    stream_url: 'https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8', // Public HLS sample
    stream_type: 'hls',
    source: 'MOCK SENSOR UPLINK',
    last_seen: new Date().toISOString(),
    metadata: { debug: true }
  };

  updateSensor(sensor);
  return sensor;
}

export async function GET() {
  const sensor = await seed();
  return NextResponse.json({
    success: true,
    message: 'Mock drone registered in London. Use POST to update telemetry programmatically.',
    sensor,
    sample_payload: {
      id: sensor.id,
      token: "drone-alpha-9",
      telemetry: { lat: 51.5, lng: -0.12, alt: 150, heading: 45 }
    }
  });
}

export async function POST() {
  const sensor = await seed();
  return NextResponse.json({ success: true, sensor });
}
