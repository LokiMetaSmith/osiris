'use client';

import React, { useState } from 'react';
import { InterpolatedTelemetry } from '@/lib/stratoscout/telemetry-playback';

interface GimbalFmvOverlayProps {
  telemetry: InterpolatedTelemetry;
  selectedSectorName?: string;
  onClose: () => void;
}

export const GimbalFmvOverlay: React.FC<GimbalFmvOverlayProps> = ({
  telemetry,
  selectedSectorName = 'SEC-PAYNE-01 (Highway 51)',
  onClose,
}) => {
  const [spectralMode, setSpectralMode] = useState<'RGB' | 'FLIR' | 'NDVI'>('FLIR');
  const [laserArmed, setLaserArmed] = useState(true);

  // Derive simulated gimbal values
  const slantRangeFt = Math.round((telemetry.altFt || 1000) / Math.sin(Math.abs(telemetry.gimbalPitchDeg || -30) * Math.PI / 180));
  const targetLat = (telemetry.lat + 0.0042).toFixed(5);
  const targetLng = (telemetry.lng + 0.0031).toFixed(5);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 font-mono">
      <div className="relative w-full max-w-4xl bg-neutral-950 border border-neutral-700 rounded-lg overflow-hidden shadow-2xl flex flex-col">
        {/* Header bar */}
        <div className="bg-neutral-900 px-4 py-2 border-b border-neutral-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse" />
            <span className="text-sm font-bold text-white tracking-wider">
              STRATOSCOUT FMV GIMBAL FEED • 50 CM/PX TACTICAL ISR
            </span>
            <span className="text-xs px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
              MISB ST 0601 COMPLIANT
            </span>
          </div>
          <button
            onClick={onClose}
            className="text-neutral-400 hover:text-white text-xs px-2 py-1 rounded bg-neutral-800"
          >
            ESC / CLOSE
          </button>
        </div>

        {/* Video Canvas / Tactical Reticle */}
        <div className="relative w-full aspect-video bg-neutral-900 overflow-hidden flex items-center justify-center select-none">
          {/* Background simulated optical/thermal/ndvi pattern */}
          <div
            className={`absolute inset-0 transition-colors duration-500 ${
              spectralMode === 'FLIR'
                ? 'bg-gradient-to-tr from-purple-950 via-red-950 to-amber-900 opacity-90'
                : spectralMode === 'NDVI'
                ? 'bg-gradient-to-tr from-red-950 via-yellow-950 to-emerald-950 opacity-90'
                : 'bg-gradient-to-tr from-emerald-950 via-neutral-900 to-amber-950 opacity-80'
            }`}
          />

          {/* Raster scanline and noise overlay */}
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_transparent_40%,_rgba(0,0,0,0.6)_100%)] pointer-events-none" />
          <div
            className="absolute inset-0 pointer-events-none opacity-20"
            style={{
              backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 2px, #000 3px)',
            }}
          />

          {/* Simulated Target Hotspot / Thermal bloom */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 rounded-full blur-2xl pointer-events-none transition-all duration-300 opacity-70 bg-amber-500 animate-pulse" />

          {/* Tactical HUD Overlay Elements */}
          {/* Top-Left Telemetry */}
          <div className="absolute top-4 left-4 text-xs text-emerald-400 drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)] space-y-1">
            <div>UAV ID: <span className="text-white font-bold">STRATO-GLIDER-01</span></div>
            <div>ALT: <span className="text-white">{(telemetry.altFt ?? 0).toLocaleString()} FT MSL</span></div>
            <div>IAS: <span className="text-white">{telemetry.groundSpeedKnots} KTS</span></div>
            <div>HDG: <span className="text-white">{telemetry.headingDeg}°</span></div>
            <div>WIND: <span className="text-cyan-300 font-bold">{telemetry.windSpeedMph} MPH @ {telemetry.windDirectionDeg}°</span></div>
          </div>

          {/* Top-Right Gimbal Telemetry */}
          <div className="absolute top-4 right-4 text-xs text-right text-emerald-400 drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)] space-y-1">
            <div>GIMBAL PITCH: <span className="text-white">{telemetry.gimbalPitchDeg}°</span></div>
            <div>GIMBAL AZ: <span className="text-white">042° TRUE</span></div>
            <div>SLANT RANGE: <span className="text-white">{slantRangeFt.toLocaleString()} FT</span></div>
            <div>GSD RESOLUTION: <span className="text-white">{telemetry.resolutionCmPx} CM/PX</span></div>
            <div>BAND: <span className="text-amber-300 font-bold">{spectralMode} SPECTRAL</span></div>
          </div>

          {/* Center Tactical Crosshair */}
          <div className="relative pointer-events-none flex items-center justify-center">
            {/* Crosshair lines */}
            <div className="w-16 h-0.5 bg-emerald-400/80" />
            <div className="absolute w-0.5 h-16 bg-emerald-400/80" />
            <div className="absolute w-8 h-8 border border-emerald-400/70 rounded-full" />
            <div className="absolute -top-6 text-[10px] text-emerald-300 font-bold tracking-widest">
              [ TARGET LOCK ]
            </div>

            {/* Target coordinates box */}
            <div className="absolute top-10 text-[10px] text-center bg-black/60 px-2 py-0.5 rounded border border-emerald-500/40 text-emerald-300 whitespace-nowrap">
              LAT: {targetLat}N • LNG: {targetLng}W
            </div>
          </div>

          {/* Bottom-Left Sector Context */}
          <div className="absolute bottom-4 left-4 text-xs text-neutral-300 drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)]">
            <span className="text-[10px] text-neutral-400 block">SECTOR IN FOCUS:</span>
            <span className="text-amber-400 font-bold">{selectedSectorName}</span>
            <span className="block text-[10px] text-neutral-400 mt-0.5">
              Payne / Oklahoma County Emergency Perimeter
            </span>
          </div>

          {/* Bottom-Right Laser Rangefinder status */}
          <div className="absolute bottom-4 right-4 flex items-center gap-2">
            <button
              onClick={() => setLaserArmed(!laserArmed)}
              className={`px-2.5 py-1 text-xs rounded border transition-colors ${
                laserArmed
                  ? 'bg-red-500/20 border-red-500 text-red-400 font-bold animate-pulse'
                  : 'bg-neutral-800 border-neutral-700 text-neutral-400'
              }`}
            >
              LRF: {laserArmed ? 'LASER ARMED 1550nm' : 'STANDBY'}
            </button>
          </div>
        </div>

        {/* Bottom controls toolbar */}
        <div className="bg-neutral-900 px-4 py-2.5 border-t border-neutral-800 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <span className="text-neutral-400">SENSOR PALETTE:</span>
            {(['RGB', 'FLIR', 'NDVI'] as const).map((mode) => (
              <button
                key={mode}
                onClick={() => setSpectralMode(mode)}
                className={`px-3 py-1 rounded border transition-colors ${
                  spectralMode === mode
                    ? 'bg-amber-500/20 border-amber-400 text-amber-300 font-bold'
                    : 'bg-neutral-800 border-neutral-700 text-neutral-400 hover:text-white'
                }`}
              >
                {mode === 'RGB' ? 'TrueColor RGB' : mode === 'FLIR' ? 'FLIR LWIR Heat' : 'NDVI Fuel Index'}
              </button>
            ))}
          </div>

          <div className="text-neutral-400 text-[11px] flex items-center gap-4">
            <span>FLIGHT PHASE: <strong className="text-white">{telemetry.phase}</strong></span>
            <span>TIME: <strong className="text-cyan-400">T+{telemetry.timeSec}s</strong></span>
          </div>
        </div>
      </div>
    </div>
  );
};
