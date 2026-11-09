'use client';

import React, { useState } from 'react';
import { SectorTriageItem, WebhookDispatchPayload, generateWebhookPayload } from '@/lib/stratoscout/data';
import { X, Send, Check, Terminal, ExternalLink, ShieldCheck } from 'lucide-react';

interface WebhookDispatchModalProps {
  sector: SectorTriageItem;
  initialPlatform?: 'D4H' | 'WebEOC' | 'ArcGIS';
  onClose: () => void;
}

export default function WebhookDispatchModal({
  sector,
  initialPlatform = 'D4H',
  onClose,
}: WebhookDispatchModalProps) {
  const [platform, setPlatform] = useState<'D4H' | 'WebEOC' | 'ArcGIS'>(initialPlatform);
  const [isSent, setIsSent] = useState<boolean>(false);

  const payload: WebhookDispatchPayload = generateWebhookPayload(platform, sector);

  const handleSend = () => {
    setIsSent(true);
    setTimeout(() => {
      setIsSent(false);
    }, 4000);
  };

  return (
    <div className="fixed inset-0 z-[650] flex items-center justify-center bg-black/80 backdrop-blur-md p-4 font-mono">
      <div className="relative w-full max-w-2xl glass-panel border border-cyan-500/40 rounded-lg shadow-2xl p-5 text-[11px] text-[var(--text-primary)]">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-full hover:bg-white/10 text-gray-400 hover:text-white transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-3 pb-3 mb-3 border-b border-[var(--border-primary)]">
          <div className="w-9 h-9 rounded bg-cyan-500/20 border border-cyan-400 flex items-center justify-center text-cyan-300">
            <Terminal className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-white tracking-wider">
                EMERGENCY MANAGEMENT WEBHOOK DISPATCH SIMULATOR
              </h3>
              <span className="px-2 py-0.5 rounded bg-cyan-950 border border-cyan-400 text-cyan-300 text-[8px] font-bold">
                API GATEWAY V1.4
              </span>
            </div>
            <div className="text-[9px] text-[var(--text-muted)] mt-0.5">
              Live transmission to Oklahoma County & Payne County incident command systems
            </div>
          </div>
        </div>

        {/* Platform Selector */}
        <div className="flex items-center gap-2 mb-3">
          <span className="text-[9px] text-[var(--text-muted)]">TARGET DISPATCH PLATFORM:</span>
          {(['D4H', 'WebEOC', 'ArcGIS'] as const).map(p => (
            <button
              key={p}
              onClick={() => setPlatform(p)}
              className={`px-3 py-1 rounded text-[10px] font-bold transition-all border ${
                platform === p
                  ? 'bg-cyan-500/20 border-cyan-400 text-cyan-300 shadow-md'
                  : 'bg-black/40 border-white/10 text-gray-400 hover:border-white/30'
              }`}
            >
              {p === 'D4H' ? 'D4H INCIDENT' : p === 'WebEOC' ? 'WebEOC CAD' : 'ESRI ARCGIS C2'}
            </button>
          ))}
        </div>

        {/* Payload JSON Inspector */}
        <div className="mb-4">
          <div className="flex justify-between items-center text-[9px] text-gray-400 mb-1">
            <span>TRANSMITTED JSON PAYLOAD:</span>
            <span className="text-emerald-400">STATUS: HTTP 200 OK READY</span>
          </div>
          <div className="p-3 rounded bg-black/80 border border-white/10 font-mono text-[9px] text-cyan-200 overflow-x-auto max-h-56 styled-scrollbar">
            <pre>{JSON.stringify(payload, null, 2)}</pre>
          </div>
        </div>

        {/* Feedback / Send Action */}
        <div className="flex items-center justify-between pt-2 border-t border-[var(--border-primary)]">
          <div className="text-[9px] text-gray-400">
            {isSent ? (
              <span className="text-emerald-400 font-bold flex items-center gap-1.5">
                <Check className="w-4 h-4 text-emerald-400" />
                ✓ WEBHOOK SUCCESSFULLY ACCEPTED BY {platform} ENDPOINT!
              </span>
            ) : (
              <span>Simulates live single-pane integration solving Benjamin Curry's 10-15 tool fatigue.</span>
            )}
          </div>

          <button
            onClick={handleSend}
            disabled={isSent}
            className={`px-4 py-2 rounded font-extrabold text-[10px] tracking-wider transition-all flex items-center gap-1.5 ${
              isSent
                ? 'bg-emerald-600 text-white cursor-default'
                : 'bg-cyan-500 hover:bg-cyan-400 text-black shadow-lg'
            }`}
          >
            {isSent ? (
              <>
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>DISPATCHED</span>
              </>
            ) : (
              <>
                <Send className="w-3.5 h-3.5" />
                <span>TRIGGER WEBHOOK TO {platform}</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
