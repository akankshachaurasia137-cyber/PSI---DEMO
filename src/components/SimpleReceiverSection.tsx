import React, { useState } from 'react';
import { Copy, Layers, Sparkles, Check, ArrowDownRight, GitFork } from 'lucide-react';
import { SimpleResult, CuckooResult } from '../types/psi';
import { getItemCandidates } from '../utils/cryptoSim';

interface SimpleReceiverSectionProps {
  simpleResult: SimpleResult;
  cuckooResult: CuckooResult;
  receiverItems: string[];
  numBins: number;
  highlightedBin: number | null;
  onHoverBin: (bin: number | null) => void;
}

export const SimpleReceiverSection: React.FC<SimpleReceiverSectionProps> = ({
  simpleResult,
  cuckooResult,
  receiverItems,
  numBins,
  highlightedBin,
  onHoverBin,
}) => {
  const [selectedItem, setSelectedItem] = useState<string | null>(
    receiverItems[0] || null
  );

  // Active item candidate bins
  const activeCandidates = selectedItem
    ? getItemCandidates(selectedItem, numBins).candidates
    : null;

  return (
    <section id="simple-receiver" className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-violet-400 mb-1">
            <Layers className="w-3.5 h-3.5" />
            <span>Section 4 · Receiver Multi-Bin Replication</span>
          </div>
          <h2 className="text-2xl font-bold text-white tracking-tight">
            Simple Hashing: Party B Triplicate Distribution
          </h2>
          <p className="text-sm text-slate-400 mt-1 max-w-2xl">
            In contrast to Sender&apos;s Cuckoo hashing, Receiver copies <strong>every element into all three</strong> of its candidate bins. Multiple items can share the same bin.
          </p>
        </div>

        {/* Item selector for branching inspection */}
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="text-xs text-slate-400 flex items-center gap-1">
            <GitFork className="w-3.5 h-3.5 text-violet-400" /> Inspect copy branches:
          </span>
          {receiverItems.map((item) => (
            <button
              key={item}
              onClick={() => setSelectedItem(item)}
              className={`px-2.5 py-1 text-xs font-mono rounded-md border transition-all ${
                selectedItem === item
                  ? 'bg-violet-900/60 border-violet-500 text-violet-100 shadow-[0_0_10px_rgba(139,92,246,0.3)]'
                  : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              {item}
            </button>
          ))}
        </div>
      </div>

      {/* Triplicate Copy Branching Diagram */}
      {selectedItem && activeCandidates && (
        <div className="rounded-xl border border-violet-500/30 bg-slate-900/50 p-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-white">Triplicate Distribution Flow:</span>
              <span className="px-2 py-0.5 rounded font-mono font-bold text-xs bg-violet-950 text-violet-300 border border-violet-800">
                &ldquo;{selectedItem}&rdquo;
              </span>
            </div>
            <span className="text-xs text-slate-400">
              Copied 3 times across Bins {activeCandidates.join(', ')}
            </span>
          </div>

          <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="p-3 rounded-lg bg-slate-950/80 border border-cyan-800/40 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-5 h-5 rounded bg-cyan-950 text-cyan-400 text-xs font-bold font-mono flex items-center justify-center">
                  1
                </span>
                <span className="text-xs text-slate-300">Copy 1 (via h₁)</span>
              </div>
              <span className="font-mono font-bold text-cyan-300 text-xs">
                Bin #{activeCandidates[0]}
              </span>
            </div>

            <div className="p-3 rounded-lg bg-slate-950/80 border border-blue-800/40 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-5 h-5 rounded bg-blue-950 text-blue-400 text-xs font-bold font-mono flex items-center justify-center">
                  2
                </span>
                <span className="text-xs text-slate-300">Copy 2 (via h₂)</span>
              </div>
              <span className="font-mono font-bold text-blue-300 text-xs">
                Bin #{activeCandidates[1]}
              </span>
            </div>

            <div className="p-3 rounded-lg bg-slate-950/80 border border-violet-800/40 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-5 h-5 rounded bg-violet-950 text-violet-400 text-xs font-bold font-mono flex items-center justify-center">
                  3
                </span>
                <span className="text-xs text-slate-300">Copy 3 (via h₃)</span>
              </div>
              <span className="font-mono font-bold text-violet-300 text-xs">
                Bin #{activeCandidates[2]}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Grid of Receiver Bins */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-3">
        {simpleResult.bins.map((bin) => {
          const isHighlighted = highlightedBin === bin.index;
          const isCandidateForSelected =
            activeCandidates && activeCandidates.includes(bin.index);

          // Check if any item in this bin matches Sender's Cuckoo item in the same bin
          const senderItemInThisBin = cuckooResult.bins[bin.index]?.item;
          const hasCommonMatch =
            senderItemInThisBin !== null &&
            senderItemInThisBin !== undefined &&
            bin.items.some(
              (it) => it.item.toLowerCase() === senderItemInThisBin.toLowerCase()
            );

          return (
            <div
              key={bin.index}
              onMouseEnter={() => onHoverBin(bin.index)}
              onMouseLeave={() => onHoverBin(null)}
              className={`relative rounded-xl border p-3 flex flex-col justify-between min-h-[160px] transition-all duration-200 cursor-pointer ${
                hasCommonMatch
                  ? 'border-emerald-500/60 bg-emerald-950/20 shadow-[0_0_15px_rgba(16,185,129,0.15)]'
                  : isCandidateForSelected
                  ? 'border-violet-400 bg-violet-950/40 shadow-[0_0_12px_rgba(139,92,246,0.25)]'
                  : isHighlighted
                  ? 'border-violet-500/70 bg-slate-900/90'
                  : bin.items.length > 0
                  ? 'border-violet-500/30 bg-slate-900/70 hover:border-violet-500/50'
                  : 'border-slate-800/80 bg-slate-950/40 hover:border-slate-700'
              }`}
            >
              {/* Header */}
              <div className="flex items-center justify-between text-xs border-b border-slate-800/60 pb-1.5">
                <span className="font-mono font-bold text-slate-400">
                  Bin #{bin.index}
                </span>
                <span
                  className={`text-[10px] font-mono px-1.5 py-0.5 rounded ${
                    bin.items.length > 0
                      ? 'bg-violet-950 text-violet-300 border border-violet-800/60'
                      : 'text-slate-600 bg-slate-900'
                  }`}
                >
                  {bin.items.length} items
                </span>
              </div>

              {/* Bucket Occupants */}
              <div className="my-auto py-2 space-y-1.5">
                {bin.items.length === 0 ? (
                  <div className="text-slate-600 text-xs italic text-center py-2">
                    Empty Bin
                  </div>
                ) : (
                  <div className="flex flex-col gap-1">
                    {bin.items.map((entry, idx) => {
                      const isMatchingSender =
                        senderItemInThisBin &&
                        senderItemInThisBin.toLowerCase() === entry.item.toLowerCase();

                      return (
                        <div
                          key={idx}
                          className={`px-2 py-1 rounded text-xs font-medium flex items-center justify-between border ${
                            isMatchingSender
                              ? 'bg-emerald-950/80 border-emerald-500/70 text-emerald-200'
                              : 'bg-violet-950/40 border-violet-800/40 text-violet-200'
                          }`}
                        >
                          <span className="truncate">{entry.item}</span>
                          <span className="text-[10px] font-mono text-slate-400 ml-1 shrink-0">
                            (h{entry.hashIndex + 1})
                          </span>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Sender Comparison Footer */}
              <div className="pt-1.5 border-t border-slate-800/40 text-[10px] flex items-center justify-between">
                <span className="text-slate-500">Party A:</span>
                {senderItemInThisBin ? (
                  <span
                    className={`font-mono font-semibold ${
                      hasCommonMatch ? 'text-emerald-400' : 'text-slate-400'
                    }`}
                  >
                    {senderItemInThisBin}
                  </span>
                ) : (
                  <span className="text-slate-600 italic">None</span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Comparative Insight Card */}
      <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-4">
        <div className="flex items-start gap-3 text-xs">
          <Sparkles className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <h4 className="font-semibold text-white">
              Why the Cuckoo + Simple Hashing Pairing is Guaranteed to Intersect:
            </h4>
            <p className="text-slate-300 leading-relaxed">
              Suppose both parties hold element <strong className="text-emerald-400">&ldquo;Banana&rdquo;</strong>.
              Sender (Party A) placed &ldquo;Banana&rdquo; into one of its candidate bins (e.g., Bin #{activeCandidates ? activeCandidates[0] : 'b'}).
              Meanwhile, Receiver (Party B) placed a copy into <em>all three</em> candidate bins!
              Therefore, in Bin #{activeCandidates ? activeCandidates[0] : 'b'}, both parties hold &ldquo;Banana&rdquo;.
              The entire multi-party PSI problem is now decomposed into <span className="font-mono text-cyan-300">{numBins}</span> independent, tiny 1-to-many comparisons!
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};
