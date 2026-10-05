import type { SymbolicAdditionHint, SymbolicAdditionProblem } from "../../types/symbolic-addition";

export function getSymbolicAdditionHints(
  problem: SymbolicAdditionProblem,
): readonly SymbolicAdditionHint[] {
  const [a, b] = problem.addends;
  return [
    { level: 1, kind: "attention", content: `Baca angka sebelum tanda tambah: mulai dari ${a}.` },
    { level: 2, kind: "question", content: `Tanda + ${b} berarti maju ${b} langkah. Di angka mana garis berhenti?` },
    { level: 3, kind: "representation", content: "Lihat garis bilangan: cari tanda mulai, lompatan, lalu tempat berhenti." },
    { level: 4, kind: "partial-step", content: `${a} adalah angka mulai; ${b} adalah banyak lompatan.` },
    { level: 5, kind: "worked-reasoning", content: `Mulai dari ${a}, maju ${b}, tiba di ${problem.total}. Jadi ${a} + ${b} = ${problem.total}.` },
  ];
}
