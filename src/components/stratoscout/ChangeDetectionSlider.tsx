'use client';

import React, { useState } from 'react';
import { Layers, AlertTriangle, Eye, Sliders, CheckCircle2 } from 'lucide-react';

interface ChangeDetectionSliderProps {
  onClose?: () => void;
}

export default function ChangeDetectionSlider({ onClose }: ChangeDetectionSliderProps) {
  const [sliderPos, setSliderPos] = useState(50); // 0 to 100%

  return (
    <div className="glass-panel p-4 max-w-md w-full border border-cyan-500/40 shadow-2xl font-mono text-[11px] text-[var(--text-primary)]">
      {/* Header */}
      <div className="flex items-center justify-between pb-2 mb-3 border-b border-[var(--border-primary)]">
        <div className="flex items-center gap-2">
          <Sliders className="w-4 h-4 text-[var(--cyan-primary)]" />
          <span className="font-bold text-xs tracking-wider text-[var(--cyan-primary)]">
            CHANGE DETECTION ENGINE
          </span>
        </div>
        <span className="px-1.5 py-0.5 rounded bg-cyan-950/80 border border-cyan-500/40 text-cyan-300 text-[8px] font-bold">
          50CM/PX VS 10M SATELLITE
        </span>
      </div>

      <p className="text-[10px] text-gray-300 leading-relaxed mb-3">
        <strong className="text-[var(--gold-primary)]">Benjamin Curry Pain Point:</strong> Conventional satellite imagery updates once every 12–24 months at 10–15m resolution, leaving recent housing developments and rapid cured brush encroachment invisible to dispatchers.
      </p>

      {/* Interactive Visual Comparison Container */}
      <div className="relative w-full h-48 rounded overflow-hidden border border-white/20 select-none bg-neutral-900 mb-3">
        {/* Left Side: Stale Satellite (10m Resolution) */}
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: `radial-gradient(circle at 40% 40%, rgba(50,70,50,0.8), rgba(20,30,20,0.95))`,
            filter: 'blur(3.5px) contrast(85%)',
          }}
        >
          {/* Simulated low-res pixel blocks */}
          <div className="w-full h-full opacity-30 flex flex-wrap">
            {Array.from({ length: 48 }).map((_, i) => (
              <div key={i} className="w-1/8 h-1/6 border border-black/40 bg-emerald-950/20" />
            ))}
          </div>
        </div>

        {/* Right Side: StratoScout 50cm/px Multi-Spectral (clipped by slider) */}
        <div
          className="absolute inset-0 overflow-hidden"
          style={{
            clipPath: `polygon(${sliderPos}% 0, 100% 0, 100% 100%, ${sliderPos}% 100%)`,
          }}
        >
          <div
            className="w-full h-full bg-cover bg-center relative"
            style={{
              backgroundImage: `radial-gradient(circle at 40% 40%, rgba(120,60,20,0.9), rgba(15,15,20,0.95))`,
            }}
          >
            {/* Crisp 50cm detail overlay */}
            <div className="absolute inset-0 p-3 flex flex-col justify-between">
              <div className="flex justify-end">
                <span className="px-2 py-0.5 rounded bg-emerald-900/90 border border-emerald-400 text-emerald-200 text-[8px] font-bold shadow-lg">
                  ✓ STRATOSCOUT 50CM/PX RECENT PASS
                </span>
              </div>

              {/* Detected new housing + encroaching fuel indicators */}
              <div className="space-y-1.5 ml-auto max-w-[210px] bg-black/80 p-2 rounded border border-red-500/50">
                <div className="flex items-center gap-1.5 text-red-400 font-bold text-[9px]">
                  <AlertTriangle className="w-3 h-3 text-red-400 shrink-0" />
                  <span>32 NEW STRUCTURES DETECTED</span>
                </div>
                <div className="text-[8px] text-gray-300">
                  Built Q4 2024–Q1 2025. Omitted from standard county base maps.
                </div>
                <div className="text-[8px] text-amber-300 font-semibold">
                  +46.2% Fuel Buildup touching perimeter fence.
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Stale Satellite label (bottom left) */}
        <div className="absolute bottom-2 left-2 z-10 pointer-events-none">
          <span className="px-2 py-0.5 rounded bg-black/80 border border-gray-600 text-gray-400 text-[8px] font-bold">
            10M SATELLITE (14 MO. OLD)
          </span>
        </div>

        {/* Divider line and handle */}
        <div
          className="absolute top-0 bottom-0 w-0.5 bg-cyan-400 z-20 pointer-events-none shadow-[0_0_8px_cyan]"
          style={{ left: `${sliderPos}%` }}
        >
          <div className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-6 h-6 rounded-full bg-cyan-500 border-2 border-white flex items-center justify-center text-black font-extrabold text-[9px] shadow-lg">
            ↔
          </div>
        </div>
      </div>

      {/* Slider input */}
      <div className="mb-3">
        <div className="flex justify-between text-[9px] text-[var(--text-muted)] mb-1">
          <span>Stale 10m Base Map</span>
          <span className="text-[var(--cyan-primary)] font-bold">DRAG SLIDER TO REVEAL 50CM DETAIL</span>
          <span>StratoScout 50cm/px</span>
        </div>
        <input
          type="range"
          min="0"
          max="100"
          value={sliderPos}
          onChange={(e) => setSliderPos(Number(e.target.value))}
          className="w-full accent-[var(--cyan-primary)] cursor-pointer"
        />
      </div>

      {/* Footer stats summary */}
      <div className="p-2 rounded bg-black/40 border border-white/5 flex items-center justify-between text-[9px]">
        <div className="flex items-center gap-1.5 text-[var(--alert-green)]">
          <CheckCircle2 className="w-3.5 h-3.5" />
          <span>Continuous Fresh Change Detection</span>
        </div>
        <span className="text-[var(--text-muted)]">52 Scans / Yr Per County</span>
      </div>
    </div>
  );
}
