/**
 * Multi-County Subscription and Fleet Allocation Data Model
 * Aligned with Dean's Innovation V18 Business Plan:
 * - $15,000 / year annual county subscription
 * - 52 launches / year operational glider budget
 * - 100-mile corridor flight missions
 * - CWDG (Community Wildfire Defense Grant) 75% federal match
 */

export interface CountySubscription {
  countyId: string;
  countyName: string;
  leadEmergencyDirector: string;
  status: 'ACTIVE_SUBSCRIBER' | 'PENDING_CWDG_AWARD' | 'PILOT_AGREEMENT';
  annualFee: number;
  launchesAllocated: number;
  launchesCompleted: number;
  scheduledCorridorMiles: number;
  cwdgGrantMatchFunded: number;
  nextScheduledLaunchDate: string;
  notamStatus: 'ACTIVE_ISSUED' | 'FILED_PENDING' | 'WINDOW_STANDBY';
  riskRating: 'EXTREME' | 'HIGH' | 'MODERATE';
}

export const OKLAHOMA_COUNTY_FLEET_DATA: CountySubscription[] = [
  {
    countyId: 'PAYNE',
    countyName: 'Payne County',
    leadEmergencyDirector: 'Rob Hill (Stillwater EM Director)',
    status: 'ACTIVE_SUBSCRIBER',
    annualFee: 15000,
    launchesAllocated: 14,
    launchesCompleted: 4,
    scheduledCorridorMiles: 400,
    cwdgGrantMatchFunded: 11250,
    nextScheduledLaunchDate: '2026-03-12 (Red Flag Window)',
    notamStatus: 'ACTIVE_ISSUED',
    riskRating: 'EXTREME',
  },
  {
    countyId: 'OKLAHOMA',
    countyName: 'Oklahoma County',
    leadEmergencyDirector: 'Benjamin Curry (Edmond EM Director)',
    status: 'ACTIVE_SUBSCRIBER',
    annualFee: 15000,
    launchesAllocated: 16,
    launchesCompleted: 5,
    scheduledCorridorMiles: 520,
    cwdgGrantMatchFunded: 11250,
    nextScheduledLaunchDate: '2026-03-14 (Arcadia WUI Pass)',
    notamStatus: 'ACTIVE_ISSUED',
    riskRating: 'EXTREME',
  },
  {
    countyId: 'LOGAN',
    countyName: 'Logan County',
    leadEmergencyDirector: 'David Ball (Guthrie EM Coordinator)',
    status: 'ACTIVE_SUBSCRIBER',
    annualFee: 15000,
    launchesAllocated: 8,
    launchesCompleted: 2,
    scheduledCorridorMiles: 240,
    cwdgGrantMatchFunded: 11250,
    nextScheduledLaunchDate: '2026-03-20 (Cimarron River Pass)',
    notamStatus: 'FILED_PENDING',
    riskRating: 'HIGH',
  },
  {
    countyId: 'LINCOLN',
    countyName: 'Lincoln County',
    leadEmergencyDirector: 'Joey Wakefield (Chandler EM)',
    status: 'PENDING_CWDG_AWARD',
    annualFee: 15000,
    launchesAllocated: 8,
    launchesCompleted: 1,
    scheduledCorridorMiles: 180,
    cwdgGrantMatchFunded: 11250,
    nextScheduledLaunchDate: '2026-03-25 (Deep Fork Corridor)',
    notamStatus: 'WINDOW_STANDBY',
    riskRating: 'HIGH',
  },
  {
    countyId: 'CANADIAN',
    countyName: 'Canadian County',
    leadEmergencyDirector: 'Tim Smith (El Reno EM)',
    status: 'PILOT_AGREEMENT',
    annualFee: 15000,
    launchesAllocated: 6,
    launchesCompleted: 2,
    scheduledCorridorMiles: 160,
    cwdgGrantMatchFunded: 11250,
    nextScheduledLaunchDate: '2026-04-02 (West Corridor Pass)',
    notamStatus: 'WINDOW_STANDBY',
    riskRating: 'MODERATE',
  },
];

export interface FleetAllocationSummary {
  totalAnnualLaunchesBudgeted: number;
  totalLaunchesAllocated: number;
  totalLaunchesCompleted: number;
  totalActiveCounties: number;
  totalAnnualArr: number;
  totalCorridorMilesScanned: number;
}

export function getFleetAllocationSummary(): FleetAllocationSummary {
  const totalLaunchesAllocated = OKLAHOMA_COUNTY_FLEET_DATA.reduce((acc, c) => acc + c.launchesAllocated, 0);
  const totalLaunchesCompleted = OKLAHOMA_COUNTY_FLEET_DATA.reduce((acc, c) => acc + c.launchesCompleted, 0);
  const totalAnnualArr = OKLAHOMA_COUNTY_FLEET_DATA.reduce((acc, c) => acc + c.annualFee, 0);
  const totalCorridorMilesScanned = OKLAHOMA_COUNTY_FLEET_DATA.reduce((acc, c) => acc + c.scheduledCorridorMiles, 0);

  return {
    totalAnnualLaunchesBudgeted: 52,
    totalLaunchesAllocated,
    totalLaunchesCompleted,
    totalActiveCounties: OKLAHOMA_COUNTY_FLEET_DATA.length,
    totalAnnualArr,
    totalCorridorMilesScanned,
  };
}
