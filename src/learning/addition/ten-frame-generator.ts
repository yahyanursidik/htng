import type {
  AdditionConcept,
  TenFrameProblem,
  TenFrameStructure,
} from "../../types/ten-frame";

export interface TenFrameGeneratorConfig {
  seed: number;
  structure: TenFrameStructure;
  concept?: AdditionConcept;
  requireLargerFirst?: boolean;
  recentProblemKeys?: readonly string[];
}

interface Candidate {
  a: number;
  b: number;
  key: string;
}

const answerOptions = Object.freeze(Array.from({ length: 11 }, (_, value) => value));

function mulberry32(seed: number): () => number {
  let state = seed >>> 0;
  return () => {
    state += 0x6d2b79f5;
    let value = state;
    value = Math.imul(value ^ (value >>> 15), value | 1);
    value ^= value + Math.imul(value ^ (value >>> 7), value | 61);
    return ((value ^ (value >>> 14)) >>> 0) / 4_294_967_296;
  };
}

function matchesStructure(a: number, b: number, structure: TenFrameStructure): boolean {
  const total = a + b;
  switch (structure) {
    case "within-five":
      return total >= 2 && total <= 5;
    case "crosses-five":
      return a < 5 && total >= 6 && total <= 9;
    case "fills-five":
      return total === 5;
    case "fills-ten":
      return total === 10;
  }
}

function defaultConcept(structure: TenFrameStructure): AdditionConcept {
  if (structure === "fills-ten") return "make-ten";
  if (structure === "fills-five") return "make-five";
  return "joining";
}

export function tenFrameProblemKey(a: number, b: number): string {
  return `${a}+${b}`;
}

export function generateTenFrameProblem(config: TenFrameGeneratorConfig): TenFrameProblem {
  if (!Number.isSafeInteger(config.seed)) {
    throw new Error("TenFrame seed must be a safe integer.");
  }

  const allCandidates: Candidate[] = [];
  for (let a = 1; a <= 9; a += 1) {
    for (let b = 1; b <= 9; b += 1) {
      if (a + b > 10 || !matchesStructure(a, b, config.structure)) continue;
      if (config.requireLargerFirst && a < b) continue;
      allCandidates.push({ a, b, key: tenFrameProblemKey(a, b) });
    }
  }

  if (allCandidates.length === 0) {
    throw new Error(`No TenFrame problems satisfy structure ${config.structure}.`);
  }

  const recent = new Set(config.recentProblemKeys ?? []);
  const unseen = allCandidates.filter((candidate) => !recent.has(candidate.key));
  const pool = unseen.length > 0 ? unseen : allCandidates;
  const random = mulberry32(config.seed);
  const candidate = pool[Math.floor(random() * pool.length)];

  if (!candidate) {
    throw new Error("TenFrame generator produced no candidate.");
  }

  const total = candidate.a + candidate.b;
  const canonicalSlots = Array.from({ length: total }, (_, slot) => ({
    slot,
    group: slot < candidate.a ? ("a" as const) : ("b" as const),
  }));

  return {
    id: `ten-frame-${config.structure}-${candidate.a}-${candidate.b}-${config.seed}`,
    phase: "A",
    mode: "join",
    concept: config.concept ?? defaultConcept(config.structure),
    seed: config.seed,
    addends: [candidate.a, candidate.b],
    total,
    structure: config.structure,
    prompt: `Ada ${candidate.a} keping biru di bingkai. Tambahkan ${candidate.b} keping kuning. Berapa semuanya?`,
    answerOptions,
    canonicalSlots,
  };
}
