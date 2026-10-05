import { storyObjectStripKey } from "./story-problem-generator";
import { getStoryProblemHints } from "./story-problem-hints";
import type { StoryProblem, StoryProblemAttemptEvidence, StoryProblemInputMethod, StoryProblemIntent, StoryProblemMasteryEvidence, StoryProblemMisconceptionTag, StoryProblemViewState } from "../../types/story-problem";
export interface StoryProblemEvaluationContext { priorCorrectObjectStripKeys?: readonly string[]; }
export function createInitialStoryProblemState(): StoryProblemViewState { return { attempts: 0, objectStripRevealed: false, revealedHintLevels: [], announcement: "Cerita siap. Pilih apa yang terjadi pada jumlah benda.", status: "answering", complete: false, inputMethods: [], observations: [] }; }
function methods(existing: StoryProblemInputMethod[], input: StoryProblemInputMethod) { return existing.includes(input) ? existing : [...existing, input]; }
function stripVisible(problem: StoryProblem, state: StoryProblemViewState) { return problem.scaffold !== "story-symbolic" || state.objectStripRevealed; }
function observation(problem: StoryProblem, state: StoryProblemViewState, context: StoryProblemEvaluationContext): StoryProblemMisconceptionTag {
  const [a, b] = problem.addends; const result = state.selectedResult ?? 0;
  if (state.selectedEvent === "take-away") return result === problem.total ? "operation-confusion" : "word-problem-interpretation";
  if (result < Math.max(a, b) || result > problem.total + 2) return "number-magnitude";
  if (context.priorCorrectObjectStripKeys?.includes(storyObjectStripKey(problem))) return "quantity-symbol-disconnect";
  return "counting-error";
}
export function reduceStoryProblemState(problem: StoryProblem, state: StoryProblemViewState, intent: StoryProblemIntent, context: StoryProblemEvaluationContext = {}): StoryProblemViewState {
  if (state.complete) return state;
  switch (intent.type) {
    case "select-event": return { ...state, selectedEvent: intent.value, inputMethods: methods(state.inputMethods, intent.input), status: state.status === "incorrect" ? "answering" : state.status, feedback: undefined, announcement: intent.value === "add-to" ? "Bertambah dipilih." : "Berkurang dipilih." };
    case "select-result": return { ...state, selectedResult: intent.value, inputMethods: methods(state.inputMethods, intent.input), status: state.status === "incorrect" ? "answering" : state.status, feedback: undefined, announcement: `Jawaban ${intent.value} dipilih.` };
    case "submit": {
      if (!state.selectedEvent) return { ...state, feedback: { tone: "neutral", message: "Pilih dulu: jumlahnya bertambah atau berkurang?" }, announcement: "Pilih makna cerita sebelum memeriksa jawaban." };
      if (state.selectedResult === undefined) return { ...state, feedback: { tone: "neutral", message: "Pilih jumlah benda sekarang dulu." }, announcement: "Pilih satu jumlah sebelum memeriksa jawaban." };
      const attempts = state.attempts + 1;
      if (state.selectedEvent === "add-to" && state.selectedResult === problem.total) return { ...state, attempts, complete: true, status: "complete", feedback: { tone: "correct", message: `Ya. ${problem.equation.left} ditambah ${problem.equation.right} sama dengan ${problem.total}.` }, announcement: `Ya. ${problem.equation.left} ditambah ${problem.equation.right} sama dengan ${problem.total}.` };
      const tag = observation(problem, state, context); const message = state.selectedEvent === "take-away" ? "Belum tepat. Cerita ini menambah benda, bukan mengambil benda." : "Belum tepat. Periksa lagi jumlah benda yang sudah ada dan yang ditambah.";
      return { ...state, attempts, status: "incorrect", feedback: { tone: "neutral", message }, announcement: `${message} Petunjuk sekarang tersedia.`, observations: [...state.observations, { tag, event: state.selectedEvent, answer: state.selectedResult }] };
    }
    case "request-hint": { if (state.attempts === 0 || state.revealedHintLevels.length >= 5) return state; const hint = getStoryProblemHints(problem)[state.revealedHintLevels.length]; if (!hint) return state; return { ...state, activeHint: hint, objectStripRevealed: state.objectStripRevealed || hint.level === 3, revealedHintLevels: [...state.revealedHintLevels, hint.level], announcement: `Petunjuk ${hint.level}. ${hint.content}` }; }
  }
}
export function getStoryProblemMasteryEvidence(problem: StoryProblem, state: StoryProblemViewState): StoryProblemMasteryEvidence { if (!state.complete) return "not-yet"; if (state.revealedHintLevels.length) return "supported"; if (state.attempts > 1 || problem.scaffold === "objects-visible") return "developing"; return "independent"; }
export function toStoryProblemAttemptEvidence(problem: StoryProblem, state: StoryProblemViewState, responseTimeMs?: number): StoryProblemAttemptEvidence { const tags = [...new Set(state.observations.map((item) => item.tag))]; return { activityId: problem.id, seed: problem.seed, templateId: problem.story.id, item: problem.story.item, addends: problem.addends, total: problem.total, scaffold: problem.scaffold, objectStripVisible: stripVisible(problem, state), selectedEvent: state.selectedEvent, answer: state.selectedResult, correct: state.complete, attempts: state.attempts, hintsUsed: state.revealedHintLevels.length, highestHintLevel: state.revealedHintLevels.at(-1) ?? 0, representationUsed: "story-problem", inputMethods: state.inputMethods, responseTimeMs, misconceptionEvidence: tags.map((tag) => ({ tag, confidence: "possible" as const })), masteryEvidence: getStoryProblemMasteryEvidence(problem, state), recordedAt: new Date().toISOString() }; }
