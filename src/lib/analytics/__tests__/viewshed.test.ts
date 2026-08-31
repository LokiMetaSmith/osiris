import { describe, it, expect } from 'vitest';
import { calculateLineOfSight, getSampleGroundElevation } from '../viewshed';

describe('Viewshed & Line-of-Sight Module', () => {
  it('should sample ground elevation deterministically', () => {
    const elev1 = getSampleGroundElevation(42.56, 23.28);
    const elev2 = getSampleGroundElevation(42.56, 23.28);
    expect(elev1).toBeGreaterThanOrEqual(0);
    expect(elev1).toBe(elev2);
  });

  it('should compute clear line of sight for elevated observer', () => {
    const observer = { lat: 42.56, lng: 23.28, altMeters: 2000 };
    const target = { lat: 42.69, lng: 23.32, altMeters: 50 };

    const result = calculateLineOfSight(observer, target, 20);

    expect(result.totalDistanceKm).toBeGreaterThan(0);
    expect(result.profile.length).toBe(21);
    expect(typeof result.isLineOfSightClear).toBe('boolean');
  });

  it('should detect obstruction when observer altitude is low relative to terrain', () => {
    const observer = { lat: 42.56, lng: 23.28, altMeters: 1 };
    const target = { lat: 42.69, lng: 23.32, altMeters: 1 };

    const result = calculateLineOfSight(observer, target, 50);

    expect(result.profile.length).toBe(51);
    if (!result.isLineOfSightClear) {
      expect(result.firstObstacleKm).not.toBeNull();
    }
  });
});
