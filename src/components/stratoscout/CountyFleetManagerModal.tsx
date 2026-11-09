'use client';

import React from 'react';
import {
  OKLAHOMA_COUNTY_FLEET_DATA,
  getFleetAllocationSummary,
  CountySubscription,
} from '@/lib/stratoscout/fleet-data';

interface CountyFleetManagerModalProps {
  onClose: () => void;
  onSelectCounty?: (countyId: string) => void;
}

export const CountyFleetManagerModal: React.FC<CountyFleetManagerModalProps> = ({
  onClose,
  onSelectCounty,
}) => {
  const summary = getFleetAllocationSummary();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 font-mono">
      <div className="relative w-full max-w-5xl bg-neutral-950 border border-neutral-700 rounded-lg shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="bg-neutral-900 px-6 py-4 border-b border-neutral-800 flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-cyan-400" />
              <h2 className="text-base font-bold text-white tracking-wide">
                STRATOSCOUT MULTI-COUNTY FLEET & SUBSCRIPTION MANAGER
              </h2>
            </div>
            <p className="text-xs text-neutral-400 mt-1">
              Dean&apos;s Innovation V18 Business Model • $15,000/yr County Tiers • 52 Annual Launch Fleet Pool
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-neutral-400 hover:text-white px-2 py-1 bg-neutral-800 rounded text-xs"
          >
            ✕ CLOSE
          </button>
        </div>

        {/* Executive KPI Bar */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 p-4 bg-neutral-900/40 border-b border-neutral-800 text-xs">
          <div className="bg-neutral-900/80 p-3 rounded border border-neutral-800">
            <span className="text-[10px] text-neutral-400 block">ANNUAL FLEET CAPACITY</span>
            <span className="text-lg font-bold text-cyan-400">
              {summary.totalLaunchesAllocated} / {summary.totalAnnualLaunchesBudgeted}
            </span>
            <span className="text-[10px] text-neutral-500 block">Launches Allocated (52 Total)</span>
          </div>

          <div className="bg-neutral-900/80 p-3 rounded border border-neutral-800">
            <span className="text-[10px] text-neutral-400 block">CONTRACTED REVENUE</span>
            <span className="text-lg font-bold text-emerald-400">
              ${(summary.totalAnnualArr).toLocaleString()} / YR
            </span>
            <span className="text-[10px] text-neutral-500 block">5 Oklahoma Counties @ $15k</span>
          </div>

          <div className="bg-neutral-900/80 p-3 rounded border border-neutral-800">
            <span className="text-[10px] text-neutral-400 block">COMPLETED MISSIONS</span>
            <span className="text-lg font-bold text-white">
              {summary.totalLaunchesCompleted} Flights
            </span>
            <span className="text-[10px] text-neutral-500 block">1,500 corridor miles flown</span>
          </div>

          <div className="bg-neutral-900/80 p-3 rounded border border-neutral-800">
            <span className="text-[10px] text-neutral-400 block">CWDG GRANT LEVERAGE</span>
            <span className="text-lg font-bold text-amber-400">75% FED MATCH</span>
            <span className="text-[10px] text-neutral-500 block">$11,250 reimbursable per county</span>
          </div>
        </div>

        {/* County Subscriptions Table */}
        <div className="p-4 overflow-y-auto flex-1">
          <table className="w-full text-xs text-left text-neutral-300">
            <thead className="text-[10px] uppercase bg-neutral-900/90 text-neutral-400 border-b border-neutral-800 sticky top-0">
              <tr>
                <th className="py-2.5 px-3">Jurisdiction</th>
                <th className="py-2.5 px-3">Emergency Director</th>
                <th className="py-2.5 px-3">Contract Status</th>
                <th className="py-2.5 px-3">Launches</th>
                <th className="py-2.5 px-3">Corridor Miles</th>
                <th className="py-2.5 px-3">Next Scan Window</th>
                <th className="py-2.5 px-3">FAA NOTAM</th>
                <th className="py-2.5 px-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-800">
              {OKLAHOMA_COUNTY_FLEET_DATA.map((county) => (
                <tr key={county.countyId} className="hover:bg-neutral-900/60 transition-colors">
                  <td className="py-3 px-3">
                    <div className="font-bold text-white">{county.countyName}</div>
                    <span className="text-[10px] text-cyan-400">${county.annualFee.toLocaleString()}/yr tier</span>
                  </td>
                  <td className="py-3 px-3 text-neutral-300">
                    {county.leadEmergencyDirector}
                  </td>
                  <td className="py-3 px-3">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] border ${
                        county.status === 'ACTIVE_SUBSCRIBER'
                          ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30 font-semibold'
                          : county.status === 'PENDING_CWDG_AWARD'
                          ? 'bg-amber-500/20 text-amber-400 border-amber-500/30'
                          : 'bg-blue-500/20 text-blue-400 border-blue-500/30'
                      }`}
                    >
                      {county.status.replace(/_/g, ' ')}
                    </span>
                  </td>
                  <td className="py-3 px-3">
                    <span className="font-bold text-white">{county.launchesCompleted}</span>
                    <span className="text-neutral-500"> / {county.launchesAllocated} used</span>
                  </td>
                  <td className="py-3 px-3 font-semibold text-neutral-200">
                    {county.scheduledCorridorMiles} mi
                  </td>
                  <td className="py-3 px-3 text-[11px] text-amber-300">
                    {county.nextScheduledLaunchDate}
                  </td>
                  <td className="py-3 px-3">
                    <span
                      className={`text-[10px] px-1.5 py-0.5 rounded ${
                        county.notamStatus === 'ACTIVE_ISSUED'
                          ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                          : 'bg-neutral-800 text-neutral-400'
                      }`}
                    >
                      {county.notamStatus}
                    </span>
                  </td>
                  <td className="py-3 px-3 text-right">
                    <button
                      onClick={() => {
                        if (onSelectCounty) onSelectCounty(county.countyId);
                        onClose();
                      }}
                      className="px-2.5 py-1 text-[11px] rounded bg-cyan-600/20 border border-cyan-500/40 text-cyan-300 hover:bg-cyan-600/40"
                    >
                      VIEW OPS →
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Footer */}
        <div className="bg-neutral-900 px-6 py-3 border-t border-neutral-800 flex items-center justify-between text-xs text-neutral-400">
          <div>
            <span>Launch Base: <strong>Stillwater Regional Airport / OAIRE Facility</strong></span>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => alert('52-Launch County Scheduling Allocation Saved.')}
              className="px-3 py-1 bg-cyan-600 hover:bg-cyan-500 text-black font-bold rounded"
            >
              SAVE ALLOCATION MATRIX
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
