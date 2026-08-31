import { LiveSensor } from '@/app/api/sensors/types';
import { sensorStore } from '@/lib/sensor-store';

export interface Geofence {
  id: string;
  name: string;
  category: 'no_fly_zone' | 'restricted' | 'warning';
  min_alt: number;
  max_alt: number;
  coordinates: [number, number][]; // Polygon coordinates [[lng, lat], ...]
}

export interface AirspaceAlert {
  id: string;
  sensor_id: string;
  geofence_id: string;
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  message: string;
  triggered_at: string;
  resolved: boolean;
  lat: number;
  lng: number;
}

// In-memory backing stores for fallback / zero-config operation
const inMemoryGeofences = new Map<string, Geofence>();
const inMemoryAlerts: AirspaceAlert[] = [];

// Seed default No-Fly Zone geofences (e.g. airport restricted zone)
inMemoryGeofences.set('nfz-1', {
  id: 'nfz-1',
  name: 'Restricted Airspace Alpha (Airport NFZ)',
  category: 'no_fly_zone',
  min_alt: 0,
  max_alt: 500,
  coordinates: [
    [23.310, 42.690],
    [23.330, 42.690],
    [23.330, 42.710],
    [23.310, 42.710],
    [23.310, 42.690]
  ]
});

export async function saveSensorTelemetry(sensor: LiveSensor): Promise<void> {
  // Update in-memory store
  sensorStore.set(sensor.id, {
    ...sensor,
    last_seen: new Date().toISOString()
  });

  // If PostGIS connection string configured, attempt DB persist
  const dbUrl = process.env.DATABASE_URL;
  if (dbUrl) {
    try {
      // Lazy load pg client if available
      const { Client } = await import('pg');
      const client = new Client({ connectionString: dbUrl });
      await client.connect();

      const query = `
        INSERT INTO sensors (id, name, type, heading, speed, battery, alt, stream_url, last_seen, location)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW(), ST_SetSRID(ST_MakePoint($9, $10), 4326))
        ON CONFLICT (id) DO UPDATE SET
          name = EXCLUDED.name,
          type = EXCLUDED.type,
          heading = EXCLUDED.heading,
          speed = EXCLUDED.speed,
          battery = EXCLUDED.battery,
          alt = EXCLUDED.alt,
          stream_url = EXCLUDED.stream_url,
          last_seen = NOW(),
          location = EXCLUDED.location;
      `;
      await client.query(query, [
        sensor.id,
        sensor.name || `Drone-${sensor.id}`,
        sensor.type || 'drone',
        sensor.heading || 0,
        sensor.speed || 0,
        sensor.battery || 100,
        sensor.alt || 0,
        sensor.stream_url || null,
        sensor.lng,
        sensor.lat
      ]);

      // Save to telemetry history
      const historyQuery = `
        INSERT INTO telemetry_history (sensor_id, heading, speed, battery, alt, recorded_at, location)
        VALUES ($1, $2, $3, $4, $5, NOW(), ST_SetSRID(ST_MakePoint($6, $7), 4326));
      `;
      await client.query(historyQuery, [
        sensor.id,
        sensor.heading || 0,
        sensor.speed || 0,
        sensor.battery || 100,
        sensor.alt || 0,
        sensor.lng,
        sensor.lat
      ]);

      await client.end();
    } catch (err) {
      console.warn('[PostGIS] DB persist fallback to in-memory store:', (err as Error).message);
    }
  }
}

export function getAllGeofences(): Geofence[] {
  return Array.from(inMemoryGeofences.values());
}

export function saveGeofence(geofence: Geofence): void {
  inMemoryGeofences.set(geofence.id, geofence);
}

export function saveAlert(alert: AirspaceAlert): void {
  inMemoryAlerts.unshift(alert);
  if (inMemoryAlerts.length > 50) {
    inMemoryAlerts.pop();
  }
}

export function getActiveAlerts(): AirspaceAlert[] {
  return inMemoryAlerts.filter(a => !a.resolved);
}

export function resolveAlert(id: string): void {
  const alert = inMemoryAlerts.find(a => a.id === id);
  if (alert) {
    alert.resolved = true;
  }
}
