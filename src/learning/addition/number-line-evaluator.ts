import { getNumberLineHints } from "./number-line-hints";
import type {
  NumberLineAttemptEvidence,
  NumberLineInputMethod,
  NumberLineIntent,
  NumberLineMasteryEvidence,
  NumberLineMisconceptionObservation,
  NumberLineProblem,
  NumberLineViewState,
} from "../../types/number-line";

export function createInitialNumberLineState(): NumberLineViewState {
  return {
    jumps: [],
    attempts: 0,
    revealedHintLevels: [],
    announcement: "Garis bilangan siap. Pilih angka untuk mulai.",
    status: "choosing-start",
    complete: false,
    inputMethods: [],
    observations: [],
  };
}

function addInputMethod(
  methods: NumberLineInputMethod[],
  method: NumberLineInputMethod,
): NumberLineInputMethod[] {
  return methods.includes(method) ? methods : [...methods, method];
}

function strategyForStart(problem: NumberLineProblem, start: number) {
  return start === problem.startValue ? ("count-on" as const) : ("count-all" as const);
}

function expectedJumps(problem: NumberLineProblem, start: number): number {
  return problem.total - start;
}

function observeWrongAnswer(
  problem: NumberLineProblem,
  state: NumberLineViewState,
  answer: number,
): NumberLineMisconceptionObservation {
  const [a, b] = problem.addends;
  if (answer === a || answer === b) return { tag: "operation-confusion", answer };
  if (state.strategyObserved === "count-all") return { tag: "counting-from-one-dependence", answer };
  return { tag: "counting-error", answer };
}

export function reduceNumberLineState(
  problem: NumberLineProblem,
  state: NumberLineViewState,
  intent: NumberLineIntent,
): NumberLineViewState {
  if (state.complete) return state;

  switch (intent.type) {
    case "select-start": {
      if (intent.value !== 0 && intent.value !== problem.startValue) return state;
      const strategyObserved = strategyForStart(problem, intent.value);
      const jumpCount = expectedJumps(problem, intent.value);
      return {
        ...state,
        start: intent.value,
        currentValue: intent.value,
        jumps: [],
        strategyObserved,
        inputMethods: addInputMethod(state.inputMethods, intent.input),
        status: "jumping",
        feedback: undefined,
        announcement:
          strategyObserved === "count-on"
            ? `Mulai dari ${intent.value}. Kamu perlu ${jumpCount} lompatan maju.`
            : `Kamu memilih mulai dari 0. Kamu perlu ${jumpCount} lompatan untuk menghitung semua.`,
      };
    }

    case "add-unit-jump": {
      if (state.start === undefined || state.currentValue === undefined || state.status !== "jumping") {
        return state;
      }
      if (state.currentValue >= problem.total) return state;

      const next = state.currentValue + 1;
      const jumps = [...state.jumps, { from: state.currentValue, to: next, length: 1 as const, input: intent.input }];
      const remaining = problem.total - next;
      const completeJumps = remaining === 0;
      return {
        ...state,
        currentValue: next,
        jumps,
        inputMethods: addInputMethod(state.inputMethods, intent.input),
        status: completeJumps ? "answering" : "jumping",
        announcement: completeJumps
          ? `Kamu tiba di ${next}. Pilih jawabanmu.`
          : `Lompat ke ${next}. Masih ${remaining} lompatan maju.`,
      };
    }

    case "select-answer":
      if (state.status !== "answering" && state.status !== "incorrect") return state;
      return {
        ...state,
        selectedAnswer: intent.value,
        status: state.status === "incorrect" ? "answering" : state.status,
        feedback: undefined,
        announcement: `Jawaban ${intent.value} dipilih.`,
      };

    case "submit-answer": {
      if (state.status !== "answering" && state.status !== "incorrect") return state;
      if (state.selectedAnswer === undefined) {
        return {
          ...state,
          feedback: { tone: "neutral", message: "Pilih angka tempat kamu tiba dulu." },
          announcement: "Pilih satu angka sebelum memeriksa jawaban.",
        };
      }

      const attempts = state.attempts + 1;
      if (state.selectedAnswer === problem.total) {
        const [a, b] = problem.addends;
        const message = `Ya. Mulai dari ${a}, maju ${b} kali, tiba di ${problem.total}.`;
        return {
          ...state,
          attempts,
          complete: true,
          status: "complete",
          feedback: { tone: "correct", message },
          announcement: message,
        };
      }

      const observation = observeWrongAnswer(problem, state, state.selectedAnswer);
      const message =
        observation.tag === "operation-confusion"
          ? "Belum tepat. Penjumlahan menggabungkan angka awal dan lompatan maju."
          : "Belum tepat. Lihat angka tempat lompatanmu berhenti.";
      return {
        ...state,
        attempts,
        status: "incorrect",
        feedback: { tone: "neutral", message },
        announcement: `${message} Petunjuk sekarang tersedia.`,
        observations: [...state.observations, observation],
      };
    }

    case "request-hint": {
      if (state.attempts === 0 || state.revealedHintLevels.length >= 5) return state;
      const hint = getNumberLineHints(problem)[state.revealedHintLevels.length];
      if (!hint) return state;
      return {
        ...state,
        activeHint: hint,
        revealedHintLevels: [...state.revealedHintLevels, hint.level],
        announcement: `Petunjuk ${hint.level}. ${hint.content}`,
      };
    }
  }
}

export function getNumberLineMasteryEvidence(
  state: NumberLineViewState,
): NumberLineMasteryEvidence {
  if (!state.complete) return "not-yet";
  if (state.revealedHintLevels.length > 0) return "supported";
  if (state.strategyObserved === "count-on" && state.attempts === 1) return "independent";
  return "developing";
}

export function toNumberLineAttemptEvidence(
  problem: NumberLineProblem,
  state: NumberLineViewState,
  responseTimeMs?: number,
): NumberLineAttemptEvidence {
  const uniqueTags = [...new Set(state.observations.map((observation) => observation.tag))];
  const highestHintLevel = state.revealedHintLevels.at(-1) ?? 0;
  return {
    activityId: problem.id,
    seed: problem.seed,
    addends: problem.addends,
    total: problem.total,
    range: problem.range,
    targetStrategy: problem.targetStrategy,
    start: state.start,
    startSource: state.start === undefined ? undefined : "child-choice",
    jumps: state.jumps,
    answer: state.selectedAnswer,
    correct: state.complete,
    attempts: state.attempts,
    hintsUsed: state.revealedHintLevels.length,
    highestHintLevel,
    representationUsed: "number-line",
    strategyObserved: state.strategyObserved,
    inputMethods: state.inputMethods,
    responseTimeMs,
    misconceptionEvidence: uniqueTags.map((tag) => ({ tag, confidence: "possible" as const })),
    masteryEvidence: getNumberLineMasteryEvidence(state),
    recordedAt: new Date().toISOString(),
  };
}
