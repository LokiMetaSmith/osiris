'use client';

import React from 'react';
import { SpectralPalette } from '@/lib/stratoscout/data';
import { Eye, Flame, Trees, Sparkles } from 'lucide-react';

interface SpectralPaletteSelectorProps {
  currentPalette: SpectralPalette;
  onChangePalette: (palette: SpectralPalette) => void;
}

export default function SpectralPaletteSelector({
  currentPalette,
  onChangePalette,
}: SpectralPaletteSelectorProps) {
  const palettes = [
    {
      id: 'RGB_50CM' as SpectralPalette,
      name: '50cm/px TrueColor RGB',
      desc: 'Visible spectrum sub-meter detail of structures, roads, and firebreaks.',
      icon: Eye,
      color: 'text-cyan-400',
      legend: 'Natural true-color 50cm resolution',
    },
    {
      id: 'NDVI_FUEL' as SpectralPalette,
      name: 'NDVI Fuel Moisture Complex',
      desc: 'Multispectral near-infrared false-color highlighting dry cured brush.',
      icon: Trees,
      color: 'text-emerald-400',
      legend: 'Red: High Fuel Load • Yellow: Moderately Dry • Green: Hydrated',
    },
    {
      id: 'FLIR_IRONBOW' as SpectralPalette,
      name: 'FLIR Thermal Ironbow',
      desc: 'Radiometric surface heat identifying smoldering brush and hotspots.',
      icon: Flame,
      color: 'text-[#FF3D3D]',
      legend: 'White: 110°F+ Smolder • Orange/Purple: 85-95°F • Dark: Ambient',
    },
  ];

  return (
    <div className="glass-panel p-3 border border-white/20 shadow-xl font-mono text-[10px] text-[var(--text-primary)] max-w-sm w-full">
      <div className="flex items-center justify-between pb-1.5 mb-2 border-b border-white/10">
        <span className="font-bold text-xs text-[var(--gold-primary)] flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5 text-[var(--gold-primary)]" />
          <span>MULTI-SPECTRAL PALETTE SHADER</span>
        </span>
        <span className="text-[8px] px-1.5 py-0.5 rounded bg-black/60 text-gray-400">
          UAV PAYLOAD
        </span>
      </div>

      <div className="space-y-1.5 mb-2.5">
        {palettes.map(p => {
          const isSelected = currentPalette === p.id;
          const Icon = p.icon;
          return (
            <button
              key={p.id}
              onClick={() => onChangePalette(p.id)}
              className={`w-full p-2 rounded text-left transition-all border ${
                isSelected
                  ? 'bg-white/10 border-cyan-400 shadow-md text-white'
                  : 'bg-black/30 border-white/5 text-gray-400 hover:border-white/20'
              }`}
            >
              <div className="flex items-center justify-between mb-0.5">
                <span className={`font-bold flex items-center gap-1.5 ${isSelected ? p.color : ''}`}>
                  <Icon className="w-3.5 h-3.5" />
                  <span>{p.name}</span>
                </span>
                {isSelected && (
                  <span className="text-[7px] font-extrabold px-1 rounded bg-cyan-500 text-black">
                    ACTIVE
                  </span>
                )}
              </div>
              <p className="text-[8px] text-gray-400 leading-tight">{p.desc}</p>
            </button>
          );
        })}
      </div>

      {/* Visual Legend Bar */}
      <div className="p-2 rounded bg-black/60 border border-white/5 text-[8px] text-gray-300">
        <div className="text-[7px] text-[var(--text-muted)] uppercase mb-1">Shader Legend:</div>
        <div className="font-medium text-cyan-200">
          {palettes.find(p => p.id === currentPalette)?.legend}
        </div>
      </div>
    </div>
  );
}
