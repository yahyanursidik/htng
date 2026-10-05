import type { TenFrameAttemptEvidence } from "../../types/ten-frame";
import type { NumberLineAttemptEvidence } from "../../types/number-line";
import type { SymbolicAdditionAttemptEvidence } from "../../types/symbolic-addition";
import type { StoryProblemAttemptEvidence } from "../../types/story-problem";
import type { ExplainStrategyAttemptEvidence } from "../../types/explain-strategy";

export const TEN_FRAME_ATTEMPT_KEY = "mathyahya.ten-frame.attempts.v1";
export const NUMBER_LINE_ATTEMPT_KEY = "mathyahya.number-line.attempts.v1";
export const SYMBOLIC_ADDITION_ATTEMPT_KEY = "mathyahya.symbolic-addition.attempts.v1";
export const STORY_PROBLEM_ATTEMPT_KEY = "mathyahya.story-problem.attempts.v1";
export const EXPLAIN_STRATEGY_ATTEMPT_KEY = "mathyahya.explain-strategy.attempts.v1";
const MAX_LOCAL_ATTEMPTS = 50;

export function readTenFrameAttempts(storage: Storage = localStorage): TenFrameAttemptEvidence[] {
  try {
    const raw = storage.getItem(TEN_FRAME_ATTEMPT_KEY);
    if (!raw) return [];
    const parsed: unknown = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as TenFrameAttemptEvidence[]) : [];
  } catch {
    return [];
  }
}

export function saveTenFrameAttempt(
  evidence: TenFrameAttemptEvidence,
  storage: Storage = localStorage,
): TenFrameAttemptEvidence {
  const previous = readTenFrameAttempts(storage);
  const misconceptionEvidence = evidence.misconceptionEvidence.map((item) => {
    const repeated = previous.some(
      (attempt) =>
        attempt.activityId !== evidence.activityId &&
        attempt.misconceptionEvidence.some((prior) => prior.tag === item.tag),
    );
    return { ...item, confidence: repeated ? ("repeated-pattern" as const) : item.confidence };
  });
  const enriched = { ...evidence, misconceptionEvidence };
  const withoutSameActivity = previous.filter(
    (attempt) => attempt.activityId !== evidence.activityId,
  );

  try {
    storage.setItem(
      TEN_FRAME_ATTEMPT_KEY,
      JSON.stringify([enriched, ...withoutSameActivity].slice(0, MAX_LOCAL_ATTEMPTS)),
    );
  } catch {
    // Learning remains usable when storage is unavailable or full.
  }

  return enriched;
}

export function readNumberLineAttempts(storage: Storage = localStorage): NumberLineAttemptEvidence[] {
  try {
    const raw = storage.getItem(NUMBER_LINE_ATTEMPT_KEY);
    if (!raw) return [];
    const parsed: unknown = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as NumberLineAttemptEvidence[]) : [];
  } catch {
    return [];
  }
}

export function saveNumberLineAttempt(
  evidence: NumberLineAttemptEvidence,
  storage: Storage = localStorage,
): NumberLineAttemptEvidence {
  const previous = readNumberLineAttempts(storage);
  const misconceptionEvidence = evidence.misconceptionEvidence.map((item) => {
    const repeated = previous.some(
      (attempt) =>
        attempt.activityId !== evidence.activityId &&
        attempt.misconceptionEvidence.some((prior) => prior.tag === item.tag),
    );
    return { ...item, confidence: repeated ? ("repeated-pattern" as const) : item.confidence };
  });
  const enriched = { ...evidence, misconceptionEvidence };
  const withoutSameActivity = previous.filter((attempt) => attempt.activityId !== evidence.activityId);
  try {
    storage.setItem(
      NUMBER_LINE_ATTEMPT_KEY,
      JSON.stringify([enriched, ...withoutSameActivity].slice(0, MAX_LOCAL_ATTEMPTS)),
    );
  } catch {
    // Learning remains usable when storage is unavailable or full.
  }
  return enriched;
}

export function readSymbolicAdditionAttempts(
  storage: Storage = localStorage,
): SymbolicAdditionAttemptEvidence[] {
  try {
    const raw = storage.getItem(SYMBOLIC_ADDITION_ATTEMPT_KEY);
    if (!raw) return [];
    const parsed: unknown = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as SymbolicAdditionAttemptEvidence[]) : [];
  } catch {
    return [];
  }
}

export function saveSymbolicAdditionAttempt(
  evidence: SymbolicAdditionAttemptEvidence,
  storage: Storage = localStorage,
): SymbolicAdditionAttemptEvidence {
  const previous = readSymbolicAdditionAttempts(storage);
  const misconceptionEvidence = evidence.misconceptionEvidence.map((item) => {
    const repeated = previous.some(
      (attempt) =>
        attempt.activityId !== evidence.activityId &&
        attempt.misconceptionEvidence.some((prior) => prior.tag === item.tag),
    );
    return { ...item, confidence: repeated ? ("repeated-pattern" as const) : item.confidence };
  });
  const enriched = { ...evidence, misconceptionEvidence };
  const withoutSameActivity = previous.filter((attempt) => attempt.activityId !== evidence.activityId);
  try {
    storage.setItem(
      SYMBOLIC_ADDITION_ATTEMPT_KEY,
      JSON.stringify([enriched, ...withoutSameActivity].slice(0, MAX_LOCAL_ATTEMPTS)),
    );
  } catch {
    // Learning remains usable when storage is unavailable or full.
  }
  return enriched;
}

export function readStoryProblemAttempts(storage: Storage = localStorage): StoryProblemAttemptEvidence[] {
  try { const raw = storage.getItem(STORY_PROBLEM_ATTEMPT_KEY); if (!raw) return []; const parsed: unknown = JSON.parse(raw); return Array.isArray(parsed) ? (parsed as StoryProblemAttemptEvidence[]) : []; } catch { return []; }
}

export function saveStoryProblemAttempt(evidence: StoryProblemAttemptEvidence, storage: Storage = localStorage): StoryProblemAttemptEvidence {
  const previous = readStoryProblemAttempts(storage);
  const misconceptionEvidence = evidence.misconceptionEvidence.map((item) => ({ ...item, confidence: previous.some((attempt) => attempt.activityId !== evidence.activityId && attempt.misconceptionEvidence.some((prior) => prior.tag === item.tag)) ? ("repeated-pattern" as const) : item.confidence }));
  const enriched = { ...evidence, misconceptionEvidence };
  try { storage.setItem(STORY_PROBLEM_ATTEMPT_KEY, JSON.stringify([enriched, ...previous.filter((attempt) => attempt.activityId !== evidence.activityId)].slice(0, MAX_LOCAL_ATTEMPTS))); } catch { /* Learning remains usable when storage is unavailable or full. */ }
  return enriched;
}

export function saveExplainStrategyAttempt(evidence: ExplainStrategyAttemptEvidence, storage: Storage = localStorage): ExplainStrategyAttemptEvidence { try { const previous: ExplainStrategyAttemptEvidence[] = JSON.parse(storage.getItem(EXPLAIN_STRATEGY_ATTEMPT_KEY) ?? "[]"); const next = [evidence, ...previous.filter((attempt) => attempt.activityId !== evidence.activityId)].slice(0, MAX_LOCAL_ATTEMPTS); storage.setItem(EXPLAIN_STRATEGY_ATTEMPT_KEY, JSON.stringify(next)); } catch { /* Learning remains usable when storage is unavailable or full. */ } return evidence; }
