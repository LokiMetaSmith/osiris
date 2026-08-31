'use client';

import React, { useState, useEffect } from 'react';
import { AirspaceAlert, resolveAlert } from '@/lib/db/postgis-store';
import { ShieldAlert, AlertTriangle, CheckCircle2, X } from 'lucide-react';

export function LiveAlertsPanel({ onClose }: { onClose?: () => void }) {
  const [alerts, setAlerts] = useState<AirspaceAlert[]>([]);

  useEffect(() => {
    // Poll active alerts every 2 seconds or listen to SSE
    const fetchAlerts = async () => {
      try {
        const res = await fetch('/api/sensors');
        if (res.ok) {
          const data = await res.json();
          if (data.alerts) {
            setAlerts(data.alerts);
          }
        }
      } catch {}
    };

    fetchAlerts();
    const interval = setInterval(fetchAlerts, 2000);
    return () => clearInterval(interval);
  }, []);

  const handleResolve = (id: string) => {
    resolveAlert(id);
    setAlerts(prev => prev.filter(a => a.id !== id));
  };

  return (
    <div className="absolute top-16 right-4 z-50 w-96 bg-slate-950/90 border border-red-500/40 backdrop-blur-md rounded-lg shadow-2xl overflow-hidden font-mono text-xs text-slate-100">
      <div className="flex items-center justify-between px-4 py-2.5 bg-red-950/40 border-b border-red-500/30">
        <div className="flex items-center gap-2 text-red-400 font-semibold tracking-wider uppercase">
          <ShieldAlert className="w-4 h-4 animate-pulse" />
          <span>Airspace Violation Feed</span>
        </div>
        {onClose && (
          <button onClick={onClose} className="p-1 text-slate-400 hover:text-white">
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      <div className="p-3 max-h-80 overflow-y-auto space-y-2.5">
        {alerts.length === 0 ? (
          <div className="text-center py-6 text-slate-500 italic">
            No active airspace violations detected.
          </div>
        ) : (
          alerts.map((alert) => (
            <div
              key={alert.id}
              className={`p-2.5 rounded border transition-colors ${
                alert.severity === 'CRITICAL'
                  ? 'bg-red-900/20 border-red-500/60 text-red-200'
                  : 'bg-amber-900/20 border-amber-500/60 text-amber-200'
              }`}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-1.5 font-bold uppercase text-[10px]">
                  <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                  <span>[{alert.severity}] {alert.triggered_at.split('T')[1]?.slice(0, 8)}</span>
                </div>
                <button
                  onClick={() => handleResolve(alert.id)}
                  className="flex items-center gap-1 text-[10px] px-1.5 py-0.5 rounded bg-slate-800 hover:bg-emerald-950 hover:text-emerald-400 border border-slate-700 transition"
                  title="Acknowledge and Resolve"
                >
                  <CheckCircle2 className="w-3 h-3" /> ACK
                </button>
              </div>
              <p className="mt-1.5 leading-relaxed text-[11px] text-slate-300">
                {alert.message}
              </p>
              <div className="mt-1 text-[9px] text-slate-400 font-mono">
                POS: {alert.lat.toFixed(4)}N, {alert.lng.toFixed(4)}E
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
