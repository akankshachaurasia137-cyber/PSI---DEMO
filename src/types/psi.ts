export interface ItemHashCandidates {
  item: string;
  h1: number;
  h2: number;
  h3: number;
  candidates: [number, number, number];
}

export interface CuckooBin {
  index: number;
  item: string | null;
  candidateIndices?: [number, number, number];
  activeHashIndex?: number; // 0, 1, or 2 (which of h1, h2, h3 was used)
  isHighlighted?: boolean;
  isEvictedThisStep?: boolean;
}

export interface SimpleBin {
  index: number;
  items: Array<{
    item: string;
    hashIndex: number; // 0 for h1, 1 for h2, 2 for h3
  }>;
  isHighlighted?: boolean;
}

export interface EvictionStep {
  stepNumber: number;
  action: 'insert' | 'evict' | 'relocate' | 'stash' | 'success';
  item: string;
  fromBin?: number;
  toBin: number;
  displacedItem?: string;
  description: string;
  candidateBins: [number, number, number];
}

export interface CuckooResult {
  bins: CuckooBin[];
  stash: string[];
  steps: EvictionStep[];
  success: boolean;
}

export interface SimpleResult {
  bins: SimpleBin[];
}

export interface CryptoToken {
  item: string;
  binIndex: number;
  // Visual cryptographic representation
  groupElement: string;      // H(item) represented as hex or point (e.g. 0x4F8A...)
  blindingFactor: string;    // r (e.g. 0x9B12...)
  blindedPoint: string;      // r * H(item)
  evaluatedPoint: string;    // k * r * H(item)
  unblindedPoint: string;    // k * H(item)
  finalPrf: string;          // Hash(k * H(item))
}

export interface BinComparison {
  binIndex: number;
  senderItem: string | null;
  senderPrf: string | null;
  receiverItems: Array<{
    item: string;
    unblindedPrf: string;
    matchesSender: boolean;
  }>;
  hasMatch: boolean;
  matchedItems: string[];
}

export type ProtocolPhase = 1 | 2 | 3 | 4;

export interface PhaseInfo {
  id: ProtocolPhase;
  title: string;
  subtitle: string;
  senderRole: string;
  receiverRole: string;
  networkPayload: string;
  summary: string;
}
