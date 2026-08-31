import { describe, it, expect } from 'vitest';
import { isPointInPolygon, evaluateGeofences } from '../engine';
import { LiveSensor } from '@/app/api/sensors/types';

describe('Geofencing Engine', () => {
  const polygon: [number, number][] = [
    [0, 0],
    [10, 0],
    [10, 10],
    [0, 10],
    [0, 0]
  ];

  it('correctly detects point inside polygon', () => {
    expect(isPointInPolygon([5, 5], polygon)).toBe(true);
  });

  it('correctly detects point outside polygon', () => {
    expect(isPointInPolygon([15, 5], polygon)).toBe(false);
  });

  it('triggers airspace alert when drone enters default NFZ', () => {
    const sensor: LiveSensor = {
      id: 'test-drone-1',
      name: 'Recon Drone',
      type: 'drone',
      status: 'active',
      telemetry: {
        lat: 42.700,
        lng: 23.320,
        alt: 100,
        heading: 180,
        speed: 15,
        battery: 85
      },
      last_seen: new Date().toISOString()
    };

    const alerts = evaluateGeofences(sensor);
    expect(alerts.length).toBeGreaterThan(0);
    expect(alerts[0].severity).toBe('CRITICAL');
    expect(alerts[0].sensor_id).toBe('test-drone-1');
  });
});
