import type {
  SymbolicAdditionBridge,
  SymbolicAdditionProblem,
  SymbolicAdditionScaffold,
} from "../../types/symbolic-addition";

export interface SymbolicAdditionGeneratorConfig {
  seed: number;
  scaffold: SymbolicAdditionScaffold;
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

export function symbolicAdditionProblemKey(a: number, b: number): string {
  return `${a}+${b}`;
}

export function symbolicAdditionBridgeKey(problem: Pick<SymbolicAdditionProblem, "addends">): string {
  return symbolicAdditionProblemKey(...problem.addends);
}

export function createSymbolicAdditionBridge(a: number, b: number): SymbolicAdditionBridge {
  return {
    representation: "number-line",
    range: [0, 10],
    start: a,
    jumps: Array.from({ length: b }, (_, index) => ({
      from: a + index,
      to: a + index + 1,
      length: 1 as const,
    })),
    landing: a + b,
  };
}

export function generateSymbolicAdditionProblem(
  config: SymbolicAdditionGeneratorConfig,
): SymbolicAdditionProblem {
  if (!Number.isSafeInteger(config.seed)) {
    throw new Error("SymbolicAddition seed must be a safe integer.");
  }

  const candidates: Candidate[] = [];
  for (let a = 3; a <= 9; a += 1) {
    for (let b = 1; b <= 4; b += 1) {
      if (a < b || a + b > 10) continue;
      candidates.push({ a, b, key: symbolicAdditionProblemKey(a, b) });
    }
  }

  const recent = new Set(config.recentProblemKeys ?? []);
  const unseen = candidates.filter((candidate) => !recent.has(candidate.key));
  const pool = unseen.length > 0 ? unseen : candidates;
  const candidate = pool[Math.floor(mulberry32(config.seed)() * pool.length)];
  if (!candidate) throw new Error("SymbolicAddition generator produced no candidate.");

  const total = candidate.a + candidate.b;
  const bridge = config.scaffold === "symbolic-first"
    ? undefined
    : createSymbolicAdditionBridge(candidate.a, candidate.b);
  return {
    id: `symbolic-addition-${config.scaffold}-${candidate.a}-${candidate.b}-${config.seed}`,
    phase: "A",
    concept: "symbolic-addition",
    seed: config.seed,
    addends: [candidate.a, candidate.b],
    total,
    equation: { left: candidate.a, operator: "+", right: candidate.b, equals: "=" },
    scaffold: config.scaffold,
    bridge,
    prompt: `Garis bilangan menunjukkan ${candidate.a} mulai lalu ${candidate.b} lompatan. Lengkapi bentuk angkanya.`,
    answerOptions,
  };
}
