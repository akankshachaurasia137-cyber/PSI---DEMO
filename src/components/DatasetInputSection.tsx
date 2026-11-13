import React from 'react';
import { Database, Play, RotateCcw, Sliders, Layers, Sparkles, AlertCircle } from 'lucide-react';
import { playClickSound } from '../utils/sound';

interface DatasetInputSectionProps {
  senderInput: string;
  receiverInput: string;
  onSenderInputChange: (val: string) => void;
  onReceiverInputChange: (val: string) => void;
  numBins: number;
  onNumBinsChange: (val: number) => void;
  onRunSimulation: () => void;
  onReset: () => void;
  senderItems: string[];
  receiverItems: string[];
  expectedIntersection: string[];
  simSpeed: number;
  onSimSpeedChange: (speed: number) => void;
}

const PRESETS = [
  {
    name: 'Fruits (Default)',
    sender: 'Apple, Banana, Mango',
    receiver: 'Banana, Cherry, Mango',
    bins: 7,
  },
  {
    name: 'Tech Giants',
    sender: 'Google, Apple, Microsoft, Amazon',
    receiver: 'Apple, Amazon, Meta, Netflix',
    bins: 8,
  },
  {
    name: 'Access Control',
    sender: 'Alice, Bob, Charlie, Dave, Eve',
    receiver: 'Bob, Dave, Frank, Grace',
    bins: 9,
  },
  {
    name: 'Disjoint Sets (0 Overlap)',
    sender: 'Red, Blue, Green',
    receiver: 'Yellow, Purple, Orange',
    bins: 7,
  },
  {
    name: 'Single Overlap',
    sender: 'Mercury, Venus, Earth, Mars',
    receiver: 'Earth, Jupiter, Saturn, Uranus',
    bins: 8,
  },
];

export const DatasetInputSection: React.FC<DatasetInputSectionProps> = ({
  senderInput,
  receiverInput,
  onSenderInputChange,
  onReceiverInputChange,
  numBins,
  onNumBinsChange,
  onRunSimulation,
  onReset,
  senderItems,
  receiverItems,
  expectedIntersection,
  simSpeed,
  onSimSpeedChange,
}) => {
  const loadPreset = (preset: typeof PRESETS[0]) => {
    playClickSound();
    onSenderInputChange(preset.sender);
    onReceiverInputChange(preset.receiver);
    onNumBinsChange(preset.bins);
  };

  return (
    <section id="datasets" className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-cyan-400 mb-1">
            <Database className="w-3.5 h-3.5" />
            <span>Section 1 · Private Inputs</span>
          </div>
          <h2 className="text-2xl font-bold text-white tracking-tight">
            Dataset Configuration & Party Allocation
          </h2>
          <p className="text-sm text-slate-400 mt-1 max-w-2xl">
            Each party enters their private dataset. Neither party reveals their list to the other.
            The Chase–Miao protocol will discover only the items in common.
          </p>
        </div>

        {/* Preset Selector */}
        <div className="flex items-center flex-wrap gap-1.5">
          <span className="text-xs text-slate-400 mr-1 flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-cyan-400" /> Presets:
          </span>
          {PRESETS.map((p) => (
            <button
              key={p.name}
              onClick={() => loadPreset(p)}
              className="px-2.5 py-1 text-xs rounded-md bg-slate-900 border border-slate-800 hover:border-cyan-500/50 text-slate-300 hover:text-white transition-colors"
            >
              {p.name}
            </button>
          ))}
        </div>
      </div>

      {/* Grid of Two Parties */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Party A: Sender */}
        <div className="relative rounded-xl border border-cyan-500/20 bg-slate-900/60 backdrop-blur-md p-5 shadow-lg shadow-cyan-950/20">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div className="flex items-center gap-2.5">
              <span className="w-6 h-6 rounded-md bg-cyan-500/20 text-cyan-400 font-mono text-xs font-bold flex items-center justify-center border border-cyan-500/30">
                A
              </span>
              <div>
                <h3 className="text-sm font-semibold text-white">Sender (Party A)</h3>
                <p className="text-xs text-slate-400">Uses Cuckoo Hashing (1 item max per bin)</p>
              </div>
            </div>
            <div className="flex items-center gap-2 text-xs text-slate-400">
              <span>Elements:</span>
              <span className="font-mono font-bold text-cyan-300 px-2 py-0.5 rounded bg-cyan-950/80 border border-cyan-800/60">
                {senderItems.length}
              </span>
            </div>
          </div>

          <div className="mt-4 space-y-3">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                Comma-separated items:
              </label>
              <input
                type="text"
                value={senderInput}
                onChange={(e) => onSenderInputChange(e.target.value)}
                placeholder="e.g. Apple, Banana, Mango"
                className="w-full px-3 py-2 text-sm bg-slate-950/80 border border-slate-800 rounded-lg text-slate-100 placeholder:text-slate-600 focus:outline-none focus:border-cyan-500 transition-colors font-mono"
              />
            </div>

            {/* Render items chips */}
            <div className="flex flex-wrap gap-1.5 min-h-[30px] items-center">
              {senderItems.length === 0 ? (
                <span className="text-xs text-slate-600 italic">No elements entered</span>
              ) : (
                senderItems.map((item, idx) => (
                  <span
                    key={idx}
                    className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-cyan-950/60 text-cyan-300 border border-cyan-800/50"
                  >
                    {item}
                  </span>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Party B: Receiver */}
        <div className="relative rounded-xl border border-violet-500/20 bg-slate-900/60 backdrop-blur-md p-5 shadow-lg shadow-violet-950/20">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div className="flex items-center gap-2.5">
              <span className="w-6 h-6 rounded-md bg-violet-500/20 text-violet-400 font-mono text-xs font-bold flex items-center justify-center border border-violet-500/30">
                B
              </span>
              <div>
                <h3 className="text-sm font-semibold text-white">Receiver (Party B)</h3>
                <p className="text-xs text-slate-400">Uses Simple Hashing (copied into 3 bins)</p>
              </div>
            </div>
            <div className="flex items-center gap-2 text-xs text-slate-400">
              <span>Elements:</span>
              <span className="font-mono font-bold text-violet-300 px-2 py-0.5 rounded bg-violet-950/80 border border-violet-800/60">
                {receiverItems.length}
              </span>
            </div>
          </div>

          <div className="mt-4 space-y-3">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                Comma-separated items:
              </label>
              <input
                type="text"
                value={receiverInput}
                onChange={(e) => onReceiverInputChange(e.target.value)}
                placeholder="e.g. Banana, Cherry, Mango"
                className="w-full px-3 py-2 text-sm bg-slate-950/80 border border-slate-800 rounded-lg text-slate-100 placeholder:text-slate-600 focus:outline-none focus:border-violet-500 transition-colors font-mono"
              />
            </div>

            {/* Render items chips */}
            <div className="flex flex-wrap gap-1.5 min-h-[30px] items-center">
              {receiverItems.length === 0 ? (
                <span className="text-xs text-slate-600 italic">No elements entered</span>
              ) : (
                receiverItems.map((item, idx) => (
                  <span
                    key={idx}
                    className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-violet-950/60 text-violet-300 border border-violet-800/50"
                  >
                    {item}
                  </span>
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Control Strip & Bin Config */}
      <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-4 flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Bin Count Slider & Formula */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-4 w-full md:w-auto">
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-cyan-400" />
            <span className="text-xs font-medium text-slate-300">Total Bins (B):</span>
            <span className="font-mono text-sm font-bold text-cyan-300 bg-slate-900 px-2 py-0.5 rounded border border-slate-800">
              {numBins}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <input
              type="range"
              min={Math.max(5, senderItems.length + 1)}
              max={14}
              value={numBins}
              onChange={(e) => onNumBinsChange(Number(e.target.value))}
              className="w-32 accent-cyan-400 cursor-pointer"
            />
            <span className="text-[11px] text-slate-500 font-mono">
              (Capacity: {(senderItems.length / numBins * 100).toFixed(0)}% load)
            </span>
          </div>
        </div>

        {/* Expected Intersection Ground Truth Indicator */}
        <div className="flex items-center gap-2 text-xs bg-slate-900/90 border border-slate-800 px-3 py-1.5 rounded-lg">
          <span className="text-slate-400">Ground Truth Intersection:</span>
          {expectedIntersection.length > 0 ? (
            <div className="flex items-center gap-1">
              {expectedIntersection.map((item) => (
                <span
                  key={item}
                  className="px-1.5 py-0.5 rounded bg-emerald-950/80 text-emerald-300 border border-emerald-800/60 font-mono font-semibold text-[11px]"
                >
                  {item}
                </span>
              ))}
            </div>
          ) : (
            <span className="text-slate-500 italic">Ø (Empty set - 0 common items)</span>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 w-full md:w-auto justify-end">
          <button
            onClick={() => {
              onReset();
              playClickSound();
            }}
            className="px-3 py-2 text-xs font-medium text-slate-300 hover:text-white bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded-lg transition-colors flex items-center gap-1.5"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset</span>
          </button>
          <button
            onClick={() => {
              onRunSimulation();
              playClickSound();
            }}
            className="px-4 py-2 text-xs font-semibold text-slate-950 bg-gradient-to-r from-cyan-400 to-blue-400 hover:from-cyan-300 hover:to-blue-300 rounded-lg shadow-md shadow-cyan-500/20 transition-all flex items-center gap-1.5 active:scale-95"
          >
            <Play className="w-3.5 h-3.5 fill-current" />
            <span>Run Simulation</span>
          </button>
        </div>
      </div>
    </section>
  );
};
