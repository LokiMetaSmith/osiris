import { describe, it, expect } from 'vitest';
import { geolocateBoundingBox, getActiveTargetTracks, BoundingBoxDetection } from '../target-tracker';
import { LiveSensor } from '@/app/api/sensors/types';

describe('VMTI Target Geolocation & Tracker', () => {
  const mockSensor: LiveSensor = {
    id: 'drone-alpha-1',
    name: 'UAS Recon',
    type: 'drone',
    status: 'active',
    telemetry: {
      lat: 42.700,
      lng: 23.320,
      alt: 500,
      heading: 90,
      speed: 20,
      battery: 90
    },
    last_seen: new Date().toISOString()
  };

  const detection: BoundingBoxDetection = {
    x1: 0.40,
    y1: 0.30,
    x2: 0.50,
    y2: 0.40,
    confidence: 0.88,
    class_name: 'vehicle',
    track_id: 201
  };

  it('geolocates bounding box center to ground coordinates', () => {
    const track = geolocateBoundingBox(detection, mockSensor);
    expect(track.track_id).toBe(201);
    expect(track.class_name).toBe('vehicle');
    expect(track.lat).toBeDefined();
    expect(track.lng).toBeDefined();
  });

  it('retrieves active target tracks', () => {
    const tracks = getActiveTargetTracks();
    expect(tracks.length).toBeGreaterThan(0);
    expect(tracks.some(t => t.track_id === 201)).toBe(true);
  });
});
