/**
 * StratoScout Command — Oklahoma Wildfire Prevention & County Emergency Management
 * Based on Dean's Innovation V18 Business Plan requirements.
 * Data models, sector telemetry, and spatial datasets covering Payne County (Stillwater)
 * and Oklahoma County (Edmond Arcadia WUI).
 */

export type ThreatType = '01 Fire Fuel Complex' | '02 Surface Heat / Thermal' | '03 High-Risk WUI Borders';

export type RecommendedAction = 'Clear Brush' | 'Cut Firebreak' | 'Pre-position Crew' | 'Initiate Evac Warning' | 'Continuous 50cm Monitor';

export interface SectorTriageItem {
  id: string;
  county: 'Payne County' | 'Oklahoma County';
  sectorName: string;
  threatType: ThreatType;
  severity: 'CRITICAL' | 'HIGH' | 'MODERATE' | 'LOW';
  structuresAtRisk: number;
  acresCovered: number;
  fuelMoisturePct: number;
  ndviIndex: number; // 0.0 - 1.0 (dry/cured vegetation vs healthy)
  surfaceTempF: number;
  windSpeedMph: number;
  windDirectionDeg: number;
  recommendedAction: RecommendedAction;
  lat: number;
  lng: number;
  urgencyHours: number;
  baselineDiffPct: number; // +X% fuel load change since last pass
  contactDirector: string;
  notes: string;
}

export interface CountyReportData {
  reportId: string;
  timestamp: string;
  county: string;
  directorName: string;
  subscriptionTier: string;
  annualLaunchesUsed: number;
  annualLaunchesAllocated: number;
  totalMilesScanned50cm: number;
  structuresAtRiskTotal: number;
  criticalSectorsCount: number;
  femaGrantReadinessScore: number; // 0-100
  cwdgEligibility: {
    status: 'ELIGIBLE' | 'APPLICATION READY' | 'HIGH PRIORITY';
    maxGrantAmount: string;
    keyJustification: string;
  };
  windVectorSummary: {
    dominantDirection: string;
    sustainedMph: number;
    gustsMph: number;
    redFlagWarning: boolean;
  };
  recommendedActionsList: {
    priority: number;
    location: string;
    action: RecommendedAction;
    estimatedCost: string;
    urgency: string;
  }[];
}

export const STRATOSCOUT_METRICS = {
  countyAnnualSubscriptionPrice: 15000, // $15,000/yr per V18 Business Plan
  oneTimeScanPrice: 1500, // $1,500 one-time project scan
  customDataPlanPrice: 5000,
  annualLaunchBudget: 52, // 52 launches/year per county
  launchesCompleted: 14,
  milesScanned50cm: 1420,
  corridorLengthMiles: 100, // 100-mile balloon glide corridor
  imageryResolution: '50 cm/pixel',
  structuresIdentified: 847,
  highRiskWuiStructures: 184,
  activeFirebreaksMaintainedMiles: 42.6,
  weatherWindowStatus: 'RED FLAG WARNING (HIGH SPREAD RISK)',
};

export const STRATOSCOUT_SECTORS: SectorTriageItem[] = [
  {
    id: 'SEC-PAYNE-01',
    county: 'Payne County',
    sectorName: 'Stillwater West / Highway 51 Corridor',
    threatType: '01 Fire Fuel Complex',
    severity: 'CRITICAL',
    structuresAtRisk: 64,
    acresCovered: 1280,
    fuelMoisturePct: 6.2,
    ndviIndex: 0.18, // Dense dried cured brush
    surfaceTempF: 94.2,
    windSpeedMph: 28,
    windDirectionDeg: 215, // SW winds typical of Oklahoma wildfire outbreaks
    recommendedAction: 'Cut Firebreak',
    lat: 36.1156,
    lng: -97.1215,
    urgencyHours: 6,
    baselineDiffPct: +38.4,
    contactDirector: 'Rob Hill (Payne County EM Director)',
    notes: 'Heavy eastern redcedar buildup encroaching on residential subdivisions west of Stillwater along SH-51.',
  },
  {
    id: 'SEC-PAYNE-02',
    county: 'Payne County',
    sectorName: 'Lake Carl Blackwell North Ridge',
    threatType: '03 High-Risk WUI Borders',
    severity: 'HIGH',
    structuresAtRisk: 42,
    acresCovered: 960,
    fuelMoisturePct: 7.8,
    ndviIndex: 0.22,
    surfaceTempF: 88.5,
    windSpeedMph: 26,
    windDirectionDeg: 220,
    recommendedAction: 'Clear Brush',
    lat: 36.1432,
    lng: -97.1984,
    urgencyHours: 12,
    baselineDiffPct: +24.1,
    contactDirector: 'Rob Hill (Payne County EM Director)',
    notes: 'Narrow ingress/egress roads bounded by unbroken cured juniper woodland.',
  },
  {
    id: 'SEC-PAYNE-03',
    county: 'Payne County',
    sectorName: 'Perkins South Riverine Flank',
    threatType: '02 Surface Heat / Thermal',
    severity: 'HIGH',
    structuresAtRisk: 28,
    acresCovered: 640,
    fuelMoisturePct: 8.5,
    ndviIndex: 0.25,
    surfaceTempF: 112.4, // Smoldering / hotspot signature
    windSpeedMph: 24,
    windDirectionDeg: 210,
    recommendedAction: 'Pre-position Crew',
    lat: 35.9723,
    lng: -97.0345,
    urgencyHours: 8,
    baselineDiffPct: +19.7,
    contactDirector: 'Rob Hill (Payne County EM Director)',
    notes: 'Thermal signature detected in dry riverbed brush pile 1.2 miles upwind of primary school.',
  },
  {
    id: 'SEC-OK-01',
    county: 'Oklahoma County',
    sectorName: 'Edmond Arcadia WUI Border / I-35 Flank',
    threatType: '03 High-Risk WUI Borders',
    severity: 'CRITICAL',
    structuresAtRisk: 89,
    acresCovered: 1840,
    fuelMoisturePct: 5.9,
    ndviIndex: 0.16,
    surfaceTempF: 96.8,
    windSpeedMph: 31,
    windDirectionDeg: 225,
    recommendedAction: 'Cut Firebreak',
    lat: 35.6528,
    lng: -97.3822,
    urgencyHours: 4,
    baselineDiffPct: +46.2, // Rapid new construction + fuel load accumulation
    contactDirector: 'Benjamin Curry (Edmond EM Director)',
    notes: 'Benjamin Curry key scenario: Year-old satellite maps omit 32 newly framed residential homes directly bordering dry timber ridge.',
  },
  {
    id: 'SEC-OK-02',
    county: 'Oklahoma County',
    sectorName: 'Spring Creek Basin & Deer Creek North',
    threatType: '01 Fire Fuel Complex',
    severity: 'HIGH',
    structuresAtRisk: 53,
    acresCovered: 1100,
    fuelMoisturePct: 7.1,
    ndviIndex: 0.20,
    surfaceTempF: 91.0,
    windSpeedMph: 29,
    windDirectionDeg: 215,
    recommendedAction: 'Clear Brush',
    lat: 35.7142,
    lng: -97.5412,
    urgencyHours: 14,
    baselineDiffPct: +28.6,
    contactDirector: 'Benjamin Curry (Edmond EM Director)',
    notes: 'Overgrown creek drainage channels acting as natural wildfire chimney conduits towards residential clusters.',
  },
  {
    id: 'SEC-OK-03',
    county: 'Oklahoma County',
    sectorName: 'Lake Hefner Northwest Buffers',
    threatType: '02 Surface Heat / Thermal',
    severity: 'MODERATE',
    structuresAtRisk: 22,
    acresCovered: 420,
    fuelMoisturePct: 10.4,
    ndviIndex: 0.29,
    surfaceTempF: 103.1,
    windSpeedMph: 20,
    windDirectionDeg: 200,
    recommendedAction: 'Continuous 50cm Monitor',
    lat: 35.5891,
    lng: -97.6210,
    urgencyHours: 24,
    baselineDiffPct: +11.3,
    contactDirector: 'Benjamin Curry (Edmond EM Director)',
    notes: 'Elevated surface temp in open grassland buffer, currently 1.8 miles from municipal fire station 14.',
  },
];

/**
 * 100-mile balloon-launch glide corridor flight path.
 * Starts from OAIRE / Stillwater regional launch zone, rides prevailing SW wind vector,
 * glides over Payne and Oklahoma County WUI critical assets, and reaches recovery coordinates.
 */
export const GLIDE_CORRIDOR_WAYPOINTS = [
  { step: 1, name: 'Launch Point: Stillwater Airport / OAIRE Facility', lat: 36.1610, lng: -97.0864, altFt: 65000, desc: 'High-altitude balloon ascent & automated deployment' },
  { step: 2, name: 'Glide Waypoint A: SH-51 WUI Sector', lat: 36.1156, lng: -97.1215, altFt: 48000, desc: 'Initiate 50cm/px multispectral sensor scanning pass' },
  { step: 3, name: 'Glide Waypoint B: Cimarron River Ridge Crossing', lat: 35.9723, lng: -97.1845, altFt: 34000, desc: 'Cross-wind autonomous thermal sweep' },
  { step: 4, name: 'Glide Waypoint C: Guthrie North Grassland Buffer', lat: 35.8790, lng: -97.4250, altFt: 22000, desc: 'Change detection pass against baseline survey' },
  { step: 5, name: 'Glide Waypoint D: Edmond Arcadia WUI Critical Zone', lat: 35.6528, lng: -97.3822, altFt: 11000, desc: 'High-density residential risk mapping' },
  { step: 6, name: 'Recovery LZ: Lake Arcadia South Landing Field', lat: 35.6210, lng: -97.3510, altFt: 1100, desc: 'Automated parachute flare and telemetry beacon recovery' },
];

/**
 * Firebreak lines (GeoJSON FeatureCollection)
 */
export const MOCK_FIREBREAKS_GEOJSON = {
  type: 'FeatureCollection',
  features: [
    {
      type: 'Feature',
      properties: {
        id: 'FB-PAYNE-01',
        name: 'Stillwater West Municipal Firebreak',
        status: 'CLEARED / OPTIMAL',
        widthFeet: 60,
        lengthMiles: 8.4,
        lastInspected: '2025-03-02',
      },
      geometry: {
        type: 'LineString',
        coordinates: [
          [-97.1500, 36.1350],
          [-97.1350, 36.1100],
          [-97.1180, 36.0850],
        ],
      },
    },
    {
      type: 'Feature',
      properties: {
        id: 'FB-PAYNE-02',
        name: 'Lake Carl Blackwell Defensive Fuel Break',
        status: 'NEEDS BRUSH CLEARING',
        widthFeet: 40,
        lengthMiles: 5.2,
        lastInspected: '2025-02-18',
      },
      geometry: {
        type: 'LineString',
        coordinates: [
          [-97.2200, 36.1550],
          [-97.1950, 36.1420],
          [-97.1750, 36.1280],
        ],
      },
    },
    {
      type: 'Feature',
      properties: {
        id: 'FB-OK-01',
        name: 'Edmond Arcadia North WUI Perimeter Break',
        status: 'RECOMMENDED CUT / CRITICAL',
        widthFeet: 75,
        lengthMiles: 11.2,
        lastInspected: '2025-03-08',
      },
      geometry: {
        type: 'LineString',
        coordinates: [
          [-97.4100, 35.6720],
          [-97.3820, 35.6520],
          [-97.3450, 35.6350],
        ],
      },
    },
  ],
};

/**
 * High-Risk WUI Structure Clusters (Points)
 */
export const MOCK_WUI_CLUSTERS_GEOJSON = {
  type: 'FeatureCollection',
  features: [
    {
      type: 'Feature',
      properties: {
        id: 'WUI-STW-01',
        name: 'Stillwater Ridge Estates (64 Structures)',
        threatScore: 92,
        primaryThreat: '01 Fire Fuel Complex',
        action: 'Cut Firebreak',
      },
      geometry: {
        type: 'Point',
        coordinates: [-97.1215, 36.1156],
      },
    },
    {
      type: 'Feature',
      properties: {
        id: 'WUI-EDM-01',
        name: 'Edmond East Timberlands Subdivisions (89 Structures)',
        threatScore: 96,
        primaryThreat: '03 High-Risk WUI Borders',
        action: 'Cut Firebreak & Clear Encroaching Brush',
      },
      geometry: {
        type: 'Point',
        coordinates: [-97.3822, 35.6528],
      },
    },
    {
      type: 'Feature',
      properties: {
        id: 'WUI-PRK-01',
        name: 'Perkins South Rural Community (28 Structures)',
        threatScore: 84,
        primaryThreat: '02 Surface Heat / Thermal',
        action: 'Pre-position Suppression Crew',
      },
      geometry: {
        type: 'Point',
        coordinates: [-97.0345, 35.9723],
      },
    },
  ],
};

/**
 * Helper to generate an authentic County Prevention & CWDG Grant Report.
 */
export function generateCountyPreventionReport(county: 'Payne County' | 'Oklahoma County'): CountyReportData {
  const isPayne = county === 'Payne County';
  const director = isPayne ? 'Rob Hill (Payne County EM Director)' : 'Benjamin Curry (Edmond / Oklahoma County EM Director)';
  const sectors = STRATOSCOUT_SECTORS.filter(s => s.county === county);
  const totalStructures = sectors.reduce((acc, s) => acc + s.structuresAtRisk, 0);
  const criticalSectors = sectors.filter(s => s.severity === 'CRITICAL').length;

  return {
    reportId: `STRATO-CWDG-${isPayne ? 'PAYNE' : 'OKLA'}-${new Date().getFullYear()}-003`,
    timestamp: new Date().toISOString(),
    county,
    directorName: director,
    subscriptionTier: '$15,000 / Annual County Enterprise',
    annualLaunchesUsed: isPayne ? 14 : 11,
    annualLaunchesAllocated: 52,
    totalMilesScanned50cm: isPayne ? 1420 : 1180,
    structuresAtRiskTotal: totalStructures,
    criticalSectorsCount: criticalSectors,
    femaGrantReadinessScore: 96,
    cwdgEligibility: {
      status: 'HIGH PRIORITY',
      maxGrantAmount: isPayne ? '$2,450,000' : '$3,200,000',
      keyJustification: isPayne
        ? 'March 2025 fire event recurrence mitigation, SH-51 corridor eastern redcedar fuel-load containment, and pre-firebrush clearance along high-density WUI perimeter.'
        : 'Arcadia lake watershed protection, unmapped 2024-2025 residential construction WUI triage, and county-wide 10-15 tool consolidation onto one single pane of glass.',
    },
    windVectorSummary: {
      dominantDirection: 'SW 215° - 225°',
      sustainedMph: isPayne ? 28 : 31,
      gustsMph: isPayne ? 38 : 42,
      redFlagWarning: true,
    },
    recommendedActionsList: sectors.map((sec, idx) => ({
      priority: idx + 1,
      location: sec.sectorName,
      action: sec.recommendedAction,
      estimatedCost: idx === 0 ? '$45,000 (CWDG Category 2)' : idx === 1 ? '$28,000 (Local EM Brush Clearance)' : '$15,000 (Tactical Crew Staging)',
      urgency: sec.severity === 'CRITICAL' ? 'Within 24 Hours' : 'Within 7 Days',
    })),
  };
}
