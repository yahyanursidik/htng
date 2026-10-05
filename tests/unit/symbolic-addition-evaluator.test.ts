import { describe, expect, it } from "vitest";
import {
  generateSymbolicAdditionProblem,
  symbolicAdditionBridgeKey,
} from "../../src/learning/addition/symbolic-addition-generator";
import {
  createInitialSymbolicAdditionState,
  getSymbolicAdditionMasteryEvidence,
  reduceSymbolicAdditionState,
  toSymbolicAdditionAttemptEvidence,
} from "../../src/learning/addition/symbolic-addition-evaluator";

function solve(problem = generateSymbolicAdditionProblem({ seed: 31, scaffold: "bridge-visible" })) {
  let state = createInitialSymbolicAdditionState();
  state = reduceSymbolicAdditionState(problem, state, { type: "select-result", value: problem.total, input: "keyboard" });
  state = reduceSymbolicAdditionState(problem, state, { type: "submit-result" });
  return { problem, state };
}

describe("SymbolicAddition evaluator", () => {
  it("does not submit before a result is selected", () => {
    const problem = generateSymbolicAdditionProblem({ seed: 1, scaffold: "bridge-visible" });
    const state = reduceSymbolicAdditionState(problem, createInitialSymbolicAdditionState(), { type: "submit-result" });
    expect(state.attempts).toBe(0);
    expect(state.complete).toBe(false);
    expect(state.feedback?.message).toMatch(/Pilih hasil/);
  });

  it("records developing mastery for a correct visible-bridge response", () => {
    const { problem, state } = solve();
    expect(state.complete).toBe(true);
    expect(getSymbolicAdditionMasteryEvidence(problem, state)).toBe("developing");
  });

  it("records independent mastery for a correct symbolic-first response", () => {
    const { problem, state } = solve(generateSymbolicAdditionProblem({ seed: 31, scaffold: "symbolic-first" }));
    expect(getSymbolicAdditionMasteryEvidence(problem, state)).toBe("independent");
  });

  it("reveals the bridge at H3 and retains the selected result after an error", () => {
    const problem = generateSymbolicAdditionProblem({ seed: 9, scaffold: "symbolic-first" });
    let state = createInitialSymbolicAdditionState();
    state = reduceSymbolicAdditionState(problem, state, { type: "select-result", value: problem.addends[0], input: "pointer" });
    state = reduceSymbolicAdditionState(problem, state, { type: "submit-result" });
    state = reduceSymbolicAdditionState(problem, state, { type: "request-hint" });
    state = reduceSymbolicAdditionState(problem, state, { type: "request-hint" });
    state = reduceSymbolicAdditionState(problem, state, { type: "request-hint" });
    expect(state.activeHint?.level).toBe(3);
    expect(state.bridgeRevealed).toBe(true);
    expect(state.selectedResult).toBe(problem.addends[0]);
  });

  it("uses quantity-symbol disconnect only with prior matching bridge evidence", () => {
    const problem = generateSymbolicAdditionProblem({ seed: 15, scaffold: "bridge-visible" });
    let state = createInitialSymbolicAdditionState();
    state = reduceSymbolicAdditionState(problem, state, { type: "select-result", value: problem.total + 1, input: "pointer" });
    state = reduceSymbolicAdditionState(problem, state, { type: "submit-result" }, {
      priorCorrectBridgeKeys: [symbolicAdditionBridgeKey(problem)],
    });
    expect(state.observations[0]?.tag).toBe("quantity-symbol-disconnect");
  });

  it("serializes bridge visibility and local attempt evidence", () => {
    const { problem, state } = solve();
    const evidence = toSymbolicAdditionAttemptEvidence(problem, state, 900);
    expect(evidence).toMatchObject({
      bridgeVisible: true,
      representationUsed: "equation",
      masteryEvidence: "developing",
      responseTimeMs: 900,
    });
  });
});
