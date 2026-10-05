import { describe, expect, it } from "vitest";
import {
  NUMBER_LINE_ATTEMPT_KEY,
  readNumberLineAttempts,
  readSymbolicAdditionAttempts,
  readTenFrameAttempts,
  saveNumberLineAttempt,
  saveSymbolicAdditionAttempt,
  saveTenFrameAttempt,
  SYMBOLIC_ADDITION_ATTEMPT_KEY,
  TEN_FRAME_ATTEMPT_KEY,
} from "../../src/lib/storage/attempt-evidence";
import type { NumberLineAttemptEvidence } from "../../src/types/number-line";
import type { SymbolicAdditionAttemptEvidence } from "../../src/types/symbolic-addition";
import type { TenFrameAttemptEvidence } from "../../src/types/ten-frame";

function evidence(activityId: string): TenFrameAttemptEvidence {
  return {
    activityId,
    seed: 1,
    addends: [6, 4],
    total: 10,
    structure: "fills-ten",
    answer: 6,
    correct: false,
    attempts: 1,
    answerChanged: false,
    hintsUsed: 0,
    highestHintLevel: 0,
    representationUsed: "ten-frame",
    inputMethods: ["keyboard"],
    misconceptionEvidence: [{ tag: "operation-confusion", confidence: "possible" }],
    masteryEvidence: "not-yet",
    recordedAt: "2026-08-16T00:00:00.000Z",
  };
}

describe("local TenFrame evidence", () => {
  it("stores attempts locally without duplicates for the same activity", () => {
    saveTenFrameAttempt(evidence("first"));
    saveTenFrameAttempt({ ...evidence("first"), attempts: 2 });
    const attempts = readTenFrameAttempts();
    expect(attempts).toHaveLength(1);
    expect(attempts[0]?.attempts).toBe(2);
  });

  it("promotes a repeated cross-problem misconception pattern", () => {
    saveTenFrameAttempt(evidence("first"));
    const saved = saveTenFrameAttempt(evidence("second"));
    expect(saved.misconceptionEvidence[0]?.confidence).toBe("repeated-pattern");
  });

  it("recovers from malformed local data", () => {
    localStorage.setItem(TEN_FRAME_ATTEMPT_KEY, "not-json");
    expect(readTenFrameAttempts()).toEqual([]);
  });
});

function numberLineEvidence(activityId: string): NumberLineAttemptEvidence {
  return {
    activityId,
    seed: 1,
    addends: [6, 3],
    total: 9,
    range: [0, 10],
    targetStrategy: "count-on",
    start: 6,
    startSource: "child-choice",
    jumps: [],
    answer: 6,
    correct: false,
    attempts: 1,
    hintsUsed: 0,
    highestHintLevel: 0,
    representationUsed: "number-line",
    strategyObserved: "count-on",
    inputMethods: ["keyboard"],
    misconceptionEvidence: [{ tag: "operation-confusion", confidence: "possible" }],
    masteryEvidence: "not-yet",
    recordedAt: "2026-08-16T00:00:00.000Z",
  };
}

describe("local NumberLine evidence", () => {
  it("stores local attempts separately and promotes repeat patterns", () => {
    saveNumberLineAttempt(numberLineEvidence("first"));
    const saved = saveNumberLineAttempt(numberLineEvidence("second"));
    expect(readNumberLineAttempts()).toHaveLength(2);
    expect(saved.misconceptionEvidence[0]?.confidence).toBe("repeated-pattern");
  });

  it("recovers from malformed NumberLine data", () => {
    localStorage.setItem(NUMBER_LINE_ATTEMPT_KEY, "not-json");
    expect(readNumberLineAttempts()).toEqual([]);
  });
});

function symbolicEvidence(activityId: string): SymbolicAdditionAttemptEvidence {
  return {
    activityId,
    seed: 1,
    addends: [6, 3],
    total: 9,
    scaffold: "bridge-visible",
    bridgeVisible: true,
    answer: 6,
    correct: false,
    attempts: 1,
    hintsUsed: 0,
    highestHintLevel: 0,
    representationUsed: "equation",
    inputMethods: ["keyboard"],
    misconceptionEvidence: [{ tag: "operation-confusion", confidence: "possible" }],
    masteryEvidence: "not-yet",
    recordedAt: "2026-08-16T00:00:00.000Z",
  };
}

describe("local SymbolicAddition evidence", () => {
  it("stores attempts separately and promotes repeated symbolic patterns", () => {
    saveSymbolicAdditionAttempt(symbolicEvidence("first"));
    const saved = saveSymbolicAdditionAttempt(symbolicEvidence("second"));
    expect(readSymbolicAdditionAttempts()).toHaveLength(2);
    expect(saved.misconceptionEvidence[0]?.confidence).toBe("repeated-pattern");
  });

  it("recovers from malformed symbolic data", () => {
    localStorage.setItem(SYMBOLIC_ADDITION_ATTEMPT_KEY, "not-json");
    expect(readSymbolicAdditionAttempts()).toEqual([]);
  });
});
