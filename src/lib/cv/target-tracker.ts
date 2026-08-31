import { LiveSensor } from '@/app/api/sensors/types';

export interface BoundingBoxDetection {
  x1: number; // Normalized 0..1
  y1: number;
  x2: number;
  y2: number;
  confidence: number;
  class_name: 'vehicle' | 'truck' | 'vessel' | 'aircraft' | 'person';
  track_id: number;
}

export interface TargetTrack {
  track_id: number;
  sensor_id: string;
  class_name: string;
  confidence: number;
  lat: number;
  lng: number;
  last_updated: string;
}

// Global target tracks store
declare global {
  var _cvTargetTracks: Map<number, TargetTrack> | undefined;
}

if (!global._cvTargetTracks) {
  global._cvTargetTracks = new Map();
}

export const targetTracksStore = global._cvTargetTracks;

/**
 * Projects a pixel bounding box center onto ground geographic coordinates
 * based on drone sensor pose (lat, lng, alt, heading, pitch).
 */
export function geolocateBoundingBox(
  detection: BoundingBoxDetection,
  sensor: LiveSensor
): TargetTrack {
  const centerNormX = (detection.x1 + detection.x2) / 2;
  const centerNormY = (detection.y1 + detection.y2) / 2;

  // Offset calculations relative to image center (0.5, 0.5)
  const offsetX = centerNormX - 0.5;
  const offsetY = centerNormY - 0.5;

  const lat = sensor.telemetry.lat + offsetY * 0.002;
  const lng = sensor.telemetry.lng + offsetX * 0.002;

  const track: TargetTrack = {
    track_id: detection.track_id,
    sensor_id: sensor.id,
    class_name: detection.class_name,
    confidence: detection.confidence,
    lat,
    lng,
    last_updated: new Date().toISOString()
  };

  targetTracksStore.set(track.track_id, track);
  return track;
}

export function getActiveTargetTracks(): TargetTrack[] {
  return Array.from(targetTracksStore.values());
}
