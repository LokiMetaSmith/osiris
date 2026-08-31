'use client';

import React, { useState } from 'react';
import { X, Eye, ShieldAlert, CheckCircle, AlertTriangle, Crosshair } from 'lucide-react';
import { calculateLineOfSight, ViewshedResult } from '@/lib/analytics/viewshed';

interface ViewshedPanelProps {
  onClose: () => void;
  onFlyTo?: (coords: { lat: number; lng: number; zoom?: number; ts: number }) => void;
}

export default function ViewshedPanel({ onClose, onFlyTo }: ViewshedPanelProps) {
  // Observer: e.g. Sofia / Vitosha peak drone position
  const [obsLat, setObsLat] = useState('42.56');
  const [obsLng, setObsLng] = useState('23.28');
  const [obsAlt, setObsAlt] = useState('150');

  // Target: e.g. Sofia downtown landmark
  const [targetLat, setTargetLat] = useState('42.69');
  const [targetLng, setTargetLng] = useState('23.32');
  const [targetAlt, setTargetAlt] = useState('10');

  const [result, setResult] = useState<ViewshedResult | null>(null);

  const handleCalculate = (e: React.FormEvent) => {
    e.preventDefault();
    const obs = {
      lat: parseFloat(obsLat),
      lng: parseFloat(obsLng),
      altMeters: parseFloat(obsAlt),
    };
    const tgt = {
      lat: parseFloat(targetLat),
      lng: parseFloat(targetLng),
      altMeters: parseFloat(targetAlt),
    };

    const res = calculateLineOfSight(obs, tgt);
    setResult(res);

    if (onFlyTo) {
      onFlyTo({
        lat: (obs.lat + tgt.lat) / 2,
        lng: (obs.lng + tgt.lng) / 2,
        zoom: 11,
        ts: Date.now(),
      });
    }
  };

  return (
    <div className="absolute top-16 right-4 z-40 w-96 bg-[#0A0D14]/95 border border-[#00E5FF]/30 backdrop-blur-md rounded-lg shadow-2xl text-slate-200 font-mono text-xs overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 bg-[#101726]/80 border-b border-[#00E5FF]/20">
        <div className="flex items-center gap-2 text-[#00E5FF] font-bold tracking-wider">
          <Eye className="w-4 h-4 animate-pulse" />
          <span>3D LINE-OF-SIGHT & VIEWSHED</span>
        </div>
        <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors p-1">
          <X className="w-4 h-4" />
        </button>
      </div>

      <div className="p-4 space-y-4 max-h-[500px] overflow-y-auto">
        <form onSubmit={handleCalculate} className="space-y-3">
          {/* Observer Section */}
          <div className="bg-[#101726] p-2.5 rounded border border-slate-800 space-y-2">
            <div className="flex items-center gap-1.5 text-amber-400 font-bold text-[10px]">
              <Crosshair className="w-3.5 h-3.5" />
              <span>SENSOR / OBSERVER POSITION</span>
            </div>
            <div className="grid grid-cols-3 gap-2">
              <div>
                <label className="block text-slate-500 text-[9px]">LATITUDE</label>
                <input
                  type="text"
                  value={obsLat}
                  onChange={(e) => setObsLat(e.target.value)}
                  className="w-full bg-[#0B0F19] border border-slate-700 rounded px-1.5 py-1 text-slate-200"
                />
              </div>
              <div>
                <label className="block text-slate-500 text-[9px]">LONGITUDE</label>
                <input
                  type="text"
                  value={obsLng}
                  onChange={(e) => setObsLng(e.target.value)}
                  className="w-full bg-[#0B0F19] border border-slate-700 rounded px-1.5 py-1 text-slate-200"
                />
              </div>
              <div>
                <label className="block text-slate-500 text-[9px]">ALT (AGL M)</label>
                <input
                  type="number"
                  value={obsAlt}
                  onChange={(e) => setObsAlt(e.target.value)}
                  className="w-full bg-[#0B0F19] border border-slate-700 rounded px-1.5 py-1 text-slate-200"
                />
              </div>
            </div>
          </div>

          {/* Target Section */}
          <div className="bg-[#101726] p-2.5 rounded border border-slate-800 space-y-2">
            <div className="flex items-center gap-1.5 text-rose-400 font-bold text-[10px]">
              <Crosshair className="w-3.5 h-3.5" />
              <span>GROUND TARGET POSITION</span>
            </div>
            <div className="grid grid-cols-3 gap-2">
              <div>
                <label className="block text-slate-500 text-[9px]">LATITUDE</label>
                <input
                  type="text"
                  value={targetLat}
                  onChange={(e) => setTargetLat(e.target.value)}
                  className="w-full bg-[#0B0F19] border border-slate-700 rounded px-1.5 py-1 text-slate-200"
                />
              </div>
              <div>
                <label className="block text-slate-500 text-[9px]">LONGITUDE</label>
                <input
                  type="text"
                  value={targetLng}
                  onChange={(e) => setTargetLng(e.target.value)}
                  className="w-full bg-[#0B0F19] border border-slate-700 rounded px-1.5 py-1 text-slate-200"
                />
              </div>
              <div>
                <label className="block text-slate-500 text-[9px]">ALT (AGL M)</label>
                <input
                  type="number"
                  value={targetAlt}
                  onChange={(e) => setTargetAlt(e.target.value)}
                  className="w-full bg-[#0B0F19] border border-slate-700 rounded px-1.5 py-1 text-slate-200"
                />
              </div>
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-2 bg-[#00E5FF] hover:bg-[#00B0FF] text-black font-bold rounded flex items-center justify-center gap-2 transition-colors"
          >
            <Eye className="w-3.5 h-3.5" />
            <span>RUN LINE-OF-SIGHT RAYCAST</span>
          </button>
        </form>

        {/* Results */}
        {result && (
          <div className="space-y-3 pt-2 border-t border-slate-800">
            <div
              className={`p-2.5 rounded border flex items-center justify-between ${
                result.isLineOfSightClear
                  ? 'bg-emerald-500/10 border-emerald-500/40 text-emerald-400'
                  : 'bg-rose-500/10 border-rose-500/40 text-rose-400'
              }`}
            >
              <div className="flex items-center gap-2 font-bold">
                {result.isLineOfSightClear ? (
                  <CheckCircle className="w-4 h-4" />
                ) : (
                  <AlertTriangle className="w-4 h-4" />
                )}
                <span>{result.isLineOfSightClear ? 'LINE OF SIGHT CLEAR' : 'SIGHTLINE OBSTRUCTED'}</span>
              </div>
              <span className="text-[10px] font-mono">{result.totalDistanceKm} KM</span>
            </div>

            <div className="grid grid-cols-2 gap-2 text-[10px]">
              <div className="bg-[#101726] p-2 rounded border border-slate-800">
                <div className="text-slate-500">MAX CLEARANCE</div>
                <div className="text-slate-200 font-bold">{result.maxObstacleClearanceMeters} M</div>
              </div>
              <div className="bg-[#101726] p-2 rounded border border-slate-800">
                <div className="text-slate-500">FIRST OBSTACLE</div>
                <div className="text-slate-200 font-bold">
                  {result.firstObstacleKm !== null ? `${result.firstObstacleKm} KM` : 'NONE'}
                </div>
              </div>
            </div>

            {/* Profile Elevation Mini Sparkline */}
            <div className="bg-[#101726] p-2.5 rounded border border-slate-800 space-y-1.5">
              <div className="text-[10px] text-slate-400 font-bold flex justify-between">
                <span>TERRAIN ELEVATION PROFILE</span>
                <span>OBS &rarr; TGT</span>
              </div>

              <div className="h-20 w-full bg-[#0B0F19] rounded relative overflow-hidden flex items-end px-1 py-1">
                {(() => {
                  const maxElev = Math.max(
                    ...result.profile.map((p) => Math.max(p.elevationMeters, p.sightlineMeters))
                  );
                  const minElev = Math.min(...result.profile.map((p) => p.elevationMeters));
                  const range = maxElev - minElev || 1;

                  return result.profile.map((p, idx) => {
                    const groundH = ((p.elevationMeters - minElev) / range) * 100;
                    const sightH = ((p.sightlineMeters - minElev) / range) * 100;

                    return (
                      <div key={idx} className="flex-1 h-full relative flex items-end group">
                        {/* Ground Bar */}
                        <div
                          className={`w-full transition-all ${
                            p.isObstructed ? 'bg-rose-500/80' : 'bg-slate-600'
                          }`}
                          style={{ height: `${Math.max(5, groundH)}%` }}
                        />
                        {/* Sightline Dot */}
                        <div
                          className={`absolute w-1 h-1 rounded-full -translate-x-1/2 ${
                            p.isObstructed ? 'bg-rose-400' : 'bg-[#00E5FF]'
                          }`}
                          style={{ bottom: `${sightH}%`, left: '50%' }}
                        />
                      </div>
                    );
                  });
                })()}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
