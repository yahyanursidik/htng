import { fireEvent, render, screen, waitFor } from "@testing-library/preact";
import { describe, expect, it } from "vitest";
import { TenFrameActivity } from "../../src/components/math/TenFrame/TenFrameActivity";
import { generateTenFrameProblem } from "../../src/learning/addition/ten-frame-generator";
import { readTenFrameAttempts } from "../../src/lib/storage/attempt-evidence";

function renderActivity() {
  const problem = generateTenFrameProblem({
    seed: 20260816,
    structure: "fills-ten",
    concept: "make-ten",
    requireLargerFirst: true,
  });
  render(<TenFrameActivity problem={problem} />);
  return problem;
}

function addEveryCounterWithKeyboard() {
  while (screen.queryAllByRole("button", { name: /Tambahkan keping kuning/ }).length > 0) {
    const button = screen.getAllByRole("button", { name: /Tambahkan keping kuning/ })[0];
    if (!button) break;
    fireEvent.click(button, { detail: 0 });
  }
}

describe("TenFrame activity", () => {
  it("exposes the prompt, frame summary, and repeatable instruction", () => {
    const problem = renderActivity();
    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent(problem.prompt);
    expect(screen.getByRole("img", { name: /Bingkai sepuluh/ })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Ulangi instruksi dengan suara" })).toBeInTheDocument();
  });

  it("accepts pointer drag-and-drop into the frame", () => {
    const problem = renderActivity();
    const values = new Map<string, string>();
    const dataTransfer = {
      getData: (type: string) => values.get(type) ?? "",
      setData: (type: string, value: string) => values.set(type, value),
    };
    const source = screen.getAllByRole("button", { name: /Tambahkan keping kuning/ })[0];
    const frame = screen.getByRole("img", { name: /Bingkai sepuluh/ });

    if (!source) throw new Error("Expected a source counter.");
    fireEvent.dragStart(source, { dataTransfer });
    fireEvent.drop(frame, { dataTransfer });

    expect(
      screen.getByRole("img", {
        name: new RegExp(`${problem.addends[0] + 1} dari 10 kotak terisi`),
      }),
    ).toBeInTheDocument();
  });

  it("supports keyboard-style activation and completes the make-ten task", async () => {
    const problem = renderActivity();
    addEveryCounterWithKeyboard();

    expect(screen.getByRole("radiogroup", { name: "Berapa jumlah semuanya?" })).toBeInTheDocument();
    fireEvent.click(screen.getByRole("radio", { name: "10" }));
    fireEvent.click(screen.getByRole("button", { name: "Cek jawaban" }));

    expect(
      screen.getByText(
        new RegExp(`Ya\\. ${problem.addends[0]} dan ${problem.addends[1]} menjadi 10`),
        { selector: ".learning-feedback" },
      ),
    ).toBeInTheDocument();
    await waitFor(() => expect(readTenFrameAttempts()).toHaveLength(1));
    expect(readTenFrameAttempts()[0]?.inputMethods).toContain("keyboard");
    expect(readTenFrameAttempts()[0]?.masteryEvidence).toBe("independent");
  });

  it("keeps the frame, offers a graduated hint, and allows recovery", () => {
    renderActivity();
    addEveryCounterWithKeyboard();
    fireEvent.click(screen.getByRole("radio", { name: "0" }));
    fireEvent.click(screen.getByRole("button", { name: "Cek jawaban" }));

    expect(screen.getByText(/Belum tepat/, { selector: ".learning-feedback" })).toBeInTheDocument();
    expect(screen.getByRole("img", { name: /10 dari 10 kotak terisi/ })).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Petunjuk" }));
    expect(screen.getByRole("heading", { name: "Petunjuk 1" })).toBeInTheDocument();
    expect(screen.getByText("Perhatikan semua kotak yang terisi.")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("radio", { name: "10" }));
    fireEvent.click(screen.getByRole("button", { name: "Cek jawaban" }));
    expect(screen.getByText(/menjadi 10/, { selector: ".learning-feedback" })).toBeInTheDocument();
  });
});
