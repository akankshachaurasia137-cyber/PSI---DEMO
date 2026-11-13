import React, { useState, useMemo } from 'react';
import { Header } from './components/Header';
import { DatasetInputSection } from './components/DatasetInputSection';
import { HashFunctionSection } from './components/HashFunctionSection';
import { CuckooSenderSection } from './components/CuckooSenderSection';
import { SimpleReceiverSection } from './components/SimpleReceiverSection';
import { ProtocolFlowSection } from './components/ProtocolFlowSection';
import { CryptoInspectorModal } from './components/CryptoInspectorModal';
import { EducationalModal } from './components/EducationalModal';
import {
  runCuckooHashing,
  runSimpleHashing,
  generateCryptoSim,
} from './utils/cryptoSim';
import { ProtocolPhase } from './types/psi';
import { setMuted, getIsMuted, playClickSound, playMatchSuccessSound } from './utils/sound';

export default function App() {
  // Input Datasets
  const [senderInput, setSenderInput] = useState<string>('Apple, Banana, Mango');
  const [receiverInput, setReceiverInput] = useState<string>('Banana, Cherry, Mango');
  const [numBins, setNumBins] = useState<number>(7);

  // Cross-component interaction state
  const [highlightedBin, setHighlightedBin] = useState<number | null>(null);
  const [currentPhase, setCurrentPhase] = useState<ProtocolPhase>(1);
  const [simulationStatus, setSimulationStatus] = useState<'ready' | 'running' | 'completed'>('ready');
  const [isAudioMuted, setIsAudioMuted] = useState<boolean>(false);
  const [simSpeed, setSimSpeed] = useState<number>(1);

  // Modals
  const [isEducationalOpen, setIsEducationalOpen] = useState<boolean>(false);
  const [isCryptoInspectorOpen, setIsCryptoInspectorOpen] = useState<boolean>(false);

  // Parse items from input strings
  const senderItems = useMemo(() => {
    return senderInput
      .split(',')
      .map((s) => s.trim())
      .filter((s) => s.length > 0);
  }, [senderInput]);

  const receiverItems = useMemo(() => {
    return receiverInput
      .split(',')
      .map((s) => s.trim())
      .filter((s) => s.length > 0);
  }, [receiverInput]);

  // Expected ground-truth intersection
  const expectedIntersection = useMemo(() => {
    const sSet = new Set(senderItems.map((i) => i.toLowerCase()));
    return receiverItems.filter((r) => sSet.has(r.toLowerCase()));
  }, [senderItems, receiverItems]);

  // Compute Cuckoo & Simple Hashing results
  const cuckooResult = useMemo(() => {
    return runCuckooHashing(senderItems, numBins);
  }, [senderItems, numBins]);

  const simpleResult = useMemo(() => {
    return runSimpleHashing(receiverItems, numBins);
  }, [receiverItems, numBins]);

  // Compute simulated cryptographic tokens and per-bin matching
  const cryptoSim = useMemo(() => {
    return generateCryptoSim(
      senderItems,
      receiverItems,
      cuckooResult,
      simpleResult,
      numBins
    );
  }, [senderItems, receiverItems, cuckooResult, simpleResult, numBins]);

  // Run full simulation workflow
  const handleRunSimulation = () => {
    setSimulationStatus('running');
    setCurrentPhase(1);

    // Sequence through phases 1 -> 2 -> 3 -> 4
    setTimeout(() => {
      setCurrentPhase(2);
    }, 700);

    setTimeout(() => {
      setCurrentPhase(3);
    }, 1400);

    setTimeout(() => {
      setCurrentPhase(4);
      setSimulationStatus('completed');
      if (expectedIntersection.length > 0) {
        playMatchSuccessSound();
      }
    }, 2100);
  };

  const handleReset = () => {
    setSenderInput('Apple, Banana, Mango');
    setReceiverInput('Banana, Cherry, Mango');
    setNumBins(7);
    setCurrentPhase(1);
    setSimulationStatus('ready');
    setHighlightedBin(null);
  };

  const handleToggleMute = () => {
    const newMuted = !isAudioMuted;
    setIsAudioMuted(newMuted);
    setMuted(newMuted);
  };

  return (
    <div className="min-h-screen bg-[#070b14] text-slate-100 selection:bg-cyan-500/30 selection:text-cyan-200">
      {/* Top Header */}
      <Header
        status={simulationStatus}
        isMuted={isAudioMuted}
        onToggleMute={handleToggleMute}
        onRunSimulation={handleRunSimulation}
        onReset={handleReset}
        onOpenEducational={() => setIsEducationalOpen(true)}
        onOpenCryptoInspector={() => setIsCryptoInspectorOpen(true)}
      />

      {/* Main Container */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-12">
        {/* Section 1: Private Input Datasets */}
        <DatasetInputSection
          senderInput={senderInput}
          receiverInput={receiverInput}
          onSenderInputChange={(val) => {
            setSenderInput(val);
            setSimulationStatus('ready');
          }}
          onReceiverInputChange={(val) => {
            setReceiverInput(val);
            setSimulationStatus('ready');
          }}
          numBins={numBins}
          onNumBinsChange={(val) => {
            setNumBins(val);
            setSimulationStatus('ready');
          }}
          onRunSimulation={handleRunSimulation}
          onReset={handleReset}
          senderItems={senderItems}
          receiverItems={receiverItems}
          expectedIntersection={expectedIntersection}
          simSpeed={simSpeed}
          onSimSpeedChange={setSimSpeed}
        />

        {/* Section 2: Hash Function Visualization */}
        <HashFunctionSection
          senderItems={senderItems}
          receiverItems={receiverItems}
          numBins={numBins}
          highlightedBin={highlightedBin}
          onHoverBin={setHighlightedBin}
        />

        {/* Section 3: Cuckoo Hashing – Sender */}
        <CuckooSenderSection
          cuckooResult={cuckooResult}
          numBins={numBins}
          highlightedBin={highlightedBin}
          onHoverBin={setHighlightedBin}
        />

        {/* Section 4: Simple Hashing – Receiver */}
        <SimpleReceiverSection
          simpleResult={simpleResult}
          cuckooResult={cuckooResult}
          receiverItems={receiverItems}
          numBins={numBins}
          highlightedBin={highlightedBin}
          onHoverBin={setHighlightedBin}
        />

        {/* Section 5: Four-Phase Protocol Flow */}
        <ProtocolFlowSection
          currentPhase={currentPhase}
          onSetPhase={setCurrentPhase}
          binComparisons={cryptoSim.binComparisons}
          intersection={cryptoSim.intersection}
          senderSecretKey={cryptoSim.senderSecretKey}
          senderItems={senderItems}
          receiverItems={receiverItems}
          numBins={numBins}
        />
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-900 bg-slate-950/80 py-8 mt-16 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 space-y-2">
          <p className="text-slate-400">
            Based on the research paper: <strong className="text-slate-200">Private Set Intersection in the Internet Setting From Lightweight Oblivious PRF</strong> by Melissa Chase and Peihan Miao (CRYPTO 2020).
          </p>
          <div className="flex items-center justify-center gap-4 text-[11px] text-slate-500">
            <span>Cuckoo Hashing (Party A)</span>
            <span>·</span>
            <span>Simple Hashing (Party B)</span>
            <span>·</span>
            <span>Diffie–Hellman OPRF</span>
            <span>·</span>
            <span>Zero-Knowledge Dataset Secrecy</span>
          </div>
        </div>
      </footer>

      {/* Modals */}
      <CryptoInspectorModal
        isOpen={isCryptoInspectorOpen}
        onClose={() => setIsCryptoInspectorOpen(false)}
        senderSecretKey={cryptoSim.senderSecretKey}
        receiverTokens={cryptoSim.receiverTokens}
      />

      <EducationalModal
        isOpen={isEducationalOpen}
        onClose={() => setIsEducationalOpen(false)}
      />
    </div>
  );
}
