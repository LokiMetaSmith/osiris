'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, MapPin, Maximize2, Compass, Navigation, Eye, ShieldAlert } from 'lucide-react';
import Hls from 'hls.js';
import { CvBoundingBoxOverlay } from './CvBoundingBoxOverlay';
import { BoundingBoxDetection } from '@/lib/cv/target-tracker';

interface FmvViewerProps {
  sensor: any | null;
  onClose: () => void;
  onLocate?: (lat: number, lng: number) => void;
}

export default function FmvViewer({ sensor, onClose, onLocate }: FmvViewerProps) {
  const [fullscreen, setFullscreen] = useState(false);
  const [currentTime, setCurrentTime] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const videoRef = useRef<HTMLVideoElement>(null);
  const hlsRef = useRef<Hls | null>(null);

  useEffect(() => {
    const iv = setInterval(() => {
      const now = new Date();
      setCurrentTime(now.toISOString().split('T')[1].slice(0, 8) + 'Z');
    }, 1000);
    return () => clearInterval(iv);
  }, []);

  const meta = typeof sensor?.metadata === 'string' ? JSON.parse(sensor.metadata) : (sensor?.metadata || {});
  const pitch = meta.pitch ?? -45;
  const roll = meta.roll ?? 0;
  const hfov = meta.hfov ?? 40;
  const slantRange = meta.slantRangeMeters ? Math.round(meta.slantRangeMeters) : 707;
  const targetCenter = meta.targetCenterLocation || [sensor?.lng || 23.32, sensor?.lat || 42.70];

  const streamUrl = sensor?.stream_url || 'http://localhost:8889/drone1';
  const streamType = sensor?.stream_type || 'webrtc';

  // Simulated live Computer Vision detections
  const [cvDetections] = useState<BoundingBoxDetection[]>([
    { x1: 0.42, y1: 0.38, x2: 0.51, y2: 0.46, confidence: 0.92, class_name: 'vehicle', track_id: 101 },
    { x1: 0.65, y1: 0.52, x2: 0.72, y2: 0.60, confidence: 0.87, class_name: 'truck', track_id: 102 }
  ]);

  useEffect(() => {
    if (!sensor) return;
    setLoading(true);
    setError(false);

    if (hlsRef.current) {
      hlsRef.current.destroy();
      hlsRef.current = null;
    }

    if (streamType === 'hls' && streamUrl) {
      if (Hls.isSupported() && videoRef.current) {
        const hls = new Hls({ enableWorker: false });
        hlsRef.current = hls;
        hls.loadSource(streamUrl);
        hls.attachMedia(videoRef.current);
        hls.on(Hls.Events.MANIFEST_PARSED, () => {
          setLoading(false);
          videoRef.current?.play().catch(() => {});
        });
        hls.on(Hls.Events.ERROR, () => {
          setError(true);
          setLoading(false);
        });
      } else if (videoRef.current?.canPlayType('application/vnd.apple.mpegurl')) {
        videoRef.current.src = streamUrl;
        videoRef.current.addEventListener('loadedmetadata', () => {
          setLoading(false);
          videoRef.current?.play().catch(() => {});
        });
      } else {
        setLoading(false);
      }
    } else {
      setLoading(false);
    }
  }, [sensor, streamUrl, streamType]);

  if (!sensor) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95 }}
        transition={{ duration: 0.3, type: "spring", bounce: 0 }}
        className={`fixed z-[550] ${
          fullscreen
            ? 'inset-2 md:inset-4'
            : 'bottom-[70px] left-2 right-2 md:bottom-6 md:right-6 md:left-auto md:w-[520px]'
        }`}
      >
        <div className="overflow-hidden h-full flex flex-col bg-black/90 backdrop-blur-2xl border border-[var(--gold-primary)]/40 rounded-sm" style={{ boxShadow: '0 20px 60px rgba(0,0,0,0.95), inset 0 0 40px rgba(255,234,0,0.05)' }}>

          {/* Tactical Header */}
          <div className="flex flex-col border-b border-[var(--gold-primary)]/30 bg-black/80 relative z-10">
            <div className="flex items-center justify-between px-3 py-1 border-b border-white/10 text-[8px] font-mono tracking-[0.2em] bg-[var(--gold-primary)]/10 text-[var(--gold-primary)]">
              <div className="flex items-center gap-2">
                <ShieldAlert className="w-3 h-3 text-[var(--gold-primary)]" />
                <span className="font-bold">MISB ST 0601 FMV FEED</span>
                <span className="text-white/60">ID: {sensor.id}</span>
              </div>
              <div className="flex items-center gap-3">
                <span>{currentTime}</span>
                <span className="text-[#00E5FF] font-bold">KLV SYNCHRONIZED</span>
              </div>
            </div>

            <div className="flex items-center justify-between px-3 md:px-4 py-2">
              <div className="flex items-center gap-3 min-w-0 flex-1">
                <div className="relative flex items-center justify-center w-7 h-7 border border-[var(--gold-primary)] bg-[var(--gold-primary)]/15 rounded-sm">
                  <Compass className="w-4 h-4 text-[var(--gold-primary)] animate-spin" style={{ animationDuration: '10s' }} />
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="text-[12px] font-mono font-bold tracking-widest text-white uppercase truncate">{sensor.name}</h3>
                  <p className="text-[8px] font-mono text-[var(--gold-primary)] tracking-wider opacity-90">
                    SENS: {sensor.lat?.toFixed(4)}°, {sensor.lng?.toFixed(4)}° | ALT: {sensor.alt || 500}m
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-1.5 flex-shrink-0">
                {targetCenter && (
                  <button
                    onClick={() => onLocate?.(targetCenter[1], targetCenter[0])}
                    className="p-1.5 rounded bg-white/5 border border-white/10 hover:bg-[var(--gold-primary)]/20 hover:border-[var(--gold-primary)] text-[var(--gold-primary)] transition-all flex items-center gap-1 text-[8px] font-mono"
                    title="Center map on camera footprint target"
                  >
                    <MapPin className="w-3 h-3" />
                    <span>TARGET</span>
                  </button>
                )}
                <button onClick={() => setFullscreen(!fullscreen)} className="p-1.5 rounded bg-white/5 border border-white/10 hover:bg-white/20 text-white transition-all">
                  <Maximize2 className="w-3.5 h-3.5" />
                </button>
                <button onClick={onClose} className="p-1.5 rounded bg-red-900/30 border border-red-500/40 hover:bg-red-500/30 text-red-400 transition-all ml-1">
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>

          {/* Video Feed Screen & Tactical HUD */}
          <div className={`relative bg-[#040404] ${fullscreen ? 'flex-1 overflow-hidden' : 'aspect-video max-h-[40vh] md:max-h-none'}`}>

            {/* Video Element / Simulation Feed */}
            {streamType === 'hls' ? (
              <video ref={videoRef} className="w-full h-full object-cover" autoPlay muted playsInline />
            ) : streamType === 'webrtc' ? (
              <iframe src={streamUrl} className="w-full h-full border-0 pointer-events-auto" allow="autoplay; fullscreen" />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-neutral-950 via-zinc-900 to-black flex items-center justify-center relative overflow-hidden">
                {/* Simulated Thermal/EO Sensor Backdrop */}
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(0,229,255,0.05)_0,transparent_70%)]" />
                <div className="text-center z-10">
                  <Eye className="w-8 h-8 text-[var(--gold-primary)]/60 mx-auto mb-2 animate-pulse" />
                  <p className="text-[10px] font-mono text-[var(--gold-primary)] tracking-widest uppercase">LIVE SENSOR STREAM</p>
                  <p className="text-[8px] font-mono text-zinc-400 mt-1">UAS DATALINK ST 0601 / ST 0903</p>
                </div>
              </div>
            )}

            {/* Live CV Target Bounding Box Overlay */}
            <CvBoundingBoxOverlay detections={cvDetections} />

            {/* Tactical HUD Overlay (HUD Elements over video) */}
            <div className="absolute inset-0 pointer-events-none z-20 flex flex-col justify-between p-3 font-mono text-[9px] text-[var(--gold-primary)]">

              {/* HUD Top Readouts */}
              <div className="flex justify-between items-start bg-black/60 p-1.5 border border-white/10 rounded-xs">
                <div className="space-y-0.5">
                  <div>LAT: <span className="text-white">{sensor.lat?.toFixed(5)}°</span></div>
                  <div>LNG: <span className="text-white">{sensor.lng?.toFixed(5)}°</span></div>
                  <div>ALT: <span className="text-[#00E5FF]">{sensor.alt || 500} m AGL</span></div>
                </div>
                <div className="text-right space-y-0.5">
                  <div>PITCH: <span className="text-white">{pitch}°</span></div>
                  <div>ROLL: <span className="text-white">{roll}°</span></div>
                  <div>HFOV: <span className="text-white">{hfov}°</span></div>
                </div>
              </div>

              {/* HUD Center Target Reticle */}
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="w-20 h-20 border border-[var(--gold-primary)]/40 rounded-full flex items-center justify-center relative">
                  <div className="w-2 h-2 bg-[var(--gold-primary)] rounded-full animate-ping" />
                  <div className="absolute -top-3 text-[7px] text-[var(--gold-primary)] font-bold tracking-widest">TGT CENTER</div>
                  <div className="absolute -bottom-4 text-[7px] text-white/80">{targetCenter[1]?.toFixed(4)}°, {targetCenter[0]?.toFixed(4)}°</div>
                  {/* Crosshair ticks */}
                  <div className="w-full h-[1px] bg-[var(--gold-primary)]/50 absolute" />
                  <div className="h-full w-[1px] bg-[var(--gold-primary)]/50 absolute" />
                </div>
              </div>

              {/* HUD Bottom Readouts */}
              <div className="flex justify-between items-end bg-black/60 p-1.5 border border-white/10 rounded-xs">
                <div>
                  <div className="text-[7px] text-zinc-400">SLANT RANGE</div>
                  <div className="text-[11px] font-bold text-white">{slantRange} m</div>
                </div>
                <div className="text-right">
                  <div className="text-[7px] text-zinc-400">HEADING</div>
                  <div className="text-[11px] font-bold text-[#00E5FF]">{sensor.telemetry?.heading || 90}°</div>
                </div>
              </div>

            </div>

          </div>

          {/* Tactical Control Footer */}
          <div className="bg-black/90 p-2 border-t border-[var(--gold-primary)]/30 flex items-center justify-between text-[8px] font-mono text-zinc-400">
            <div className="flex items-center gap-2">
              <Navigation className="w-3 h-3 text-[var(--gold-primary)]" />
              <span>DYNAMIC FOV TRAPEZOID ACTIVE ON MAP</span>
            </div>
            {targetCenter && (
              <button
                onClick={() => onLocate?.(targetCenter[1], targetCenter[0])}
                className="px-2.5 py-1 bg-[var(--gold-primary)]/15 border border-[var(--gold-primary)]/50 text-[var(--gold-primary)] hover:bg-[var(--gold-primary)]/30 transition-all font-bold tracking-wider"
              >
                CENTER CAMERA TARGET
              </button>
            )}
          </div>

        </div>
      </motion.div>
    </AnimatePresence>
  );
}
