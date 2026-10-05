import { describe, expect, it } from "vitest";
import { generateStoryProblem, storyObjectStripKey, storyProblemKey } from "../../src/learning/addition/story-problem-generator";
import { createInitialStoryProblemState, getStoryProblemMasteryEvidence, reduceStoryProblemState, toStoryProblemAttemptEvidence } from "../../src/learning/addition/story-problem-evaluator";

describe("StoryProblem domain", () => {
  it("is deterministic and keeps approved story, equation, and strip invariants", () => {
    const first = generateStoryProblem({ seed: 44, scaffold: "objects-visible" });
    expect(first).toEqual(generateStoryProblem({ seed: 44, scaffold: "objects-visible" }));
    const [a, b] = first.addends;
    expect(a).toBeGreaterThanOrEqual(b); expect(b).toBeGreaterThanOrEqual(1); expect(first.total).toBe(a + b);
    expect(first.equation.left).toBe(a); expect(first.objectStrip).toMatchObject({ initialCount: a, addedCount: b, total: first.total });
    const next = generateStoryProblem({ seed: 44, scaffold: "objects-visible", recentProblemKeys: [storyProblemKey(first.story.id, a, b)] });
    expect(next.id).not.toBe(first.id);
  });

  it("requires event and result, then records a supported object-visible success", () => {
    const problem = generateStoryProblem({ seed: 7, scaffold: "objects-visible" });
    let state = reduceStoryProblemState(problem, createInitialStoryProblemState(), { type: "submit" });
    expect(state.attempts).toBe(0);
    state = reduceStoryProblemState(problem, state, { type: "select-event", value: "add-to", input: "keyboard" });
    state = reduceStoryProblemState(problem, state, { type: "select-result", value: problem.total, input: "keyboard" });
    state = reduceStoryProblemState(problem, state, { type: "submit" });
    expect(state.complete).toBe(true); expect(getStoryProblemMasteryEvidence(problem, state)).toBe("developing");
    expect(toStoryProblemAttemptEvidence(problem, state).objectStripVisible).toBe(true);
  });

  it("records observed operation meaning and reveals strip at H3", () => {
    const problem = generateStoryProblem({ seed: 7, scaffold: "story-symbolic" }); let state = createInitialStoryProblemState();
    state = reduceStoryProblemState(problem, state, { type: "select-event", value: "take-away", input: "pointer" });
    state = reduceStoryProblemState(problem, state, { type: "select-result", value: problem.total, input: "pointer" });
    state = reduceStoryProblemState(problem, state, { type: "submit" });
    expect(state.observations[0]?.tag).toBe("operation-confusion");
    state = reduceStoryProblemState(problem, state, { type: "request-hint" }); state = reduceStoryProblemState(problem, state, { type: "request-hint" }); state = reduceStoryProblemState(problem, state, { type: "request-hint" });
    expect(state.objectStripRevealed).toBe(true); expect(storyObjectStripKey(problem)).toContain(problem.story.item);
  });
});
