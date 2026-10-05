import type { StoryProblem, StoryProblemHint } from "../../types/story-problem";
export function getStoryProblemHints(problem: StoryProblem): readonly StoryProblemHint[] { const [a, b] = problem.addends; return [
  { level: 1, kind: "attention", content: `Baca lagi: “${problem.story.changeSentence}”` },
  { level: 2, kind: "question", content: "Jumlah benda sekarang bertambah atau berkurang?" },
  { level: 3, kind: "representation", content: `Lihat kelompok “sudah ada” dan kelompok yang ditambah.` },
  { level: 4, kind: "partial-step", content: `${a} adalah benda yang sudah ada; ${b} adalah benda yang ditambah.` },
  { level: 5, kind: "worked-reasoning", content: `${problem.story.initialSentence} ${problem.story.changeSentence} Jadi ${a} + ${b} = ${problem.total}.` },
]; }
