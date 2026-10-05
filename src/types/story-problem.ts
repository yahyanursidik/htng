export type StoryProblemScaffold = "objects-visible" | "objects-compact" | "story-symbolic";
export type StoryEventMeaning = "add-to" | "take-away";
export type StoryProblemInputMethod = "pointer" | "keyboard" | "switch";
export type StoryProblemMisconceptionTag = "operation-confusion" | "word-problem-interpretation" | "counting-error" | "quantity-symbol-disconnect" | "number-magnitude";
export type StoryTemplateId = "in-box-added" | "on-table-arrived" | "in-jar-inserted";
export type StoryItem = "pensil" | "buku" | "kancing";

export interface StoryTemplate {
  id: StoryTemplateId;
  item: StoryItem;
  initialSentence: string;
  changeSentence: string;
  question: string;
  additionCue: "ditambah" | "datang lagi" | "masuk lagi";
}

export interface StoryObjectStrip {
  representation: "counters";
  itemLabel: StoryItem;
  initialCount: number;
  addedCount: number;
  total: number;
}

export interface StoryProblem {
  id: string;
  phase: "A";
  concept: "story-add-to";
  seed: number;
  addends: readonly [number, number];
  total: number;
  story: StoryTemplate;
  equation: { left: number; operator: "+"; right: number; equals: "=" };
  scaffold: StoryProblemScaffold;
  objectStrip?: StoryObjectStrip;
  answerOptions: readonly number[];
}

export interface StoryProblemHint {
  level: 1 | 2 | 3 | 4 | 5;
  kind: "attention" | "question" | "representation" | "partial-step" | "worked-reasoning";
  content: string;
}

export type StoryProblemIntent =
  | { type: "select-event"; value: StoryEventMeaning; input: StoryProblemInputMethod }
  | { type: "select-result"; value: number; input: StoryProblemInputMethod }
  | { type: "submit" }
  | { type: "request-hint" };

export interface StoryProblemViewState {
  selectedEvent?: StoryEventMeaning;
  selectedResult?: number;
  attempts: number;
  objectStripRevealed: boolean;
  revealedHintLevels: Array<1 | 2 | 3 | 4 | 5>;
  activeHint?: StoryProblemHint;
  feedback?: { tone: "neutral" | "correct"; message: string };
  announcement: string;
  status: "answering" | "incorrect" | "complete";
  complete: boolean;
  inputMethods: StoryProblemInputMethod[];
  observations: Array<{ tag: StoryProblemMisconceptionTag; event?: StoryEventMeaning; answer?: number }>;
}

export type StoryProblemMasteryEvidence = "not-yet" | "supported" | "developing" | "independent";
export interface StoryProblemAttemptEvidence {
  activityId: string; seed: number; templateId: StoryTemplateId; item: StoryItem;
  addends: readonly [number, number]; total: number; scaffold: StoryProblemScaffold;
  objectStripVisible: boolean; selectedEvent?: StoryEventMeaning; answer?: number;
  correct: boolean; attempts: number; hintsUsed: number; highestHintLevel: 0 | 1 | 2 | 3 | 4 | 5;
  representationUsed: "story-problem"; inputMethods: StoryProblemInputMethod[]; responseTimeMs?: number;
  misconceptionEvidence: Array<{ tag: StoryProblemMisconceptionTag; confidence: "possible" | "repeated-pattern" }>;
  masteryEvidence: StoryProblemMasteryEvidence; recordedAt: string;
}
