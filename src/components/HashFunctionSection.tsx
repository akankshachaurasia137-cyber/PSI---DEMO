import React, { useState } from 'react';
import { Hash, Sparkles, CheckCircle2, Info } from 'lucide-react';
import { getItemCandidates } from '../utils/cryptoSim';
import { ItemHashCandidates } from '../types/psi';

interface HashFunctionSectionProps {
  senderItems: string[];
  receiverItems: string[];
  numBins: number;
  highlightedBin: number | null;
  onHoverBin: (bin: number | null) => void;
}

export const HashFunctionSection: React.FC<HashFunctionSectionProps> = ({
  senderItems,
  receiverItems,
  numBins,
  highlightedBin,
  onHoverBin,
}) => {
  const [activeItem, setActiveItem] = useState<string | null>(null);

  // Calculate candidate locations for all items
  const senderCandidates: Array<ItemHashCandidates & { party: 'A' }> = senderItems.map((item) => ({
    ...getItemCandidates(item, numBins),
    party: 'A',
  }));

  const receiverCandidates: Array<ItemHashCandidates & { party: 'B' }> = receiverItems.map((item) => ({
    ...getItemCandidates(item, numBins),
    party: 'B',
  }));

  const allItems = [...senderCandidates, ...receiverCandidates];

  // Detect which items exist in BOTH sets
  const commonItemNames = new Set(
    senderItems
      .map((i) => i.trim().toLowerCase())
      .filter((s) => receiverItems.some((r) => r.trim().toLowerCase() === s))
  );

  return (
    <section id="hash-functions" className="space-y-6">
      <div>
        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-cyan-400 mb-1">
          <Hash className="w-3.5 h-3.5" />
          <span>Section 2 · Deterministic Hash Mapping</span>
        </div>
        <h2 className="text-2xl font-bold text-white tracking-tight">
          Hash Functions: h₁(x), h₂(x), h₃(x)
        </h2>
        <p className="text-sm text-slate-400 mt-1 max-w-2xl">
          Both parties share three deterministic pseudo-random hash functions. For any given item,
          these functions compute its exact 3 candidate bin locations in the range{' '}
          <span className="font-mono text-cyan-300">[0, {numBins - 1}]</span>.
        </p>
      </div>

      {/* Formula & Determinism Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="rounded-xl border border-cyan-500/20 bg-slate-900/50 p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="font-mono text-xs font-bold text-cyan-400">h₁(x)</span>
            <span className="text-[10px] font-mono text-slate-500">Seed: 0x9E3779B9</span>
          </div>
          <div className="font-mono text-xs text-slate-200 bg-slate-950/80 p-2 rounded border border-slate-800">
            h₁(x) = Hash(x, seed₁) mod {numBins}
          </div>
          <p className="text-[11px] text-slate-400 mt-2">
            Primary candidate bin. First choice during Cuckoo placement.
          </p>
        </div>

        <div className="rounded-xl border border-blue-500/20 bg-slate-900/50 p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="font-mono text-xs font-bold text-blue-400">h₂(x)</span>
            <span className="text-[10px] font-mono text-slate-500">Seed: 0x517CC1B7</span>
          </div>
          <div className="font-mono text-xs text-slate-200 bg-slate-950/80 p-2 rounded border border-slate-800">
            h₂(x) = Hash(x, seed₂) mod {numBins}
          </div>
          <p className="text-[11px] text-slate-400 mt-2">
            Secondary candidate bin. Target if primary bin is contested.
          </p>
        </div>

        <div className="rounded-xl border border-violet-500/20 bg-slate-900/50 p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="font-mono text-xs font-bold text-violet-400">h₃(x)</span>
            <span className="text-[10px] font-mono text-slate-500">Seed: 0x165667B1</span>
          </div>
          <div className="font-mono text-xs text-slate-200 bg-slate-950/80 p-2 rounded border border-slate-800">
            h₃(x) = Hash(x, seed₃) mod {numBins}
          </div>
          <p className="text-[11px] text-slate-400 mt-2">
            Tertiary candidate bin. Eliminates Cuckoo cycles with high probability.
          </p>
        </div>
      </div>

      {/* Candidate Mapping Table */}
      <div className="rounded-xl border border-slate-800 bg-slate-900/60 overflow-hidden shadow-lg">
        <div className="p-4 bg-slate-900/90 border-b border-slate-800 flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold text-white">Item-to-Bin Candidate Mapping Table</span>
            <span className="text-xs text-slate-400">({allItems.length} total entries)</span>
          </div>
          <div className="flex items-center gap-3 text-xs">
            <span className="flex items-center gap-1.5 text-emerald-400">
              <span className="w-2 h-2 rounded-full bg-emerald-400" />
              Common items (exact hash alignment)
            </span>
            <span className="text-slate-500">·</span>
            <span className="text-slate-400">Hover any row to inspect candidate bins</span>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-800 bg-slate-950/60 text-slate-400 font-mono">
                <th className="py-3 px-4 font-semibold">Party</th>
                <th className="py-3 px-4 font-semibold">Item Name</th>
                <th className="py-3 px-4 font-semibold text-cyan-400">Candidate 1 (h₁)</th>
                <th className="py-3 px-4 font-semibold text-blue-400">Candidate 2 (h₂)</th>
                <th className="py-3 px-4 font-semibold text-violet-400">Candidate 3 (h₃)</th>
                <th className="py-3 px-4 font-semibold">Candidate Bins Vector</th>
                <th className="py-3 px-4 font-semibold">Intersection Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {allItems.map((row, idx) => {
                const isCommon = commonItemNames.has(row.item.toLowerCase());
                const isHovered = activeItem === row.item;

                return (
                  <tr
                    key={`${row.party}-${row.item}-${idx}`}
                    onMouseEnter={() => {
                      setActiveItem(row.item);
                      onHoverBin(row.candidates[0]);
                    }}
                    onMouseLeave={() => {
                      setActiveItem(null);
                      onHoverBin(null);
                    }}
                    className={`transition-colors cursor-pointer ${
                      isHovered
                        ? 'bg-cyan-950/30'
                        : isCommon
                        ? 'bg-emerald-950/20 hover:bg-emerald-950/30'
                        : 'hover:bg-slate-800/40'
                    }`}
                  >
                    {/* Party */}
                    <td className="py-3 px-4">
                      {row.party === 'A' ? (
                        <span className="px-2 py-0.5 rounded font-mono font-bold text-[11px] bg-cyan-950 text-cyan-300 border border-cyan-800/60">
                          Sender (A)
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded font-mono font-bold text-[11px] bg-violet-950 text-violet-300 border border-violet-800/60">
                          Receiver (B)
                        </span>
                      )}
                    </td>

                    {/* Item Name */}
                    <td className="py-3 px-4 font-semibold text-white">
                      <div className="flex items-center gap-1.5">
                        <span>{row.item}</span>
                        {isCommon && (
                          <span title="Present in both sets">
                            <Sparkles className="w-3 h-3 text-emerald-400" />
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Candidate 1 */}
                    <td className="py-3 px-4 font-mono font-semibold text-cyan-300">
                      <span className="px-2 py-0.5 rounded bg-cyan-950/80 border border-cyan-800/50">
                        Bin {row.h1}
                      </span>
                    </td>

                    {/* Candidate 2 */}
                    <td className="py-3 px-4 font-mono font-semibold text-blue-300">
                      <span className="px-2 py-0.5 rounded bg-blue-950/80 border border-blue-800/50">
                        Bin {row.h2}
                      </span>
                    </td>

                    {/* Candidate 3 */}
                    <td className="py-3 px-4 font-mono font-semibold text-violet-300">
                      <span className="px-2 py-0.5 rounded bg-violet-950/80 border border-violet-800/50">
                        Bin {row.h3}
                      </span>
                    </td>

                    {/* Vector */}
                    <td className="py-3 px-4 font-mono text-slate-300">
                      <div className="flex items-center gap-1">
                        {row.candidates.map((c, cIdx) => (
                          <span
                            key={cIdx}
                            className={`w-6 h-6 rounded flex items-center justify-center font-bold text-[11px] border ${
                              highlightedBin === c
                                ? 'bg-cyan-500 text-slate-950 border-cyan-300 shadow-[0_0_8px_rgba(6,182,212,0.4)]'
                                : 'bg-slate-950 border-slate-800 text-slate-300'
                            }`}
                          >
                            {c}
                          </span>
                        ))}
                      </div>
                    </td>

                    {/* Status */}
                    <td className="py-3 px-4">
                      {isCommon ? (
                        <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-300 bg-emerald-950/80 border border-emerald-800/60 px-2 py-0.5 rounded">
                          <CheckCircle2 className="w-3 h-3" />
                          Common (Matches in Bins {row.candidates.join(', ')})
                        </span>
                      ) : (
                        <span className="text-[11px] text-slate-500 font-mono">
                          Unique to Party {row.party}
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Footer observation callout */}
        <div className="p-3 bg-slate-950/80 border-t border-slate-800 flex items-start gap-2 text-xs text-slate-300">
          <Info className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
          <p>
            <strong className="text-cyan-300">Key Observation for PSI:</strong> Notice that whenever an item appears in both Party A and Party B (e.g. &ldquo;Banana&rdquo;), its candidate bins <span className="font-mono text-emerald-300">[h₁, h₂, h₃]</span> are 100% identical. Even though Party A places it into only <em>one</em> bin (via Cuckoo hashing), Party B places a copy into <em>all three</em> bins. Therefore, they are mathematically guaranteed to share at least one bin!
          </p>
        </div>
      </div>
    </section>
  );
};
