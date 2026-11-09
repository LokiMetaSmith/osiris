'use client';

import React, { useState, useMemo, useEffect, useRef } from 'react';
import dynamic from 'next/dynamic';
import {
  STRATOSCOUT_SECTORS,
  STRATOSCOUT_METRICS,
  GLIDE_CORRIDOR_WAYPOINTS,
  MOCK_FIREBREAKS_GEOJSON,
  MOCK_WUI_CLUSTERS_GEOJSON,
  SectorTriageItem,
} from '@/lib/stratoscout/data';
import ExecutiveHud from '@/components/stratoscout/ExecutiveHud';
import PriorityTriageQueue from '@/components/stratoscout/PriorityTriageQueue';
import ChangeDetectionSlider from '@/components/stratoscout/ChangeDetectionSlider';
import CountyReportModal from '@/components/stratoscout/CountyReportModal';
import PitchWalkthroughController from '@/components/stratoscout/PitchWalkthroughController';
import FlightPlaybackScrubber from '@/components/stratoscout/FlightPlaybackScrubber';
import WebhookDispatchModal from '@/components/stratoscout/WebhookDispatchModal';
import SpectralPaletteSelector from '@/components/stratoscout/SpectralPaletteSelector';
import OfflineFieldPack from '@/components/stratoscout/OfflineFieldPack';
import { FireSpreadHud } from '@/components/stratoscout/FireSpreadHud';
import { GimbalFmvOverlay } from '@/components/stratoscout/GimbalFmvOverlay';
import { CountyFleetManagerModal } from '@/components/stratoscout/CountyFleetManagerModal';
import { generateFireSpreadProjection } from '@/lib/stratoscout/dispersion-model';
import { SpectralPalette } from '@/lib/stratoscout/data';
import { FlightTelemetryPoint, TELEMETRY_PROFILE } from '@/lib/stratoscout/telemetry-playback';
import {
  Layers,
  Flame,
  Wind,
  Droplets,
  Building,
  ShieldAlert,
  Sliders,
  FileText,
  MapPin,
  ArrowLeft,
  Play,
  RotateCcw,
  Sparkles,
  Video,
  BarChart3,
  Radio,
} from 'lucide-react';
import Link from 'next/link';

// Dynamically import map component
const OsintMap = dynamic(() => import('@/components/OsintMap'), { ssr: false });

export default function StratoScoutCommandPage() {
  const [selectedCounty, setSelectedCounty] = useState<'All Counties' | 'Payne County' | 'Oklahoma County'>('All Counties');
  const [selectedSector, setSelectedSector] = useState<SectorTriageItem | null>(null);
  const [showCorridor, setShowCorridor] = useState<boolean>(true);
  const [showFirebreaks, setShowFirebreaks] = useState<boolean>(true);
  const [showFuelLoad, setShowFuelLoad] = useState<boolean>(true);
  const [showWuiBorders, setShowWuiBorders] = useState<boolean>(true);
  const [showWindVectors, setShowWindVectors] = useState<boolean>(true);
  const [showThermalHotspots, setShowThermalHotspots] = useState<boolean>(true);
  const [showFireSpread, setShowFireSpread] = useState<boolean>(true);

  const [activeReportCounty, setActiveReportCounty] = useState<'Payne County' | 'Oklahoma County' | null>(null);
  const [showChangeDetection, setShowChangeDetection] = useState<boolean>(false);
  const [pitchStep, setPitchStep] = useState<number>(0);

  // Advanced Extensions States
  const [activeTelemetry, setActiveTelemetry] = useState<FlightTelemetryPoint>(TELEMETRY_PROFILE[0]);
  const [showFlightPlayback, setShowFlightPlayback] = useState<boolean>(false);
  const [spectralPalette, setSpectralPalette] = useState<SpectralPalette>('RGB_50CM');
  const [showPaletteSelector, setShowPaletteSelector] = useState<boolean>(false);
  const [webhookSector, setWebhookSector] = useState<SectorTriageItem | null>(null);
  const [isOfflineMode, setIsOfflineMode] = useState<boolean>(false);
  const [showOfflinePack, setShowOfflinePack] = useState<boolean>(false);
  const [showFmvGimbal, setShowFmvGimbal] = useState<boolean>(false);
  const [showFleetManager, setShowFleetManager] = useState<boolean>(false);
  const [fireSpreadHour, setFireSpreadHour] = useState<number>(2);

  // Rothermel rate of spread & smoke dispersion model
  const spreadProjection = useMemo(() => {
    const originLat = selectedSector ? selectedSector.lat : 36.14;
    const originLng = selectedSector ? selectedSector.lng : -97.10;
    const fuelMoisture = selectedSector ? selectedSector.fuelMoisturePct : 6.2;
    return generateFireSpreadProjection(originLat, originLng, 42, 40, fuelMoisture);
  }, [selectedSector]);

  // Map state centered over Oklahoma / Payne & Oklahoma counties
  const [flyToLocation, setFlyToLocation] = useState<{ lat: number; lng: number; zoom?: number; ts: number } | null>({
    lat: 35.85,
    lng: -97.25,
    zoom: 9.2,
    ts: Date.now(),
  });

  // Filtered sectors based on selected county
  const visibleSectors = useMemo(() => {
    if (selectedCounty === 'All Counties') return STRATOSCOUT_SECTORS;
    return STRATOSCOUT_SECTORS.filter(s => s.county === selectedCounty);
  }, [selectedCounty]);

  const totalAtRiskStructures = useMemo(() => {
    return visibleSectors.reduce((sum, s) => sum + s.structuresAtRisk, 0);
  }, [visibleSectors]);

  // Handle Sector Click / Locate
  const handleSelectSector = (sec: SectorTriageItem) => {
    setSelectedSector(sec);
    setFlyToLocation({
      lat: sec.lat,
      lng: sec.lng,
      zoom: 13,
      ts: Date.now(),
    });
  };

  // Walkthrough pitch steps logic
  const handlePitchStepChange = (step: number) => {
    setPitchStep(step);
    if (step === 1) {
      // Step 1: Red Flag Wind Warning over Payne County
      setSelectedCounty('Payne County');
      setShowCorridor(true);
      setShowWindVectors(true);
      setShowFireSpread(true);
      setFlyToLocation({ lat: 36.14, lng: -97.10, zoom: 10.5, ts: Date.now() });
    } else if (step === 2) {
      // Step 2: Glider scanning 100-mile corridor at 50cm/px down to Edmond
      setShowCorridor(true);
      setShowFuelLoad(true);
      setShowWuiBorders(true);
      setShowChangeDetection(true);
      setFlyToLocation({ lat: 35.65, lng: -97.38, zoom: 12.5, ts: Date.now() });
    } else if (step === 3) {
      // Step 3: Priority mitigation zone and report export
      const criticalSec = STRATOSCOUT_SECTORS.find(s => s.id === 'SEC-OK-01') || STRATOSCOUT_SECTORS[0];
      handleSelectSector(criticalSec);
      setActiveReportCounty('Oklahoma County');
    }
  };

  const handleResetPitch = () => {
    setPitchStep(0);
    setSelectedCounty('All Counties');
    setSelectedSector(null);
    setShowChangeDetection(false);
    setActiveReportCounty(null);
    setFlyToLocation({ lat: 35.85, lng: -97.25, zoom: 9.2, ts: Date.now() });
  };

  // Prepare sensor & spatial entities for the map view
  const mapData = useMemo(() => {
    // Glider sensor driven by live flight telemetry playback
    const gliderSensor = {
      id: 'STRATO-GLIDER-01',
      name: `StratoScout Glider (${activeTelemetry.resolutionCmPx}cm/px ${spectralPalette})`,
      type: 'sensor',
      sensor_type: 'FMV',
      source: 'FMV_MISB_FEED',
      lat: activeTelemetry.lat,
      lng: activeTelemetry.lng,
      alt: activeTelemetry.altFt,
      heading: activeTelemetry.headingDeg,
      battery: activeTelemetry.batteryPct,
      status: activeTelemetry.phase,
      fov_polygon: [
        [activeTelemetry.lng - 0.015, activeTelemetry.lat + 0.01],
        [activeTelemetry.lng + 0.015, activeTelemetry.lat + 0.01],
        [activeTelemetry.lng + 0.015, activeTelemetry.lat - 0.01],
        [activeTelemetry.lng - 0.015, activeTelemetry.lat - 0.01],
      ],
    };

    // Hotspots from sectors
    const hotspotEntities = showThermalHotspots
      ? STRATOSCOUT_SECTORS.map(s => ({
          id: s.id,
          name: `${s.sectorName} (${s.threatType})`,
          lat: s.lat,
          lng: s.lng,
          brightness: s.surfaceTempF,
          frp: s.acresCovered,
          type: 'fires',
        }))
      : [];

    return {
      live_sensors: [gliderSensor],
      fires: hotspotEntities,
    };
  }, [pitchStep, showThermalHotspots, activeTelemetry, spectralPalette]);

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-[#05070a] text-white font-mono select-none">
      {/* ── TOP BANNER NAVIGATION ── */}
      <header className="absolute top-0 left-0 right-0 z-[300] h-12 bg-black/80 backdrop-blur-md border-b border-[var(--gold-primary)]/30 px-4 flex items-center justify-between pointer-events-auto">
        <div className="flex items-center gap-3">
          <Link
            href="/"
            className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-white/10 hover:bg-white/20 text-xs font-bold text-gray-300 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>GLOBAL C2</span>
          </Link>

          <div className="h-5 w-[1px] bg-white/20" />

          <div className="flex items-center gap-2">
            <Flame className="w-4 h-4 text-[#FF3D3D] animate-pulse" />
            <span className="font-bold tracking-wider text-sm text-[var(--gold-primary)]">
              STRATOSCOUT COMMAND
            </span>
            <span className="text-[10px] px-2 py-0.5 rounded bg-amber-500/20 border border-amber-500/40 text-amber-300 font-bold hidden sm:inline">
              WILDFIRE PREVENTION & COUNTY EMERGENCY MANAGEMENT
            </span>
          </div>
        </div>

        {/* Center / Right controls */}
        <div className="flex items-center gap-2 text-[11px]">
          <div className="hidden lg:flex items-center gap-3 text-[9px] text-[var(--text-muted)] mr-2">
            <span>
              WEATHER WINDOW:{' '}
              <strong className="text-red-400 font-bold">RED FLAG (GUSTS 42 MPH)</strong>
            </span>
            <span>
              COUNTY TIER:{' '}
              <strong className="text-[var(--gold-primary)]">${STRATOSCOUT_METRICS.countyAnnualSubscriptionPrice.toLocaleString()}/YR</strong>
            </span>
          </div>

          <button
            onClick={() => setShowFmvGimbal(true)}
            className="px-2 py-1 rounded text-[10px] font-bold border border-emerald-500/40 bg-emerald-500/20 text-emerald-300 hover:bg-emerald-500/30 transition-all flex items-center gap-1"
          >
            <Video className="w-3.5 h-3.5 text-emerald-400" />
            <span>FMV GIMBAL</span>
          </button>

          <button
            onClick={() => setShowFleetManager(true)}
            className="px-2 py-1 rounded text-[10px] font-bold border border-cyan-500/40 bg-cyan-500/20 text-cyan-300 hover:bg-cyan-500/30 transition-all flex items-center gap-1"
          >
            <BarChart3 className="w-3.5 h-3.5 text-cyan-400" />
            <span>FLEET MGR (52)</span>
          </button>

          <button
            onClick={() => setShowFlightPlayback(!showFlightPlayback)}
            className={`px-2 py-1 rounded text-[10px] font-bold border transition-all flex items-center gap-1 ${
              showFlightPlayback
                ? 'bg-cyan-500/20 border-cyan-400 text-cyan-300'
                : 'bg-black/40 border-white/20 text-gray-400 hover:border-white/40'
            }`}
          >
            <Play className="w-3.5 h-3.5 text-cyan-400" />
            <span>SITL SCRUBBER</span>
          </button>

          <button
            onClick={() => setShowPaletteSelector(!showPaletteSelector)}
            className={`px-2 py-1 rounded text-[10px] font-bold border transition-all flex items-center gap-1 ${
              showPaletteSelector
                ? 'bg-amber-500/20 border-amber-400 text-amber-300'
                : 'bg-black/40 border-white/20 text-gray-400 hover:border-white/40'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>PALETTE</span>
          </button>

          <button
            onClick={() => setShowOfflinePack(!showOfflinePack)}
            className={`px-2 py-1 rounded text-[10px] font-bold border transition-all flex items-center gap-1 ${
              isOfflineMode
                ? 'bg-red-500/20 border-red-400 text-red-300'
                : 'bg-black/40 border-white/20 text-gray-400 hover:border-white/40'
            }`}
          >
            <span>{isOfflineMode ? 'OFFLINE' : 'FIELD PACK'}</span>
          </button>

          <button
            onClick={() => setShowChangeDetection(!showChangeDetection)}
            className={`px-2 py-1 rounded text-[10px] font-bold border transition-all flex items-center gap-1 ${
              showChangeDetection
                ? 'bg-cyan-500/20 border-cyan-400 text-cyan-300'
                : 'bg-black/40 border-white/20 text-gray-400 hover:border-white/40'
            }`}
          >
            <Sliders className="w-3.5 h-3.5 text-cyan-400" />
            <span>CHANGE</span>
          </button>
        </div>
      </header>

      {/* ── MAP CONTAINER ── */}
      <div className="absolute inset-0 pt-12">
        <OsintMap
          data={mapData}
          activeLayers={{
            flights: false,
            private: false,
            jets: false,
            military: false,
            maritime: false,
            satellites: false,
            sat_comms: false,
            sat_military: false,
            sat_navigation: false,
            sat_earth: false,
            sat_science: false,
            balloons: false,
            cctv: false,
            live_news: false,
            news_intel: false,
            earthquakes: false,
            fires: showThermalHotspots,
            weather: false,
            radiation: false,
            infrastructure: false,
            global_incidents: false,
            war_alerts: false,
            gps_jamming: false,
            day_night: false,
            cables: false,
            sdk_sea: false,
            sdk_air: false,
            sdk_naval: false,
            terrain_3d: false,
            malware: false,
            live_sensors: true,
          }}
          activeOrthoJobs={[]}
          projection="mercator"
          mapStyle="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
          onEntityClick={(ent) => {
            const found = STRATOSCOUT_SECTORS.find(s => s.id === ent?.id);
            if (found) handleSelectSector(found);
          }}
          onMouseCoords={() => {}}
          onRightClick={() => {}}
          onViewStateChange={() => {}}
          flyToLocation={flyToLocation}
          sweepData={null}
          scanTargets={[]}
          demoMode={false}
          theme="ghost"
        />

        {/* ── OKLAHOMA GLIDE CORRIDOR & SECTOR HUD GRAPHICAL OVERLAYS ── */}
        <div className="absolute inset-0 pointer-events-none pt-12 overflow-hidden">
          {/* Top-Right Map Layer Controls */}
          <div className="absolute top-16 right-4 z-[200] pointer-events-auto glass-panel p-3 border border-white/20 shadow-xl max-w-xs text-[10px] space-y-2">
            <div className="font-bold text-xs text-[var(--gold-primary)] flex items-center gap-1.5 pb-1 border-b border-white/10">
              <Layers className="w-3.5 h-3.5" />
              <span>WILDFIRE & TRIAGE LAYERS</span>
            </div>
            <div className="space-y-1">
              {[
                { label: 'Firebreaks & Dozer Lines', val: showFirebreaks, set: setShowFirebreaks, color: 'text-amber-400' },
                { label: 'Dry Fuel Load (NDVI Multispectral)', val: showFuelLoad, set: setShowFuelLoad, color: 'text-orange-400' },
                { label: 'WUI High-Risk Structure Borders', val: showWuiBorders, set: setShowWuiBorders, color: 'text-purple-400' },
                { label: 'Surface Heat & Smolder Detections', val: showThermalHotspots, set: setShowThermalHotspots, color: 'text-red-400' },
                { label: 'Rothermel Fire Spread & Smoke Plume', val: showFireSpread, set: setShowFireSpread, color: 'text-amber-300' },
                { label: '100-Mi Glide Flight Corridor', val: showCorridor, set: setShowCorridor, color: 'text-cyan-400' },
                { label: 'Wind Vector & Spread Corridor', val: showWindVectors, set: setShowWindVectors, color: 'text-blue-400' },
              ].map(layer => (
                <button
                  key={layer.label}
                  onClick={() => layer.set(!layer.val)}
                  className={`w-full py-1 px-2 rounded text-left flex items-center justify-between transition-colors border ${
                    layer.val
                      ? 'bg-white/10 border-white/30 text-white font-semibold'
                      : 'bg-black/30 border-transparent text-gray-500'
                  }`}
                >
                  <span className={layer.val ? layer.color : ''}>{layer.label}</span>
                  <span className="text-[8px] font-mono">{layer.val ? 'ON' : 'OFF'}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Rothermel Fire Spread & Smoke Plume HUD */}
          {showFireSpread && (
            <div className="absolute top-16 right-72 z-[190] pointer-events-auto max-w-sm">
              <FireSpreadHud
                projection={spreadProjection}
                activeHour={fireSpreadHour}
                onSelectHour={setFireSpreadHour}
                onClose={() => setShowFireSpread(false)}
              />
            </div>
          )}

          {/* Glide Corridor Waypoint Visualizer (when Corridor is ON) */}
          {showCorridor && (
            <div className="absolute top-16 left-[410px] z-[150] pointer-events-auto hidden xl:block glass-panel p-2.5 border border-cyan-500/30 max-w-xs text-[9px]">
              <div className="font-bold text-cyan-300 mb-1 flex items-center justify-between">
                <span>100-MI AUTONOMOUS GLIDE TRAJECTORY</span>
                <span className="text-gray-400">OAIRE Stillwater → Edmond</span>
              </div>
              <div className="space-y-1 border-t border-white/10 pt-1 text-gray-300">
                {GLIDE_CORRIDOR_WAYPOINTS.map(wp => (
                  <div key={wp.step} className="flex justify-between items-center">
                    <span className="truncate max-w-[190px]">{wp.name.split(':')[1] || wp.name}</span>
                    <span className="text-cyan-400 font-bold tabular-nums">{wp.altFt.toLocaleString()} ft</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Change Detection Popout (if toggled) */}
          {showChangeDetection && (
            <div className="absolute top-16 right-72 z-[250] pointer-events-auto">
              <ChangeDetectionSlider />
            </div>
          )}

          {/* Multi-Spectral Palette Selector (if toggled) */}
          {showPaletteSelector && (
            <div className="absolute top-16 right-96 z-[250] pointer-events-auto">
              <SpectralPaletteSelector
                currentPalette={spectralPalette}
                onChangePalette={setSpectralPalette}
              />
            </div>
          )}

          {/* Offline Field Command Pack (if toggled) */}
          {showOfflinePack && (
            <div className="absolute top-16 left-96 z-[250] pointer-events-auto">
              <OfflineFieldPack
                isOfflineMode={isOfflineMode}
                onToggleOffline={() => setIsOfflineMode(!isOfflineMode)}
              />
            </div>
          )}

          {/* Flight Telemetry Playback Scrubber (if toggled) */}
          {showFlightPlayback && (
            <div className="absolute top-16 left-1/2 -translate-x-1/2 z-[250] pointer-events-auto">
              <FlightPlaybackScrubber
                onTelemetryUpdate={(tel) => {
                  setActiveTelemetry(tel);
                  setFlyToLocation({ lat: tel.lat, lng: tel.lng, zoom: 12, ts: Date.now() });
                }}
              />
            </div>
          )}
        </div>
      </div>

      {/* ── TOP-LEFT EXECUTIVE HUD ── */}
      <div className="absolute top-16 left-4 z-[200] pointer-events-auto">
        <ExecutiveHud
          corridorOverlay={showCorridor}
          onToggleCorridor={() => setShowCorridor(!showCorridor)}
          selectedCounty={selectedCounty}
          onSelectCounty={(c) => {
            setSelectedCounty(c);
            if (c === 'Payne County') {
              setFlyToLocation({ lat: 36.11, lng: -97.10, zoom: 11, ts: Date.now() });
            } else if (c === 'Oklahoma County') {
              setFlyToLocation({ lat: 35.65, lng: -97.38, zoom: 11, ts: Date.now() });
            } else {
              setFlyToLocation({ lat: 35.85, lng: -97.25, zoom: 9.2, ts: Date.now() });
            }
          }}
          totalAtRiskStructures={totalAtRiskStructures}
        />
      </div>

      {/* ── 60-SECOND PITCH WALKTHROUGH CONTROLLER ── */}
      <div className="absolute bottom-[240px] left-4 z-[200] pointer-events-auto hidden md:block">
        <PitchWalkthroughController
          currentStep={pitchStep}
          onStepChange={handlePitchStepChange}
          onReset={handleResetPitch}
        />
      </div>

      {/* ── BOTTOM PRIORITY MITIGATION & TRIAGE QUEUE ── */}
      <div className="absolute bottom-2 left-4 right-4 z-[200] pointer-events-auto">
        <PriorityTriageQueue
          sectors={visibleSectors}
          selectedSectorId={selectedSector?.id || null}
          onSelectSector={(sec) => {
            handleSelectSector(sec);
            setWebhookSector(sec);
          }}
          onOpenReportModal={(county) => setActiveReportCounty(county)}
        />
      </div>

      {/* ── FMV GIMBAL TACTICAL OVERLAY MODAL ── */}
      {showFmvGimbal && (
        <GimbalFmvOverlay
          telemetry={{
            ...activeTelemetry,
            altitudeFt: activeTelemetry.altFt,
            timeSeconds: 45,
            windSpeedMph: 42,
            windHeadingDeg: activeTelemetry.headingDeg,
            gimbalPitchDeg: -35,
          }}
          selectedSectorName={selectedSector ? selectedSector.sectorName : 'Payne / Oklahoma County WUI Interface'}
          onClose={() => setShowFmvGimbal(false)}
        />
      )}

      {/* ── COUNTY FLEET & SUBSCRIPTION MANAGER MODAL ── */}
      {showFleetManager && (
        <CountyFleetManagerModal
          onClose={() => setShowFleetManager(false)}
          onSelectCounty={(cid) => {
            if (cid === 'PAYNE') setSelectedCounty('Payne County');
            if (cid === 'OKLAHOMA') setSelectedCounty('Oklahoma County');
          }}
        />
      )}

      {/* ── WEBHOOK DISPATCH MODAL (When Triggered) ── */}
      {webhookSector && (
        <WebhookDispatchModal
          sector={webhookSector}
          onClose={() => setWebhookSector(null)}
        />
      )}

      {/* ── COUNTY REPORT MODAL (When Triggered) ── */}
      {activeReportCounty && (
        <CountyReportModal
          county={activeReportCounty}
          onClose={() => setActiveReportCounty(null)}
        />
      )}
    </div>
  );
}
