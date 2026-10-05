import { fireEvent, render, screen, waitFor } from "@testing-library/preact";
import { describe, expect, it } from "vitest";
import { StoryProblemActivity } from "../../src/components/math/StoryProblem/StoryProblemActivity";
import { readStoryProblemAttempts } from "../../src/lib/storage/attempt-evidence";
import { generateStoryProblem } from "../../src/learning/addition/story-problem-generator";
describe("StoryProblem activity", () => {
  it("supports keyboard-ready choices and persists its evidence", async () => {
    const problem = generateStoryProblem({ seed: 20260819, scaffold: "objects-visible" }); render(<StoryProblemActivity problem={problem} />);
    expect(screen.getByRole("article", { name: "Cerita soal" })).toBeInTheDocument(); expect(screen.getByRole("img", { name: /sudah ada dan/ })).toBeInTheDocument();
    fireEvent.click(screen.getByRole("radio", { name: "Bertambah" }), { detail: 0 }); fireEvent.click(screen.getByRole("radio", { name: String(problem.total) }), { detail: 0 }); fireEvent.click(screen.getByRole("button", { name: "Cek jawaban" }));
    await waitFor(() => expect(readStoryProblemAttempts()).toHaveLength(1)); expect(screen.getByRole("status")).toHaveTextContent("ditambah");
  });
});
