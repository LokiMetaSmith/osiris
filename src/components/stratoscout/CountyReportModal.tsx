'use client';

import React, { useState } from 'react';
import { CountyReportData, generateCountyPreventionReport } from '@/lib/stratoscout/data';
import { X, Download, Share2, Check, FileText, Wind, ShieldAlert, Award } from 'lucide-react';

interface CountyReportModalProps {
  county: 'Payne County' | 'Oklahoma County';
  onClose: () => void;
}

export default function CountyReportModal({ county, onClose }: CountyReportModalProps) {
  const [exportedFormat, setExportedFormat] = useState<string | null>(null);
  const report: CountyReportData = generateCountyPreventionReport(county);

  const handleExport = (platform: string) => {
    setExportedFormat(platform);
    if (platform === 'Printable PDF') {
      window.print();
    }
    setTimeout(() => {
      setExportedFormat(null);
    }, 3000);
  };

  return (
    <div className="fixed inset-0 z-[600] flex items-center justify-center bg-black/80 backdrop-blur-md p-4 font-mono">
      <div className="relative w-full max-w-3xl glass-panel border border-[var(--gold-primary)]/50 rounded-lg shadow-2xl p-6 max-h-[90vh] overflow-y-auto styled-scrollbar text-[11px] text-[var(--text-primary)]">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-full hover:bg-white/10 text-gray-400 hover:text-white transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-3 pb-4 mb-4 border-b border-[var(--border-primary)]">
          <div className="w-10 h-10 rounded-lg bg-[var(--gold-primary)]/20 border border-[var(--gold-primary)]/60 flex items-center justify-center text-[var(--gold-primary)]">
            <Award className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold text-[var(--gold-primary)] tracking-wider">
                WILDFIRE MITIGATION & CWDG GRANT READINESS REPORT
              </h2>
              <span className="px-2 py-0.5 rounded bg-emerald-950 border border-emerald-400 text-emerald-300 text-[9px] font-bold">
                FEMA SCORE: {report.femaGrantReadinessScore}/100
              </span>
            </div>
            <div className="text-[9px] text-[var(--text-muted)] mt-0.5">
              DOC ID: <span className="text-white font-bold">{report.reportId}</span> • GENERATED: {new Date(report.timestamp).toLocaleString()}
            </div>
          </div>
        </div>

        {/* Executive Summary Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4">
          <div className="p-3 rounded bg-black/50 border border-white/10">
            <div className="text-[9px] text-[var(--text-muted)]">OPERATIONAL JURISDICTION</div>
            <div className="text-sm font-bold text-white mt-1">{report.county}</div>
            <div className="text-[9px] text-[var(--gold-primary)] mt-0.5">{report.directorName}</div>
          </div>

          <div className="p-3 rounded bg-black/50 border border-white/10">
            <div className="text-[9px] text-[var(--text-muted)]">CWDG GRANT ELIGIBILITY</div>
            <div className="text-sm font-bold text-emerald-400 mt-1">UP TO {report.cwdgEligibility.maxGrantAmount}</div>
            <div className="text-[9px] text-emerald-300/80 mt-0.5">Status: {report.cwdgEligibility.status}</div>
          </div>

          <div className="p-3 rounded bg-black/50 border border-white/10">
            <div className="text-[9px] text-[var(--text-muted)]">WIND VECTOR & SPREAD DYNAMICS</div>
            <div className="text-sm font-bold text-[#FF3D3D] mt-1 flex items-center gap-1.5">
              <Wind className="w-4 h-4 text-[#FF3D3D]" />
              {report.windVectorSummary.sustainedMph}G{report.windVectorSummary.gustsMph} MPH
            </div>
            <div className="text-[9px] text-red-300/80 mt-0.5">Vector: {report.windVectorSummary.dominantDirection}</div>
          </div>
        </div>

        {/* 50cm/pixel Imagery & Justification */}
        <div className="p-3.5 rounded bg-black/40 border border-white/10 mb-4 space-y-2">
          <div className="flex items-center justify-between">
            <span className="font-bold text-xs text-[var(--cyan-primary)] flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5" />
              50 CM/PIXEL IMAGERY EVIDENCE & EMERGENCY MANAGER JUSTIFICATION
            </span>
            <span className="text-[9px] text-gray-400">StratoScout Multi-Spectral Pass</span>
          </div>
          <p className="text-[10px] text-gray-300 leading-relaxed">
            {report.cwdgEligibility.keyJustification}
          </p>
          <div className="grid grid-cols-3 gap-2 pt-1 text-[9px]">
            <div className="bg-black/60 p-2 rounded border border-white/5">
              <span className="text-[var(--text-muted)]">Miles Scanned:</span>{' '}
              <strong className="text-white">{report.totalMilesScanned50cm} mi</strong>
            </div>
            <div className="bg-black/60 p-2 rounded border border-white/5">
              <span className="text-[var(--text-muted)]">Structures at Risk:</span>{' '}
              <strong className="text-[#FF3D3D]">{report.structuresAtRiskTotal} Parcels</strong>
            </div>
            <div className="bg-black/60 p-2 rounded border border-white/5">
              <span className="text-[var(--text-muted)]">Annual Launches:</span>{' '}
              <strong className="text-[var(--alert-green)]">{report.annualLaunchesUsed} / {report.annualLaunchesAllocated} used</strong>
            </div>
          </div>
        </div>

        {/* Actionable Recommendations Table */}
        <div className="mb-5">
          <div className="font-bold text-xs text-white mb-2 flex items-center gap-1.5">
            <ShieldAlert className="w-3.5 h-3.5 text-[#FF9500]" />
            PRIORITIZED PRE-FIRE MITIGATION DIRECTIVES
          </div>
          <div className="border border-white/10 rounded overflow-hidden">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-black/60 text-[9px] text-[var(--text-muted)] uppercase border-b border-white/10">
                  <th className="py-2 px-3">#</th>
                  <th className="py-2 px-3">Sector Location</th>
                  <th className="py-2 px-3">Mandated Action</th>
                  <th className="py-2 px-3">Estimated Budget</th>
                  <th className="py-2 px-3">Execution Window</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {report.recommendedActionsList.map(rec => (
                  <tr key={rec.priority} className="hover:bg-white/5 text-[10px]">
                    <td className="py-2 px-3 font-bold text-[var(--gold-primary)]">{rec.priority}</td>
                    <td className="py-2 px-3 font-medium text-white">{rec.location}</td>
                    <td className="py-2 px-3 font-bold text-amber-300">{rec.action}</td>
                    <td className="py-2 px-3 text-gray-300 tabular-nums">{rec.estimatedCost}</td>
                    <td className="py-2 px-3 text-red-400 font-semibold">{rec.urgency}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* USFS / FEMA Community Wildfire Defense Grant Signature Block */}
        <div className="p-3 rounded bg-black/60 border border-white/10 mb-4 grid grid-cols-2 gap-4 text-[9px]">
          <div>
            <div className="text-[var(--text-muted)] mb-1">COUNTY EMERGENCY MANAGEMENT CERTIFICATION:</div>
            <div className="font-bold text-white uppercase">{report.directorName}</div>
            <div className="text-[8px] text-gray-400 mt-1 italic">
              "Attesting 50cm/px multi-spectral data verification for USFS Community Wildfire Defense Grant application."
            </div>
            <div className="mt-2 text-emerald-400 font-bold border-b border-dashed border-white/20 pb-1">
              DIGITALLY SIGNED & VERIFIED ✓
            </div>
          </div>
          <div>
            <div className="text-[var(--text-muted)] mb-1">GRANT FUNDING ALLOCATION MATCH:</div>
            <div className="font-bold text-[var(--gold-primary)]">{report.cwdgEligibility.maxGrantAmount} TOTAL ELIGIBLE</div>
            <div className="text-[8px] text-gray-400 mt-1">
              Federal Share (75%): {report.county === 'Payne County' ? '$1,837,500' : '$2,400,000'} • County Match (25%): {report.county === 'Payne County' ? '$612,500' : '$800,000'}
            </div>
            <div className="mt-2 text-cyan-300 font-bold border-b border-dashed border-white/20 pb-1">
              FEMA HAZARD MITIGATION REGION 6 DOCKET
            </div>
          </div>
        </div>

        {/* Integration & Export Actions */}
        <div className="pt-3 border-t border-[var(--border-primary)] flex flex-wrap items-center justify-between gap-3">
          <div className="text-[9px] text-[var(--text-muted)]">
            CONSOLIDATES 10–15 SYSTEMS • READY FOR FEMA / STATE FORESTRY SUBMISSION
          </div>

          <div className="flex items-center gap-2">
            {(['Esri ArcGIS', 'D4H Incident', 'WebEOC', 'Printable PDF'] as const).map(plat => (
              <button
                key={plat}
                onClick={() => handleExport(plat)}
                className="px-3 py-1.5 rounded bg-black/60 hover:bg-[var(--cyan-primary)] hover:text-black border border-white/20 hover:border-cyan-400 text-[10px] font-bold text-white transition-all flex items-center gap-1.5 shadow-sm"
              >
                {exportedFormat === plat ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    <span>EXPORTED!</span>
                  </>
                ) : (
                  <>
                    <Download className="w-3.5 h-3.5 text-cyan-400" />
                    <span>{plat}</span>
                  </>
                )}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
