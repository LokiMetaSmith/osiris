'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
  FlightTelemetryPoint,
  getInterpolatedTelemetry,
} from '@/lib/stratoscout/telemetry-playback';
import {
  Play,
  Pause,
  RotateCcw,
  Gauge,
  Compass,
  Wind,
  Battery,
  Camera,
  Layers,
} from 'lucide-react';

interface FlightPlaybackScrubberProps {
  onTelemetryUpdate: (telemetry: FlightTelemetryPoint) => void;
}

export default function FlightPlaybackScrubber({
  onTelemetryUpdate,
}: FlightPlaybackScrubberProps) {
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [speedMultiplier, setSpeedMultiplier] = useState<number>(1);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const currentTelemetry = getInterpolatedTelemetry(currentTime);

  useEffect(() => {
    onTelemetryUpdate(currentTelemetry);
  }, [currentTime]);

  useEffect(() => {
    if (isPlaying) {
      timerRef.current = setInterval(() => {
        setCurrentTime(t => {
          if (t >= 120) {
            setIsPlaying(false);
            return 120;
          }
          return Math.min(120, t + 0.5 * speedMultiplier);
        });
      }, 500);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isPlaying, speedMultiplier]);

  const handleReset = () => {
    setIsPlaying(false);
    setCurrentTime(0);
  };

  return (
    <div className="glass-panel p-3 border border-cyan-500/40 shadow-2xl font-mono text-[11px] text-[var(--text-primary)] w-full max-w-xl">
      {/* Flight Telemetry Header */}
      <div className="flex items-center justify-between pb-2 mb-2 border-b border-white/10">
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-pulse" />
          <span className="font-bold text-xs text-cyan-300">
            SITL / ARDUPILOT FLIGHT TELEMETRY PLAYBACK
          </span>
        </div>
        <span className="text-[9px] px-2 py-0.5 rounded bg-cyan-950 border border-cyan-500/50 text-cyan-300 font-bold">
          {currentTelemetry.phase} • T+{Math.round(currentTime)}s / 120s
        </span>
      </div>

      {/* Telemetry HUD Gauges */}
      <div className="grid grid-cols-5 gap-1.5 mb-2.5 text-center">
        <div className="p-1.5 rounded bg-black/50 border border-white/5">
          <div className="text-[8px] text-[var(--text-muted)] flex items-center justify-center gap-1">
            <Gauge className="w-2.5 h-2.5 text-cyan-400" />
            <span>ALTITUDE</span>
          </div>
          <div className="text-xs font-bold text-white tabular-nums mt-0.5">
            {currentTelemetry.altFt.toLocaleString()} <span className="text-[7px]">ft</span>
          </div>
        </div>

        <div className="p-1.5 rounded bg-black/50 border border-white/5">
          <div className="text-[8px] text-[var(--text-muted)] flex items-center justify-center gap-1">
            <Compass className="w-2.5 h-2.5 text-[var(--gold-primary)]" />
            <span>AIRSPEED</span>
          </div>
          <div className="text-xs font-bold text-[var(--gold-primary)] tabular-nums mt-0.5">
            {currentTelemetry.groundSpeedKnots} <span className="text-[7px]">kts</span>
          </div>
        </div>

        <div className="p-1.5 rounded bg-black/50 border border-white/5">
          <div className="text-[8px] text-[var(--text-muted)] flex items-center justify-center gap-1">
            <Wind className="w-2.5 h-2.5 text-red-400" />
            <span>WIND VECTOR</span>
          </div>
          <div className="text-xs font-bold text-red-300 tabular-nums mt-0.5">
            {currentTelemetry.windSpeedMph} <span className="text-[7px]">mph</span>
          </div>
        </div>

        <div className="p-1.5 rounded bg-black/50 border border-white/5">
          <div className="text-[8px] text-[var(--text-muted)] flex items-center justify-center gap-1">
            <Camera className="w-2.5 h-2.5 text-emerald-400" />
            <span>GIMBAL</span>
          </div>
          <div className="text-xs font-bold text-emerald-300 tabular-nums mt-0.5">
            {currentTelemetry.gimbalPitchDeg}°
          </div>
        </div>

        <div className="p-1.5 rounded bg-black/50 border border-white/5">
          <div className="text-[8px] text-[var(--text-muted)] flex items-center justify-center gap-1">
            <Battery className="w-2.5 h-2.5 text-amber-400" />
            <span>BATTERY</span>
          </div>
          <div className="text-xs font-bold text-amber-300 tabular-nums mt-0.5">
            {currentTelemetry.batteryPct}%
          </div>
        </div>
      </div>

      {/* Flight status quote / log */}
      <div className="text-[9px] text-gray-300 p-2 rounded bg-black/60 border border-white/5 mb-2.5 flex items-start gap-2">
        <span className="text-cyan-400 font-bold shrink-0">LOG:</span>
        <span className="leading-snug">{currentTelemetry.statusText}</span>
      </div>

      {/* Scrubber slider and controls */}
      <div className="space-y-1.5">
        <input
          type="range"
          min="0"
          max="120"
          step="0.5"
          value={currentTime}
          onChange={(e) => setCurrentTime(parseFloat(e.target.value))}
          className="w-full accent-cyan-400 cursor-pointer h-1.5 bg-gray-800 rounded"
        />

        <div className="flex items-center justify-between pt-1">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsPlaying(!isPlaying)}
              className="px-3 py-1 rounded bg-cyan-500 hover:bg-cyan-400 text-black font-extrabold text-[10px] flex items-center gap-1 transition-all"
            >
              {isPlaying ? <Pause className="w-3 h-3 fill-black" /> : <Play className="w-3 h-3 fill-black" />}
              <span>{isPlaying ? 'PAUSE' : 'PLAY'}</span>
            </button>

            <button
              onClick={handleReset}
              className="p-1.5 rounded bg-white/10 hover:bg-white/20 text-gray-300 transition-all"
              title="Reset flight timeline"
            >
              <RotateCcw className="w-3 h-3" />
            </button>
          </div>

          {/* Speed Multipliers */}
          <div className="flex items-center gap-1 text-[9px]">
            <span className="text-[var(--text-muted)] mr-1">SPEED:</span>
            {[1, 2, 5].map(spd => (
              <button
                key={spd}
                onClick={() => setSpeedMultiplier(spd)}
                className={`px-2 py-0.5 rounded transition-all border ${
                  speedMultiplier === spd
                    ? 'bg-cyan-500/30 border-cyan-400 text-cyan-200 font-bold'
                    : 'bg-black/40 border-white/10 text-gray-400 hover:border-white/30'
                }`}
              >
                {spd}x
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
