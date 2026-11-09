/**
 * Wildfire Rate-of-Spread (ROS) and Smoke Dispersion Engine
 * Based on simplified Rothermel surface fire spread and Gaussian smoke plume dispersion.
 * Optimized for real-time projection under Oklahoma Red Flag conditions.
 */

export interface FireSpreadProjection {
  originLat: number;
  originLng: number;
  windSpeedMph: number;
  windHeadingDeg: number; // direction wind is blowing TOWARDS
  fuelMoisturePct: number;
  rateOfSpreadChainsPerHour: number;
  perimeters: {
    hour: number;
    areaAcres: number;
    structuresThreatened: number;
    polygonGeoJson: GeoJSON.Feature<GeoJSON.Polygon>;
  }[];
  smokePlumeGeoJson: GeoJSON.Feature<GeoJSON.Polygon>;
}

/**
 * Calculate rate of spread in chains/hour (~66 ft/hr)
 * Simplified Rothermel approximation based on 10-hr fuel moisture and wind speed
 */
export function calculateRateOfSpread(windSpeedMph: number, fuelMoisturePct: number): number {
  // Base spread in cured Oklahoma prairie grass (fuel model 1/3)
  const moistureFactor = Math.max(0.1, (30 - fuelMoisturePct) / 25);
  const windFactor = 1 + 0.12 * Math.pow(windSpeedMph, 1.35);
  return Math.round(moistureFactor * windFactor * 4.2 * 10) / 10;
}

/**
 * Generate an elliptical fire spread perimeter oriented along the wind vector
 */
export function generateFireSpreadProjection(
  originLat: number,
  originLng: number,
  windSpeedMph: number = 42,
  windHeadingDeg: number = 40, // blowing to NE (from 220 SW)
  fuelMoisturePct: number = 6.2
): FireSpreadProjection {
  const ros = calculateRateOfSpread(windSpeedMph, fuelMoisturePct);
  // 1 chain = 0.0125 miles (~66 feet)
  const hours = [1, 2, 4];
  const windRad = (windHeadingDeg * Math.PI) / 180;

  const perimeters = hours.map((hour) => {
    // Distance traveled downwind in miles
    const majorAxisMiles = (ros * hour * 66) / 5280;
    // Length-to-breadth ratio for wind-driven fires: LB = 1 + 0.25 * windSpeedMph^0.5
    const lbRatio = 1 + 0.3 * Math.sqrt(windSpeedMph);
    const minorAxisMiles = majorAxisMiles / lbRatio;

    // Approximate area of ellipse in acres: pi * a * b * 640
    const areaAcres = Math.round(Math.PI * majorAxisMiles * minorAxisMiles * 640);
    const structuresThreatened = Math.round((areaAcres / 100) * 14);

    // Build GeoJSON Polygon points
    const points: [number, number][] = [];
    const steps = 32;

    for (let i = 0; i <= steps; i++) {
      const theta = (i / steps) * 2 * Math.PI;
      // Ellipse centered so the ignition point is near the rear focus
      const x = minorAxisMiles * Math.sin(theta);
      const y = majorAxisMiles * (Math.cos(theta) + 0.7); // shifted downwind

      // Rotate by wind direction
      const rotX = x * Math.cos(windRad) - y * Math.sin(windRad);
      const rotY = x * Math.sin(windRad) + y * Math.cos(windRad);

      // Convert miles to degrees approx (Oklahoma ~ 36 deg lat)
      const dLat = rotY / 69.0;
      const dLng = rotX / (69.0 * Math.cos((originLat * Math.PI) / 180));

      points.push([originLng + dLng, originLat + dLat]);
    }

    const polygonGeoJson: GeoJSON.Feature<GeoJSON.Polygon> = {
      type: 'Feature',
      properties: {
        hour,
        areaAcres,
        structuresThreatened,
        rosChainsPerHour: ros,
      },
      geometry: {
        type: 'Polygon',
        coordinates: [points],
      },
    };

    return {
      hour,
      areaAcres,
      structuresThreatened,
      polygonGeoJson,
    };
  });

  // Generate Smoke Dispersion Plume (Gaussian cone expanding downwind)
  const plumeLengthMiles = (windSpeedMph * 1.5); // smoke travels far downwind
  const plumeHalfAngleRad = (22 * Math.PI) / 180; // 22 degree cone

  const plumePoints: [number, number][] = [
    [originLng, originLat], // ignition apex
  ];

  // Right edge
  const rightAngle = windRad + plumeHalfAngleRad;
  const rightX = plumeLengthMiles * Math.sin(rightAngle);
  const rightY = plumeLengthMiles * Math.cos(rightAngle);
  plumePoints.push([
    originLng + rightX / (69.0 * Math.cos((originLat * Math.PI) / 180)),
    originLat + rightY / 69.0,
  ]);

  // Center downwind apex arc
  const centerAngle = windRad;
  const centerX = (plumeLengthMiles * 1.15) * Math.sin(centerAngle);
  const centerY = (plumeLengthMiles * 1.15) * Math.cos(centerAngle);
  plumePoints.push([
    originLng + centerX / (69.0 * Math.cos((originLat * Math.PI) / 180)),
    originLat + centerY / 69.0,
  ]);

  // Left edge
  const leftAngle = windRad - plumeHalfAngleRad;
  const leftX = plumeLengthMiles * Math.sin(leftAngle);
  const leftY = plumeLengthMiles * Math.cos(leftAngle);
  plumePoints.push([
    originLng + leftX / (69.0 * Math.cos((originLat * Math.PI) / 180)),
    originLat + leftY / 69.0,
  ]);

  // Close polygon
  plumePoints.push([originLng, originLat]);

  const smokePlumeGeoJson: GeoJSON.Feature<GeoJSON.Polygon> = {
    type: 'Feature',
    properties: {
      type: 'SMOKE_DISPERSION_PLUME',
      maxAqiLevel: 'VERY_UNHEALTHY',
      downwindDistanceMiles: plumeLengthMiles,
    },
    geometry: {
      type: 'Polygon',
      coordinates: [plumePoints],
    },
  };

  return {
    originLat,
    originLng,
    windSpeedMph,
    windHeadingDeg,
    fuelMoisturePct,
    rateOfSpreadChainsPerHour: ros,
    perimeters,
    smokePlumeGeoJson,
  };
}
