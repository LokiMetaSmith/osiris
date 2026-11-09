import { describe, it, expect } from 'vitest';
import {
  TELEMETRY_PROFILE,
  getInterpolatedTelemetry,
} from '../telemetry-playback';
import {
  STRATOSCOUT_SECTORS,
  generateWebhookPayload,
} from '../data';

describe('StratoScout Extensions: SITL Telemetry & Incident Webhooks', () => {
  it('has comprehensive time-series flight telemetry profile from 0 to 120 seconds', () => {
    expect(TELEMETRY_PROFILE.length).toBeGreaterThanOrEqual(9);
    expect(TELEMETRY_PROFILE[0].altFt).toBe(1100);
    expect(TELEMETRY_PROFILE[2].altFt).toBe(65000); // Stratospheric release
    expect(TELEMETRY_PROFILE[TELEMETRY_PROFILE.length - 1].altFt).toBe(1100); // Landing flare
  });

  it('correctly interpolates flight coordinates, airspeed, and altitude along corridor', () => {
    const midway = getInterpolatedTelemetry(45);
    expect(midway.altFt).toBe(48000);
    expect(midway.phase).toBe('SCANNING_CRUISE');
    expect(midway.groundSpeedKnots).toBeGreaterThan(30);
    expect(midway.resolutionCmPx).toBe(50);

    // Continuous interpolation between points (e.g. at 37.5s)
    const interpolated = getInterpolatedTelemetry(37.5);
    expect(interpolated.altFt).toBeLessThan(65000);
    expect(interpolated.altFt).toBeGreaterThan(48000);
    expect(interpolated.lat).toBeLessThan(36.1156);
    expect(interpolated.lat).toBeGreaterThan(36.0420);
  });

  it('generates authentic D4H Incident Management webhook payloads', () => {
    const stillwaterSec = STRATOSCOUT_SECTORS[0];
    const d4hPayload = generateWebhookPayload('D4H', stillwaterSec);

    expect(d4hPayload.platform).toBe('D4H');
    expect(d4hPayload.incidentId).toContain('INC-PAYNE');
    expect(d4hPayload.femaThreatCode).toBe('FEMA-FIRE-VEG-01');
    expect(d4hPayload.structuresAtRisk).toBe(64);
    expect(d4hPayload.cadDispatchStatus).toBe('DISPATCH_QUEUED');
    expect(d4hPayload.gisFeatureLayerUrl).toContain('arcgis');
  });

  it('generates authentic WebEOC and ArcGIS CAD payloads with correct FEMA threat codes', () => {
    const edmondSec = STRATOSCOUT_SECTORS[3]; // SEC-OK-01
    const webeocPayload = generateWebhookPayload('WebEOC', edmondSec);

    expect(webeocPayload.platform).toBe('WebEOC');
    expect(webeocPayload.incidentId).toContain('INC-OKLA');
    expect(webeocPayload.femaThreatCode).toBe('FEMA-FIRE-WUI-03');
    expect(webeocPayload.emergencyDirector).toContain('Benjamin Curry');
    expect(webeocPayload.structuresAtRisk).toBe(89);
  });
});
