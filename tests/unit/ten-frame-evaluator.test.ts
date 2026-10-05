import { describe, expect, it } from "vitest";
import {
  createInitialTenFrameState,
  getMasteryEvidence,
  reduceTenFrameState,
  toTenFrameAttemptEvidence,
} from "../../src/learning/addition/ten-frame-evaluator";
import { generateTenFrameProblem } from "../../src/learning/addition/ten-frame-generator";
import type { TenFrameViewState } from "../../src/types/ten-frame";

const problem = generateTenFrameProblem({
  seed: 17,
  structure: "fills-ten",
  requireLargerFirst: true,
});

function buildFrame(state = createInitialTenFrameState()): TenFrameViewState {
  let current = state;
  for (let index = 0; index < problem.addends[1]; index += 1) {
    current = reduceTenFrameState(problem, current, {
      type: "add-counter",
      counterId: `b-${index + 1}`,
      input: "keyboard",
    });
  }
  return current;
}

describe("TenFrame evaluator", () => {
  it("moves from building to answering when all B counters are placed", () => {
    const state = buildFrame();
    expect(state.placedBCount).toBe(problem.addends[1]);
    expect(state.status).toBe("answering");
    expect(state.inputMethods).toEqual(["keyboard"]);
  });

  it("does not count submission without an answer as an attempt", () => {
    const state = reduceTenFrameState(problem, buildFrame(), { type: "submit-answer" });
    expect(state.attempts).toBe(0);
    expect(state.feedback?.message).toBe("Pilih jumlahnya dulu.");
  });

  it("classifies a first-try, unhinted success as independent", () => {
    let state = buildFrame();
    state = reduceTenFrameState(problem, state, { type: "select-answer", value: 10 });
    state = reduceTenFrameState(problem, state, { type: "submit-answer" });

    expect(state.complete).toBe(true);
    expect(state.feedback?.message).toContain("menjadi 10");
    expect(getMasteryEvidence(state)).toBe("independent");
  });

  it("classifies an unhinted self-correction as developing", () => {
    let state = buildFrame();
    state = reduceTenFrameState(problem, state, {
      type: "select-answer",
      value: problem.addends[0],
    });
    state = reduceTenFrameState(problem, state, { type: "submit-answer" });
    expect(state.observations.at(-1)?.tag).toBe("operation-confusion");

    state = reduceTenFrameState(problem, state, { type: "select-answer", value: 10 });
    state = reduceTenFrameState(problem, state, { type: "submit-answer" });
    expect(getMasteryEvidence(state)).toBe("developing");
    expect(state.answerChanged).toBe(true);
  });

  it("reveals hints in order and counts each level once", () => {
    let state = buildFrame();
    state = reduceTenFrameState(problem, state, { type: "select-answer", value: 0 });
    state = reduceTenFrameState(problem, state, { type: "submit-answer" });
    state = reduceTenFrameState(problem, state, { type: "request-hint" });
    state = reduceTenFrameState(problem, state, { type: "request-hint" });

    expect(state.revealedHintLevels).toEqual([1, 2]);
    expect(state.activeHint?.kind).toBe("question");
  });

  it("records supported evidence after a hint", () => {
    let state = buildFrame();
    state = reduceTenFrameState(problem, state, { type: "select-answer", value: 0 });
    state = reduceTenFrameState(problem, state, { type: "submit-answer" });
    state = reduceTenFrameState(problem, state, { type: "request-hint" });
    state = reduceTenFrameState(problem, state, { type: "select-answer", value: 10 });
    state = reduceTenFrameState(problem, state, { type: "submit-answer" });

    const evidence = toTenFrameAttemptEvidence(problem, state, 8_000);
    expect(evidence.masteryEvidence).toBe("supported");
    expect(evidence.hintsUsed).toBe(1);
    expect(evidence.highestHintLevel).toBe(1);
    expect(evidence.responseTimeMs).toBe(8_000);
    expect(evidence.misconceptionEvidence).toEqual([
      { tag: "counting-error", confidence: "possible" },
    ]);
  });
});
