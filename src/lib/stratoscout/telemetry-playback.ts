/**
 * StratoScout SITL / Flight Telemetry Playback Engine
 * Generates and interpolates continuous time-series flight telemetry
 * simulating the balloon launch to 65k ft, transition to autonomous glider flight,
 * and navigation along the 100-mile Oklahoma wind corridor.
 */

export interface FlightTelemetryPoint {
  timeSec: number;
  phase: 'ASCENT' | 'CORRIDOR_ENTRY' | 'SCANNING_CRUISE' | 'DESCENT_APPROACH' | 'RECOVERY_FLARE';
  lat: number;
  lng: number;
  altFt: number;
  groundSpeedKnots: number;
  headingDeg: number;
  pitchDeg: number;
  rollDeg: number;
  windSpeedMph: number;
  windDirectionDeg: number;
  gimbalPitchDeg: number;
  batteryPct: number;
  resolutionCmPx: number;
  statusText: string;
}

export const TELEMETRY_PROFILE: FlightTelemetryPoint[] = [
  {
    timeSec: 0,
    phase: 'ASCENT',
    lat: 36.1610,
    lng: -97.0864,
    altFt: 1100,
    groundSpeedKnots: 12,
    headingDeg: 215,
    pitchDeg: 14,
    rollDeg: 0,
    windSpeedMph: 18,
    windDirectionDeg: 210,
    gimbalPitchDeg: -30,
    batteryPct: 100,
    resolutionCmPx: 12,
    statusText: 'Balloon launch from Stillwater Airport / OAIRE Facility. Ascent rate 1,200 ft/min.',
  },
  {
    timeSec: 15,
    phase: 'ASCENT',
    lat: 36.1380,
    lng: -97.1020,
    altFt: 35000,
    groundSpeedKnots: 38,
    headingDeg: 212,
    pitchDeg: 8,
    rollDeg: 1,
    windSpeedMph: 45,
    windDirectionDeg: 215,
    gimbalPitchDeg: -45,
    batteryPct: 98,
    resolutionCmPx: 25,
    statusText: 'Climbing through tropopause. Stratospheric wind vector alignment.',
  },
  {
    timeSec: 30,
    phase: 'CORRIDOR_ENTRY',
    lat: 36.1156,
    lng: -97.1215,
    altFt: 65000,
    groundSpeedKnots: 54,
    headingDeg: 215,
    pitchDeg: -3,
    rollDeg: 2,
    windSpeedMph: 52,
    windDirectionDeg: 220,
    gimbalPitchDeg: -90,
    batteryPct: 95,
    resolutionCmPx: 50,
    statusText: 'Autonomous release at 65,000 ft. Glider wings deployed. 100-mile corridor initiated.',
  },
  {
    timeSec: 45,
    phase: 'SCANNING_CRUISE',
    lat: 36.0420,
    lng: -97.1530,
    altFt: 48000,
    groundSpeedKnots: 46,
    headingDeg: 218,
    pitchDeg: -4,
    rollDeg: -1,
    windSpeedMph: 36,
    windDirectionDeg: 215,
    gimbalPitchDeg: -88,
    batteryPct: 91,
    resolutionCmPx: 50,
    statusText: 'Scanning SH-51 WUI Sector. Multi-spectral NDVI fuel analysis active.',
  },
  {
    timeSec: 60,
    phase: 'SCANNING_CRUISE',
    lat: 35.9723,
    lng: -97.1845,
    altFt: 36000,
    groundSpeedKnots: 42,
    headingDeg: 220,
    pitchDeg: -5,
    rollDeg: 0,
    windSpeedMph: 32,
    windDirectionDeg: 218,
    gimbalPitchDeg: -90,
    batteryPct: 86,
    resolutionCmPx: 50,
    statusText: 'Cimarron River Crossing. Thermal infrared sensor detects 112°F riverbed smolder.',
  },
  {
    timeSec: 75,
    phase: 'SCANNING_CRUISE',
    lat: 35.8790,
    lng: -97.4250,
    altFt: 24000,
    groundSpeedKnots: 39,
    headingDeg: 216,
    pitchDeg: -4,
    rollDeg: 2,
    windSpeedMph: 28,
    windDirectionDeg: 215,
    gimbalPitchDeg: -85,
    batteryPct: 82,
    resolutionCmPx: 50,
    statusText: 'Guthrie Grassland Buffer. Comparing against baseline survey pass.',
  },
  {
    timeSec: 90,
    phase: 'SCANNING_CRUISE',
    lat: 35.6528,
    lng: -97.3822,
    altFt: 14000,
    groundSpeedKnots: 35,
    headingDeg: 222,
    pitchDeg: -5,
    rollDeg: -2,
    windSpeedMph: 31,
    windDirectionDeg: 225,
    gimbalPitchDeg: -90,
    batteryPct: 78,
    resolutionCmPx: 50,
    statusText: 'Edmond Arcadia WUI Critical Zone. 32 unmapped residential frames verified.',
  },
  {
    timeSec: 105,
    phase: 'DESCENT_APPROACH',
    lat: 35.6320,
    lng: -97.3610,
    altFt: 4500,
    groundSpeedKnots: 28,
    headingDeg: 200,
    pitchDeg: -8,
    rollDeg: 4,
    windSpeedMph: 24,
    windDirectionDeg: 210,
    gimbalPitchDeg: -60,
    batteryPct: 74,
    resolutionCmPx: 35,
    statusText: 'Glide approach to Lake Arcadia South Landing Field. Airspace clearance confirmed.',
  },
  {
    timeSec: 120,
    phase: 'RECOVERY_FLARE',
    lat: 35.6210,
    lng: -97.3510,
    altFt: 1100,
    groundSpeedKnots: 15,
    headingDeg: 195,
    pitchDeg: 12,
    rollDeg: 0,
    windSpeedMph: 18,
    windDirectionDeg: 205,
    gimbalPitchDeg: -20,
    batteryPct: 71,
    resolutionCmPx: 20,
    statusText: 'Automated parachute flare touchdown. Telemetry beacon transmitting recovery coordinates.',
  },
];

/**
 * Interpolate flight telemetry at any arbitrary playback time in seconds (0 to 120s)
 */
export function getInterpolatedTelemetry(timeSec: number): FlightTelemetryPoint {
  const clampedTime = Math.max(0, Math.min(120, timeSec));
  const idx = TELEMETRY_PROFILE.findIndex(p => p.timeSec >= clampedTime);

  if (idx <= 0) return TELEMETRY_PROFILE[0];
  if (idx >= TELEMETRY_PROFILE.length) return TELEMETRY_PROFILE[TELEMETRY_PROFILE.length - 1];

  const p0 = TELEMETRY_PROFILE[idx - 1];
  const p1 = TELEMETRY_PROFILE[idx];

  const t = (clampedTime - p0.timeSec) / (p1.timeSec - p0.timeSec);

  return {
    timeSec: clampedTime,
    phase: t > 0.5 ? p1.phase : p0.phase,
    lat: p0.lat + (p1.lat - p0.lat) * t,
    lng: p0.lng + (p1.lng - p0.lng) * t,
    altFt: Math.round(p0.altFt + (p1.altFt - p0.altFt) * t),
    groundSpeedKnots: Math.round(p0.groundSpeedKnots + (p1.groundSpeedKnots - p0.groundSpeedKnots) * t),
    headingDeg: Math.round(p0.headingDeg + (p1.headingDeg - p0.headingDeg) * t),
    pitchDeg: Math.round(p0.pitchDeg + (p1.pitchDeg - p0.pitchDeg) * t),
    rollDeg: Math.round(p0.rollDeg + (p1.rollDeg - p0.rollDeg) * t),
    windSpeedMph: Math.round(p0.windSpeedMph + (p1.windSpeedMph - p0.windSpeedMph) * t),
    windDirectionDeg: Math.round(p0.windDirectionDeg + (p1.windDirectionDeg - p0.windDirectionDeg) * t),
    gimbalPitchDeg: Math.round(p0.gimbalPitchDeg + (p1.gimbalPitchDeg - p0.gimbalPitchDeg) * t),
    batteryPct: Math.round(p0.batteryPct + (p1.batteryPct - p0.batteryPct) * t),
    resolutionCmPx: 50,
    statusText: t > 0.5 ? p1.statusText : p0.statusText,
  };
}
