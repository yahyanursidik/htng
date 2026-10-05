import { describe, expect, it } from "vitest";
import {
  generateTenFrameProblem,
  tenFrameProblemKey,
} from "../../src/learning/addition/ten-frame-generator";

describe("generateTenFrameProblem", () => {
  it("is deterministic for the same config and seed", () => {
    const config = { seed: 42, structure: "fills-ten" as const, requireLargerFirst: true };
    expect(generateTenFrameProblem(config)).toEqual(generateTenFrameProblem(config));
  });

  it.each(Array.from({ length: 100 }, (_, seed) => seed))(
    "keeps Phase A constraints for seed %i",
    (seed) => {
      const problem = generateTenFrameProblem({ seed, structure: "fills-ten" });
      const [a, b] = problem.addends;

      expect(Number.isInteger(a)).toBe(true);
      expect(Number.isInteger(b)).toBe(true);
      expect(a).toBeGreaterThan(0);
      expect(b).toBeGreaterThan(0);
      expect(problem.total).toBe(a + b);
      expect(problem.total).toBe(10);
      expect(problem.canonicalSlots).toHaveLength(problem.total);
      expect(problem.canonicalSlots.map((slot) => slot.slot)).toEqual(
        Array.from({ length: problem.total }, (_, index) => index),
      );
      expect(problem.canonicalSlots.slice(0, a).every((slot) => slot.group === "a")).toBe(true);
      expect(problem.canonicalSlots.slice(a).every((slot) => slot.group === "b")).toBe(true);
    },
  );

  it("generates only the requested pedagogical structure", () => {
    const withinFive = generateTenFrameProblem({ seed: 1, structure: "within-five" });
    const crossesFive = generateTenFrameProblem({ seed: 2, structure: "crosses-five" });
    const fillsFive = generateTenFrameProblem({ seed: 3, structure: "fills-five" });

    expect(withinFive.total).toBeLessThanOrEqual(5);
    expect(crossesFive.addends[0]).toBeLessThan(5);
    expect(crossesFive.total).toBeGreaterThanOrEqual(6);
    expect(crossesFive.total).toBeLessThanOrEqual(9);
    expect(fillsFive.total).toBe(5);
  });

  it("puts the larger addend first when counting-on requires it", () => {
    for (let seed = 0; seed < 50; seed += 1) {
      const problem = generateTenFrameProblem({
        seed,
        structure: "fills-ten",
        requireLargerFirst: true,
      });
      expect(problem.addends[0]).toBeGreaterThanOrEqual(problem.addends[1]);
    }
  });

  it("avoids recently used pairs when another candidate exists", () => {
    const first = generateTenFrameProblem({ seed: 8, structure: "fills-ten" });
    const next = generateTenFrameProblem({
      seed: 8,
      structure: "fills-ten",
      recentProblemKeys: [tenFrameProblemKey(...first.addends)],
    });
    expect(next.addends).not.toEqual(first.addends);
  });

  it("rejects a non-integer seed", () => {
    expect(() => generateTenFrameProblem({ seed: 1.5, structure: "fills-ten" })).toThrow(
      "safe integer",
    );
  });
});
