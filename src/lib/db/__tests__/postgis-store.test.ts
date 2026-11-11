import { describe, it, expect, beforeEach } from 'vitest';
import {
  saveSensorTelemetry,
  validateSensorTelemetry,
  getAllGeofences,
  saveGeofence,
  saveAlert,
  getActiveAlerts,
  resolveAlert,
  Geofence,
  AirspaceAlert
} from '../postgis-store';
import { sensorStore } from '@/lib/sensor-store';
import { LiveSensor } from '@/app/api/sensors/types';

describe('PostGIS & In-Memory Spatial Store', () => {
  beforeEach(() => {
    sensorStore.clear();
  });

  const validSensor: LiveSensor = {
    id: 'uas-bravo-99',
    name: 'Bravo Recon',
    type: 'drone',
    status: 'active',
    source: 'TEST_SUITE',
    telemetry: {
      lat: 42.695,
      lng: 23.325,
      alt: 450,
      heading: 180,
      speed: 25,
      battery: 88,
    },
    last_seen: new Date().toISOString()
  };

  it('validates sensor telemetry coordinates correctly', () => {
    expect(validateSensorTelemetry(validSensor)).toBe(true);

    const invalidLat = { ...validSensor, telemetry: { ...validSensor.telemetry, lat: 95 } };
    expect(validateSensorTelemetry(invalidLat)).toBe(false);

    const invalidLng = { ...validSensor, telemetry: { ...validSensor.telemetry, lng: 185 } };
    expect(validateSensorTelemetry(invalidLng)).toBe(false);

    const nanTelemetry = { ...validSensor, telemetry: { lat: NaN, lng: 20 } };
    expect(validateSensorTelemetry(nanTelemetry)).toBe(false);
  });

  it('persists valid telemetry into in-memory store with clamping and fallbacks', async () => {
    const sensorWithNegativeSpeed: LiveSensor = {
      ...validSensor,
      telemetry: {
        ...validSensor.telemetry,
        speed: -15,
        battery: 150,
      }
    };

    const saved = await saveSensorTelemetry(sensorWithNegativeSpeed);
    expect(saved).toBe(true);

    const stored = sensorStore.get('uas-bravo-99');
    expect(stored).toBeDefined();
    expect(stored?.telemetry.speed).toBe(0); // clamped to >= 0
    expect(stored?.telemetry.battery).toBe(100); // clamped to <= 100
    expect(stored?.telemetry.lat).toBe(42.695);
    expect(stored?.telemetry.lng).toBe(23.325);
  });

  it('manages geofences and airspace alerts lifecycle', () => {
    const newGeofence: Geofence = {
      id: 'custom-nfz-9',
      name: 'Capitol NFZ',
      category: 'no_fly_zone',
      min_alt: 0,
      max_alt: 1000,
      coordinates: [[23.30, 42.68], [23.35, 42.68], [23.35, 42.72], [23.30, 42.72], [23.30, 42.68]]
    };

    saveGeofence(newGeofence);
    const geofences = getAllGeofences();
    expect(geofences.some(g => g.id === 'custom-nfz-9')).toBe(true);

    const alert: AirspaceAlert = {
      id: 'alert-test-01',
      sensor_id: 'uas-bravo-99',
      geofence_id: 'custom-nfz-9',
      severity: 'CRITICAL',
      message: 'Airspace boundary breached',
      triggered_at: new Date().toISOString(),
      resolved: false,
      lat: 42.695,
      lng: 23.325,
    };

    saveAlert(alert);
    const active = getActiveAlerts();
    expect(active.some(a => a.id === 'alert-test-01')).toBe(true);

    resolveAlert('alert-test-01');
    const activeAfter = getActiveAlerts();
    expect(activeAfter.some(a => a.id === 'alert-test-01')).toBe(false);
  });
});
