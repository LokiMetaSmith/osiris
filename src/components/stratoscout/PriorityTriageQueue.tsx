'use client';

import React, { useState } from 'react';
import { SectorTriageItem, ThreatType } from '@/lib/stratoscout/data';
import { Flame, Thermometer, ShieldAlert, CheckCircle2, ChevronRight, Filter } from 'lucide-react';

interface PriorityTriageQueueProps {
  sectors: SectorTriageItem[];
  selectedSectorId: string | null;
  onSelectSector: (sector: SectorTriageItem) => void;
  onOpenReportModal: (county: 'Payne County' | 'Oklahoma County') => void;
}

export default function PriorityTriageQueue({
  sectors,
  selectedSectorId,
  onSelectSector,
  onOpenReportModal,
}: PriorityTriageQueueProps) {
  const [filterThreat, setFilterThreat] = useState<string>('ALL');

  const filtered = sectors.filter(s => {
    if (filterThreat === 'ALL') return true;
    return s.threatType === filterThreat;
  });

  const getThreatBadge = (threat: ThreatType) => {
    switch (threat) {
      case '01 Fire Fuel Complex':
        return (
          <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[8px] font-bold bg-amber-500/20 border border-amber-500/40 text-amber-300">
            <Flame className="w-2.5 h-2.5 text-amber-400" />
            01 FUEL COMPLEX
          </span>
        );
      case '02 Surface Heat / Thermal':
        return (
          <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[8px] font-bold bg-red-500/20 border border-red-500/40 text-red-300">
            <Thermometer className="w-2.5 h-2.5 text-red-400" />
            02 SURFACE HEAT
          </span>
        );
      case '03 High-Risk WUI Borders':
        return (
          <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[8px] font-bold bg-purple-500/20 border border-purple-500/40 text-purple-300">
            <ShieldAlert className="w-2.5 h-2.5 text-purple-400" />
            03 WUI BORDER
          </span>
        );
    }
  };

  const getSeverityBadge = (sev: string) => {
    if (sev === 'CRITICAL') {
      return <span className="px-1.5 py-0.5 rounded text-[8px] font-extrabold bg-red-600/30 text-red-300 border border-red-500">CRITICAL</span>;
    }
    if (sev === 'HIGH') {
      return <span className="px-1.5 py-0.5 rounded text-[8px] font-bold bg-orange-600/30 text-orange-300 border border-orange-500">HIGH</span>;
    }
    return <span className="px-1.5 py-0.5 rounded text-[8px] font-bold bg-yellow-600/30 text-yellow-300 border border-yellow-500">{sev}</span>;
  };

  const getActionBadge = (action: string) => {
    if (action === 'Cut Firebreak') {
      return <span className="text-[#FF9500] font-bold">⚡ Cut Firebreak</span>;
    }
    if (action === 'Clear Brush') {
      return <span className="text-[#00E5FF] font-bold">🧹 Clear Brush</span>;
    }
    if (action === 'Pre-position Crew') {
      return <span className="text-[#FF3D3D] font-bold">🚒 Pre-position Crew</span>;
    }
    return <span className="text-gray-300">{action}</span>;
  };

  return (
    <div className="glass-panel w-full border border-[var(--gold-primary)]/30 backdrop-blur-md shadow-2xl p-3 font-mono text-[10px] text-[var(--text-primary)]">
      {/* Header bar with controls */}
      <div className="flex flex-wrap items-center justify-between pb-2 mb-2 border-b border-[var(--border-primary)] gap-2">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-[var(--gold-primary)]" />
          <span className="font-bold text-xs tracking-wider text-[var(--gold-primary)] uppercase">
            Priority Mitigation & Triage Queue
          </span>
          <span className="text-[9px] text-[var(--text-muted)]">
            ({filtered.length} ACTIVE TARGETS MONITORED)
          </span>
        </div>

        {/* Filter controls */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 text-[9px] text-[var(--text-muted)]">
            <Filter className="w-3 h-3 text-[var(--cyan-primary)]" />
            <span>MODE:</span>
          </div>
          {(['ALL', '01 Fire Fuel Complex', '02 Surface Heat / Thermal', '03 High-Risk WUI Borders'] as const).map(mode => (
            <button
              key={mode}
              onClick={() => setFilterThreat(mode)}
              className={`px-2 py-0.5 rounded text-[8px] transition-all border ${
                filterThreat === mode
                  ? 'bg-[var(--cyan-primary)]/20 border-[var(--cyan-primary)] text-[var(--cyan-primary)] font-bold'
                  : 'bg-black/30 border-white/10 hover:border-white/30 text-[var(--text-muted)]'
              }`}
            >
              {mode === 'ALL' ? 'ALL MODES' : mode.split(' ')[1]}
            </button>
          ))}

          {/* Quick County Report Triggers */}
          <button
            onClick={() => onOpenReportModal('Payne County')}
            className="ml-2 px-2.5 py-1 rounded bg-[var(--gold-primary)]/20 hover:bg-[var(--gold-primary)]/30 border border-[var(--gold-primary)]/60 text-[var(--gold-primary)] font-bold transition-all"
          >
            📄 PAYNE REPORT
          </button>
          <button
            onClick={() => onOpenReportModal('Oklahoma County')}
            className="px-2.5 py-1 rounded bg-[var(--cyan-primary)]/20 hover:bg-[var(--cyan-primary)]/30 border border-[var(--cyan-primary)]/60 text-[var(--cyan-primary)] font-bold transition-all"
          >
            📄 EDMOND REPORT
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto max-h-48 styled-scrollbar">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-white/10 text-[8px] text-[var(--text-muted)] tracking-wider uppercase">
              <th className="py-1 px-2">Sector / Zone ID</th>
              <th className="py-1 px-2">Jurisdiction</th>
              <th className="py-1 px-2">Threat Type</th>
              <th className="py-1 px-2">Severity</th>
              <th className="py-1 px-2 text-right">Structures at Risk</th>
              <th className="py-1 px-2 text-right">Fuel Moisture</th>
              <th className="py-1 px-2 text-right">Surface Temp</th>
              <th className="py-1 px-2">Recommended Action</th>
              <th className="py-1 px-2 text-center">Action</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(sec => {
              const isSelected = selectedSectorId === sec.id;
              return (
                <tr
                  key={sec.id}
                  onClick={() => onSelectSector(sec)}
                  className={`cursor-pointer transition-colors border-b border-white/5 ${
                    isSelected
                      ? 'bg-[var(--cyan-primary)]/20 text-white font-semibold'
                      : 'hover:bg-white/5 text-gray-300'
                  }`}
                >
                  <td className="py-1.5 px-2 font-bold flex items-center gap-1.5">
                    <span className="text-[var(--cyan-primary)]">{sec.id}</span>
                    <span className="text-gray-400 font-normal truncate max-w-[150px]">{sec.sectorName}</span>
                  </td>
                  <td className="py-1.5 px-2">{sec.county}</td>
                  <td className="py-1.5 px-2">{getThreatBadge(sec.threatType)}</td>
                  <td className="py-1.5 px-2">{getSeverityBadge(sec.severity)}</td>
                  <td className="py-1.5 px-2 text-right font-bold text-[#FF3D3D] tabular-nums">
                    {sec.structuresAtRisk}
                  </td>
                  <td className="py-1.5 px-2 text-right tabular-nums">
                    <span className={sec.fuelMoisturePct < 7 ? 'text-[#FF3D3D] font-bold' : 'text-amber-300'}>
                      {sec.fuelMoisturePct}%
                    </span>
                  </td>
                  <td className="py-1.5 px-2 text-right tabular-nums">
                    <span className={sec.surfaceTempF > 100 ? 'text-[#FF1744] font-bold' : 'text-white'}>
                      {sec.surfaceTempF}°F
                    </span>
                  </td>
                  <td className="py-1.5 px-2">{getActionBadge(sec.recommendedAction)}</td>
                  <td className="py-1.5 px-2 text-center">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onSelectSector(sec);
                      }}
                      className="px-2 py-0.5 rounded text-[8px] bg-white/10 hover:bg-[var(--gold-primary)] hover:text-black transition-all font-bold inline-flex items-center gap-0.5"
                    >
                      <span>LOCATE</span>
                      <ChevronRight className="w-2.5 h-2.5" />
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
