import React from 'react';
import { ShieldCheck, Play, RotateCcw, Volume2, VolumeX, BookOpen, KeyRound } from 'lucide-react';
import { playClickSound } from '../utils/sound';

interface HeaderProps {
  status: 'ready' | 'running' | 'completed';
  isMuted: boolean;
  onToggleMute: () => void;
  onRunSimulation: () => void;
  onReset: () => void;
  onOpenEducational: () => void;
  onOpenCryptoInspector: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  status,
  isMuted,
  onToggleMute,
  onRunSimulation,
  onReset,
  onOpenEducational,
  onOpenCryptoInspector,
}) => {
  return (
    <header className="sticky top-0 z-50 border-b border-cyan-900/30 bg-[#070b14]/90 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Top Bar Contract: 3 zones */}
        <div className="flex items-center justify-between gap-8 h-16">
          {/* Zone 1: Brand wordmark */}
          <div className="flex items-center gap-3 shrink-0">
            <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-cyan-500/20 to-blue-600/30 border border-cyan-500/40 flex items-center justify-center text-cyan-400 shadow-[0_0_15px_rgba(6,182,212,0.15)]">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-base font-bold tracking-tight text-white whitespace-nowrap">
                  Chase–Miao PSI Simulator
                </span>
                <span className="inline-flex items-center px-2 py-0.5 text-[10px] font-semibold text-cyan-300 bg-cyan-950/70 border border-cyan-800/60 rounded">
                  2020 Protocol
                </span>
              </div>
              <p className="text-xs text-slate-400 hidden sm:block">
                Privacy-Preserving Set Intersection
              </p>
            </div>
          </div>

          {/* Zone 2: Navigation Links */}
          <nav className="hidden lg:flex items-center gap-6 text-sm font-medium text-slate-300">
            <a
              href="#datasets"
              className="hover:text-cyan-400 transition-colors whitespace-nowrap"
            >
              Datasets
            </a>
            <a
              href="#hash-functions"
              className="hover:text-cyan-400 transition-colors whitespace-nowrap"
            >
              Hash Functions
            </a>
            <a
              href="#cuckoo-sender"
              className="hover:text-cyan-400 transition-colors whitespace-nowrap"
            >
              Sender Cuckoo
            </a>
            <a
              href="#simple-receiver"
              className="hover:text-cyan-400 transition-colors whitespace-nowrap"
            >
              Receiver Simple
            </a>
            <a
              href="#protocol-flow"
              className="hover:text-cyan-400 transition-colors whitespace-nowrap"
            >
              Protocol Flow
            </a>
          </nav>

          {/* Zone 3: Primary Action & Utilities */}
          <div className="flex items-center gap-2.5 shrink-0">
            {/* Status indicator */}
            <div className="hidden md:flex items-center gap-2 px-2.5 py-1 rounded-md bg-slate-900/80 border border-slate-800 text-xs">
              <span
                className={`w-2 h-2 rounded-full ${
                  status === 'running'
                    ? 'bg-amber-400 animate-ping'
                    : status === 'completed'
                    ? 'bg-emerald-400'
                    : 'bg-cyan-400'
                }`}
              />
              <span className="text-slate-300 font-mono text-[11px]">
                {status === 'running'
                  ? 'Simulating...'
                  : status === 'completed'
                  ? 'Intersection Computed'
                  : 'Simulation Ready'}
              </span>
            </div>

            {/* Audio Toggle */}
            <button
              onClick={() => {
                onToggleMute();
                playClickSound();
              }}
              title={isMuted ? 'Unmute sounds' : 'Mute sounds'}
              className="p-2 rounded-lg bg-slate-900/80 border border-slate-800 hover:border-slate-700 text-slate-400 hover:text-cyan-300 transition-colors"
            >
              {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
            </button>

            {/* Crypto Inspector Button */}
            <button
              onClick={() => {
                onOpenCryptoInspector();
                playClickSound();
              }}
              className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-300 hover:text-white bg-slate-900/80 border border-slate-800 hover:border-cyan-500/40 rounded-lg transition-colors whitespace-nowrap"
            >
              <KeyRound className="w-3.5 h-3.5 text-cyan-400" />
              <span>Inspect Keys</span>
            </button>

            {/* Deep Dive Paper Guide */}
            <button
              onClick={() => {
                onOpenEducational();
                playClickSound();
              }}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-300 hover:text-white bg-slate-900/80 border border-slate-800 hover:border-violet-500/40 rounded-lg transition-colors whitespace-nowrap"
            >
              <BookOpen className="w-3.5 h-3.5 text-violet-400" />
              <span className="hidden sm:inline">Paper Concept</span>
            </button>

            {/* Reset Button */}
            <button
              onClick={() => {
                onReset();
                playClickSound();
              }}
              className="p-2 rounded-lg bg-slate-900/80 border border-slate-800 hover:border-rose-500/40 text-slate-400 hover:text-rose-400 transition-colors"
              title="Reset simulation"
            >
              <RotateCcw className="w-4 h-4" />
            </button>

            {/* Run Button */}
            <button
              onClick={() => {
                onRunSimulation();
                playClickSound();
              }}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-slate-950 bg-gradient-to-r from-cyan-400 to-blue-400 hover:from-cyan-300 hover:to-blue-300 rounded-lg shadow-[0_0_15px_rgba(34,211,238,0.25)] transition-all whitespace-nowrap active:scale-95"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              <span>Run Simulation</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
