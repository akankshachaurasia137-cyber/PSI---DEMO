import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  ArrowRight,
  Play,
  Pause,
  SkipForward,
  SkipBack,
  RotateCcw,
  AlertTriangle,
  CheckCircle,
  HelpCircle,
  Zap,
} from 'lucide-react';
import { CuckooResult, EvictionStep, CuckooBin } from '../types/psi';
import { playBinDropSound, playEvictSound, playClickSound } from '../utils/sound';

interface CuckooSenderSectionProps {
  cuckooResult: CuckooResult;
  numBins: number;
  highlightedBin: number | null;
  onHoverBin: (bin: number | null) => void;
}

export const CuckooSenderSection: React.FC<CuckooSenderSectionProps> = ({
  cuckooResult,
  numBins,
  highlightedBin,
  onHoverBin,
}) => {
  const { steps, bins: finalBins, stash, success } = cuckooResult;

  // Step replay state (0 = start, steps.length = final)
  const [currentStepIndex, setCurrentStepIndex] = useState<number>(steps.length);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1000); // ms per step

  // Auto playback effect
  useEffect(() => {
    let timer: NodeJS.Timeout | null = null;
    if (isPlaying) {
      timer = setInterval(() => {
        setCurrentStepIndex((prev) => {
          if (prev >= steps.length) {
            setIsPlaying(false);
            return steps.length;
          }
          const next = prev + 1;
          const currentStep = steps[prev];
          if (currentStep?.action === 'evict') {
            playEvictSound();
          } else {
            playBinDropSound();
          }
          return next;
        });
      }, playbackSpeed);
    }
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [isPlaying, playbackSpeed, steps]);

  // Compute intermediate state of bins based on currentStepIndex
  const currentBins: CuckooBin[] = Array.from({ length: numBins }, (_, i) => ({
    index: i,
    item: null,
  }));

  // Replay steps up to currentStepIndex
  for (let i = 0; i < currentStepIndex && i < steps.length; i++) {
    const s = steps[i];
    if (s.action === 'insert' || s.action === 'success') {
      currentBins[s.toBin].item = s.item;
      currentBins[s.toBin].candidateIndices = s.candidateBins;
    } else if (s.action === 'evict') {
      currentBins[s.toBin].item = s.item;
      currentBins[s.toBin].candidateIndices = s.candidateBins;
      currentBins[s.toBin].isEvictedThisStep = true;
    }
  }

  const activeStep: EvictionStep | undefined =
    currentStepIndex > 0 ? steps[currentStepIndex - 1] : undefined;

  const handleStepForward = () => {
    if (currentStepIndex < steps.length) {
      const nextStep = steps[currentStepIndex];
      if (nextStep?.action === 'evict') {
        playEvictSound();
      } else {
        playBinDropSound();
      }
      setCurrentStepIndex((prev) => prev + 1);
    }
  };

  const handleStepBack = () => {
    playClickSound();
    if (currentStepIndex > 0) {
      setCurrentStepIndex((prev) => prev - 1);
    }
  };

  const handleJumpToStart = () => {
    playClickSound();
    setIsPlaying(false);
    setCurrentStepIndex(0);
  };

  const handleJumpToEnd = () => {
    playClickSound();
    setIsPlaying(false);
    setCurrentStepIndex(steps.length);
  };

  return (
    <section id="cuckoo-sender" className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-cyan-400 mb-1">
            <Zap className="w-3.5 h-3.5" />
            <span>Section 3 · Sender Binning</span>
          </div>
          <h2 className="text-2xl font-bold text-white tracking-tight">
            Cuckoo Hashing: Party A Insertion & Evictions
          </h2>
          <p className="text-sm text-slate-400 mt-1 max-w-2xl">
            In Cuckoo hashing, each bin holds <strong>at most one item</strong>. If a candidate bin
            is already occupied, the new item kicks out the incumbent, forcing it to relocate to one
            of its alternative candidate bins.
          </p>
        </div>

        {/* Step-by-Step Replay Controller */}
        <div className="flex items-center gap-2 bg-slate-900 border border-slate-800 p-1.5 rounded-lg">
          <button
            onClick={handleJumpToStart}
            title="Beginning"
            className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded transition-colors"
          >
            <SkipBack className="w-4 h-4" />
          </button>
          <button
            onClick={handleStepBack}
            disabled={currentStepIndex === 0}
            title="Step Back"
            className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 disabled:opacity-30 rounded transition-colors"
          >
            <ArrowRight className="w-4 h-4 rotate-180" />
          </button>
          <button
            onClick={() => {
              playClickSound();
              setIsPlaying(!isPlaying);
            }}
            className="px-3 py-1 bg-cyan-500/20 text-cyan-300 hover:bg-cyan-500/30 border border-cyan-500/40 rounded flex items-center gap-1 text-xs font-medium transition-colors"
          >
            {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5 fill-current" />}
            <span>{isPlaying ? 'Pause' : 'Play'}</span>
          </button>
          <button
            onClick={handleStepForward}
            disabled={currentStepIndex >= steps.length}
            title="Step Forward"
            className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 disabled:opacity-30 rounded transition-colors"
          >
            <ArrowRight className="w-4 h-4" />
          </button>
          <button
            onClick={handleJumpToEnd}
            title="Jump to Final State"
            className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded transition-colors"
          >
            <SkipForward className="w-4 h-4" />
          </button>

          <div className="h-4 w-px bg-slate-800 mx-1" />

          <span className="text-[11px] font-mono text-slate-400 px-1">
            Step {currentStepIndex}/{steps.length}
          </span>
        </div>
      </div>

      {/* Active Step Banner */}
      {activeStep && (
        <div
          className={`p-3 rounded-lg border text-xs flex items-center justify-between transition-all ${
            activeStep.action === 'evict'
              ? 'bg-amber-950/40 border-amber-600/50 text-amber-200'
              : activeStep.action === 'relocate'
              ? 'bg-blue-950/40 border-blue-600/50 text-blue-200'
              : activeStep.action === 'stash'
              ? 'bg-rose-950/40 border-rose-600/50 text-rose-200'
              : 'bg-cyan-950/40 border-cyan-600/50 text-cyan-200'
          }`}
        >
          <div className="flex items-center gap-2">
            <span
              className={`px-2 py-0.5 rounded font-mono font-bold text-[10px] uppercase border ${
                activeStep.action === 'evict'
                  ? 'bg-amber-900 border-amber-500 text-amber-100'
                  : activeStep.action === 'relocate'
                  ? 'bg-blue-900 border-blue-500 text-blue-100'
                  : 'bg-cyan-900 border-cyan-500 text-cyan-100'
              }`}
            >
              {activeStep.action}
            </span>
            <span className="font-semibold">{activeStep.description}</span>
          </div>

          <span className="font-mono text-[11px] text-slate-400">
            Target Bin: {activeStep.toBin}
          </span>
        </div>
      )}

      {/* Grid of Bins */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-3">
        {currentBins.map((bin) => {
          const isTargeted = activeStep?.toBin === bin.index;
          const isHighlighted = highlightedBin === bin.index;
          const hasItem = bin.item !== null;

          return (
            <div
              key={bin.index}
              onMouseEnter={() => onHoverBin(bin.index)}
              onMouseLeave={() => onHoverBin(null)}
              className={`relative rounded-xl border p-3 flex flex-col justify-between min-h-[130px] transition-all duration-200 cursor-pointer ${
                isTargeted
                  ? 'border-cyan-400 bg-cyan-950/60 shadow-[0_0_15px_rgba(6,182,212,0.3)] scale-[1.02]'
                  : isHighlighted
                  ? 'border-cyan-500/70 bg-slate-900/90'
                  : hasItem
                  ? 'border-cyan-500/30 bg-slate-900/70 hover:border-cyan-500/50'
                  : 'border-slate-800/80 bg-slate-950/40 hover:border-slate-700'
              }`}
            >
              {/* Bin Header */}
              <div className="flex items-center justify-between text-xs border-b border-slate-800/60 pb-1.5">
                <span className="font-mono font-bold text-slate-400">
                  Bin #{bin.index}
                </span>
                <span
                  className={`text-[10px] font-mono px-1.5 py-0.5 rounded ${
                    hasItem
                      ? 'bg-cyan-950 text-cyan-300 border border-cyan-800/60'
                      : 'text-slate-600 bg-slate-900'
                  }`}
                >
                  {hasItem ? '1 / 1' : '0 / 1'}
                </span>
              </div>

              {/* Occupant Content */}
              <div className="my-auto py-2 flex flex-col items-center justify-center text-center">
                {hasItem ? (
                  <div className="space-y-1">
                    <span className="inline-block px-2.5 py-1 rounded-md text-xs font-semibold bg-cyan-500/20 text-cyan-200 border border-cyan-500/40 shadow-sm">
                      {bin.item}
                    </span>
                    {bin.candidateIndices && (
                      <div className="text-[10px] text-slate-400 font-mono">
                        Slots: [{bin.candidateIndices.join(', ')}]
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-slate-600 text-xs italic flex flex-col items-center">
                    <span>Empty Slot</span>
                  </div>
                )}
              </div>

              {/* Status footer */}
              <div className="text-[10px] text-center pt-1 border-t border-slate-800/40 font-mono text-slate-500">
                {hasItem ? 'Holds at most 1' : 'Available'}
              </div>
            </div>
          );
        })}
      </div>

      {/* Activity Log and Stash Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Placement Activity Log */}
        <div className="lg:col-span-2 rounded-xl border border-slate-800 bg-slate-900/60 p-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-white">Cuckoo Activity Log</span>
              <span className="text-[11px] text-slate-400 font-mono">({steps.length} total operations)</span>
            </div>
            <span className="text-[11px] text-slate-500">Step replay updates above live</span>
          </div>

          <div className="mt-3 space-y-1.5 max-h-48 overflow-y-auto pr-2 font-mono text-xs">
            {steps.map((step, idx) => {
              const isCurrent = idx === currentStepIndex - 1;
              return (
                <div
                  key={step.stepNumber}
                  onClick={() => {
                    playClickSound();
                    setCurrentStepIndex(idx + 1);
                  }}
                  className={`p-2 rounded cursor-pointer transition-colors flex items-center justify-between ${
                    isCurrent
                      ? 'bg-cyan-950/70 border border-cyan-500/50 text-cyan-200'
                      : 'hover:bg-slate-800/60 text-slate-300'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <span className="text-slate-500 text-[10px] w-6">#{step.stepNumber}</span>
                    <span
                      className={`px-1.5 py-0.5 rounded text-[10px] font-bold uppercase ${
                        step.action === 'evict'
                          ? 'bg-amber-950 text-amber-300 border border-amber-800'
                          : step.action === 'relocate'
                          ? 'bg-blue-950 text-blue-300 border border-blue-800'
                          : step.action === 'stash'
                          ? 'bg-rose-950 text-rose-300 border border-rose-800'
                          : 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                      }`}
                    >
                      {step.action}
                    </span>
                    <span className="text-slate-200">{step.description}</span>
                  </div>
                  <span className="text-slate-500 text-[11px] shrink-0">
                    Bin {step.toBin}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Cuckoo Stash & Failure Handling Panel */}
        <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <span className="text-xs font-semibold text-white">Cuckoo Stash & Integrity</span>
              <span
                className={`text-[10px] font-mono px-2 py-0.5 rounded font-bold ${
                  success
                    ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                    : 'bg-rose-950 text-rose-300 border border-rose-800'
                }`}
              >
                {success ? 'PASS (0 Stashed)' : 'FAIL (Items in Stash)'}
              </span>
            </div>

            <div className="mt-3 space-y-3 text-xs">
              {stash.length === 0 ? (
                <div className="p-3 rounded-lg bg-emerald-950/30 border border-emerald-800/40 text-emerald-200 flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold">All elements placed cleanly</p>
                    <p className="text-[11px] text-emerald-400/80 mt-0.5">
                      No cycles detected. The stash is empty, preserving linear protocol efficiency.
                    </p>
                  </div>
                </div>
              ) : (
                <div className="p-3 rounded-lg bg-rose-950/40 border border-rose-800/50 text-rose-200 space-y-2">
                  <div className="flex items-center gap-1.5 font-bold text-rose-300">
                    <AlertTriangle className="w-4 h-4" />
                    <span>Eviction Cycle Limit Exceeded</span>
                  </div>
                  <p className="text-[11px] text-rose-300/90">
                    The following items could not find a free slot without exceeding the eviction limit:
                  </p>
                  <div className="flex flex-wrap gap-1 font-mono">
                    {stash.map((it) => (
                      <span key={it} className="px-2 py-0.5 rounded bg-rose-900 text-rose-100 font-bold">
                        {it}
                      </span>
                    ))}
                  </div>
                  <p className="text-[11px] text-slate-400">
                    Tip: Increase total bins <span className="font-mono text-cyan-300">(B)</span> in Section 1 to lower the hash load factor.
                  </p>
                </div>
              )}

              <div className="p-2.5 rounded bg-slate-950/70 border border-slate-800 text-[11px] text-slate-400">
                <span className="text-slate-300 font-semibold">Why Cuckoo Hashing?</span> In Chase–Miao PSI, Party A is restricted to at most 1 item per bin. This bounds the number of comparisons per bin to exactly 1!
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
