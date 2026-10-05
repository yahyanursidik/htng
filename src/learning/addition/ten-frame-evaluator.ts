import { getTenFrameHints } from "./ten-frame-hints";
import type {
  InputMethod,
  MasteryEvidence,
  MisconceptionObservation,
  TenFrameAttemptEvidence,
  TenFrameIntent,
  TenFrameProblem,
  TenFrameViewState,
} from "../../types/ten-frame";

export function createInitialTenFrameState(): TenFrameViewState {
  return {
    placedBCount: 0,
    attempts: 0,
    answerChanged: false,
    revealedHintLevels: [],
    announcement: "Bingkai siap. Tambahkan keping kelompok kedua.",
    status: "building",
    complete: false,
    inputMethods: [],
    observations: [],
  };
}

function addInputMethod(methods: InputMethod[], method: InputMethod): InputMethod[] {
  return methods.includes(method) ? methods : [...methods, method];
}

function observeWrongAnswer(problem: TenFrameProblem, answer: number): MisconceptionObservation {
  const [a, b] = problem.addends;
  return {
    tag: answer === a || answer === b ? "operation-confusion" : "counting-error",
    answer,
  };
}

export function reduceTenFrameState(
  problem: TenFrameProblem,
  state: TenFrameViewState,
  intent: TenFrameIntent,
): TenFrameViewState {
  if (state.complete && intent.type !== "select-strategy") return state;

  switch (intent.type) {
    case "add-counter": {
      const [, b] = problem.addends;
      if (state.placedBCount >= b) return state;

      const placedBCount = state.placedBCount + 1;
      const remaining = b - placedBCount;
      const allPlaced = remaining === 0;

      return {
        ...state,
        placedBCount,
        inputMethods: addInputMethod(state.inputMethods, intent.input),
        status: allPlaced ? "answering" : "building",
        announcement: allPlaced
          ? `Semua keping sudah masuk. Ada ${problem.total} kotak terisi. Pilih jumlahnya.`
          : `Satu keping ditambahkan. ${remaining} keping tersisa.`,
      };
    }

    case "select-answer":
      if (state.status === "building") return state;
      return {
        ...state,
        answerChanged:
          state.answerChanged ||
          (state.selectedAnswer !== undefined && state.selectedAnswer !== intent.value),
        selectedAnswer: intent.value,
        status: state.status === "incorrect" ? "answering" : state.status,
        feedback: state.status === "incorrect" ? undefined : state.feedback,
        announcement: `Jawaban ${intent.value} dipilih.`,
      };

    case "submit-answer": {
      if (state.status === "building") return state;
      if (state.selectedAnswer === undefined) {
        return {
          ...state,
          feedback: { tone: "neutral", message: "Pilih jumlahnya dulu." },
          announcement: "Pilih satu jumlah sebelum memeriksa jawaban.",
        };
      }

      const attempts = state.attempts + 1;
      if (state.selectedAnswer === problem.total) {
        const [a, b] = problem.addends;
        const message = `Ya. ${a} dan ${b} menjadi ${problem.total}.`;
        return {
          ...state,
          attempts,
          complete: true,
          status: "complete",
          feedback: { tone: "correct", message },
          announcement: message,
        };
      }

      const observation = observeWrongAnswer(problem, state.selectedAnswer);
      const message =
        observation.tag === "operation-confusion"
          ? "Belum tepat. Kamu sudah menggabungkan dua kelompok. Coba hitung semua kotak yang terisi."
          : "Belum tepat. Coba lihat lagi semua kotak yang terisi.";

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
      const hints = getTenFrameHints(problem);
      const hint = hints[state.revealedHintLevels.length];
      if (!hint) return state;
      return {
        ...state,
        activeHint: hint,
        revealedHintLevels: [...state.revealedHintLevels, hint.level],
        announcement: `Petunjuk ${hint.level}. ${hint.content}`,
      };
    }

    case "select-strategy":
      return { ...state, strategySelected: intent.strategy };
  }
}

export function getMasteryEvidence(state: TenFrameViewState): MasteryEvidence {
  if (!state.complete) return "not-yet";
  if (state.revealedHintLevels.length > 0) return "supported";
  if (state.attempts === 1) return "independent";
  return "developing";
}

export function toTenFrameAttemptEvidence(
  problem: TenFrameProblem,
  state: TenFrameViewState,
  responseTimeMs?: number,
): TenFrameAttemptEvidence {
  const uniqueTags = [...new Set(state.observations.map((observation) => observation.tag))];
  const highestHintLevel = state.revealedHintLevels.at(-1) ?? 0;

  return {
    activityId: problem.id,
    seed: problem.seed,
    addends: problem.addends,
    total: problem.total,
    structure: problem.structure,
    answer: state.selectedAnswer,
    correct: state.complete,
    attempts: state.attempts,
    answerChanged: state.answerChanged,
    hintsUsed: state.revealedHintLevels.length,
    highestHintLevel,
    representationUsed: "ten-frame",
    strategySelected: state.strategySelected,
    inputMethods: state.inputMethods,
    responseTimeMs,
    misconceptionEvidence: uniqueTags.map((tag) => ({ tag, confidence: "possible" })),
    masteryEvidence: getMasteryEvidence(state),
    recordedAt: new Date().toISOString(),
  };
}
