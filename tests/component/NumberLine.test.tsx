import { fireEvent, render, screen, waitFor } from "@testing-library/preact";
import { describe, expect, it } from "vitest";
import { NumberLineActivity } from "../../src/components/math/NumberLine/NumberLineActivity";
import { readNumberLineAttempts } from "../../src/lib/storage/attempt-evidence";
import { generateNumberLineProblem } from "../../src/learning/addition/number-line-generator";

function renderActivity() {
  const problem = generateNumberLineProblem({ seed: 20260817 });
  render(<NumberLineActivity problem={problem} />);
  return problem;
}

function jumpUntilAnswer() {
  while (screen.queryByRole("button", { name: "Lompat maju satu" })) {
    fireEvent.click(screen.getByRole("button", { name: "Lompat maju satu" }), { detail: 0 });
  }
}

describe("NumberLine activity", () => {
  it("exposes a semantic line, a repeatable instruction, and two start choices", () => {
    const problem = renderActivity();
    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent(problem.prompt);
    expect(screen.getByRole("img", { name: /Garis bilangan dari 0 sampai 10/ })).toBeInTheDocument();
    expect(screen.getByRole("radio", { name: `Mulai dari ${problem.startValue}` })).toBeInTheDocument();
    expect(screen.getByRole("radio", { name: "Hitung dari 0" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Ulangi instruksi dengan suara" })).toBeInTheDocument();
  });

  it("uses keyboard activation for counting-on and persists local evidence", async () => {
    const problem = renderActivity();
    fireEvent.click(screen.getByRole("radio", { name: `Mulai dari ${problem.startValue}` }), { detail: 0 });
    jumpUntilAnswer();
    fireEvent.click(screen.getByRole("radio", { name: String(problem.total) }));
    fireEvent.click(screen.getByRole("button", { name: "Cek jawaban" }));
    expect(screen.getByRole("status")).toHaveTextContent(`tiba di ${problem.total}`);
    await waitFor(() => expect(readNumberLineAttempts()).toHaveLength(1));
    expect(readNumberLineAttempts()[0]).toMatchObject({
      strategyObserved: "count-on", representationUsed: "number-line", masteryEvidence: "independent",
    });
  });

  it("shows a graduated hint after a wrong answer without erasing jumps", () => {
    const problem = renderActivity();
    fireEvent.click(screen.getByRole("radio", { name: `Mulai dari ${problem.startValue}` }));
    jumpUntilAnswer();
    fireEvent.click(screen.getByRole("radio", { name: "0" }));
    fireEvent.click(screen.getByRole("button", { name: "Cek jawaban" }));
    fireEvent.click(screen.getByRole("button", { name: "Petunjuk" }));
    expect(screen.getByRole("heading", { name: "Petunjuk 1" })).toBeInTheDocument();
    expect(screen.getByRole("img", { name: new RegExp(`${problem.expectedJumpCount} lompatan maju dibuat`) })).toBeInTheDocument();
  });
});
