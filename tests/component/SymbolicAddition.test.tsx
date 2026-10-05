import { fireEvent, render, screen, waitFor } from "@testing-library/preact";
import { describe, expect, it } from "vitest";
import { SymbolicAdditionActivity } from "../../src/components/math/SymbolicAddition/SymbolicAdditionActivity";
import { readSymbolicAdditionAttempts } from "../../src/lib/storage/attempt-evidence";
import { generateSymbolicAdditionProblem } from "../../src/learning/addition/symbolic-addition-generator";

function renderActivity(scaffold: "bridge-visible" | "bridge-compact" | "symbolic-first" = "bridge-visible") {
  const problem = generateSymbolicAdditionProblem({ seed: 20260818, scaffold });
  render(<SymbolicAdditionActivity problem={problem} />);
  return problem;
}

describe("SymbolicAddition activity", () => {
  it("exposes an accessible equation, bridge, and repeatable instruction", () => {
    renderActivity();
    expect(screen.getByRole("img", { name: /ditambah.*sama dengan kosong/ })).toBeInTheDocument();
    expect(screen.getByRole("img", { name: /Garis bilangan: mulai dari/ })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Ulangi instruksi dengan suara" })).toBeInTheDocument();
  });

  it("supports keyboard result selection and stores local evidence", async () => {
    const problem = renderActivity();
    fireEvent.click(screen.getByRole("radio", { name: String(problem.total) }), { detail: 0 });
    fireEvent.click(screen.getByRole("button", { name: "Cek jawaban" }));
    expect(screen.getByRole("status")).toHaveTextContent(`sama dengan ${problem.total}`);
    await waitFor(() => expect(readSymbolicAdditionAttempts()).toHaveLength(1));
    expect(readSymbolicAdditionAttempts()[0]).toMatchObject({
      correct: true, bridgeVisible: true, representationUsed: "equation", masteryEvidence: "developing",
    });
  });

  it("reveals a compact bridge with H3 for symbolic-first work", () => {
    const problem = renderActivity("symbolic-first");
    expect(screen.queryByRole("img", { name: /Garis bilangan/ })).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole("radio", { name: String(problem.addends[0]) }));
    fireEvent.click(screen.getByRole("button", { name: "Cek jawaban" }));
    fireEvent.click(screen.getByRole("button", { name: "Petunjuk" }));
    fireEvent.click(screen.getByRole("button", { name: "Petunjuk berikutnya" }));
    fireEvent.click(screen.getByRole("button", { name: "Petunjuk berikutnya" }));
    expect(screen.getByRole("heading", { name: "Petunjuk 3" })).toBeInTheDocument();
    expect(screen.getByRole("img", { name: /Garis bilangan: mulai dari/ })).toBeInTheDocument();
  });
});
