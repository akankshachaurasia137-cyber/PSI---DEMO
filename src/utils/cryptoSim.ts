import {
  ItemHashCandidates,
  CuckooBin,
  SimpleBin,
  EvictionStep,
  CuckooResult,
  SimpleResult,
  CryptoToken,
  BinComparison,
} from '../types/psi';

// 32-bit FNV-1a inspired hash with seed
export function hashStringWithSeed(str: string, seed: number): number {
  let hash = seed >>> 0;
  for (let i = 0; i < str.length; i++) {
    hash ^= str.charCodeAt(i);
    // Math.imul for 32-bit integer multiplication
    hash = Math.imul(hash, 16777619) >>> 0;
  }
  // Avalanching bits
  hash ^= hash >>> 16;
  hash = Math.imul(hash, 0x85ebca6b) >>> 0;
  hash ^= hash >>> 13;
  hash = Math.imul(hash, 0xc2b2ae35) >>> 0;
  hash ^= hash >>> 16;
  return hash >>> 0;
}

// Compute deterministic candidates [h1, h2, h3] in range [0, numBins - 1]
export function getItemCandidates(item: string, numBins: number): ItemHashCandidates {
  const clean = item.trim().toLowerCase();
  
  // Three distinct seeds
  const seed1 = 0x9e3779b9;
  const seed2 = 0x517cc1b7;
  const seed3 = 0x165667b1;

  const raw1 = hashStringWithSeed(clean, seed1);
  const raw2 = hashStringWithSeed(clean, seed2);
  const raw3 = hashStringWithSeed(clean, seed3);

  let h1 = raw1 % numBins;
  let h2 = raw2 % numBins;
  let h3 = raw3 % numBins;

  // Guarantee distinct candidate bins when numBins >= 3 for clean Cuckoo hashing visualization
  if (numBins >= 3) {
    if (h2 === h1) {
      h2 = (h1 + 1 + (raw2 % (numBins - 1))) % numBins;
    }
    if (h3 === h1 || h3 === h2) {
      h3 = (h1 + 2) % numBins;
      if (h3 === h2) {
        h3 = (h2 + 1) % numBins;
      }
    }
  }

  return {
    item: item.trim(),
    h1,
    h2,
    h3,
    candidates: [h1, h2, h3],
  };
}

// Run Cuckoo Hashing for Sender (Party A) with detailed eviction step logging
export function runCuckooHashing(
  items: string[],
  numBins: number,
  maxEvictionsPerItem: number = 20
): CuckooResult {
  const bins: CuckooBin[] = Array.from({ length: numBins }, (_, i) => ({
    index: i,
    item: null,
  }));

  const steps: EvictionStep[] = [];
  const stash: string[] = [];
  let stepCounter = 1;

  for (const rawItem of items) {
    const item = rawItem.trim();
    if (!item) continue;

    const { candidates } = getItemCandidates(item, numBins);
    let currentItem = item;
    let currentCandidates = candidates;
    let evictions = 0;
    let inserted = false;

    steps.push({
      stepNumber: stepCounter++,
      action: 'insert',
      item: currentItem,
      toBin: currentCandidates[0],
      candidateBins: currentCandidates,
      description: `Attempting insertion of "${currentItem}". Candidate bins are [${currentCandidates.join(', ')}].`,
    });

    while (evictions < maxEvictionsPerItem) {
      // 1. Try to find an empty candidate bin first
      let emptyBinIdx = -1;
      let emptyCandidateHashIdx = -1;

      for (let c = 0; c < 3; c++) {
        const binIdx = currentCandidates[c];
        if (bins[binIdx].item === null) {
          emptyBinIdx = binIdx;
          emptyCandidateHashIdx = c;
          break;
        }
      }

      if (emptyBinIdx !== -1) {
        // Found an empty bin!
        bins[emptyBinIdx].item = currentItem;
        bins[emptyBinIdx].candidateIndices = currentCandidates;
        bins[emptyBinIdx].activeHashIndex = emptyCandidateHashIdx;

        steps.push({
          stepNumber: stepCounter++,
          action: 'success',
          item: currentItem,
          toBin: emptyBinIdx,
          candidateBins: currentCandidates,
          description: `Placed "${currentItem}" directly into empty Bin ${emptyBinIdx} (using h${emptyCandidateHashIdx + 1}).`,
        });

        inserted = true;
        break;
      }

      // 2. All 3 candidate bins are occupied: evict the occupant of current candidate bin
      // Use rotation based on eviction count to avoid immediate ping-pong
      const hashChoice = evictions % 3;
      const targetBinIdx = currentCandidates[hashChoice];
      const displaced = bins[targetBinIdx].item!;
      const displacedCandidates = bins[targetBinIdx].candidateIndices!;

      // Evict
      bins[targetBinIdx].item = currentItem;
      bins[targetBinIdx].candidateIndices = currentCandidates;
      bins[targetBinIdx].activeHashIndex = hashChoice;

      steps.push({
        stepNumber: stepCounter++,
        action: 'evict',
        item: currentItem,
        toBin: targetBinIdx,
        displacedItem: displaced,
        candidateBins: currentCandidates,
        description: `Bin ${targetBinIdx} is occupied. Inserted "${currentItem}" and evicted "${displaced}".`,
      });

      // The displaced item must now find an alternative bin
      currentItem = displaced;
      currentCandidates = displacedCandidates;
      evictions++;

      steps.push({
        stepNumber: stepCounter++,
        action: 'relocate',
        item: currentItem,
        fromBin: targetBinIdx,
        toBin: currentCandidates[(hashChoice + 1) % 3],
        candidateBins: currentCandidates,
        description: `Relocating evicted "${currentItem}". Checking alternative candidate bins...`,
      });
    }

    if (!inserted) {
      // Eviction loop limit reached: placed in Cuckoo Stash
      stash.push(currentItem);
      steps.push({
        stepNumber: stepCounter++,
        action: 'stash',
        item: currentItem,
        toBin: -1,
        candidateBins: currentCandidates,
        description: `Max eviction limit (${maxEvictionsPerItem}) reached for "${currentItem}". Placed into Cuckoo Stash.`,
      });
    }
  }

  return {
    bins,
    stash,
    steps,
    success: stash.length === 0,
  };
}

// Run Simple Hashing for Receiver (Party B)
// Each item is copied into ALL 3 candidate bins
export function runSimpleHashing(items: string[], numBins: number): SimpleResult {
  const bins: SimpleBin[] = Array.from({ length: numBins }, (_, i) => ({
    index: i,
    items: [],
  }));

  for (const rawItem of items) {
    const item = rawItem.trim();
    if (!item) continue;

    const { candidates } = getItemCandidates(item, numBins);

    // Copy to all 3 candidate bins
    candidates.forEach((binIdx, hashIdx) => {
      // Only push if not already in this bin for this exact item
      const alreadyPresent = bins[binIdx].items.some(
        (it) => it.item.toLowerCase() === item.toLowerCase() && it.hashIndex === hashIdx
      );
      if (!alreadyPresent) {
        bins[binIdx].items.push({
          item,
          hashIndex: hashIdx,
        });
      }
    });
  }

  return { bins };
}

// Simulated Cryptographic Operations for Phase 2, 3, 4
// Realistic hex generation mimicking elliptic curve points & OPRF
export function generateCryptoSim(
  senderItems: string[],
  receiverItems: string[],
  cuckooResult: CuckooResult,
  simpleResult: SimpleResult,
  numBins: number
) {
  // Global sender secret key k (in hex)
  const senderSecretKey = '0x4D2A91F6';

  // Helper to create consistent pseudo-random hexes from a string
  const toHex = (str: string, prefix: number) => {
    const raw = hashStringWithSeed(str, prefix);
    return '0x' + raw.toString(16).padStart(8, '0').toUpperCase();
  };

  // Group element representation H(item)
  const getGroupPoint = (item: string) => toHex(`POINT_${item.toLowerCase()}`, 0x11223344);
  
  // Blinding factor r for receiver
  const getBlindingFactor = (item: string, binIdx: number) => 
    toHex(`BLIND_${item.toLowerCase()}_bin_${binIdx}`, 0x55667788);

  // Blinded point r * H(item)
  const getBlindedPoint = (item: string, binIdx: number) =>
    toHex(`BLINDED_PT_${item.toLowerCase()}_${binIdx}`, 0x99AABBCC);

  // Evaluated point by sender: k * (r * H(item))
  const getEvaluatedPoint = (item: string, binIdx: number) =>
    toHex(`EVAL_PT_${item.toLowerCase()}_${binIdx}`, 0xDDEEFF00);

  // Unblinded point computed by receiver: r^(-1) * Z = k * H(item)
  // CRITICAL PROPERTY: k * H(item) depends ONLY on the item and sender key k, NOT on r!
  const getUnblindedPoint = (item: string) =>
    toHex(`PRF_CORE_${item.toLowerCase()}_KEY_${senderSecretKey}`, 0xCAFEBABE);

  // Final PRF digest: Hash(k * H(item))
  const getFinalPrf = (item: string) => {
    const raw = hashStringWithSeed(`PRF_FINAL_${item.toLowerCase()}`, 0xDEADBEEF);
    return 'PRF-' + raw.toString(16).slice(0, 6).toUpperCase();
  };

  // Build comparisons per bin
  const binComparisons: BinComparison[] = [];
  const allMatchedItems = new Set<string>();

  for (let b = 0; b < numBins; b++) {
    const sBin = cuckooResult.bins[b];
    const rBin = simpleResult.bins[b];

    const senderItem = sBin.item;
    const senderPrf = senderItem ? getFinalPrf(senderItem) : null;

    const receiverItemsList = rBin.items.map((rEntry) => {
      const unblindedPrf = getFinalPrf(rEntry.item);
      const matchesSender =
        senderItem !== null &&
        senderItem.toLowerCase() === rEntry.item.toLowerCase();

      if (matchesSender) {
        allMatchedItems.add(rEntry.item);
      }

      return {
        item: rEntry.item,
        unblindedPrf,
        matchesSender,
      };
    });

    const hasMatch = receiverItemsList.some((r) => r.matchesSender);
    const matchedInThisBin = receiverItemsList
      .filter((r) => r.matchesSender)
      .map((r) => r.item);

    binComparisons.push({
      binIndex: b,
      senderItem,
      senderPrf,
      receiverItems: receiverItemsList,
      hasMatch,
      matchedItems: Array.from(new Set(matchedInThisBin)),
    });
  }

  // Also build detailed cryptographic tokens for inspection drawer
  const receiverTokens: CryptoToken[] = [];
  for (const rBin of simpleResult.bins) {
    for (const entry of rBin.items) {
      receiverTokens.push({
        item: entry.item,
        binIndex: rBin.index,
        groupElement: getGroupPoint(entry.item),
        blindingFactor: getBlindingFactor(entry.item, rBin.index),
        blindedPoint: getBlindedPoint(entry.item, rBin.index),
        evaluatedPoint: getEvaluatedPoint(entry.item, rBin.index),
        unblindedPoint: getUnblindedPoint(entry.item),
        finalPrf: getFinalPrf(entry.item),
      });
    }
  }

  return {
    senderSecretKey,
    binComparisons,
    receiverTokens,
    intersection: Array.from(allMatchedItems),
    getGroupPoint,
    getBlindingFactor,
    getBlindedPoint,
    getEvaluatedPoint,
    getUnblindedPoint,
    getFinalPrf,
  };
}
