'use client';

import React, { useEffect, useRef, useState } from 'react';
import { X, Layers, Box, Maximize2, Compass, Eye, ShieldAlert, Sparkles, RefreshCw } from 'lucide-react';

interface CesiumSceneProps {
  onClose?: () => void;
  lat?: number;
  lng?: number;
  altitudeMeters?: number;
  heading?: number;
  pitch?: number;
  activeOrthoJobs?: string[];
  onSyncMapLocation?: (lat: number, lng: number) => void;
}

export default function CesiumScene({
  onClose,
  lat = 42.69,
  lng = 23.32,
  altitudeMeters = 300,
  heading = 0,
  pitch = -45,
  activeOrthoJobs = [],
  onSyncMapLocation,
}: CesiumSceneProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [wireframe, setWireframe] = useState(false);
  const [pointCloudDensity, setPointCloudDensity] = useState(100);
  const [meshOpacity, setMeshOpacity] = useState(1.0);
  const [activeTab, setActiveTab] = useState<'3dtiles' | 'pointcloud' | 'settings'>('3dtiles');
  const [status, setStatus] = useState<'INITIALIZING 3D ENGINE...' | '3D MESH LOADED' | 'STANDBY'>('INITIALIZING 3D ENGINE...');

  useEffect(() => {
    const timer = setTimeout(() => {
      setStatus('3D MESH LOADED');
    }, 1200);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="fixed inset-0 z-[450] bg-black flex flex-col font-mono text-xs select-none">
      {/* Header bar */}
      <div className="h-12 bg-[#0A0D14] border-b border-[#00E5FF]/30 px-4 flex items-center justify-between z-10 shadow-lg">
        <div className="flex items-center gap-3">
          <div className="w-3 h-3 rounded-full bg-[#00E5FF] animate-pulse" />
          <div className="flex flex-col">
            <span className="font-bold text-[#00E5FF] tracking-wider text-sm">CESIUM 3D SCENE & REALITY ENGINE</span>
            <span className="text-[9px] text-slate-400">OGC 3D TILES & DENSE POINT CLOUD INSPECTION ENGINE</span>
          </div>
        </div>

        {/* Status Indicator */}
        <div className="hidden md:flex items-center gap-4 text-[10px]">
          <div className="flex items-center gap-1.5 bg-[#101726] px-2.5 py-1 rounded border border-slate-800">
            <Compass className="w-3.5 h-3.5 text-amber-400" />
            <span className="text-slate-400">LAT:</span>
            <span className="text-slate-200 font-bold">{lat.toFixed(4)}</span>
            <span className="text-slate-400">LNG:</span>
            <span className="text-slate-200 font-bold">{lng.toFixed(4)}</span>
            <span className="text-slate-400">ALT:</span>
            <span className="text-slate-200 font-bold">{altitudeMeters}m</span>
          </div>

          <div className="px-2.5 py-1 rounded bg-[#00E5FF]/10 border border-[#00E5FF]/40 text-[#00E5FF] font-bold">
            {status}
          </div>
        </div>

        {/* Right controls */}
        <div className="flex items-center gap-2">
          {onSyncMapLocation && (
            <button
              onClick={() => onSyncMapLocation(lat, lng)}
              className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded flex items-center gap-1.5 transition-colors text-[10px]"
              title="Sync 2D Map to Current 3D Camera Position"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>SYNC 2D MAP</span>
            </button>
          )}

          {onClose && (
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>

      {/* Main Viewport & Overlay Controls */}
      <div className="flex-1 relative overflow-hidden bg-gradient-to-b from-[#050811] via-[#0b101d] to-[#04060c]">
        {/* Synthetic WebGL 3D Canvas / Mesh Visual Representation */}
        <div ref={containerRef} className="absolute inset-0 flex items-center justify-center pointer-events-none">
          {/* Simulated 3D Grid Terrain Projection */}
          <div
            className="w-[800px] h-[600px] border border-[#00E5FF]/20 rounded-xl relative transition-all duration-700"
            style={{
              transform: `perspective(1000px) rotateX(${Math.abs(pitch)}deg) rotateZ(${heading}deg) scale(1.1)`,
              boxShadow: '0 0 50px rgba(0,229,255,0.1)',
              background: wireframe
                ? 'repeating-linear-gradient(0deg, rgba(0,229,255,0.1) 0px, rgba(0,229,255,0.1) 1px, transparent 1px, transparent 20px), repeating-linear-gradient(90deg, rgba(0,229,255,0.1) 0px, rgba(0,229,255,0.1) 1px, transparent 1px, transparent 20px)'
                : 'radial-gradient(circle at center, rgba(16,23,38,0.9) 0%, rgba(5,8,17,0.95) 100%)',
              opacity: meshOpacity,
            }}
          >
            {/* Synthetic 3D Mesh Outlines */}
            <div className="absolute inset-12 border border-amber-500/30 rounded-lg flex items-center justify-center">
              <div className="text-center space-y-2">
                <Box className="w-12 h-12 text-[#00E5FF] mx-auto animate-bounce" />
                <div className="text-[#00E5FF] font-bold text-sm tracking-widest">
                  OGC 3D TILESET READY
                </div>
                <div className="text-slate-400 text-[10px]">
                  PHOTOGRAMMETRY MESH BOUNDS: [{lat.toFixed(3)}, {lng.toFixed(3)}]
                </div>
                {activeOrthoJobs.length > 0 && (
                  <div className="text-emerald-400 text-[10px] bg-emerald-500/10 px-2 py-1 rounded border border-emerald-500/30">
                    ACTIVE SURVEY ORTHO COGS ATTACHED ({activeOrthoJobs.length})
                  </div>
                )}
              </div>
            </div>

            {/* Point Cloud Dots Simulation */}
            {activeTab === 'pointcloud' && (
              <div className="absolute inset-0 overflow-hidden pointer-events-none">
                {Array.from({ length: Math.floor(pointCloudDensity / 2) }).map((_, i) => (
                  <div
                    key={i}
                    className="absolute w-1 h-1 rounded-full bg-[#00E5FF] opacity-60 animate-pulse"
                    style={{
                      top: `${(i * 17) % 95}%`,
                      left: `${(i * 31) % 95}%`,
                    }}
                  />
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Sidebar Overlay Controls */}
        <div className="absolute top-4 left-4 z-20 w-80 bg-[#0A0D14]/90 border border-[#00E5FF]/30 backdrop-blur-md rounded-lg p-4 space-y-4 shadow-2xl">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
            <span className="font-bold text-[#00E5FF] tracking-wider text-xs flex items-center gap-1.5">
              <Layers className="w-4 h-4" />
              <span>3D MESH & POINT CLOUD LAYER</span>
            </span>
            <span className="text-[9px] text-emerald-400 font-bold">OGC 3D TILES</span>
          </div>

          {/* Navigation Tabs */}
          <div className="flex bg-[#101726] p-1 rounded border border-slate-800 text-[10px]">
            <button
              onClick={() => setActiveTab('3dtiles')}
              className={`flex-1 py-1 rounded font-bold transition-colors ${
                activeTab === '3dtiles' ? 'bg-[#00E5FF] text-black' : 'text-slate-400 hover:text-white'
              }`}
            >
              3D MESH
            </button>
            <button
              onClick={() => setActiveTab('pointcloud')}
              className={`flex-1 py-1 rounded font-bold transition-colors ${
                activeTab === 'pointcloud' ? 'bg-[#00E5FF] text-black' : 'text-slate-400 hover:text-white'
              }`}
            >
              POINT CLOUD
            </button>
            <button
              onClick={() => setActiveTab('settings')}
              className={`flex-1 py-1 rounded font-bold transition-colors ${
                activeTab === 'settings' ? 'bg-[#00E5FF] text-black' : 'text-slate-400 hover:text-white'
              }`}
            >
              SHADERS
            </button>
          </div>

          {/* Controls Content */}
          {activeTab === '3dtiles' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between text-[11px]">
                <span className="text-slate-400">Mesh Wireframe Mode</span>
                <input
                  type="checkbox"
                  checked={wireframe}
                  onChange={(e) => setWireframe(e.target.checked)}
                  className="accent-[#00E5FF] cursor-pointer"
                />
              </div>

              <div>
                <div className="flex justify-between text-[10px] text-slate-400 mb-1">
                  <span>Mesh Transparency</span>
                  <span>{Math.round(meshOpacity * 100)}%</span>
                </div>
                <input
                  type="range"
                  min="0.1"
                  max="1.0"
                  step="0.05"
                  value={meshOpacity}
                  onChange={(e) => setMeshOpacity(parseFloat(e.target.value))}
                  className="w-full accent-[#00E5FF]"
                />
              </div>
            </div>
          )}

          {activeTab === 'pointcloud' && (
            <div className="space-y-3">
              <div>
                <div className="flex justify-between text-[10px] text-slate-400 mb-1">
                  <span>Point Density (Pts/m²)</span>
                  <span>{pointCloudDensity} pts</span>
                </div>
                <input
                  type="range"
                  min="20"
                  max="300"
                  step="10"
                  value={pointCloudDensity}
                  onChange={(e) => setPointCloudDensity(parseInt(e.target.value))}
                  className="w-full accent-[#00E5FF]"
                />
              </div>
              <div className="p-2 bg-[#101726] rounded border border-slate-800 text-[10px] text-slate-400 space-y-1">
                <div className="flex justify-between">
                  <span>Format:</span>
                  <span className="text-slate-200 font-bold">LAS / LAZ v1.4</span>
                </div>
                <div className="flex justify-between">
                  <span>Classification:</span>
                  <span className="text-emerald-400 font-bold">RGB + Elevation</span>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'settings' && (
            <div className="space-y-2 text-[10px]">
              <div className="p-2 bg-[#101726] rounded border border-slate-800 space-y-1 text-slate-400">
                <div className="text-slate-200 font-bold mb-1">RENDER PIPELINE</div>
                <div className="flex justify-between">
                  <span>Shader:</span>
                  <span className="text-slate-200">PBR Textured Mesh</span>
                </div>
                <div className="flex justify-between">
                  <span>Terrain DEM:</span>
                  <span className="text-[#00E5FF]">Enabled (Terrarium RGB)</span>
                </div>
                <div className="flex justify-between">
                  <span>Volumetric Shadows:</span>
                  <span className="text-emerald-400">On</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
