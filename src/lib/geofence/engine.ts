import { LiveSensor } from '@/app/api/sensors/types';
import { Geofence, AirspaceAlert, getAllGeofences, saveAlert } from '@/lib/db/postgis-store';

/**
 * Point in Polygon check using Ray Casting Algorithm
 * point: [lng, lat]
 * polygon: [[lng, lat], ...]
 */
export function isPointInPolygon(point: [number, number], polygon: [number, number][]): boolean {
  const [x, y] = point;
  let inside = false;

  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
    const xi = polygon[i][0], yi = polygon[i][1];
    const xj = polygon[j][0], yj = polygon[j][1];

    const intersect = ((yi > y) !== (yj > y)) &&
      (x < (xj - xi) * (y - yi) / (yj - yi + 1e-10) + xi);

    if (intersect) inside = !inside;
  }

  return inside;
}

/**
 * Evaluate sensor position against active geofences and generate alerts upon boundary breach.
 */
export function evaluateGeofences(sensor: LiveSensor): AirspaceAlert[] {
  const alerts: AirspaceAlert[] = [];
  const geofences = getAllGeofences();
  const point: [number, number] = [sensor.telemetry.lng, sensor.telemetry.lat];
  const alt = sensor.telemetry.alt ?? 0;

  for (const geofence of geofences) {
    if (alt >= geofence.min_alt && alt <= geofence.max_alt) {
      if (isPointInPolygon(point, geofence.coordinates)) {
        const alert: AirspaceAlert = {
          id: `alert-${sensor.id}-${geofence.id}-${Date.now()}`,
          sensor_id: sensor.id,
          geofence_id: geofence.id,
          severity: geofence.category === 'no_fly_zone' ? 'CRITICAL' : 'HIGH',
          message: `UNAUTHORIZED AIRSPACE BREACH: Drone [${sensor.name || sensor.id}] entered [${geofence.name}] at altitude ${alt}m`,
          triggered_at: new Date().toISOString(),
          resolved: false,
          lat: sensor.telemetry.lat,
          lng: sensor.telemetry.lng
        };

        saveAlert(alert);
        alerts.push(alert);
      }
    }
  }

  return alerts;
}
