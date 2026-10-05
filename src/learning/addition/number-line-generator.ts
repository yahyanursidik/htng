import type { NumberLineProblem } from "../../types/number-line";

export interface NumberLineGeneratorConfig {
  seed: number;
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

export function numberLineProblemKey(a: number, b: number): string {
  return `${a}+${b}`;
}

export function generateNumberLineProblem(config: NumberLineGeneratorConfig): NumberLineProblem {
  if (!Number.isSafeInteger(config.seed)) {
    throw new Error("NumberLine seed must be a safe integer.");
  }

  const candidates: Candidate[] = [];
  for (let a = 3; a <= 9; a += 1) {
    for (let b = 1; b <= 4; b += 1) {
      if (a < b || a + b > 10) continue;
      candidates.push({ a, b, key: numberLineProblemKey(a, b) });
    }
  }

  const recent = new Set(config.recentProblemKeys ?? []);
  const unseen = candidates.filter((candidate) => !recent.has(candidate.key));
  const pool = unseen.length > 0 ? unseen : candidates;
  const random = mulberry32(config.seed);
  const candidate = pool[Math.floor(random() * pool.length)];
  if (!candidate) throw new Error("NumberLine generator produced no candidate.");

  const total = candidate.a + candidate.b;
  return {
    id: `number-line-${candidate.a}-${candidate.b}-${config.seed}`,
    phase: "A",
    concept: "counting-on",
    seed: config.seed,
    addends: [candidate.a, candidate.b],
    total,
    range: [0, 10],
    targetStrategy: "count-on",
    startValue: candidate.a,
    expectedJumpCount: candidate.b,
    prompt: `Mulai dari ${candidate.a}. Lompat maju ${candidate.b} kali. Kamu tiba di angka berapa?`,
    answerOptions,
  };
}
