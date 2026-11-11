import { describe, it, expect, vi, beforeEach } from 'vitest';
import { PolybolosClient } from '../PolybolosClient';
import { LatticeAdapter } from '../LatticeAdapter';
import { Domain, EntityType, ThreatLevel } from '../types';

describe('Polybolos Intelligence Fusion Engine & SDK', () => {
  let client: PolybolosClient;

  beforeEach(() => {
    client = new PolybolosClient({
      osintBaseUrl: 'http://localhost:3000',
    });
  });

  it('translates multi-domain OSINT raw feeds into normalized Polybolos entities', () => {
    const rawData = {
      commercial_flights: [
        { icao24: 'a1b2c3', callsign: 'DAL123 ', lat: 35.1, lng: -97.2, alt: 32000, heading: 180, speed_knots: 450, model: 'B738' }
      ],
      maritime_ships: [
        { mmsi: 123456789, name: 'SEA DEFENDER', type: 'military', lat: 24.5, lng: 119.5, heading: 45, speed: 22 }
      ],
      satellites: [
        { noradId: 25544, name: 'ISS (ZARYA)', lat: 51.6, lng: 10.2, alt: 420, mission: 'Space Station' }
      ],
      earthquakes: [
        { id: 'us7000test', magnitude: 6.4, lat: 38.2, lng: 142.3, place: 'Honshu, Japan', depth: 30 }
      ],
      cameras: [
        { id: 'cam-99', name: 'Downtown Traffic', lat: 40.71, lng: -74.00, city: 'New York', country: 'USA' }
      ]
    };

    client.ingestOsintData(rawData);

    const entities = client.getEntities();
    expect(entities.length).toBe(5);

    // Air entity validation
    const flight = entities.find(e => e.domain === Domain.AIR);
    expect(flight).toBeDefined();
    expect(flight?.name).toBe('DAL123');
    expect(flight?.position.speed).toBe(450);

    // Maritime military entity threat classification
    const ship = entities.find(e => e.domain === Domain.SEA);
    expect(ship).toBeDefined();
    expect(ship?.threat).toBe(ThreatLevel.ELEVATED);

    // M6+ earthquake critical threat classification
    const eq = entities.find(e => e.entityType === EntityType.EVENT);
    expect(eq).toBeDefined();
    expect(eq?.threat).toBe(ThreatLevel.CRITICAL);
    expect(eq?.display.glow).toBe(true);

    // Domain breakdown counts
    const domainCounts = client.getEntityCountByDomain();
    expect(domainCounts[Domain.AIR]).toBe(1);
    expect(domainCounts[Domain.SEA]).toBe(1);
    expect(domainCounts[Domain.SPACE]).toBe(1);
    expect(domainCounts[Domain.LAND]).toBe(2);
  });

  it('filters entities by domain and threat level threshold', () => {
    client.ingestOsintData({
      commercial_flights: [{ icao24: 'abc', callsign: 'TEST1', lat: 10, lng: 10 }],
      earthquakes: [
        { id: 'eq-minor', magnitude: 2.1, lat: 20, lng: 20 },
        { id: 'eq-major', magnitude: 6.8, lat: 30, lng: 30 },
      ]
    });

    const landEntities = client.getEntities(Domain.LAND);
    expect(landEntities.length).toBe(2);

    const criticalThreats = client.getThreats(ThreatLevel.CRITICAL);
    expect(criticalThreats.length).toBe(1);
    expect(criticalThreats[0].id).toContain('eq-major');
  });

  it('exports valid GeoJSON FeatureCollection for MapLibre / WebGL consumption', () => {
    client.ingestOsintData({
      commercial_flights: [{ icao24: 'abc', callsign: 'TEST1', lat: 36.5, lng: -97.5, heading: 90 }]
    });

    const geojson = client.toGeoJSON();
    expect(geojson.type).toBe('FeatureCollection');
    expect(geojson.features.length).toBe(1);
    const feature = geojson.features[0];
    expect(feature.geometry.type).toBe('Point');
    if (feature.geometry.type === 'Point') {
      expect(feature.geometry.coordinates).toEqual([-97.5, 36.5]);
    }
    expect(feature.properties?.heading).toBe(90);
  });

  it('handles edge-cases and kinematics conversion in LatticeAdapter track translation', () => {
    const adapter = new LatticeAdapter({
      endpoint: 'https://lattice.anduril.local',
      token: 'test-token',
    });

    const rawHostileTrack = {
      entityId: 'alpha-hostile-drone',
      displayName: 'HOSTILE UAV 01',
      trackType: 'AIR',
      position: {
        latitude_deg: 32.12,
        longitude_deg: 44.55,
        altitude_hae_m: 2500,
      },
      kinematics: {
        speed_mps: 50, // 50 m/s * 1.94384 = ~97.19 knots
        heading_deg: 450, // should normalize to 90 degrees
      },
      allegiance: 'HOSTILE',
      timestamp: new Date().toISOString(),
    };

    const entity = adapter.ingestTrack(rawHostileTrack);
    expect(entity.id).toBe('lattice-alpha-hostile-drone');
    expect(entity.threat).toBe(ThreatLevel.CRITICAL);
    expect(entity.display.scale).toBe(1.5);
    expect(entity.display.glow).toBe(true);
    expect(entity.position.heading).toBe(90);
    expect(entity.position.speed).toBeCloseTo(97.192, 1);

    // Negative speed clamping and fallback handling
    const malformedTrack = {
      entityId: 'unknown-entity',
      displayName: '',
      trackType: 'UNKNOWN_DOMAIN',
      position: {
        latitude_deg: 0,
        longitude_deg: 0,
      },
      kinematics: {
        speed_mps: -25,
      },
      timestamp: '',
    };

    const fallbackEntity = adapter.ingestTrack(malformedTrack);
    expect(fallbackEntity.domain).toBe(Domain.LAND);
    expect(fallbackEntity.threat).toBe(ThreatLevel.ELEVATED);
    expect(fallbackEntity.position.speed).toBe(0);
    expect(fallbackEntity.name).toBe('TRACK-unknown-');
  });
});
