import { LiveSensor } from '@/app/api/sensors/types';

// Simple in-memory store for active sensors.
// In a production environment, this should be moved to Redis or a Database (e.g. Vercel KV)
// to ensure persistence across serverless function invocations.

declare global {
  var _sensorStore: Map<string, LiveSensor> | undefined;
}

if (!global._sensorStore) {
  global._sensorStore = new Map();
}

export const sensorStore = global._sensorStore;

export function getSensors(): LiveSensor[] {
  return Array.from(sensorStore.values());
}

export function updateSensor(sensor: LiveSensor) {
  sensorStore.set(sensor.id, {
    ...sensor,
    last_seen: new Date().toISOString()
  });
}

export function deleteSensor(id: string) {
  sensorStore.delete(id);
}

// Cleanup stale sensors (last seen > 5 minutes ago)
export function cleanupSensors() {
  const now = Date.now();
  const timeout = 5 * 60 * 1000;
  for (const [id, sensor] of sensorStore.entries()) {
    if (now - new Date(sensor.last_seen).getTime() > timeout) {
      sensorStore.delete(id);
    }
  }
}
