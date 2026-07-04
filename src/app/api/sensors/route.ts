import { NextResponse } from 'next/server';
import { getSensors, updateSensor, cleanupSensors, sensorStore } from '@/lib/sensor-store';
import { SensorRegistrationRequest, SensorTelemetryUpdate, LiveSensor, SensorTelemetry } from './types';

// Simple token for demo/prototype authentication
// In production, use JWT or env-based secrets
const SENSOR_AUTH_TOKEN = process.env.SENSOR_AUTH_TOKEN || 'drone-alpha-9';

export async function GET() {
  cleanupSensors();
  const sensors = getSensors();
  return NextResponse.json({
    sensors,
    total: sensors.length,
    timestamp: new Date().toISOString(),
  }, {
    headers: { 'Cache-Control': 'no-store, max-age=0' }
  });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    // Check if it's a registration or a telemetry update
    if (body.token !== SENSOR_AUTH_TOKEN) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Telemetry Update
    if ('telemetry' in body && !('type' in body)) {
      const update = body as SensorTelemetryUpdate;
      const existing = sensorStore.get(update.id);

      if (!existing) {
        return NextResponse.json({ error: 'Sensor not registered' }, { status: 404 });
      }

      const updated: LiveSensor = {
        ...existing,
        telemetry: { ...existing.telemetry, ...update.telemetry },
        status: update.status || existing.status,
        last_seen: new Date().toISOString()
      };

      updateSensor(updated);
      return NextResponse.json({ success: true, sensor: updated });
    }

    // Full Registration or Update
    const reg = body as SensorRegistrationRequest & { telemetry?: SensorTelemetry };
    const sensor: LiveSensor = {
      id: reg.id,
      name: reg.name,
      type: reg.type,
      status: 'active',
      telemetry: reg.telemetry || { lat: 0, lng: 0 },
      stream_url: reg.stream_url,
      stream_type: reg.stream_type || 'hls',
      source: reg.source,
      last_seen: new Date().toISOString()
    };

    updateSensor(sensor);
    return NextResponse.json({ success: true, sensor });

  } catch (error) {
    console.error('Sensor API error:', error);
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
  }
}
