export type SymbolicAdditionScaffold = "bridge-visible" | "bridge-compact" | "symbolic-first";

export type SymbolicAdditionInputMethod = "pointer" | "keyboard" | "switch";

export type SymbolicAdditionMisconceptionTag =
  | "operation-confusion"
  | "counting-error"
  | "quantity-symbol-disconnect"
  | "number-magnitude";

export interface SymbolicAdditionBridge {
  representation: "number-line";
  range: readonly [0, 10];
  start: number;
  jumps: readonly { from: number; to: number; length: 1 }[];
  landing: number;
}

export interface SymbolicAdditionProblem {
  id: string;
  phase: "A";
  concept: "symbolic-addition";
  seed: number;
  addends: readonly [number, number];
  total: number;
  equation: { left: number; operator: "+"; right: number; equals: "=" };
  scaffold: SymbolicAdditionScaffold;
  bridge?: SymbolicAdditionBridge;
  prompt: string;
  answerOptions: readonly number[];
}

export interface SymbolicAdditionHint {
  level: 1 | 2 | 3 | 4 | 5;
  kind:
    | "attention"
    | "question"
    | "representation"
    | "partial-step"
    | "worked-reasoning";
  content: string;
}

export type SymbolicAdditionIntent =
  | { type: "select-result"; value: number; input: SymbolicAdditionInputMethod }
  | { type: "submit-result" }
  | { type: "request-hint" };

export interface SymbolicAdditionViewState {
  selectedResult?: number;
  attempts: number;
  revealedHintLevels: Array<1 | 2 | 3 | 4 | 5>;
  activeHint?: SymbolicAdditionHint;
  bridgeRevealed: boolean;
  feedback?: { tone: "neutral" | "correct"; message: string };
  announcement: string;
  status: "answering" | "incorrect" | "complete";
  complete: boolean;
  inputMethods: SymbolicAdditionInputMethod[];
  observations: Array<{ tag: SymbolicAdditionMisconceptionTag; answer: number }>;
}

export type SymbolicAdditionMasteryEvidence = "not-yet" | "supported" | "developing" | "independent";

export interface SymbolicAdditionAttemptEvidence {
  activityId: string;
  seed: number;
  addends: readonly [number, number];
  total: number;
  scaffold: SymbolicAdditionScaffold;
  bridgeVisible: boolean;
  answer?: number;
  correct: boolean;
  attempts: number;
  hintsUsed: number;
  highestHintLevel: 0 | 1 | 2 | 3 | 4 | 5;
  representationUsed: "equation";
  inputMethods: SymbolicAdditionInputMethod[];
  responseTimeMs?: number;
  misconceptionEvidence: Array<{
    tag: SymbolicAdditionMisconceptionTag;
    confidence: "possible" | "repeated-pattern";
  }>;
  masteryEvidence: SymbolicAdditionMasteryEvidence;
  recordedAt: string;
}
