import { describe, it, expect } from 'vitest';
import { parseMisbST0601, encodeMisbST0601, MisbST0601Telemetry } from '../klv-parser';
import { calculateCameraFootprint, computeDestinationPoint } from '../footprint-calculator';

describe('MISB ST 0601 KLV Parser', () => {
  it('should encode and parse telemetry roundtrip', () => {
    const inputTelemetry: MisbST0601Telemetry = {
      sensorLatitude: 42.7012,
      sensorLongitude: 23.3219,
      sensorTrueAltitude: 1500,
      sensorPitch: -35.5,
      sensorRoll: 2.1,
      sensorYaw: 145.0,
      horizontalFov: 42.0,
    };

    const encoded = encodeMisbST0601(inputTelemetry);
    expect(encoded).toBeInstanceOf(Uint8Array);
    expect(encoded.length).toBeGreaterThan(16);

    const parsed = parseMisbST0601(encoded);

    expect(parsed.sensorLatitude).toBeCloseTo(inputTelemetry.sensorLatitude!, 2);
    expect(parsed.sensorLongitude).toBeCloseTo(inputTelemetry.sensorLongitude!, 2);
    expect(parsed.sensorTrueAltitude).toBeCloseTo(inputTelemetry.sensorTrueAltitude!, 0);
    expect(parsed.sensorPitch).toBeCloseTo(inputTelemetry.sensorPitch!, 1);
    expect(parsed.sensorRoll).toBeCloseTo(inputTelemetry.sensorRoll!, 1);
    expect(parsed.sensorYaw).toBeCloseTo(inputTelemetry.sensorYaw!, 1);
    expect(parsed.horizontalFov).toBeCloseTo(inputTelemetry.horizontalFov!, 1);
  });
});

describe('Camera Footprint Calculator', () => {
  it('should compute destination point accurately', () => {
    const startLat = 42.70;
    const startLng = 23.32;
    const dest = computeDestinationPoint(startLat, startLng, 1000, 90); // 1km east

    expect(dest[0]).toBeGreaterThan(startLng); // Longitude increases east
    expect(dest[1]).toBeCloseTo(startLat, 3);
  });

  it('should compute valid 5-point closed GeoJSON ground trapezoid footprint polygon', () => {
    const result = calculateCameraFootprint({
      sensorLat: 42.70,
      sensorLng: 23.32,
      sensorAltMeters: 500,
      headingDeg: 90,
      pitchDeg: -45,
      hfovDeg: 40,
    });

    expect(result.sensorLocation).toEqual([23.32, 42.70]);
    expect(result.targetCenterLocation[0]).toBeGreaterThan(23.32); // East of sensor
    expect(result.footprintPolygon.length).toBe(5);
    expect(result.footprintPolygon[0]).toEqual(result.footprintPolygon[4]); // Closed ring
    expect(result.slantRangeMeters).toBeGreaterThan(500);
  });
});
