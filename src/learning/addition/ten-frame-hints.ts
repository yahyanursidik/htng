import type { Hint, TenFrameProblem } from "../../types/ten-frame";

export function getTenFrameHints(problem: TenFrameProblem): readonly Hint[] {
  const [a, b] = problem.addends;
  const lowerRowCount = Math.max(0, problem.total - 5);

  return [
    {
      level: 1,
      kind: "attention",
      content: "Perhatikan semua kotak yang terisi.",
    },
    {
      level: 2,
      kind: "question",
      content:
        problem.total > 5
          ? `Apakah baris atas sudah lima? Ada berapa keping di baris bawah?`
          : "Ada berapa kotak yang terisi dari kiri?",
    },
    {
      level: 3,
      kind: "representation",
      content:
        problem.total > 5
          ? `Lihat batas lima: 5 di atas dan ${lowerRowCount} di bawah.`
          : `Semua ${problem.total} keping masih berada di baris pertama.`,
    },
    {
      level: 4,
      kind: "partial-step",
      content: `Mulai dari ${a}. Keping berikutnya membuat ${a + 1}. Lanjutkan menghitung.`,
    },
    {
      level: 5,
      kind: "worked-reasoning",
      content: `Mulai dari ${a}, lalu hitung ${b} keping lagi hingga ${problem.total}. Jadi jumlahnya ${problem.total}.`,
    },
  ];
}
