import { symbolicAdditionBridgeKey } from "./symbolic-addition-generator";
import { getSymbolicAdditionHints } from "./symbolic-addition-hints";
import type {
  SymbolicAdditionAttemptEvidence,
  SymbolicAdditionInputMethod,
  SymbolicAdditionIntent,
  SymbolicAdditionMasteryEvidence,
  SymbolicAdditionMisconceptionTag,
  SymbolicAdditionProblem,
  SymbolicAdditionViewState,
} from "../../types/symbolic-addition";

export interface SymbolicAdditionEvaluationContext {
  priorCorrectBridgeKeys?: readonly string[];
}

export function createInitialSymbolicAdditionState(): SymbolicAdditionViewState {
  return {
    attempts: 0,
    revealedHintLevels: [],
    bridgeRevealed: false,
    announcement: "Bentuk angka siap. Pilih hasil penjumlahan.",
    status: "answering",
    complete: false,
    inputMethods: [],
    observations: [],
  };
}

function addInputMethod(
  methods: SymbolicAdditionInputMethod[],
  method: SymbolicAdditionInputMethod,
): SymbolicAdditionInputMethod[] {
  return methods.includes(method) ? methods : [...methods, method];
}

function bridgeIsVisible(problem: SymbolicAdditionProblem, state: SymbolicAdditionViewState): boolean {
  return problem.scaffold !== "symbolic-first" || state.bridgeRevealed;
}

function observeWrongAnswer(
  problem: SymbolicAdditionProblem,
  state: SymbolicAdditionViewState,
  answer: number,
  context: SymbolicAdditionEvaluationContext,
): SymbolicAdditionMisconceptionTag {
  const [a, b] = problem.addends;
  if (answer === a || answer === b) return "operation-confusion";
  if (answer < Math.max(a, b) || answer > problem.total + 2) return "number-magnitude";
  if (context.priorCorrectBridgeKeys?.includes(symbolicAdditionBridgeKey(problem))) {
    return "quantity-symbol-disconnect";
  }
  if (bridgeIsVisible(problem, state)) return "counting-error";
  return "counting-error";
}

export function reduceSymbolicAdditionState(
  problem: SymbolicAdditionProblem,
  state: SymbolicAdditionViewState,
  intent: SymbolicAdditionIntent,
  context: SymbolicAdditionEvaluationContext = {},
): SymbolicAdditionViewState {
  if (state.complete) return state;

  switch (intent.type) {
    case "select-result":
      return {
        ...state,
        selectedResult: intent.value,
        inputMethods: addInputMethod(state.inputMethods, intent.input),
        status: state.status === "incorrect" ? "answering" : state.status,
        feedback: undefined,
        announcement: `Jawaban ${intent.value} dipilih.`,
      };

    case "submit-result": {
      if (state.selectedResult === undefined) {
        return {
          ...state,
          feedback: { tone: "neutral", message: "Pilih hasil penjumlahan dulu." },
          announcement: "Pilih satu hasil sebelum memeriksa jawaban.",
        };
      }

      const attempts = state.attempts + 1;
      if (state.selectedResult === problem.total) {
        const [a, b] = problem.addends;
        const message = `Ya. ${a} ditambah ${b} sama dengan ${problem.total}.`;
        return {
          ...state,
          attempts,
          complete: true,
          status: "complete",
          feedback: { tone: "correct", message },
          announcement: message,
        };
      }

      const tag = observeWrongAnswer(problem, state, state.selectedResult, context);
      const message = tag === "operation-confusion"
        ? "Belum tepat. Dua angka itu digabung, bukan dipilih salah satunya."
        : "Belum tepat. Periksa lagi angka tempat garis berhenti.";
      return {
        ...state,
        attempts,
        status: "incorrect",
        feedback: { tone: "neutral", message },
        announcement: `${message} Petunjuk sekarang tersedia.`,
        observations: [...state.observations, { tag, answer: state.selectedResult }],
      };
    }

    case "request-hint": {
      if (state.attempts === 0 || state.revealedHintLevels.length >= 5) return state;
      const hint = getSymbolicAdditionHints(problem)[state.revealedHintLevels.length];
      if (!hint) return state;
      return {
        ...state,
        activeHint: hint,
        bridgeRevealed: state.bridgeRevealed || hint.level === 3,
        revealedHintLevels: [...state.revealedHintLevels, hint.level],
        announcement: `Petunjuk ${hint.level}. ${hint.content}`,
      };
    }
  }
}

export function getSymbolicAdditionMasteryEvidence(
  problem: SymbolicAdditionProblem,
  state: SymbolicAdditionViewState,
): SymbolicAdditionMasteryEvidence {
  if (!state.complete) return "not-yet";
  if (state.revealedHintLevels.length > 0) return "supported";
  if (state.attempts > 1) return "developing";
  return problem.scaffold === "bridge-visible" ? "developing" : "independent";
}

export function toSymbolicAdditionAttemptEvidence(
  problem: SymbolicAdditionProblem,
  state: SymbolicAdditionViewState,
  responseTimeMs?: number,
): SymbolicAdditionAttemptEvidence {
  const uniqueTags = [...new Set(state.observations.map((observation) => observation.tag))];
  const highestHintLevel = state.revealedHintLevels.at(-1) ?? 0;
  return {
    activityId: problem.id,
    seed: problem.seed,
    addends: problem.addends,
    total: problem.total,
    scaffold: problem.scaffold,
    bridgeVisible: bridgeIsVisible(problem, state),
    answer: state.selectedResult,
    correct: state.complete,
    attempts: state.attempts,
    hintsUsed: state.revealedHintLevels.length,
    highestHintLevel,
    representationUsed: "equation",
    inputMethods: state.inputMethods,
    responseTimeMs,
    misconceptionEvidence: uniqueTags.map((tag) => ({ tag, confidence: "possible" as const })),
    masteryEvidence: getSymbolicAdditionMasteryEvidence(problem, state),
    recordedAt: new Date().toISOString(),
  };
}
