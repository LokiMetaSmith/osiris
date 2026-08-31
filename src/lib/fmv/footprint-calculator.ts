/**
 * Ground intersection & camera Field of View (FOV) trapezoid calculator
 */

export interface CameraPose {
  sensorLat: number;       // Sensor latitude in degrees
  sensorLng: number;       // Sensor longitude in degrees
  sensorAltMeters: number; // Sensor altitude in meters above ground level
  headingDeg: number;      // Sensor true heading / yaw in degrees (0 - 360)
  pitchDeg: number;        // Sensor pitch angle in degrees (-90 = straight down, -45 = 45° tilt down)
  rollDeg?: number;        // Sensor optical roll angle in degrees (default 0)
  hfovDeg: number;         // Sensor horizontal field-of-view in degrees (e.g. 30° to 60°)
  vfovDeg?: number;        // Sensor vertical field-of-view in degrees (default calculated from 16:9 ratio)
}

export interface CameraFootprintResult {
  sensorLocation: [number, number];       // [lng, lat]
  targetCenterLocation: [number, number]; // [lng, lat]
  footprintPolygon: [number, number][];   // [[lng, lat], ...] 5-point closed ring
  slantRangeMeters: number;
}

const EARTH_RADIUS_METERS = 6378137; // WGS84 major axis

/**
 * Calculates a destination coordinate given start point, distance in meters, and bearing in degrees.
 */
export function computeDestinationPoint(lat: number, lng: number, distanceMeters: number, bearingDeg: number): [number, number] {
  const δ = distanceMeters / EARTH_RADIUS_METERS;
  const θ = (bearingDeg * Math.PI) / 180;

  const φ1 = (lat * Math.PI) / 180;
  const λ1 = (lng * Math.PI) / 180;

  const sinφ2 = Math.sin(φ1) * Math.cos(δ) + Math.cos(φ1) * Math.sin(δ) * Math.cos(θ);
  const φ2 = Math.asin(sinφ2);

  const y = Math.sin(θ) * Math.sin(δ) * Math.cos(φ1);
  const x = Math.cos(δ) - Math.sin(φ1) * Math.sin(φ2);
  const λ2 = λ1 + Math.atan2(y, x);

  const lat2 = (φ2 * 180) / Math.PI;
  const lng2 = (((λ2 * 180) / Math.PI + 540) % 360) - 180; // Normalise to -180..+180

  return [lng2, lat2];
}

/**
 * Calculates the 4-corner camera field of view ground trapezoid polygon.
 */
export function calculateCameraFootprint(pose: CameraPose): CameraFootprintResult {
  const { sensorLat, sensorLng, sensorAltMeters, headingDeg, pitchDeg, hfovDeg } = pose;

  // Clamp pitch angle so it looks down (negative pitch). If pitch >= 0, treat as slightly tilted down (-5°)
  const effectivePitch = pitchDeg >= 0 ? -5 : Math.max(pitchDeg, -89.9);
  const pitchRad = (Math.abs(effectivePitch) * Math.PI) / 180;

  // Compute vertical FOV if not explicitly provided (defaulting to 16:9 aspect ratio)
  const vfovDeg = pose.vfovDeg || hfovDeg * (9 / 16);

  // Slant range to center of FOV
  const slantRangeMeters = sensorAltMeters / Math.sin(pitchRad);
  const groundDistanceCenterMeters = sensorAltMeters / Math.tan(pitchRad);

  // Target center location on ground
  const targetCenterLocation = computeDestinationPoint(sensorLat, sensorLng, groundDistanceCenterMeters, headingDeg);

  // Compute near and far pitch angles
  const halfVfov = vfovDeg / 2;
  const pitchNearRad = Math.min((Math.abs(effectivePitch) + halfVfov) * (Math.PI / 180), (89.5 * Math.PI) / 180);
  const pitchFarRad = Math.max((Math.abs(effectivePitch) - halfVfov) * (Math.PI / 180), (1.0 * Math.PI) / 180);

  const distNearMeters = sensorAltMeters / Math.tan(pitchNearRad);
  const distFarMeters = sensorAltMeters / Math.tan(pitchFarRad);

  // Compute half widths at near and far bounds
  const halfHfovRad = (hfovDeg / 2) * (Math.PI / 180);
  const widthNearMeters = (sensorAltMeters / Math.sin(pitchNearRad)) * Math.tan(halfHfovRad);
  const widthFarMeters = (sensorAltMeters / Math.sin(pitchFarRad)) * Math.tan(halfHfovRad);

  // Calculate 4 ground corners relative to sensor
  // 1. Far Left corner
  const farCenter = computeDestinationPoint(sensorLat, sensorLng, distFarMeters, headingDeg);
  const farLeft = computeDestinationPoint(farCenter[1], farCenter[0], widthFarMeters, headingDeg - 90);

  // 2. Far Right corner
  const farRight = computeDestinationPoint(farCenter[1], farCenter[0], widthFarMeters, headingDeg + 90);

  // 3. Near Right corner
  const nearCenter = computeDestinationPoint(sensorLat, sensorLng, distNearMeters, headingDeg);
  const nearRight = computeDestinationPoint(nearCenter[1], nearCenter[0], widthNearMeters, headingDeg + 90);

  // 4. Near Left corner
  const nearLeft = computeDestinationPoint(nearCenter[1], nearCenter[0], widthNearMeters, headingDeg - 90);

  // Closed 5-point GeoJSON ring
  const footprintPolygon: [number, number][] = [
    farLeft,
    farRight,
    nearRight,
    nearLeft,
    farLeft // Closed
  ];

  return {
    sensorLocation: [sensorLng, sensorLat],
    targetCenterLocation,
    footprintPolygon,
    slantRangeMeters
  };
}
