import { describe, expect, it } from "vitest";
import { generateNumberLineProblem } from "../../src/learning/addition/number-line-generator";
import {
  createInitialNumberLineState,
  getNumberLineMasteryEvidence,
  reduceNumberLineState,
  toNumberLineAttemptEvidence,
} from "../../src/learning/addition/number-line-evaluator";

function countOnToAnswer(problem = generateNumberLineProblem({ seed: 17 })) {
  let state = createInitialNumberLineState();
  state = reduceNumberLineState(problem, state, { type: "select-start", value: problem.startValue, input: "keyboard" });
  while (state.status === "jumping") {
    state = reduceNumberLineState(problem, state, { type: "add-unit-jump", input: "keyboard" });
  }
  return { problem, state };
}

describe("NumberLine evaluator", () => {
  it("records a count-on trace and completes only after the answer", () => {
    const { problem, state: jumped } = countOnToAnswer();
    expect(jumped.strategyObserved).toBe("count-on");
    expect(jumped.jumps).toHaveLength(problem.expectedJumpCount);
    expect(jumped.currentValue).toBe(problem.total);
    expect(jumped.complete).toBe(false);
    const selected = reduceNumberLineState(problem, jumped, { type: "select-answer", value: problem.total });
    const complete = reduceNumberLineState(problem, selected, { type: "submit-answer" });
    expect(complete.complete).toBe(true);
    expect(getNumberLineMasteryEvidence(complete)).toBe("independent");
  });

  it("distinguishes counting-all by the selected start and its longer trace", () => {
    const problem = generateNumberLineProblem({ seed: 33 });
    let state = reduceNumberLineState(problem, createInitialNumberLineState(), {
      type: "select-start", value: 0, input: "pointer",
    });
    while (state.status === "jumping") {
      state = reduceNumberLineState(problem, state, { type: "add-unit-jump", input: "pointer" });
    }
    expect(state.strategyObserved).toBe("count-all");
    expect(state.jumps).toHaveLength(problem.total);
  });

  it("offers progressive hints after an incorrect response and retains the trace", () => {
    const { problem, state: jumped } = countOnToAnswer();
    let state = reduceNumberLineState(problem, jumped, { type: "select-answer", value: problem.startValue });
    state = reduceNumberLineState(problem, state, { type: "submit-answer" });
    state = reduceNumberLineState(problem, state, { type: "request-hint" });
    state = reduceNumberLineState(problem, state, { type: "request-hint" });
    expect(state.activeHint?.level).toBe(2);
    expect(state.jumps).toHaveLength(problem.expectedJumpCount);
  });

  it("serializes local evidence with the observed strategy and jumps", () => {
    const { problem, state: jumped } = countOnToAnswer();
    const selected = reduceNumberLineState(problem, jumped, { type: "select-answer", value: problem.total });
    const complete = reduceNumberLineState(problem, selected, { type: "submit-answer" });
    const evidence = toNumberLineAttemptEvidence(problem, complete, 1200);
    expect(evidence).toMatchObject({
      correct: true, representationUsed: "number-line", strategyObserved: "count-on",
      masteryEvidence: "independent", responseTimeMs: 1200,
    });
    expect(evidence.jumps).toHaveLength(problem.expectedJumpCount);
  });
});
