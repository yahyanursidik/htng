import {describe, it, expect} from "vitest";
import {calculate, numberError, type Calculation, type Operation} from "../../src/learning/calculator/engine";
function solved(a: string, op: Operation, b: string): Calculation {
  const answer = calculate(a, op, b);
  if (!answer.ok) throw new Error(answer.message);
  return answer.calculation;
}
describe("exact explaining calculator", () => {
  it.each([
    ["28", "add", "17", "45"], ["99", "add", "1", "100"],
    ["52", "subtract", "28", "24"], ["1000", "subtract", "1", "999"],
    ["12", "multiply", "4", "48"], ["17", "divide", "4", "4,25"],
    ["0.1", "add", "0,2", "0,3"], ["1,25", "add", "0,75", "2"],
    ["1,2", "multiply", "0,3", "0,36"], ["1,25", "subtract", "0,6", "0,65"],
    ["1,2", "divide", "0,3", "4"], ["0,006", "divide", "0,002", "3"],
    ["5", "subtract", "8", "−3"], ["-5", "add", "8", "3"],
    ["-5", "add", "-8", "−13"], ["5", "add", "-8", "−3"],
    ["-5", "subtract", "-8", "3"], ["-5", "subtract", "8", "−13"],
    ["-3", "multiply", "4", "−12"], ["-3", "multiply", "-4", "12"],
    ["-17", "divide", "4", "−4,25"], ["-17", "divide", "-4", "4,25"],
    ["0", "divide", "3", "0"], ["-0", "add", "+0", "0"],
    ["0", "multiply", "-7", "0"], ["123", "subtract", "0", "123"],
    ["999999,999", "multiply", "999999,999", "999999998000,000001"],
  ] as const)("%s %s %s = %s", (a, op, b, expected) => {
    const result = solved(a, op, b);
    expect(result.exact).toBe(expected); expect(result.approximation).toBeUndefined();
    expect(result.steps.length).toBeGreaterThan(1);
    expect(solved(a, op, b)).toEqual(result);
    expect(result.steps.at(-1)?.equation).toContain(`= ${expected}`);
    expect(result.steps.every(s => s.title && s.equation && s.explanation)).toBe(true);
  });
  it("explains carrying, borrowing, distributivity and decimal scaling", () => {
    expect(solved("28", "add", "17").steps.find(s => s.title === "Satuan")?.explanation).toContain("15 satuan = 1 puluhan dan 5 satuan");
    expect(solved("52", "subtract", "28").steps.find(s => s.title === "Kurangi satuan")?.explanation).toContain("32 = 20 + 12");
    expect(solved("12", "multiply", "4").steps.map(s => s.equation)).toContain("10 × 4 = 40");
    expect(solved("12", "multiply", "4").steps.map(s => s.equation)).toContain("40 + 8 = 48");
    expect(solved("1,2", "divide", "0,3").steps[0]?.equation).toBe("1,2 ÷ 0,3 = 12 ÷ 3");
    expect(solved("17", "divide", "4").steps.map(s => s.equation)).toContain("17 = 4 × 4 + 1");
  });
  it("keeps repeating or long decimals exact and labels rounded approximations", () => {
    const third = solved("1", "divide", "3");
    expect(third.exact).toBe("1/3"); expect(third.approximation).toBe("0,333333");
    expect(third.check).toContain("(1/3) × 3 = 1");
    expect(third.steps.some(s => s.title === "Desimal berulang")).toBe(true);
    expect(solved("2", "divide", "3").approximation).toBe("0,666667");
    expect(solved("-2", "divide", "3").approximation).toBe("−0,666667");
    expect(solved("1", "divide", "128")).toMatchObject({exact: "1/128", approximation: "0,007813"});
    expect(solved("1", "divide", "999999")).toMatchObject({exact: "1/999999", approximation: "0,000001"});
  });
  it.each(["", " ", "1e2", "NaN", "Infinity", "1/2", "1.000,5", "1,000.5", "1 2", ".5", "1.", "1000000", "0.0001", "2+3", "<script>", "1".repeat(100)])("rejects invalid number %s", raw => {
    expect(numberError(raw)).not.toBeNull();
    expect(calculate(raw, "add", "1")).toMatchObject({ok: false, field: "first"});
    expect(calculate("1", "add", raw)).toMatchObject({ok: false, field: "second"});
  });
  it("validates operation and zero division without throwing or displaying Infinity", () => {
    expect(calculate("1", "pow", "2")).toMatchObject({ok: false, field: "operation"});
    expect(calculate("1", "toString", "2")).toMatchObject({ok: false});
    for (const zero of ["0", "-0", "0,000", "0.0"]) {
      expect(calculate("17", "divide", zero)).toMatchObject({ok: false, field: "second", message: expect.stringContaining("Tidak dapat membagi")});
      expect(calculate("0", "divide", zero)).toMatchObject({ok: false, message: expect.stringContaining("tidak mempunyai satu hasil tertentu")});
    }
    expect(solved("17", "multiply", "0").check).not.toContain("÷");
    expect(numberError(" −3,5 ")).toBeNull();
  });
  it("preserves exact arithmetic for a signed grid of operands", () => {
    for (let a = -7; a <= 7; a++) for (let b = -7; b <= 7; b++) for (const op of ["add", "subtract", "multiply", "divide"] as const) {
      if (op === "divide" && !b) continue;
      const result = solved(String(a), op, String(b));
      const n = BigInt(result.fraction.numerator), d = BigInt(result.fraction.denominator);
      expect(d > 0n).toBe(true);
      const expected = op === "add" ? a + b : op === "subtract" ? a - b : a * b;
      if (op === "divide") expect(n * BigInt(b)).toBe(BigInt(a) * d);
      else expect(n).toBe(BigInt(expected) * d);
    }
  });
});
