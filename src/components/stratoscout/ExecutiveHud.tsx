'use client';

import React from 'react';
import { STRATOSCOUT_METRICS } from '@/lib/stratoscout/data';
import { ShieldAlert, Compass, DollarSign, Rocket, Layers, Eye } from 'lucide-react';

interface ExecutiveHudProps {
  corridorOverlay: boolean;
  onToggleCorridor: () => void;
  selectedCounty: 'All Counties' | 'Payne County' | 'Oklahoma County';
  onSelectCounty: (county: 'All Counties' | 'Payne County' | 'Oklahoma County') => void;
  totalAtRiskStructures: number;
}

export default function ExecutiveHud({
  corridorOverlay,
  onToggleCorridor,
  selectedCounty,
  onSelectCounty,
  totalAtRiskStructures,
}: ExecutiveHudProps) {
  return (
    <div className="glass-panel p-4 max-w-sm w-full border border-[var(--gold-primary)]/30 backdrop-blur-md shadow-2xl text-[11px] font-mono text-[var(--text-primary)]">
      {/* Title & Region */}
      <div className="flex items-center justify-between pb-2 mb-3 border-b border-[var(--border-primary)]">
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 rounded-full bg-[#FF3D3D] animate-pulse" />
          <span className="font-bold tracking-wider text-sm text-[var(--gold-primary)]">
            STRATOSCOUT C2
          </span>
        </div>
        <span className="text-[9px] px-2 py-0.5 rounded bg-red-950/60 border border-red-500/40 text-red-300 font-bold">
          OK-REGION ALPHA
        </span>
      </div>

      {/* Target County Selector */}
      <div className="mb-3">
        <div className="text-[9px] text-[var(--text-muted)] tracking-wider mb-1.5 flex items-center gap-1">
          <Compass className="w-3 h-3 text-[var(--cyan-primary)]" />
          OPERATIONAL JURISDICTION:
        </div>
        <div className="grid grid-cols-3 gap-1">
          {(['All Counties', 'Payne County', 'Oklahoma County'] as const).map(c => (
            <button
              key={c}
              onClick={() => onSelectCounty(c)}
              className={`px-2 py-1 text-[9px] rounded transition-all text-center border ${
                selectedCounty === c
                  ? 'bg-[var(--gold-primary)]/20 border-[var(--gold-primary)] text-[var(--gold-primary)] font-bold'
                  : 'bg-black/30 border-white/10 hover:border-white/30 text-[var(--text-muted)]'
              }`}
            >
              {c === 'All Counties' ? 'ALL' : c.replace(' County', '')}
            </button>
          ))}
        </div>
      </div>

      {/* Primary Metrics Grid */}
      <div className="grid grid-cols-2 gap-2 mb-3">
        <div className="p-2 rounded bg-black/40 border border-white/10">
          <div className="text-[9px] text-[var(--text-muted)] flex items-center gap-1">
            <ShieldAlert className="w-3 h-3 text-[#FF3D3D]" />
            WUI STRUCTURES AT RISK
          </div>
          <div className="text-xl font-bold text-[#FF3D3D] tabular-nums mt-0.5">
            {totalAtRiskStructures}
          </div>
          <div className="text-[8px] text-[var(--text-muted)] mt-0.5">High-Risk Perimeter</div>
        </div>

        <div className="p-2 rounded bg-black/40 border border-white/10">
          <div className="text-[9px] text-[var(--text-muted)] flex items-center gap-1">
            <Eye className="w-3 h-3 text-[var(--cyan-primary)]" />
            50CM/PX SCANNED
          </div>
          <div className="text-xl font-bold text-[var(--cyan-primary)] tabular-nums mt-0.5">
            {STRATOSCOUT_METRICS.milesScanned50cm.toLocaleString()} <span className="text-xs font-normal">mi</span>
          </div>
          <div className="text-[8px] text-[var(--text-muted)] mt-0.5">Sub-Meter Ground Intel</div>
        </div>
      </div>

      {/* Secondary Metrics / Business Plan Alignment */}
      <div className="space-y-1.5 p-2.5 rounded bg-black/50 border border-white/5 mb-3 text-[9px]">
        <div className="flex justify-between items-center">
          <span className="text-[var(--text-muted)] flex items-center gap-1">
            <Rocket className="w-3 h-3 text-[var(--alert-green)]" />
            ANNUAL LAUNCH BUDGET:
          </span>
          <span className="font-bold text-[var(--alert-green)] tabular-nums">
            {STRATOSCOUT_METRICS.launchesCompleted} / {STRATOSCOUT_METRICS.annualLaunchBudget} LAUNCHES
          </span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-[var(--text-muted)] flex items-center gap-1">
            <DollarSign className="w-3 h-3 text-[var(--gold-primary)]" />
            COUNTY SUBSCRIPTION:
          </span>
          <span className="font-bold text-[var(--gold-primary)] tabular-nums">
            ${STRATOSCOUT_METRICS.countyAnnualSubscriptionPrice.toLocaleString()} / YR
          </span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-[var(--text-muted)]">ACTIVE FIREBREAKS MAINTAINED:</span>
          <span className="text-white font-bold tabular-nums">
            {STRATOSCOUT_METRICS.activeFirebreaksMaintainedMiles} mi
          </span>
        </div>
      </div>

      {/* Interactive Toggle: 100-Mile Balloon Glide Corridor */}
      <button
        onClick={onToggleCorridor}
        className={`w-full py-2 px-3 rounded flex items-center justify-between text-[10px] font-bold tracking-wider transition-all border ${
          corridorOverlay
            ? 'bg-gradient-to-r from-cyan-950/80 to-blue-900/60 border-cyan-400 text-cyan-200 shadow-[0_0_15px_rgba(0,229,255,0.2)]'
            : 'bg-black/40 border-white/20 text-gray-400 hover:border-white/40'
        }`}
      >
        <span className="flex items-center gap-2">
          <Layers className="w-3.5 h-3.5 text-cyan-400" />
          100-MI GLIDE CORRIDOR / WIND VECTOR
        </span>
        <span className={`px-1.5 py-0.5 text-[8px] rounded ${corridorOverlay ? 'bg-cyan-500 text-black font-extrabold' : 'bg-gray-800 text-gray-300'}`}>
          {corridorOverlay ? 'ACTIVE' : 'OFF'}
        </span>
      </button>
    </div>
  );
}
