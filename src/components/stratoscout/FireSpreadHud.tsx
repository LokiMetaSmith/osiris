'use client';

import React from 'react';
import { FireSpreadProjection } from '@/lib/stratoscout/dispersion-model';

interface FireSpreadHudProps {
  projection: FireSpreadProjection;
  activeHour: number;
  onSelectHour: (hour: number) => void;
  onClose: () => void;
}

export const FireSpreadHud: React.FC<FireSpreadHudProps> = ({
  projection,
  activeHour,
  onSelectHour,
  onClose,
}) => {
  const currentPerimeter = projection.perimeters.find((p) => p.hour === activeHour) || projection.perimeters[0];

  return (
    <div className="bg-neutral-900/95 border border-amber-500/40 rounded p-3 backdrop-blur-md text-xs font-mono shadow-2xl text-amber-200">
      <div className="flex items-center justify-between pb-2 mb-2 border-b border-amber-500/30">
        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
          <span className="font-bold text-amber-300 uppercase tracking-wider">
            Rothermel Fire Spread & Smoke Dispersion
          </span>
        </div>
        <button
          onClick={onClose}
          className="text-neutral-400 hover:text-white px-1.5 py-0.5 rounded text-xs bg-neutral-800"
        >
          ✕
        </button>
      </div>

      <div className="grid grid-cols-3 gap-2 mb-3">
        <div className="bg-black/50 p-2 rounded border border-neutral-800">
          <div className="text-[10px] text-neutral-400">RATE OF SPREAD</div>
          <div className="text-sm font-bold text-amber-400">{projection.rateOfSpreadChainsPerHour} ch/hr</div>
          <div className="text-[9px] text-neutral-500">~{Math.round(projection.rateOfSpreadChainsPerHour * 0.82)} mph forward</div>
        </div>

        <div className="bg-black/50 p-2 rounded border border-neutral-800">
          <div className="text-[10px] text-neutral-400">WIND VECTOR</div>
          <div className="text-sm font-bold text-cyan-400">{projection.windSpeedMph} mph</div>
          <div className="text-[9px] text-neutral-500">{projection.windHeadingDeg}° Gusting SW</div>
        </div>

        <div className="bg-black/50 p-2 rounded border border-neutral-800">
          <div className="text-[10px] text-neutral-400">FUEL MOISTURE</div>
          <div className="text-sm font-bold text-red-400">{projection.fuelMoisturePct}%</div>
          <div className="text-[9px] text-red-500">Critical Red Flag</div>
        </div>
      </div>

      <div className="mb-3">
        <div className="text-[10px] text-neutral-400 uppercase mb-1">Projection Horizon</div>
        <div className="grid grid-cols-3 gap-1">
          {projection.perimeters.map((p) => {
            const isSelected = p.hour === activeHour;
            return (
              <button
                key={p.hour}
                onClick={() => onSelectHour(p.hour)}
                className={`py-1.5 px-2 rounded border text-center transition-all ${
                  isSelected
                    ? 'bg-amber-500/20 border-amber-400 text-amber-300 font-bold shadow-[0_0_10px_rgba(245,158,11,0.2)]'
                    : 'bg-black/40 border-neutral-800 text-neutral-400 hover:border-neutral-600'
                }`}
              >
                <div>T+{p.hour}h PERIMETER</div>
                <div className="text-[10px] opacity-80">{p.areaAcres.toLocaleString()} ac</div>
              </button>
            );
          })}
        </div>
      </div>

      <div className="bg-amber-950/30 border border-amber-900/50 p-2.5 rounded flex items-center justify-between">
        <div>
          <span className="text-[10px] text-amber-400 block font-semibold">T+{activeHour}h IMPACT ESTIMATE:</span>
          <span className="text-sm font-bold text-white">{currentPerimeter.structuresThreatened} WUI Structures</span>
          <span className="text-neutral-400 text-[10px] ml-1">in predicted burn scar</span>
        </div>
        <span className="text-[10px] px-2 py-1 rounded bg-amber-500/20 text-amber-300 border border-amber-500/40">
          EVAC CORRIDOR WARN
        </span>
      </div>
    </div>
  );
};
