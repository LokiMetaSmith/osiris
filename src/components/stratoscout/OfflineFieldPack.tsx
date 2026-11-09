'use client';

import React, { useState, useEffect } from 'react';
import {
  STRATOSCOUT_SECTORS,
  MOCK_FIREBREAKS_GEOJSON,
  SectorTriageItem,
} from '@/lib/stratoscout/data';
import {
  WifiOff,
  Wifi,
  HardDriveDownload,
  CheckCircle2,
  AlertTriangle,
  Tablet,
  Radio,
} from 'lucide-react';

interface OfflineFieldPackProps {
  isOfflineMode: boolean;
  onToggleOffline: () => void;
}

export default function OfflineFieldPack({
  isOfflineMode,
  onToggleOffline,
}: OfflineFieldPackProps) {
  const [cachedItemsCount, setCachedItemsCount] = useState<number>(0);
  const [isSyncing, setIsSyncing] = useState<boolean>(false);

  useEffect(() => {
    // Check local storage for cached pack
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('stratoscout_offline_sectors');
      if (stored) {
        try {
          const parsed = JSON.parse(stored);
          setCachedItemsCount(parsed.length);
        } catch {
          setCachedItemsCount(0);
        }
      }
    }
  }, []);

  const handleDownloadOfflinePack = () => {
    setIsSyncing(true);
    setTimeout(() => {
      if (typeof window !== 'undefined') {
        localStorage.setItem(
          'stratoscout_offline_sectors',
          JSON.stringify(STRATOSCOUT_SECTORS)
        );
        localStorage.setItem(
          'stratoscout_offline_firebreaks',
          JSON.stringify(MOCK_FIREBREAKS_GEOJSON)
        );
        setCachedItemsCount(STRATOSCOUT_SECTORS.length);
      }
      setIsSyncing(false);
    }, 1200);
  };

  return (
    <div className="glass-panel p-3 border border-amber-500/40 shadow-xl font-mono text-[10px] text-[var(--text-primary)] max-w-sm w-full">
      <div className="flex items-center justify-between pb-1.5 mb-2 border-b border-white/10">
        <span className="font-bold text-xs text-amber-300 flex items-center gap-1.5">
          <Tablet className="w-3.5 h-3.5 text-amber-400" />
          <span>OFFLINE INCIDENT FIELD PACK (PWA)</span>
        </span>
        <span className={`text-[8px] px-1.5 py-0.5 rounded font-bold ${isOfflineMode ? 'bg-red-500 text-black' : 'bg-emerald-950 text-emerald-300 border border-emerald-500/40'}`}>
          {isOfflineMode ? 'OFFLINE DISCONNECTED' : 'ONLINE CONNECTED'}
        </span>
      </div>

      <p className="text-[9px] text-gray-300 leading-snug mb-2.5">
        Designed for rural Payne and Oklahoma County fire crews operating beyond cellular tower range. Stores 50cm parcels, dozer lines, and triage priority locally.
      </p>

      {/* Sync State / Storage Status */}
      <div className="p-2 rounded bg-black/50 border border-white/5 space-y-1 mb-2.5 text-[9px]">
        <div className="flex justify-between items-center">
          <span className="text-[var(--text-muted)]">LOCAL STORAGE CACHE:</span>
          <span className="font-bold text-white tabular-nums">
            {cachedItemsCount > 0 ? `${cachedItemsCount} SECTORS STORED` : 'NOT CACHED'}
          </span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-[var(--text-muted)]">DOZER / FIREBREAK LINES:</span>
          <span className="text-amber-300 font-bold">
            {cachedItemsCount > 0 ? '✓ 42.6 MILES READY' : 'PENDING SYNC'}
          </span>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="grid grid-cols-2 gap-2">
        <button
          onClick={handleDownloadOfflinePack}
          disabled={isSyncing}
          className="p-1.5 rounded bg-black/60 hover:bg-white/10 border border-white/20 text-white font-bold text-[9px] flex items-center justify-center gap-1 transition-all"
        >
          {isSyncing ? (
            <span className="animate-pulse">DOWNLOADING...</span>
          ) : (
            <>
              <HardDriveDownload className="w-3 h-3 text-cyan-400" />
              <span>SYNC LOCAL PACK</span>
            </>
          )}
        </button>

        <button
          onClick={onToggleOffline}
          className={`p-1.5 rounded font-bold text-[9px] flex items-center justify-center gap-1 transition-all border ${
            isOfflineMode
              ? 'bg-amber-500 hover:bg-amber-400 text-black border-amber-400 shadow-md'
              : 'bg-black/60 hover:bg-white/10 border-white/20 text-gray-300'
          }`}
        >
          {isOfflineMode ? (
            <>
              <WifiOff className="w-3 h-3 text-black" />
              <span>EXIT FIELD MODE</span>
            </>
          ) : (
            <>
              <Radio className="w-3 h-3 text-amber-400" />
              <span>ENTER FIELD MODE</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
}
