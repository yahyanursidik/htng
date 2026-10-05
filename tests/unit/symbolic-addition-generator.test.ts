import { describe, expect, it } from "vitest";
import {
  generateSymbolicAdditionProblem,
  symbolicAdditionProblemKey,
} from "../../src/learning/addition/symbolic-addition-generator";

describe("SymbolicAddition generator", () => {
  it("is deterministic for a seed and scaffold", () => {
    expect(
      generateSymbolicAdditionProblem({ seed: 42, scaffold: "bridge-visible" }),
    ).toEqual(generateSymbolicAdditionProblem({ seed: 42, scaffold: "bridge-visible" }));
  });

  it.each(["bridge-visible", "bridge-compact", "symbolic-first"] as const)(
    "keeps equation invariants for %s",
    (scaffold) => {
      const problem = generateSymbolicAdditionProblem({ seed: 42, scaffold });
      const [a, b] = problem.addends;
      expect(a).toBeGreaterThanOrEqual(b);
      expect(b).toBeGreaterThanOrEqual(1);
      expect(b).toBeLessThanOrEqual(4);
      expect(problem.total).toBe(a + b);
      expect(problem.equation).toEqual({ left: a, operator: "+", right: b, equals: "=" });
      expect(problem.answerOptions).toEqual(Array.from({ length: 11 }, (_, value) => value));

      if (scaffold === "symbolic-first") {
        expect(problem.bridge).toBeUndefined();
      } else {
        expect(problem.bridge?.start).toBe(a);
        expect(problem.bridge?.landing).toBe(problem.total);
        expect(problem.bridge?.jumps).toHaveLength(b);
        expect(problem.bridge?.jumps).toEqual(
          expect.arrayContaining([{ from: a, to: a + 1, length: 1 }]),
        );
        expect(problem.bridge?.jumps.every((jump, index) => jump.from === a + index && jump.to === a + index + 1)).toBe(true);
      }
    },
  );

  it("avoids a recent ordered pair when another candidate exists", () => {
    const first = generateSymbolicAdditionProblem({ seed: 12, scaffold: "bridge-visible" });
    const next = generateSymbolicAdditionProblem({
      seed: 12,
      scaffold: "bridge-visible",
      recentProblemKeys: [symbolicAdditionProblemKey(...first.addends)],
    });
    expect(next.addends).not.toEqual(first.addends);
  });
});
