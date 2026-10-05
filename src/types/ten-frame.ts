export type AdditionConcept =
  | "joining"
  | "counting-all"
  | "counting-on"
  | "make-five"
  | "make-ten";

export type TenFrameStructure =
  | "within-five"
  | "crosses-five"
  | "fills-five"
  | "fills-ten";

export type InputMethod = "pointer" | "keyboard" | "switch";

export type Strategy = "count-all" | "count-on" | "saw-five" | "saw-ten";

export type MisconceptionTag = "operation-confusion" | "counting-error";

export interface TenFrameSlot {
  slot: number;
  group: "a" | "b";
}

export interface TenFrameProblem {
  id: string;
  phase: "A";
  mode: "join";
  concept: AdditionConcept;
  seed: number;
  addends: readonly [number, number];
  total: number;
  structure: TenFrameStructure;
  prompt: string;
  answerOptions: readonly number[];
  canonicalSlots: readonly TenFrameSlot[];
}

export interface Hint {
  level: 1 | 2 | 3 | 4 | 5;
  kind:
    | "attention"
    | "question"
    | "representation"
    | "partial-step"
    | "worked-reasoning";
  content: string;
}

export type TenFrameIntent =
  | { type: "add-counter"; counterId: string; input: InputMethod }
  | { type: "select-answer"; value: number }
  | { type: "submit-answer" }
  | { type: "request-hint" }
  | { type: "select-strategy"; strategy: Strategy };

export interface Feedback {
  tone: "neutral" | "correct";
  message: string;
}

export interface MisconceptionObservation {
  tag: MisconceptionTag;
  answer: number;
}

export interface TenFrameViewState {
  placedBCount: number;
  selectedAnswer?: number;
  attempts: number;
  answerChanged: boolean;
  revealedHintLevels: Array<1 | 2 | 3 | 4 | 5>;
  activeHint?: Hint;
  feedback?: Feedback;
  announcement: string;
  status: "building" | "answering" | "incorrect" | "complete";
  complete: boolean;
  inputMethods: InputMethod[];
  observations: MisconceptionObservation[];
  strategySelected?: Strategy;
}

export type MasteryEvidence = "not-yet" | "supported" | "developing" | "independent";

export interface TenFrameAttemptEvidence {
  activityId: string;
  seed: number;
  addends: readonly [number, number];
  total: number;
  structure: TenFrameStructure;
  answer?: number;
  correct: boolean;
  attempts: number;
  answerChanged: boolean;
  hintsUsed: number;
  highestHintLevel: 0 | 1 | 2 | 3 | 4 | 5;
  representationUsed: "ten-frame";
  strategySelected?: Strategy;
  inputMethods: InputMethod[];
  responseTimeMs?: number;
  misconceptionEvidence: Array<{
    tag: MisconceptionTag;
    confidence: "possible" | "repeated-pattern";
  }>;
  masteryEvidence: MasteryEvidence;
  recordedAt: string;
}
