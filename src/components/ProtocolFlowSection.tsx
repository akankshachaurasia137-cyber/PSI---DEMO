import React, { useState } from 'react';
import {
  Workflow,
  ArrowRight,
  ShieldAlert,
  ShieldCheck,
  Lock,
  Unlock,
  Key,
  CheckCircle2,
  Sparkles,
  Send,
  EyeOff,
  Cpu,
  Layers,
  ChevronRight,
} from 'lucide-react';
import { ProtocolPhase, BinComparison, CuckooResult, SimpleResult } from '../types/psi';
import { playClickSound, playMatchSuccessSound } from '../utils/sound';

interface ProtocolFlowSectionProps {
  currentPhase: ProtocolPhase;
  onSetPhase: (phase: ProtocolPhase) => void;
  binComparisons: BinComparison[];
  intersection: string[];
  senderSecretKey: string;
  senderItems: string[];
  receiverItems: string[];
  numBins: number;
}

const PHASES = [
  {
    id: 1 as ProtocolPhase,
    num: '01',
    name: 'Binning & Hash Alignment',
    summary: 'Sender Cuckoo (≤1/bin) vs Receiver Simple (3-copies/bin)',
    partyRole: 'Both Parties independently hash inputs to B bins',
  },
  {
    id: 2 as ProtocolPhase,
    num: '02',
    name: 'Receiver Blinding & Query',
    summary: 'Receiver blinds each item: Y = r · H(y) and sends to Sender',
    partyRole: 'Receiver → Sender over secure network channel',
  },
  {
    id: 3 as ProtocolPhase,
    num: '03',
    name: 'Sender Evaluation & PRF',
    summary: 'Sender applies secret key k: Z = k · Y and sends PA = Hash(k · H(x))',
    partyRole: 'Sender → Receiver with evaluated group tokens',
  },
  {
    id: 4 as ProtocolPhase,
    num: '04',
    name: 'Unblinding & Match',
    summary: 'Receiver unblinds PB = r⁻¹ · Z = k · H(y) and checks PA == PB',
    partyRole: 'Receiver discovers intersection with 0 leakage',
  },
];

export const ProtocolFlowSection: React.FC<ProtocolFlowSectionProps> = ({
  currentPhase,
  onSetPhase,
  binComparisons,
  intersection,
  senderSecretKey,
  senderItems,
  receiverItems,
  numBins,
}) => {
  const [selectedBinIndex, setSelectedBinIndex] = useState<number>(0);

  const selectedBin = binComparisons[selectedBinIndex] || binComparisons[0];

  const handlePhaseChange = (phase: ProtocolPhase) => {
    playClickSound();
    onSetPhase(phase);
    if (phase === 4 && intersection.length > 0) {
      playMatchSuccessSound();
    }
  };

  return (
    <section id="protocol-flow" className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-cyan-400 mb-1">
            <Workflow className="w-3.5 h-3.5" />
            <span>Section 5 · Chase–Miao Protocol Execution</span>
          </div>
          <h2 className="text-2xl font-bold text-white tracking-tight">
            Four-Phase Interactive Cryptographic Flow
          </h2>
          <p className="text-sm text-slate-400 mt-1 max-w-2xl">
            Step through how Oblivious Pseudo-Random Functions (OPRF) and homomorphic blinding enable
            intersection discovery without leaking non-common elements.
          </p>
        </div>

        {/* Phase progress buttons */}
        <div className="flex items-center gap-2">
          {currentPhase < 4 && (
            <button
              onClick={() => handlePhaseChange((currentPhase + 1) as ProtocolPhase)}
              className="px-3.5 py-1.5 text-xs font-semibold text-slate-950 bg-cyan-400 hover:bg-cyan-300 rounded-lg flex items-center gap-1.5 shadow-md shadow-cyan-500/20 transition-all active:scale-95"
            >
              <span>Next Phase</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* 4-Phase Stepper Ribbon */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {PHASES.map((p) => {
          const isActive = currentPhase === p.id;
          const isPassed = currentPhase > p.id;

          return (
            <button
              key={p.id}
              onClick={() => handlePhaseChange(p.id)}
              className={`p-4 rounded-xl border text-left transition-all relative overflow-hidden flex flex-col justify-between ${
                isActive
                  ? 'bg-slate-900 border-cyan-400 shadow-[0_0_20px_rgba(6,182,212,0.2)] scale-[1.01]'
                  : isPassed
                  ? 'bg-slate-950/80 border-cyan-900/40 hover:border-cyan-700/60'
                  : 'bg-slate-950/40 border-slate-800 hover:border-slate-700 opacity-70'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="font-mono text-xs font-bold text-slate-500">
                  PHASE {p.num}
                </span>
                {isPassed ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                ) : isActive ? (
                  <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
                ) : (
                  <span className="w-2 h-2 rounded-full bg-slate-700" />
                )}
              </div>

              <div>
                <h3
                  className={`text-sm font-bold ${
                    isActive ? 'text-cyan-300' : 'text-slate-200'
                  }`}
                >
                  {p.name}
                </h3>
                <p className="text-[11px] text-slate-400 mt-1 line-clamp-2">
                  {p.summary}
                </p>
              </div>

              <div className="mt-3 pt-2 border-t border-slate-800/80 text-[10px] font-mono text-slate-500">
                {p.partyRole}
              </div>
            </button>
          );
        })}
      </div>

      {/* Interactive Phase Sandbox Canvas */}
      <div className="rounded-xl border border-cyan-500/30 bg-slate-900/70 backdrop-blur-md p-6 shadow-xl">
        {/* Phase 1: Binning & Hash Alignment */}
        {currentPhase === 1 && (
          <div className="space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <div>
                <span className="text-xs font-mono font-semibold text-cyan-400">Phase 01</span>
                <h3 className="text-lg font-bold text-white">Input Binning & Hash Alignment</h3>
                <p className="text-xs text-slate-400">
                  Each party executes their hashing locally before any network communication occurs.
                </p>
              </div>
              <span className="px-2.5 py-1 rounded bg-slate-800 text-slate-300 font-mono text-xs">
                Zero Network Communication
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Sender Role */}
              <div className="p-4 rounded-xl bg-slate-950/80 border border-cyan-900/40 space-y-3">
                <div className="flex items-center gap-2">
                  <span className="w-6 h-6 rounded bg-cyan-500/20 text-cyan-400 font-bold font-mono text-xs flex items-center justify-center">
                    A
                  </span>
                  <span className="text-sm font-semibold text-white">Sender Procedure (Cuckoo)</span>
                </div>
                <ul className="text-xs text-slate-300 space-y-2 list-disc list-inside">
                  <li>Takes dataset <span className="font-mono text-cyan-300">[{senderItems.join(', ')}]</span></li>
                  <li>Calculates candidates <span className="font-mono text-slate-400">[h₁(x), h₂(x), h₃(x)]</span></li>
                  <li>Places each element in <strong>exactly 1 bin</strong> using Cuckoo eviction rules</li>
                  <li>Guarantee: Each bin has at most 1 item (<span className="text-emerald-400 font-semibold">≤ 1 element/bin</span>)</li>
                </ul>
              </div>

              {/* Receiver Role */}
              <div className="p-4 rounded-xl bg-slate-950/80 border border-violet-900/40 space-y-3">
                <div className="flex items-center gap-2">
                  <span className="w-6 h-6 rounded bg-violet-500/20 text-violet-400 font-bold font-mono text-xs flex items-center justify-center">
                    B
                  </span>
                  <span className="text-sm font-semibold text-white">Receiver Procedure (Simple)</span>
                </div>
                <ul className="text-xs text-slate-300 space-y-2 list-disc list-inside">
                  <li>Takes dataset <span className="font-mono text-violet-300">[{receiverItems.join(', ')}]</span></li>
                  <li>Calculates candidates <span className="font-mono text-slate-400">[h₁(y), h₂(y), h₃(y)]</span></li>
                  <li>Places a copy of each element into <strong>all 3 candidate bins</strong></li>
                  <li>Guarantee: If <span className="font-mono text-emerald-300">x = y</span>, they are guaranteed to meet in item&apos;s active bin</li>
                </ul>
              </div>
            </div>

            <div className="p-3 rounded-lg bg-cyan-950/30 border border-cyan-800/40 text-xs text-cyan-200 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-cyan-400 shrink-0" />
              <span>
                <strong>Outcome:</strong> Instead of performing a huge <span className="font-mono">O(n × m)</span> all-pairs comparison, the problem is now divided into <span className="font-mono text-cyan-300">{numBins}</span> independent tiny comparisons!
              </span>
            </div>
          </div>
        )}

        {/* Phase 2: Receiver Blinding */}
        {currentPhase === 2 && (
          <div className="space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <div>
                <span className="text-xs font-mono font-semibold text-violet-400">Phase 02</span>
                <h3 className="text-lg font-bold text-white">Receiver Cryptographic Blinding</h3>
                <p className="text-xs text-slate-400">
                  Receiver masks every element with an ephemeral random blinding scalar before transmission.
                </p>
              </div>
              <span className="px-2.5 py-1 rounded bg-violet-950/80 text-violet-300 border border-violet-800/60 font-mono text-xs flex items-center gap-1.5">
                <Send className="w-3.5 h-3.5" /> Payload: Receiver → Sender
              </span>
            </div>

            {/* Network Channel Pipeline Animation */}
            <div className="relative rounded-xl bg-slate-950 border border-slate-800 p-6 flex flex-col md:flex-row items-center justify-between gap-6">
              {/* Receiver (Source) */}
              <div className="w-full md:w-56 p-4 rounded-lg bg-violet-950/40 border border-violet-800/50 text-center space-y-2">
                <span className="text-xs font-bold text-violet-300">Receiver (Party B)</span>
                <div className="font-mono text-[11px] text-slate-300 bg-slate-900 p-2 rounded border border-slate-800">
                  Y = r · H(y)
                </div>
                <div className="text-[10px] text-slate-400">
                  Random scalar <span className="font-mono text-violet-300">r ∈ ℤ*q</span> masks element
                </div>
              </div>

              {/* Secure Network Wire */}
              <div className="flex-1 flex flex-col items-center justify-center space-y-2 w-full">
                <div className="w-full flex items-center justify-center gap-3">
                  <span className="h-0.5 flex-1 bg-gradient-to-r from-violet-500 via-cyan-400 to-cyan-500" />
                  <div className="px-3 py-1 rounded-full bg-cyan-950 text-cyan-300 border border-cyan-800 text-xs font-mono flex items-center gap-1.5 animate-pulse shadow-[0_0_12px_rgba(6,182,212,0.4)]">
                    <Lock className="w-3.5 h-3.5" />
                    <span>Blinded Points: [Y₁, Y₂, ..., Yₘ]</span>
                  </div>
                  <span className="h-0.5 flex-1 bg-gradient-to-r from-cyan-400 via-cyan-500 to-blue-500" />
                </div>
                <span className="text-[10px] font-mono text-slate-500">
                  Information-theoretically hidden: Sender cannot invert Y to obtain y
                </span>
              </div>

              {/* Sender (Destination) */}
              <div className="w-full md:w-56 p-4 rounded-lg bg-cyan-950/40 border border-cyan-800/50 text-center space-y-2">
                <span className="text-xs font-bold text-cyan-300">Sender (Party A)</span>
                <div className="font-mono text-[11px] text-slate-300 bg-slate-900 p-2 rounded border border-slate-800">
                  Receives Y
                </div>
                <div className="text-[10px] text-slate-400">
                  Learns zero information about Receiver&apos;s elements
                </div>
              </div>
            </div>

            {/* Blinding Security Math Note */}
            <div className="p-3 rounded-lg bg-slate-950/80 border border-slate-800 text-xs space-y-1 text-slate-300">
              <div className="flex items-center gap-2 font-semibold text-white">
                <EyeOff className="w-4 h-4 text-violet-400" />
                <span>Zero-Knowledge Privacy Proof:</span>
              </div>
              <p className="text-slate-400 leading-relaxed">
                Because <span className="font-mono text-violet-300">r</span> is sampled uniformly at random from the scalar field <span className="font-mono">ℤ*q</span>, the product <span className="font-mono text-cyan-300">Y = r · H(y)</span> is distributed identically to a random elliptic curve point. Even a computationally unbounded Sender learns literally <em>nothing</em> about what Receiver holds.
              </p>
            </div>
          </div>
        )}

        {/* Phase 3: Sender OPRF Evaluation */}
        {currentPhase === 3 && (
          <div className="space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <div>
                <span className="text-xs font-mono font-semibold text-cyan-400">Phase 03</span>
                <h3 className="text-lg font-bold text-white">Sender Key Evaluation & PRF Responses</h3>
                <p className="text-xs text-slate-400">
                  Sender applies secret key <span className="font-mono text-cyan-300">{senderSecretKey}</span> homomorphically to the blinded queries.
                </p>
              </div>
              <span className="px-2.5 py-1 rounded bg-cyan-950/80 text-cyan-300 border border-cyan-800/60 font-mono text-xs flex items-center gap-1.5">
                <Send className="w-3.5 h-3.5" /> Payload: Sender → Receiver
              </span>
            </div>

            {/* Evaluation Flow */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-cyan-300">1. Blinded OPRF Evaluation:</span>
                  <Key className="w-4 h-4 text-cyan-400" />
                </div>
                <div className="font-mono text-xs bg-slate-900 p-2.5 rounded border border-slate-800 text-slate-200">
                  Z = k · Y = k · (r · H(y))
                </div>
                <p className="text-xs text-slate-400">
                  By scalar multiplication commutativity: <span className="font-mono text-cyan-300">k · (r · H(y)) = r · (k · H(y))</span>. The secret key <span className="font-mono text-cyan-300">k</span> is now applied inside the blind!
                </p>
              </div>

              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-cyan-300">2. Sender Local PRF Vector:</span>
                  <Cpu className="w-4 h-4 text-cyan-400" />
                </div>
                <div className="font-mono text-xs bg-slate-900 p-2.5 rounded border border-slate-800 text-slate-200">
                  PA[b] = Hash(k · H(x_b))
                </div>
                <p className="text-xs text-slate-400">
                  For each bin <span className="font-mono text-slate-300">b</span>, Sender directly computes the PRF on its Cuckoo item <span className="font-mono text-slate-300">x_b</span> and sends <span className="font-mono text-cyan-300">PA</span> to Receiver.
                </p>
              </div>
            </div>

            <div className="p-3 rounded-lg bg-slate-950/80 border border-slate-800 text-xs text-slate-300 flex items-center justify-between">
              <span>Network Wire Transfer: Sender returns evaluated points <span className="font-mono text-cyan-300">[Z₁, Z₂, ...]</span> and local digests <span className="font-mono text-cyan-300">[PA]</span> to Receiver.</span>
              <span className="px-2 py-0.5 rounded bg-cyan-950 text-cyan-400 font-mono text-[10px] font-bold">
                EN ROUTE
              </span>
            </div>
          </div>
        )}

        {/* Phase 4: Receiver Unblinding & Intersection Match */}
        {currentPhase === 4 && (
          <div className="space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <div>
                <span className="text-xs font-mono font-semibold text-emerald-400">Phase 04</span>
                <h3 className="text-lg font-bold text-white">Receiver Unblinding & Local Intersection</h3>
                <p className="text-xs text-slate-400">
                  Receiver multiplies by <span className="font-mono text-emerald-300">r⁻¹</span> to strip the blinding scalar, then compares PRF hashes in each bin.
                </p>
              </div>
              <span className="px-2.5 py-1 rounded bg-emerald-950/80 text-emerald-300 border border-emerald-800/60 font-mono text-xs flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5" /> Intersection Discovered
              </span>
            </div>

            {/* Interactive Bin Match Explorer */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-300">
                  Select a Bin to Inspect Cryptographic PRF Match:
                </span>
                <span className="text-xs text-slate-400">
                  Matches highlighted in emerald
                </span>
              </div>

              {/* Horizontal Bin Selector Strip */}
              <div className="flex items-center gap-2 overflow-x-auto pb-2">
                {binComparisons.map((bc) => (
                  <button
                    key={bc.binIndex}
                    onClick={() => {
                      playClickSound();
                      setSelectedBinIndex(bc.binIndex);
                    }}
                    className={`px-3 py-2 rounded-lg border text-xs font-mono transition-all flex items-center gap-2 shrink-0 ${
                      selectedBinIndex === bc.binIndex
                        ? 'border-cyan-400 bg-cyan-950/80 text-white shadow-[0_0_12px_rgba(6,182,212,0.3)]'
                        : bc.hasMatch
                        ? 'border-emerald-500/60 bg-emerald-950/30 text-emerald-300 hover:border-emerald-400'
                        : 'border-slate-800 bg-slate-950 text-slate-400 hover:border-slate-700'
                    }`}
                  >
                    <span>Bin #{bc.binIndex}</span>
                    {bc.hasMatch && (
                      <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                    )}
                  </button>
                ))}
              </div>

              {/* Selected Bin Inspection Card */}
              <div className="p-5 rounded-xl bg-slate-950 border border-slate-800 space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                  <div className="flex items-center gap-2 font-mono text-xs">
                    <span className="font-bold text-white">Inspecting Bin #{selectedBin.binIndex}:</span>
                    {selectedBin.hasMatch ? (
                      <span className="px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800 font-bold">
                        MATCH FOUND ({selectedBin.matchedItems.join(', ')})
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded bg-slate-900 text-slate-400 border border-slate-800">
                        NO MATCH (DISJOINT IN THIS BIN)
                      </span>
                    )}
                  </div>
                  <span className="text-[11px] text-slate-500 font-mono">
                    Local Comparison Test: PA == PB
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Sender Side in this Bin */}
                  <div className="p-3 rounded-lg bg-slate-900/60 border border-cyan-900/40 space-y-2">
                    <span className="text-xs font-bold text-cyan-300">Party A (Sender)</span>
                    <div className="text-xs flex items-center justify-between">
                      <span className="text-slate-400">Cuckoo Occupant:</span>
                      <span className="font-semibold text-white">
                        {selectedBin.senderItem || 'EMPTY (No item)'}
                      </span>
                    </div>
                    <div className="text-xs flex items-center justify-between">
                      <span className="text-slate-400">Sender PRF Digest (PA):</span>
                      <span className="font-mono text-cyan-300 text-[11px] font-bold">
                        {selectedBin.senderPrf || 'N/A'}
                      </span>
                    </div>
                  </div>

                  {/* Receiver Side in this Bin */}
                  <div className="p-3 rounded-lg bg-slate-900/60 border border-violet-900/40 space-y-2">
                    <span className="text-xs font-bold text-violet-300">Party B (Receiver)</span>
                    <div className="space-y-1.5">
                      {selectedBin.receiverItems.length === 0 ? (
                        <span className="text-xs text-slate-500 italic">No receiver items in this bin</span>
                      ) : (
                        selectedBin.receiverItems.map((r, rIdx) => (
                          <div
                            key={rIdx}
                            className={`p-2 rounded text-xs flex items-center justify-between border ${
                              r.matchesSender
                                ? 'bg-emerald-950/70 border-emerald-500 text-emerald-200'
                                : 'bg-slate-950 border-slate-800 text-slate-300'
                            }`}
                          >
                            <span className="font-semibold">{r.item}</span>
                            <div className="flex items-center gap-2 font-mono text-[11px]">
                              <span>PB: {r.unblindedPrf}</span>
                              {r.matchesSender && (
                                <span className="font-bold text-emerald-400">PA == PB!</span>
                              )}
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                </div>

                {/* Mathematical Unblinding Step */}
                <div className="p-3 rounded bg-slate-900 border border-slate-800 text-[11px] text-slate-300 font-mono flex items-center justify-between">
                  <span>
                    Unblinding formula: PB = r⁻¹ · Z = r⁻¹ · (r · k · H(y)) = k · H(y)
                  </span>
                  <span className="text-emerald-400 font-bold">Verified</span>
                </div>
              </div>
            </div>

            {/* Final Revealed Intersection Results Card */}
            <div className="rounded-xl border border-emerald-500/40 bg-gradient-to-br from-emerald-950/30 to-slate-950 p-5 shadow-lg shadow-emerald-950/20">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-emerald-900/40">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center border border-emerald-500/40">
                    <ShieldCheck className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-white">
                      Computed Private Set Intersection
                    </h4>
                    <p className="text-xs text-emerald-400/80">
                      Chase–Miao Protocol execution complete
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 text-xs">
                  <span className="text-slate-400">Intersection Cardinality:</span>
                  <span className="font-mono font-bold text-emerald-300 text-sm px-2.5 py-0.5 rounded bg-emerald-950 border border-emerald-800">
                    |X ∩ Y| = {intersection.length}
                  </span>
                </div>
              </div>

              <div className="mt-4 flex flex-wrap items-center gap-2">
                {intersection.length === 0 ? (
                  <div className="p-3 rounded-lg bg-slate-900 border border-slate-800 text-xs text-slate-400 italic">
                    Ø Disjoint sets. No common elements were found between Party A and Party B.
                  </div>
                ) : (
                  intersection.map((item) => (
                    <span
                      key={item}
                      className="px-3 py-1.5 rounded-lg text-sm font-bold bg-emerald-500/20 text-emerald-200 border border-emerald-500/50 shadow-md shadow-emerald-500/10 flex items-center gap-1.5"
                    >
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                      <span>{item}</span>
                    </span>
                  ))
                )}
              </div>

              {/* Privacy Breakdown */}
              <div className="mt-4 pt-3 border-t border-emerald-900/30 grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                <div className="flex items-start gap-2 text-slate-300">
                  <span className="text-cyan-400 font-bold">Party A Learned:</span>
                  <span className="text-slate-400">
                    Nothing! (Zero elements learned about Receiver&apos;s set Y).
                  </span>
                </div>
                <div className="flex items-start gap-2 text-slate-300">
                  <span className="text-violet-400 font-bold">Party B Learned:</span>
                  <span className="text-slate-400">
                    Only the intersection elements {intersection.length > 0 ? `{${intersection.join(', ')}}` : 'Ø'}, and zero non-matching elements.
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
};
