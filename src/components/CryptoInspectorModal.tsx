import React, { useState } from 'react';
import { X, KeyRound, Copy, Check, Shield, Search } from 'lucide-react';
import { CryptoToken } from '../types/psi';
import { playClickSound } from '../utils/sound';

interface CryptoInspectorModalProps {
  isOpen: boolean;
  onClose: () => void;
  senderSecretKey: string;
  receiverTokens: CryptoToken[];
}

export const CryptoInspectorModal: React.FC<CryptoInspectorModalProps> = ({
  isOpen,
  onClose,
  senderSecretKey,
  receiverTokens,
}) => {
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');

  if (!isOpen) return null;

  const handleCopy = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(label);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const filteredTokens = receiverTokens.filter(
    (t) =>
      t.item.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.finalPrf.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
      <div className="w-full max-w-4xl max-h-[90vh] bg-slate-950 border border-cyan-500/30 rounded-2xl flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="p-5 border-b border-slate-800 bg-slate-900/80 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-cyan-500/20 text-cyan-400 flex items-center justify-center border border-cyan-500/40">
              <KeyRound className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Cryptographic Parameter Inspector</h3>
              <p className="text-xs text-slate-400">
                Inspect raw simulated elliptic curve points, blinding scalars, and OPRF tokens
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

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-6 text-xs">
          {/* Sender Secret Key */}
          <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <span className="text-[11px] font-mono font-bold text-cyan-400 uppercase">
                Party A Secret Key (k)
              </span>
              <p className="text-slate-400 text-xs mt-0.5">
                Never revealed to Receiver. Used as the OPRF seed.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <span className="px-3 py-1.5 rounded-lg bg-slate-950 border border-cyan-900/60 font-mono font-bold text-cyan-300 text-sm">
                {senderSecretKey}
              </span>
              <button
                onClick={() => handleCopy(senderSecretKey, 'senderKey')}
                className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
                title="Copy Key"
              >
                {copiedKey === 'senderKey' ? (
                  <Check className="w-4 h-4 text-emerald-400" />
                ) : (
                  <Copy className="w-4 h-4" />
                )}
              </button>
            </div>
          </div>

          {/* Tokens Table */}
          <div className="space-y-3">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <span className="font-semibold text-white">
                Receiver OPRF Tokens per Bin & Element ({receiverTokens.length} tokens):
              </span>
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-slate-500 absolute left-2.5 top-2.5" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Filter by item or PRF..."
                  className="pl-8 pr-3 py-1.5 bg-slate-900 border border-slate-800 rounded-lg text-xs text-white placeholder:text-slate-600 focus:outline-none focus:border-cyan-500"
                />
              </div>
            </div>

            <div className="border border-slate-800 rounded-xl overflow-x-auto bg-slate-900/50">
              <table className="w-full text-left font-mono text-[11px]">
                <thead>
                  <tr className="border-b border-slate-800 bg-slate-950 text-slate-400">
                    <th className="py-2.5 px-3">Item (y)</th>
                    <th className="py-2.5 px-3">Bin #</th>
                    <th className="py-2.5 px-3">Group Pt H(y)</th>
                    <th className="py-2.5 px-3">Blinding (r)</th>
                    <th className="py-2.5 px-3">Blinded Y = r·H(y)</th>
                    <th className="py-2.5 px-3">Eval Z = k·Y</th>
                    <th className="py-2.5 px-3">Unblinded k·H(y)</th>
                    <th className="py-2.5 px-3">Final PRF</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {filteredTokens.map((tok, idx) => (
                    <tr key={idx} className="hover:bg-slate-800/40 transition-colors">
                      <td className="py-2 px-3 font-sans font-bold text-white">
                        {tok.item}
                      </td>
                      <td className="py-2 px-3 text-cyan-300">
                        #{tok.binIndex}
                      </td>
                      <td className="py-2 px-3 text-slate-400">
                        {tok.groupElement}
                      </td>
                      <td className="py-2 px-3 text-violet-300">
                        {tok.blindingFactor}
                      </td>
                      <td className="py-2 px-3 text-amber-300">
                        {tok.blindedPoint}
                      </td>
                      <td className="py-2 px-3 text-blue-300">
                        {tok.evaluatedPoint}
                      </td>
                      <td className="py-2 px-3 text-emerald-300 font-semibold">
                        {tok.unblindedPoint}
                      </td>
                      <td className="py-2 px-3 text-cyan-400 font-bold">
                        {tok.finalPrf}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
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
            Close Inspector
          </button>
        </div>
      </div>
    </div>
  );
};
