import { describe, it, expect } from 'vitest';
import {
  STRATOSCOUT_METRICS,
  STRATOSCOUT_SECTORS,
  GLIDE_CORRIDOR_WAYPOINTS,
  MOCK_FIREBREAKS_GEOJSON,
  MOCK_WUI_CLUSTERS_GEOJSON,
  generateCountyPreventionReport,
} from '../data';

describe('StratoScout Oklahoma Wildfire Prevention Data & Models', () => {
  it('aligns with Dean Innovation V18 Business Plan pricing and metrics', () => {
    // $15,000/yr county subscription, 52 launches/yr, 100-mile corridor
    expect(STRATOSCOUT_METRICS.countyAnnualSubscriptionPrice).toBe(15000);
    expect(STRATOSCOUT_METRICS.oneTimeScanPrice).toBe(1500);
    expect(STRATOSCOUT_METRICS.annualLaunchBudget).toBe(52);
    expect(STRATOSCOUT_METRICS.corridorLengthMiles).toBe(100);
    expect(STRATOSCOUT_METRICS.imageryResolution).toBe('50 cm/pixel');
  });

  it('includes Payne County and Oklahoma County sectors with 3 core detection modes', () => {
    expect(STRATOSCOUT_SECTORS.length).toBeGreaterThanOrEqual(6);

    const threatTypes = new Set(STRATOSCOUT_SECTORS.map(s => s.threatType));
    expect(threatTypes.has('01 Fire Fuel Complex')).toBe(true);
    expect(threatTypes.has('02 Surface Heat / Thermal')).toBe(true);
    expect(threatTypes.has('03 High-Risk WUI Borders')).toBe(true);

    const counties = new Set(STRATOSCOUT_SECTORS.map(s => s.county));
    expect(counties.has('Payne County')).toBe(true);
    expect(counties.has('Oklahoma County')).toBe(true);
  });

  it('contains Rob Hill and Benjamin Curry operational emergency manager scenarios', () => {
    const payneSectors = STRATOSCOUT_SECTORS.filter(s => s.county === 'Payne County');
    expect(payneSectors.some(s => s.contactDirector.includes('Rob Hill'))).toBe(true);

    const okSectors = STRATOSCOUT_SECTORS.filter(s => s.county === 'Oklahoma County');
    expect(okSectors.some(s => s.contactDirector.includes('Benjamin Curry'))).toBe(true);

    const arcadiaSector = STRATOSCOUT_SECTORS.find(s => s.id === 'SEC-OK-01');
    expect(arcadiaSector).toBeDefined();
    expect(arcadiaSector?.notes).toContain('Benjamin Curry key scenario');
    expect(arcadiaSector?.recommendedAction).toBe('Cut Firebreak');
  });

  it('validates 100-mile glide corridor flight path waypoints', () => {
    expect(GLIDE_CORRIDOR_WAYPOINTS.length).toBe(6);
    expect(GLIDE_CORRIDOR_WAYPOINTS[0].name).toContain('Stillwater Airport / OAIRE');
    expect(GLIDE_CORRIDOR_WAYPOINTS[GLIDE_CORRIDOR_WAYPOINTS.length - 1].name).toContain('Lake Arcadia');
  });

  it('generates CWDG grant readiness reports with actionable emergency directives', () => {
    const payneReport = generateCountyPreventionReport('Payne County');
    expect(payneReport.county).toBe('Payne County');
    expect(payneReport.directorName).toContain('Rob Hill');
    expect(payneReport.subscriptionTier).toBe('$15,000 / Annual County Enterprise');
    expect(payneReport.femaGrantReadinessScore).toBeGreaterThanOrEqual(90);
    expect(payneReport.cwdgEligibility.status).toBe('HIGH PRIORITY');
    expect(payneReport.recommendedActionsList.length).toBeGreaterThan(0);

    const okReport = generateCountyPreventionReport('Oklahoma County');
    expect(okReport.county).toBe('Oklahoma County');
    expect(okReport.directorName).toContain('Benjamin Curry');
    expect(okReport.cwdgEligibility.maxGrantAmount).toBe('$3,200,000');
  });

  it('provides valid GeoJSON features for firebreaks and WUI clusters', () => {
    expect(MOCK_FIREBREAKS_GEOJSON.type).toBe('FeatureCollection');
    expect(MOCK_FIREBREAKS_GEOJSON.features.length).toBeGreaterThan(0);
    expect(MOCK_FIREBREAKS_GEOJSON.features[0].geometry.type).toBe('LineString');

    expect(MOCK_WUI_CLUSTERS_GEOJSON.type).toBe('FeatureCollection');
    expect(MOCK_WUI_CLUSTERS_GEOJSON.features.length).toBeGreaterThan(0);
    expect(MOCK_WUI_CLUSTERS_GEOJSON.features[0].geometry.type).toBe('Point');
  });
});
