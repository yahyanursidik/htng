# B1 Place Value Addition — Implementation Contract

> Scope: early Phase B. This is a structure lesson about tens and ones, not a column-algorithm screen and not regrouping.

## 1. Learning objective

The child represents a two-digit addend as tens and ones, combines like units, and relates the model to an equation:

```text
23 + 14 = (2 tens + 3 ones) + (1 ten + 4 ones)
         = 3 tens + 7 ones
         = 37
```

The first slice permits only **no-regrouping** sums: ones total `<= 9`, tens total `<= 9`. A “ten” is one unit of ten ones, never a decorative long rectangle or a digit copied from the number.

## 2. Readiness and boundaries

Introduce after Phase A evidence shows stable addition meaning, symbolic addition, and transfer—not because a child has completed a fixed activity count. Entry evidence should include independent/developing A10–A13 results across different addend pairs.

Explicit non-goals:

- no carrying/regrouping;
- no vertical standard algorithm;
- no three-digit numbers;
- no arbitrary digit concatenation task;
- no timed facts or gamification.

## 3. Representation rules

- Use a two-column place-value chart, **Puluhan** then **Satuan**.
- A ten is a labelled base-ten rod; a one is a labelled small square/counter. Rods and ones also differ by shape and column, never colour alone.
- Each addend is initially grouped in its own row/region. Combining occurs only between same-place columns.
- The symbolic expansion is always visible or recoverable:
  `23 = 2 puluhan + 3 satuan`.
- No rod may be split or exchanged in B1. If an interaction would create 10 ones, that is B3 regrouping and must be excluded by generation.

## 4. Interaction model

Initial family: `combine-like-units`.

1. Show `a + b` and two labelled base-ten groups.
2. Child selects the total tens and total ones from stable radio values (0–9), or presses a clearly labelled **Gabungkan puluhan** / **Gabungkan satuan** control if manipulation is used.
3. The resulting chart displays `T tens and O ones`.
4. Child selects the two-digit result from answer choices, then checks.

The implementation may use click-to-combine controls, but every operation has a button equivalent; no drag requirement. Do not ask the child to type a two-digit number in the first slice.

## 5. Domain contract

```ts
export interface PlaceValueNumber { tens: number; ones: number; value: number; }
export interface PlaceValueProblem {
  id: string;
  phase: "B";
  concept: "place-value-addition";
  seed: number;
  addends: readonly [PlaceValueNumber, PlaceValueNumber];
  total: PlaceValueNumber;
  regrouping: false;
  prompt: string;
  answerOptions: readonly number[];
}

export type PlaceValueIntent =
  | { type: "combine-place"; place: "tens" | "ones"; input: InputMethod }
  | { type: "select-result"; value: number }
  | { type: "submit" }
  | { type: "request-hint" };
```

Pure generator/evaluator/hints live outside the Preact component. Evidence includes per-place actions, result, hints, attempts, representation, and any observable pattern.

## 6. Generator constraints

`generatePlaceValueProblem({ seed, recentKeys? })` must be deterministic.

- First addend: 11–88; second addend: 11–88.
- `a.ones + b.ones <= 9`; `a.tens + b.tens <= 9`.
- Both addends contain at least one non-zero digit; avoid only-round-ten pairs in the entry family.
- Total equals place-value composition, not string concatenation.
- Candidates intentionally include different shapes: zero ones in one addend, zero tens nowhere, and varied total magnitudes—but never a regrouping case.
- Answer choices include correct total, each addend, digit-concatenation distractor where safe, and nearby same-magnitude alternatives; no impossible or misleading numeral formatting.

## 7. Evaluator and evidence

- Correctness requires correct result after both places have been combined/inspected.
- Selecting one addend as total → `operation-confusion` observation.
- Selecting digit concatenation such as `2314` (when presented) → `digit-concatenation` observation.
- Selecting a result whose tens/ones disagree with visibly combined columns → `place-value` observation.
- These labels describe response patterns, not a child diagnosis.
- Correct with hints → supported; first-pass after both per-place actions → independent; correction without hints → developing.

## 8. Hints and scaffold fading

H1: attend to the **Puluhan** column.  
H2: ask how many rods are in both groups.  
H3: highlight/label both columns and expanded form.  
H4: combine one place only: “2 puluhan dan 1 puluhan menjadi 3 puluhan.”  
H5: work through both places and reconstruct the numeral.

Fading: labelled rods + expanded form → unlabelled rods + chart → chart + numeral expansion → symbolic decomposition. Move only after repeated independent evidence; two same-place errors restore the labelled representation.

## 9. Accessibility and testing

- Native buttons/radios, one semantic chart/table, concise screen-reader summaries, visible focus, 44px targets, and reduced motion.
- Rod/square shapes, labels, position, and pattern provide non-colour cues.
- Test determinism, no-regrouping invariants, exact total composition, unavailable completion before both places, error pattern evidence, H1–H5 order, keyboard happy path, local persistence, and 320/375/414/768px layout.

## 10. Explicit non-goals

No regrouping exchange, algorithmic “carry,” multi-step word problem, money context, three-digit addition, or Phase C strategy comparison.
