export interface ElevationPoint {
  distanceKm: number;
  elevationMeters: number;
  sightlineMeters: number;
  isObstructed: boolean;
  lat: number;
  lng: number;
}

export interface ViewshedResult {
  observer: { lat: number; lng: number; altMeters: number };
  target: { lat: number; lng: number; altMeters: number };
  totalDistanceKm: number;
  isLineOfSightClear: boolean;
  maxObstacleClearanceMeters: number;
  firstObstacleKm: number | null;
  profile: ElevationPoint[];
}

/**
 * Approximate ground elevation calculation based on latitude/longitude (mock DEM sampling for client-side raycasting).
 * Can be replaced or enhanced with real DEM tile sampling.
 */
export function getSampleGroundElevation(lat: number, lng: number): number {
  // Synthetic terrain model based on sinusoidal landforms (e.g., Balkan/Alpine/Rockies topography)
  const base = Math.sin(lat * 0.1) * Math.cos(lng * 0.1) * 350;
  const detail = Math.sin(lat * 0.8) * Math.sin(lng * 0.8) * 120;
  const ridge = Math.abs(Math.sin((lat + lng) * 0.5)) * 250;
  return Math.max(0, Math.round(base + detail + ridge + 50));
}

/**
 * Calculates 3D Line-of-Sight raycasting between observer and target positions.
 */
export function calculateLineOfSight(
  observer: { lat: number; lng: number; altMeters: number },
  target: { lat: number; lng: number; altMeters: number },
  numSamples = 50
): ViewshedResult {
  const dLat = target.lat - observer.lat;
  const dLng = target.lng - observer.lng;

  // Approximate Haversine distance in Km
  const R = 6371; // Earth radius in km
  const dLatRad = (dLat * Math.PI) / 180;
  const dLngRad = (dLng * Math.PI) / 180;
  const a =
    Math.sin(dLatRad / 2) * Math.sin(dLatRad / 2) +
    Math.cos((observer.lat * Math.PI) / 180) *
      Math.cos((target.lat * Math.PI) / 180) *
      Math.sin(dLngRad / 2) *
      Math.sin(dLngRad / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const totalDistanceKm = R * c;

  const obsGroundElev = getSampleGroundElevation(observer.lat, observer.lng);
  const targetGroundElev = getSampleGroundElevation(target.lat, target.lng);

  const obsTotalAlt = obsGroundElev + observer.altMeters;
  const targetTotalAlt = targetGroundElev + target.altMeters;

  let isLineOfSightClear = true;
  let firstObstacleKm: number | null = null;
  let minClearanceMeters = Infinity;

  const profile: ElevationPoint[] = [];

  for (let i = 0; i <= numSamples; i++) {
    const fraction = i / numSamples;
    const sampleLat = observer.lat + dLat * fraction;
    const sampleLng = observer.lng + dLng * fraction;
    const sampleDistanceKm = totalDistanceKm * fraction;

    const groundElev = getSampleGroundElevation(sampleLat, sampleLng);

    // Linear interpolation of sightline altitude between observer total alt and target total alt
    const sightlineAlt = obsTotalAlt + (targetTotalAlt - obsTotalAlt) * fraction;

    const clearance = sightlineAlt - groundElev;
    if (clearance < minClearanceMeters) {
      minClearanceMeters = clearance;
    }

    const isObstructed = clearance < 0;
    if (isObstructed) {
      isLineOfSightClear = false;
      if (firstObstacleKm === null) {
        firstObstacleKm = sampleDistanceKm;
      }
    }

    profile.push({
      distanceKm: Number(sampleDistanceKm.toFixed(2)),
      elevationMeters: groundElev,
      sightlineMeters: Number(sightlineAlt.toFixed(1)),
      isObstructed,
      lat: Number(sampleLat.toFixed(5)),
      lng: Number(sampleLng.toFixed(5)),
    });
  }

  return {
    observer,
    target,
    totalDistanceKm: Number(totalDistanceKm.toFixed(2)),
    isLineOfSightClear,
    maxObstacleClearanceMeters: Number(minClearanceMeters.toFixed(1)),
    firstObstacleKm: firstObstacleKm !== null ? Number(firstObstacleKm.toFixed(2)) : null,
    profile,
  };
}
