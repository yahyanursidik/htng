import { describe, expect, it } from "vitest";
import { generateNumberLineProblem, numberLineProblemKey } from "../../src/learning/addition/number-line-generator";

describe("NumberLine generator", () => {
  it("is deterministic for a seed", () => {
    expect(generateNumberLineProblem({ seed: 41 })).toEqual(generateNumberLineProblem({ seed: 41 }));
  });

  it.each([1, 2, 7, 41, 1001])("keeps Phase A counting-on constraints for seed %i", (seed) => {
    const problem = generateNumberLineProblem({ seed });
    const [a, b] = problem.addends;
    expect(problem.phase).toBe("A");
    expect(problem.concept).toBe("counting-on");
    expect(a).toBeGreaterThanOrEqual(3);
    expect(a).toBeGreaterThanOrEqual(b);
    expect(b).toBeGreaterThanOrEqual(1);
    expect(b).toBeLessThanOrEqual(4);
    expect(problem.total).toBe(a + b);
    expect(problem.total).toBeLessThanOrEqual(10);
    expect(problem.startValue).toBe(a);
    expect(problem.expectedJumpCount).toBe(b);
  });

  it("avoids a recent pair when another candidate exists", () => {
    const first = generateNumberLineProblem({ seed: 81 });
    const next = generateNumberLineProblem({
      seed: 81,
      recentProblemKeys: [numberLineProblemKey(...first.addends)],
    });
    expect(next.addends).not.toEqual(first.addends);
  });
});
