import type { NumberLineHint, NumberLineProblem } from "../../types/number-line";

export function getNumberLineHints(problem: NumberLineProblem): readonly NumberLineHint[] {
  const [a, b] = problem.addends;
  const firstLanding = a + 1;
  return [
    { level: 1, kind: "attention", content: `Cari angka ${a}. Di situlah kita mulai, bukan di 0.` },
    { level: 2, kind: "question", content: `Setelah ${a}, angka berikutnya adalah ${firstLanding}. Itu satu lompatan.` },
    { level: 3, kind: "representation", content: "Setiap garis kecil berarti satu. Perhatikan penanda 5 dan 10 saat melompat." },
    { level: 4, kind: "partial-step", content: `Coba dulu: ${a} lompat satu ke ${firstLanding}. Lalu lanjutkan.` },
    { level: 5, kind: "worked-reasoning", content: `Mulai dari ${a}, lalu maju ${b} kali sampai ${problem.total}. Jadi ${a} + ${b} = ${problem.total}.` },
  ];
}
