'use client';

import React from 'react';
import { Play, RotateCcw, ChevronRight, CheckCircle2, ShieldCheck, Flame, Rocket } from 'lucide-react';

interface PitchWalkthroughControllerProps {
  currentStep: number; // 0 (inactive), 1, 2, 3
  onStepChange: (step: number) => void;
  onReset: () => void;
}

export default function PitchWalkthroughController({
  currentStep,
  onStepChange,
  onReset,
}: PitchWalkthroughControllerProps) {
  const steps = [
    {
      num: 1,
      title: 'High-Risk Wind Warning Trigger',
      desc: 'Red Flag conditions trigger an autonomous on-demand glider launch from OAIRE Stillwater.',
      badge: 'Step 1: Weather Window',
    },
    {
      num: 2,
      title: '100-Mile 50cm/px Scanning Pass',
      desc: 'Glider traverses prevailing wind corridor, capturing sub-meter imagery of fuel loads and firebreaks.',
      badge: 'Step 2: Aerial Data Pipeline',
    },
    {
      num: 3,
      title: 'Triage Priority & Export Report',
      desc: 'Emergency manager clicks red priority zone and exports 1-click FEMA/CWDG mitigation report.',
      badge: 'Step 3: Actionable Intelligence',
    },
  ];

  return (
    <div className="glass-panel p-3.5 max-w-lg w-full border border-[var(--gold-primary)]/40 shadow-2xl font-mono text-[11px] text-[var(--text-primary)]">
      <div className="flex items-center justify-between pb-2 mb-2.5 border-b border-[var(--border-primary)]">
        <div className="flex items-center gap-2">
          <Play className="w-4 h-4 text-[var(--gold-primary)]" />
          <span className="font-bold text-xs tracking-wider text-[var(--gold-primary)] uppercase">
            60-Second Judge Pitch Walkthrough
          </span>
        </div>
        <div className="flex items-center gap-2">
          {currentStep > 0 && (
            <button
              onClick={onReset}
              className="text-[9px] px-2 py-0.5 rounded bg-white/10 hover:bg-white/20 text-gray-300 flex items-center gap-1 transition-all"
            >
              <RotateCcw className="w-2.5 h-2.5" />
              <span>RESET</span>
            </button>
          )}
          <span className="text-[9px] px-1.5 py-0.5 rounded bg-amber-500/20 border border-amber-500/40 text-amber-300 font-bold">
            {currentStep === 0 ? 'READY' : `STEP ${currentStep} / 3`}
          </span>
        </div>
      </div>

      {/* Step progression pill tracks */}
      <div className="grid grid-cols-3 gap-2 mb-3">
        {steps.map(s => {
          const isActive = currentStep === s.num;
          const isDone = currentStep > s.num;
          return (
            <button
              key={s.num}
              onClick={() => onStepChange(s.num)}
              className={`p-2 rounded text-left transition-all border ${
                isActive
                  ? 'bg-[var(--gold-primary)]/20 border-[var(--gold-primary)] shadow-md text-white'
                  : isDone
                  ? 'bg-emerald-950/40 border-emerald-500/50 text-emerald-300'
                  : 'bg-black/40 border-white/10 text-gray-400 hover:border-white/30'
              }`}
            >
              <div className="flex items-center justify-between text-[8px] mb-1">
                <span className="font-bold uppercase tracking-wider">{s.badge}</span>
                {isDone && <CheckCircle2 className="w-3 h-3 text-emerald-400" />}
              </div>
              <div className="text-[9px] font-bold leading-tight">{s.title}</div>
            </button>
          );
        })}
      </div>

      {/* Active Step Details */}
      {currentStep > 0 ? (
        <div className="p-2.5 rounded bg-black/60 border border-white/10 mb-3 space-y-1.5">
          <div className="text-white font-bold text-xs flex items-center gap-2">
            <span className="w-5 h-5 rounded-full bg-[var(--gold-primary)] text-black flex items-center justify-center font-extrabold text-[10px]">
              {currentStep}
            </span>
            <span>{steps[currentStep - 1].title}</span>
          </div>
          <p className="text-[10px] text-gray-300 leading-relaxed">
            {steps[currentStep - 1].desc}
          </p>
        </div>
      ) : (
        <div className="p-2 rounded bg-black/40 border border-white/5 mb-3 text-[10px] text-gray-400">
          Click <strong>Start 60-Second Demo</strong> to showcase how aircraft imagery translates into actionable emergency management mitigation.
        </div>
      )}

      {/* Next Step / Trigger Button */}
      <div className="flex justify-end gap-2">
        {currentStep === 0 ? (
          <button
            onClick={() => onStepChange(1)}
            className="w-full py-2 px-3 rounded bg-gradient-to-r from-amber-500 to-yellow-600 hover:from-amber-600 hover:to-yellow-700 text-black font-extrabold text-[10px] tracking-wider transition-all flex items-center justify-center gap-1.5 shadow-lg"
          >
            <Play className="w-3.5 h-3.5 fill-black" />
            <span>START 60-SECOND JUDGE DEMO</span>
          </button>
        ) : currentStep < 3 ? (
          <button
            onClick={() => onStepChange(currentStep + 1)}
            className="w-full py-2 px-3 rounded bg-[var(--cyan-primary)] hover:bg-[var(--cyan-primary)]/80 text-black font-extrabold text-[10px] tracking-wider transition-all flex items-center justify-center gap-1.5 shadow-lg"
          >
            <span>PROCEED TO STEP {currentStep + 1}</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        ) : (
          <button
            onClick={onReset}
            className="w-full py-2 px-3 rounded bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-[10px] tracking-wider transition-all flex items-center justify-center gap-1.5 shadow-lg"
          >
            <ShieldCheck className="w-4 h-4" />
            <span>DEMO COMPLETE • RESET SEQUENCE</span>
          </button>
        )}
      </div>
    </div>
  );
}
