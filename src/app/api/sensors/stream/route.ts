import { NextResponse } from 'next/server';
import { getSensors } from '@/lib/sensor-store';
import { getActiveAlerts, getAllGeofences } from '@/lib/db/postgis-store';

export const dynamic = 'force-dynamic';

export async function GET() {
  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    async start(controller) {
      // Send initial snapshot
      const snapshot = {
        event: 'snapshot',
        sensors: getSensors(),
        geofences: getAllGeofences(),
        alerts: getActiveAlerts(),
        timestamp: new Date().toISOString()
      };
      controller.enqueue(encoder.encode(`data: ${JSON.stringify(snapshot)}\n\n`));

      // Periodic stream updates (1 Hz telemetry firehose)
      const interval = setInterval(() => {
        try {
          const payload = {
            event: 'telemetry_firehose',
            sensors: getSensors(),
            alerts: getActiveAlerts(),
            timestamp: new Date().toISOString()
          };
          controller.enqueue(encoder.encode(`data: ${JSON.stringify(payload)}\n\n`));
        } catch {
          clearInterval(interval);
          controller.close();
        }
      }, 1000);

      // Clean up on close after 5 minutes limit
      setTimeout(() => {
        clearInterval(interval);
        try {
          controller.close();
        } catch {}
      }, 5 * 60 * 1000);
    }
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache, no-transform',
      'Connection': 'keep-alive'
    }
  });
}
