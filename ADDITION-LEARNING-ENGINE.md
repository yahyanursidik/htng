# ADDITION LEARNING ENGINE
## Domain Logic Specification

---

## 1. Tujuan

Learning engine harus terpisah dari UI.

UI menampilkan pengalaman.

Learning engine menentukan:
- tujuan;
- soal;
- representasi;
- hint;
- evaluasi;
- misconception;
- progression;
- mastery evidence.

---

## 2. Activity Model

```ts
export type Phase = "A" | "B" | "C";

export type AdditionConcept =
  | "quantity"
  | "joining"
  | "counting-all"
  | "counting-on"
  | "part-whole"
  | "number-bond"
  | "make-five"
  | "make-ten"
  | "doubles"
  | "near-doubles"
  | "place-value"
  | "regrouping"
  | "compensation"
  | "estimation"
  | "algorithm"
  | "transfer";

export type Representation =
  | "physical"
  | "objects"
  | "counters"
  | "five-frame"
  | "ten-frame"
  | "double-ten-frame"
  | "number-line"
  | "part-whole"
  | "base-ten"
  | "place-value-chart"
  | "equation";

export interface Activity {
  id: string;
  phase: Phase;
  concept: AdditionConcept;
  objective: string;
  representation: Representation[];
  difficulty: 1 | 2 | 3 | 4 | 5;
  prompt: string;
  expected: unknown;
  hintStrategy: string[];
  misconceptionTags: string[];
  transferContext?: string;
}
```

---

## 3. Generator Input

Jangan menggunakan generator berbasis angka acak murni.

```ts
export interface AdditionGeneratorConfig {
  phase: Phase;
  concept: AdditionConcept;

  minA?: number;
  maxA?: number;
  minB?: number;
  maxB?: number;
  maxResult?: number;

  regrouping?: boolean;
  targetStrategy?:
    | "count-on"
    | "make-ten"
    | "double"
    | "near-double"
    | "decompose"
    | "compensate";

  representation?: Representation;
  requireExplanation?: boolean;
}
```

---

## 4. Constraint-Based Generation

Contoh `make-ten`:

```ts
generate({
  phase: "A",
  concept: "make-ten",
  maxResult: 20,
  targetStrategy: "make-ten"
});
```

Generator harus memilih pasangan yang benar-benar memungkinkan strategi target tampak bermakna.

---

## 5. Jangan Menghasilkan Soal Tanpa Tujuan

Tidak boleh:

```ts
const a = random(1, 100);
const b = random(1, 100);
```

lalu menganggap semua `a + b` sama secara pedagogik.

`40 + 30`, `48 + 7`, dan `48 + 37` memerlukan reasoning yang berbeda.

---

## 6. Evaluator

Evaluator tidak hanya menghasilkan boolean.

```ts
export interface Evaluation {
  isCorrect: boolean;
  attempts: number;

  likelyMisconceptions: Misconception[];

  suggestedHintLevel: number;

  evidence: {
    concept: AdditionConcept;
    representation?: Representation;
    strategy?: string;
    independence: "supported" | "independent";
  };
}
```

---

## 7. Misconception Taxonomy

```ts
export type Misconception =
  | "counting-error"
  | "quantity-symbol-disconnect"
  | "operation-confusion"
  | "counting-from-one-dependence"
  | "number-magnitude"
  | "place-value"
  | "regrouping"
  | "digit-concatenation"
  | "symbol-understanding"
  | "word-problem-interpretation";
```

Jangan mengklaim diagnosis psikologis.

Label hanya menggambarkan pola respons matematika yang teramati.

---

## 8. Hint Engine

```ts
export interface Hint {
  level: 1 | 2 | 3 | 4 | 5;
  kind:
    | "attention"
    | "question"
    | "representation"
    | "partial-step"
    | "worked-reasoning";
  content: string;
}
```

Hint harus terkait dengan kemungkinan kesulitan.

Tidak boleh menggunakan hint generik terus-menerus.

---

## 9. Representation Escalation

Contoh:

```text
equation
↓ difficulty
number line
↓ difficulty
ten-frame
↓ difficulty
counters
↓
physical prompt
```

Jangan selalu turun melalui urutan yang sama.

Pilih representasi yang sesuai dengan konsep.

---

## 10. Scaffold Fading

Jika anak menunjukkan evidence independent berulang:

```text
objects
→ structured frame
→ partial visual
→ symbolic
→ mental
```

Fading tidak boleh berdasarkan satu jawaban benar saja.

---

## 11. Attempt Record

```ts
export interface AttemptRecord {
  activityId: string;
  answer: unknown;
  correct: boolean;

  attempts: number;
  hintsUsed: number;
  highestHintLevel: number;

  representationUsed?: Representation;
  strategyUsed?: string;

  responseTimeMs?: number;

  masteryEvidence:
    | "not-yet"
    | "supported"
    | "developing"
    | "independent"
    | "flexible"
    | "transferable";
}
```

---

## 12. Local Mastery Model

MVP cukup menggunakan local storage / IndexedDB.

```ts
export interface SkillProgress {
  skillId: string;
  attempts: number;
  correctIndependent: number;
  correctSupported: number;
  transferEvidence: number;
  reasoningEvidence: number;
  lastPracticedAt: string;
}
```

---

## 13. Adaptive Rules — MVP

Gunakan rule-based adaptation.

Contoh:

```text
2–3 kesalahan bermakna
+
pola miskonsepsi sama
→ ganti representasi / berikan scaffold
```

```text
beberapa independent successes
+
reasoning evidence
→ kurangi scaffold
```

Jangan menyebutnya “AI adaptive learning” jika hanya rule engine.

---

## 14. Question Families

Generator harus mengenali family:

- joining;
- missing addend;
- number bond;
- make-ten;
- doubles;
- near doubles;
- place value;
- regrouping;
- compensation;
- estimation;
- word problem;
- error analysis;
- open-ended.

---

## 15. Test Requirements

Setiap generator memiliki unit test:

- range tidak dilanggar;
- result valid;
- target strategy benar-benar relevan;
- regrouping sesuai config;
- tidak ada impossible prompt;
- deterministic seed tersedia untuk testing.

Gunakan seeded random untuk test reproducibility.

---

## 16. Pedagogical Review Gate

Setiap activity family harus dapat menjawab:

1. skill apa yang diukur?
2. strategi apa yang ingin dimunculkan?
3. apakah representasi cocok?
4. miskonsepsi apa yang mungkin terlihat?
5. bagaimana scaffold diberikan?
6. kapan scaffold dilepas?
