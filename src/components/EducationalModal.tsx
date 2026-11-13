import React from 'react';
import { X, BookOpen, Shield, Zap, CheckCircle2, Lock, ArrowRight } from 'lucide-react';
import { playClickSound } from '../utils/sound';

interface EducationalModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const EducationalModal: React.FC<EducationalModalProps> = ({
  isOpen,
  onClose,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
      <div className="w-full max-w-3xl max-h-[90vh] bg-slate-950 border border-violet-500/30 rounded-2xl flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="p-5 border-b border-slate-800 bg-slate-900/80 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-violet-500/20 text-violet-400 flex items-center justify-center border border-violet-500/40">
              <BookOpen className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">
                The Chase–Miao (2020) PSI Breakthrough
              </h3>
              <p className="text-xs text-slate-400">
                CRYPTO 2020 · Lightweight Oblivious PRF for Private Set Intersection
              </p>
            </div>
          </div>

          <button
            onClick={() => {
              playClickSound();
              onClose();
            }}
            className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 overflow-y-auto space-y-6 text-xs text-slate-300 leading-relaxed">
          {/* Section 1: The Problem */}
          <div className="space-y-2">
            <h4 className="text-sm font-bold text-white flex items-center gap-2">
              <Lock className="w-4 h-4 text-cyan-400" />
              1. The Flaw with Naive Hashing
            </h4>
            <p>
              Beginners often ask: <em>&ldquo;Why can&apos;t both parties just exchange SHA-256 hashes of their items?&rdquo;</em>
            </p>
            <div className="p-3 rounded-lg bg-rose-950/30 border border-rose-800/40 text-rose-200">
              <strong>Offline Dictionary Attacks:</strong> If Party A has sensitive items (e.g., patient phone numbers, SSNs, or disease codes), exchanging raw hashes allows an adversary to pre-compute hashes of all valid numbers (rainbow table) and instantly reverse every single item Party A holds!
            </div>
          </div>

          {/* Section 2: Chase-Miao Hashing Innovation */}
          <div className="space-y-2">
            <h4 className="text-sm font-bold text-white flex items-center gap-2">
              <Zap className="w-4 h-4 text-violet-400" />
              2. Why Pair Cuckoo Hashing with Simple Hashing?
            </h4>
            <p>
              Traditional PSI protocols (like Pinkas et al.) struggled with high communication overhead because comparing sets of size <span className="font-mono">n</span> naively requires <span className="font-mono">O(n²)</span> comparisons.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-2">
              <div className="p-3 rounded-lg bg-slate-900 border border-cyan-900/40">
                <span className="font-bold text-cyan-300 block mb-1">Sender: Cuckoo Hashing</span>
                <p className="text-[11px] text-slate-400">
                  Each item is assigned to <strong>exactly 1</strong> of its 3 candidate bins. This guarantees that every bin contains at most 1 item!
                </p>
              </div>

              <div className="p-3 rounded-lg bg-slate-900 border border-violet-900/40">
                <span className="font-bold text-violet-300 block mb-1">Receiver: Simple Hashing</span>
                <p className="text-[11px] text-slate-400">
                  Each item is duplicated into <strong>all 3</strong> candidate bins. If <span className="font-mono text-emerald-300">x = y</span>, they are 100% guaranteed to collide in at least one bin!
                </p>
              </div>
            </div>
          </div>

          {/* Section 3: Oblivious PRF (OPRF) */}
          <div className="space-y-2">
            <h4 className="text-sm font-bold text-white flex items-center gap-2">
              <Shield className="w-4 h-4 text-emerald-400" />
              3. Oblivious PRF (OPRF) Math in a Nutshell
            </h4>
            <p>
              An Oblivious PRF allows Receiver to learn <span className="font-mono text-cyan-300">F_k(y)</span> without Sender learning <span className="font-mono">y</span>, and without Receiver learning Sender&apos;s key <span className="font-mono">k</span>:
            </p>
            <div className="p-3 rounded-lg bg-slate-900 border border-slate-800 font-mono space-y-1.5 text-[11px]">
              <div>1. Receiver blinds: <span className="text-violet-300">Y = r · H(y)</span></div>
              <div>2. Sender evaluates with secret key k: <span className="text-blue-300">Z = k · Y = k · (r · H(y))</span></div>
              <div>3. Receiver unblinds with inverse r⁻¹: <span className="text-emerald-300">PB = r⁻¹ · Z = k · H(y)</span></div>
              <div>4. Sender computes its own: <span className="text-cyan-300">PA = k · H(x)</span></div>
              <div>5. Match condition: If <span className="text-emerald-300">x == y</span>, then <span className="text-emerald-300">PA == PB</span>!</div>
            </div>
          </div>

          {/* Section 4: Performance & Privacy */}
          <div className="p-3 rounded-lg bg-cyan-950/30 border border-cyan-800/40 text-xs text-cyan-200">
            <strong>Linear Communication:</strong> Because the number of bins is linear in the dataset size (<span className="font-mono">B = O(n)</span>), and each bin comparison is lightweight, Chase–Miao achieves optimal communication efficiency over modern internet connections.
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-900/80 flex justify-end">
          <button
            onClick={() => {
              playClickSound();
              onClose();
            }}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-xs font-semibold transition-colors"
          >
            Understood
          </button>
        </div>
      </div>
    </div>
  );
};
