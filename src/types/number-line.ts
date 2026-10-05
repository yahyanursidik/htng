export type NumberLineStrategy = "count-all" | "count-on";

export type NumberLineInputMethod = "pointer" | "keyboard" | "switch";

export type NumberLineMisconceptionTag =
  | "counting-error"
  | "counting-from-one-dependence"
  | "operation-confusion";

export interface NumberLineJump {
  from: number;
  to: number;
  length: 1;
  input: NumberLineInputMethod;
}

export interface NumberLineProblem {
  id: string;
  phase: "A";
  concept: "counting-on";
  seed: number;
  addends: readonly [number, number];
  total: number;
  range: readonly [0, 10];
  targetStrategy: "count-on";
  startValue: number;
  expectedJumpCount: number;
  prompt: string;
  answerOptions: readonly number[];
}

export interface NumberLineHint {
  level: 1 | 2 | 3 | 4 | 5;
  kind:
    | "attention"
    | "question"
    | "representation"
    | "partial-step"
    | "worked-reasoning";
  content: string;
}

export type NumberLineIntent =
  | { type: "select-start"; value: number; input: NumberLineInputMethod }
  | { type: "add-unit-jump"; input: NumberLineInputMethod }
  | { type: "select-answer"; value: number }
  | { type: "submit-answer" }
  | { type: "request-hint" };

export interface NumberLineFeedback {
  tone: "neutral" | "correct";
  message: string;
}

export interface NumberLineMisconceptionObservation {
  tag: NumberLineMisconceptionTag;
  answer: number;
}

export interface NumberLineViewState {
  start?: number;
  strategyObserved?: NumberLineStrategy;
  currentValue?: number;
  jumps: NumberLineJump[];
  selectedAnswer?: number;
  attempts: number;
  revealedHintLevels: Array<1 | 2 | 3 | 4 | 5>;
  activeHint?: NumberLineHint;
  feedback?: NumberLineFeedback;
  announcement: string;
  status: "choosing-start" | "jumping" | "answering" | "incorrect" | "complete";
  complete: boolean;
  inputMethods: NumberLineInputMethod[];
  observations: NumberLineMisconceptionObservation[];
}

export type NumberLineMasteryEvidence = "not-yet" | "supported" | "developing" | "independent";

export interface NumberLineAttemptEvidence {
  activityId: string;
  seed: number;
  addends: readonly [number, number];
  total: number;
  range: readonly [0, 10];
  targetStrategy: "count-on";
  start?: number;
  startSource?: "child-choice";
  jumps: NumberLineJump[];
  answer?: number;
  correct: boolean;
  attempts: number;
  hintsUsed: number;
  highestHintLevel: 0 | 1 | 2 | 3 | 4 | 5;
  representationUsed: "number-line";
  strategyObserved?: NumberLineStrategy;
  inputMethods: NumberLineInputMethod[];
  responseTimeMs?: number;
  misconceptionEvidence: Array<{
    tag: NumberLineMisconceptionTag;
    confidence: "possible" | "repeated-pattern";
  }>;
  masteryEvidence: NumberLineMasteryEvidence;
  recordedAt: string;
}
