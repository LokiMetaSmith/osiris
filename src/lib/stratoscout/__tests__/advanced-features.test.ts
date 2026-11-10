import { describe, it, expect } from 'vitest';
import { calculateRateOfSpread, generateFireSpreadProjection } from '../dispersion-model';
import { OKLAHOMA_COUNTY_FLEET_DATA, getFleetAllocationSummary } from '../fleet-data';
import { normalizeMavlinkPacket } from '@/app/api/stratoscout/telemetry/route';

describe('StratoScout Advanced Features', () => {
  describe('Wildfire Spread & Smoke Dispersion Engine', () => {
    it('calculates rate of spread based on wind and fuel moisture', () => {
      const rosCritical = calculateRateOfSpread(42, 6.2);
      expect(rosCritical).toBeGreaterThan(15);

      const rosMild = calculateRateOfSpread(10, 15);
      expect(rosMild).toBeLessThan(rosCritical);
    });

    it('generates 1h, 2h, and 4h perimeters with valid GeoJSON', () => {
      const proj = generateFireSpreadProjection(36.12, -97.06, 40, 45, 6.0);
      expect(proj.perimeters).toHaveLength(3);
      expect(proj.perimeters[0].hour).toBe(1);
      expect(proj.perimeters[1].hour).toBe(2);
      expect(proj.perimeters[2].hour).toBe(4);
      expect(proj.perimeters[2].areaAcres).toBeGreaterThan(proj.perimeters[0].areaAcres);
      expect(proj.smokePlumeGeoJson.geometry.type).toBe('Polygon');
    });
  });

  describe('Multi-County Fleet Allocation Data Model', () => {
    it('accurately balances 52 launch budget and $15,000 subscriptions', () => {
      const summary = getFleetAllocationSummary();
      expect(summary.totalAnnualLaunchesBudgeted).toBe(52);
      expect(summary.totalActiveCounties).toBe(5);
      expect(summary.totalAnnualArr).toBe(75000); // 5 * $15,000
      expect(summary.totalLaunchesAllocated).toBeLessThanOrEqual(52);
    });

    it('contains Payne and Oklahoma county configurations', () => {
      const payne = OKLAHOMA_COUNTY_FLEET_DATA.find((c) => c.countyId === 'PAYNE');
      const okla = OKLAHOMA_COUNTY_FLEET_DATA.find((c) => c.countyId === 'OKLAHOMA');
      expect(payne).toBeDefined();
      expect(payne?.leadEmergencyDirector).toContain('Rob Hill');
      expect(okla).toBeDefined();
      expect(okla?.leadEmergencyDirector).toContain('Benjamin Curry');
    });
  });

  describe('MAVLink Telemetry Normalization', () => {
    it('normalizes degE7 coordinate packets from ArduPilot SITL', () => {
      const packet = normalizeMavlinkPacket({
        lat: 361200000,
        lon: -970600000,
        alt_msl: 19812000,
        heading: 4200,
        airspeed: 25.72, // ~50 kts
      });
      expect(packet.lat).toBeCloseTo(36.12, 2);
      expect(packet.lng).toBeCloseTo(-97.06, 2);
      expect(packet.airspeedKts).toBe(50);
    });
  });
});
