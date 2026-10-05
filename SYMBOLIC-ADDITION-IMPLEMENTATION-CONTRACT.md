# A10 Symbolic Addition — Implementation Contract

> Scope: Phase A, sums within 10. This is the bridge from a solved model to `a + b = c`, not a speed-drill or a free-form equation editor.

## 1. Learning objective

The child connects a represented addition event to its symbolic statement:

```text
start quantity + amount added = resulting whole
```

For `6 + 3 = 9`, success means the child can identify that the `6` is the starting amount, `+ 3` means three added steps, and `9` names the total. A correct response alone is not evidence that the symbols were understood; the activity must retain which representation bridge was visible and which hint level was needed.

`=` is introduced as “has the same value as,” not as an instruction to “write the answer.” Initial A10 does not include missing addends, true/false equations, commutativity, or rearranging symbol tiles. Those are later tasks.

## 2. Readiness and introduction

Introduce this after A9 NumberLine, not merely after a child has seen an equation elsewhere. The entry rule for the symbolic-first scaffold is:

- at least two correct NumberLine activities with `strategyObserved: "count-on"`;
- at least one of those independent (no hint); and
- no repeated `counting-error` evidence in the two most recent NumberLine attempts.

If that evidence is absent, continue with NumberLine or TenFrame. Do not hide the model and call the child “not ready” after one wrong symbolic answer.

## 3. Representation rules

The equation is always rendered in reading order:

```text
[first addend]  +  [second addend]  =  [result]
```

- The two addends are non-zero integers; `a >= b`, `1 <= b <= 4`, `3 <= a <= 9`, and `a + b <= 10`.
- The same solved NumberLine bridge is initially visible below the equation: start marker at `a`, exactly `b` one-unit forward jumps, landing at `c`.
- Operand identity uses three channels: position in the equation, text labels in the model (“mulai”, “lompat”), and the existing solid/dashed colour/pattern distinction. Colour is never the only cue.
- The equation’s result cell is a single blank or chosen numeral. The other three tokens are locked; the child is not asked to drag symbols into order in the initial family.
- The number line is explanatory, not a second task: no editable start selector and no jump button in A10.
- The screen-reader form is one readable phrase: “Enam ditambah tiga sama dengan [jawaban].” The visually separated tokens are `aria-hidden`.

## 4. Interaction model

1. Prompt: “Garis bilangan menunjukkan 6 mulai lalu 3 lompatan. Lengkapi bentuk angkanya.”
2. Show the read-only bridge and the locked equation `6 + 3 = [ ]`.
3. Child selects one result from native radio choices 0–10, then presses **Cek jawaban**.
4. A correct result completes the activity with a relational read-back: “Ya. 6 ditambah 3 sama dengan 9.”
5. An incorrect result retains the same bridge, equation, selected answer, and focus path. It never clears work, shames, times, or rewards with game mechanics.

No text field is required in the first slice. Native radios avoid handwriting/keyboard-layout barriers while preserving the mathematical decision. A free numeric input can be introduced only after independent evidence and must retain a radio or on-screen keypad alternative.

## 5. Component and domain contracts

```ts
export type SymbolicAdditionScaffold = "bridge-visible" | "bridge-compact" | "symbolic-first";
export type SymbolicAdditionInputMethod = "pointer" | "keyboard" | "switch";
export type SymbolicAdditionMisconceptionTag =
  | "operation-confusion"
  | "counting-error"
  | "quantity-symbol-disconnect"
  | "number-magnitude";

export interface SymbolicAdditionBridge {
  representation: "number-line";
  range: readonly [0, 10];
  start: number;
  jumps: readonly { from: number; to: number; length: 1 }[];
  landing: number;
}

export interface SymbolicAdditionProblem {
  id: string;
  phase: "A";
  concept: "symbolic-addition";
  seed: number;
  addends: readonly [number, number];
  total: number;
  equation: { left: number; operator: "+"; right: number; equals: "=" };
  scaffold: SymbolicAdditionScaffold;
  bridge?: SymbolicAdditionBridge;
  prompt: string;
  answerOptions: readonly number[];
}

export type SymbolicAdditionIntent =
  | { type: "select-result"; value: number; input: SymbolicAdditionInputMethod }
  | { type: "submit-result" }
  | { type: "request-hint" };

export interface SymbolicAdditionViewState {
  selectedResult?: number;
  attempts: number;
  revealedHintLevels: Array<1 | 2 | 3 | 4 | 5>;
  activeHint?: SymbolicAdditionHint;
  feedback?: { tone: "neutral" | "correct"; message: string };
  announcement: string;
  status: "answering" | "incorrect" | "complete";
  complete: boolean;
  inputMethods: SymbolicAdditionInputMethod[];
  observations: Array<{ tag: SymbolicAdditionMisconceptionTag; answer: number }>;
}

export interface SymbolicAdditionProps {
  problem: SymbolicAdditionProblem;
  state: SymbolicAdditionViewState;
  dispatch(intent: SymbolicAdditionIntent): void;
  onRepeatInstruction?(): void;
}
```

The reducer, generator, hints, and evidence converter remain pure modules outside the Preact component. `SymbolicAdditionActivity` owns elapsed-time measurement and one local-storage write after completion, following the NumberLine pattern.

## 6. Generator constraints

`generateSymbolicAdditionProblem({ seed, scaffold, recentProblemKeys? })` must be seeded and deterministic.

- Initial supported family: `a >= b`, `b in 1..4`, total `<= 10`; reject zero addends and repeated recent ordered pairs when another valid pair exists.
- `equation.left === addends[0]`, `equation.right === addends[1]`, and `total === left + right` are invariants.
- `bridge-visible` and `bridge-compact` must have a NumberLine bridge with `start === left`, `landing === total`, exactly `right` jumps, and continuous one-unit jumps.
- `symbolic-first` deliberately omits `bridge`; it may only be generated when progression evidence explicitly selects that scaffold.
- Answer choices are the stable `0..10` ordered set. Do not randomize their spatial order in Phase A; spatial consistency is an accessibility support.
- Generator configuration does not accept arbitrary min/max values in this first family. Enlarging the range, switching to missing addends, or changing equation form requires a separate activity family and tests.

## 7. Evaluator behavior and misconception evidence

Evaluation remains answer-based but evidence-rich.

- Correct `selectedResult === total` completes. Mastery is `independent` only when first attempt, no hints, and the displayed scaffold was `symbolic-first` or `bridge-compact`; `bridge-visible` first-pass success is `developing`, not independent.
- Correct with any hint is `supported`.
- Correct after a wrong answer but no hint is `developing`.
- `operation-confusion`: selected result equals either addend.
- `number-magnitude`: selected result is below `max(a, b)` or above `total + 2`; record as an observed response pattern, never a diagnosis.
- `counting-error`: another incorrect result when a visible bridge lands at the correct total.
- `quantity-symbol-disconnect` is eligible only after a child previously completed the identical bridge correctly within the current session but chooses an incorrect symbolic result. It is not inferred from one wrong answer.
- No `symbol-understanding` label is emitted in the first slice because the child does not manipulate operators or equals. Do not claim evidence the UI cannot observe.

Local evidence must contain `activityId`, `seed`, `addends`, `total`, `scaffold`, `bridgeVisible`, selected result, correctness, attempts, hint use, input methods, response time, observed misconceptions, and mastery. Repeated-pattern promotion is scoped to prior Symbolic Addition activities, as it is for NumberLine.

## 8. Hint progression

Hints appear only after an incorrect submitted answer; H0 is independent.

| Level | Kind | Behavior |
| --- | --- | --- |
| H1 | attention | “Baca angka sebelum tanda tambah: mulai dari 6.” |
| H2 | question | “Tanda + 3 berarti maju tiga langkah. Di angka mana garis berhenti?” |
| H3 | representation | Reveal or expand the NumberLine bridge and label start / landing. |
| H4 | partial-step | Link just the first mapping: “6 adalah angka mulai; 3 adalah banyak lompatan.” |
| H5 | worked reasoning | Read the complete relation: “Mulai dari 6, maju 3, tiba di 9. Jadi 6 + 3 = 9.” |

Hints never replace the equation with an answer-only card. H5 leaves the child’s selected result visible and explains why the relation has the stated value.

## 9. Accessibility and responsive architecture

- Use real `fieldset`, `legend`, radio inputs, and button controls; no canvas or custom keyboard grid.
- The equation exposes one concise accessible sentence, while visual token spans are hidden from the accessibility tree to prevent repeated reading.
- The NumberLine bridge uses `role="img"` with a changing summary and its internal visual ticks are `aria-hidden`.
- The visible start/landing distinction includes labels, solid versus dashed marker borders, and position—never colour alone.
- All actionable controls have at least 44px targets, visible `:focus-visible`, Enter/Space behavior through native controls, and no keyboard-only drag requirement.
- `aria-live="polite"` announces result selection, feedback, and hints; it must not announce every decorative state change.
- `prefers-reduced-motion: reduce` replaces jump motion with an immediate state; no animation is required to understand the bridge.
- At 320, 375, 414, and 768px, the equation stacks only as a single readable line or uses controlled horizontal token spacing; controls may wrap but their labels may not. Never allow the equation or answer choices to create horizontal page scrolling.

## 10. Scaffold fading

Fading is selected from prior evidence, never from a single correct answer.

1. `bridge-visible`: full NumberLine with labelled start, all jumps, landing, and equation blank. Use on entry and after repeated symbolic errors.
2. `bridge-compact`: same endpoints and jumps, smaller unlabelled line; equation remains primary. Use after two successful `bridge-visible` attempts, at least one without H3–H5.
3. `symbolic-first`: equation only at first. H3 can reintroduce the compact line. Use after three independent or developing Symbolic Addition successes across at least two different addend pairs, with no repeated misconception pattern.

Any two meaningful errors with the same tag move the next activity one scaffold level more concrete. This is a rule-based support choice, not a claim of adaptive AI.

## 11. Deterministic tests required before implementation handoff

- Generator produces the same problem for the same seed.
- Every generated problem satisfies the equation and Phase A range invariants.
- Bridge jumps are contiguous, unit-length, and land on `total`.
- Recent-pair avoidance is deterministic and falls back safely when exhausted.
- Reducer rejects submit without a selected result, retains work after an incorrect answer, and cannot alter state after completion.
- Evaluator assigns evidence only for observable patterns, including the session-conditioned `quantity-symbol-disconnect` case.
- Hint order is exactly H1–H5; H3 alters representation visibility and H5 gives relational reasoning.
- Component test covers native keyboard radio selection, instruction replay control, semantic equation sentence, bridge summary, error recovery, and local evidence persistence.
- Playwright covers a supported happy path, a `symbolic-first` happy path, and 320/375/414/768px reduced-motion layouts with no horizontal overflow.

## 12. Explicit non-goals

Do not add story context, rewards, a progress dashboard, gamification, equation drag-and-drop, free-text handwriting recognition, missing-addend equations, or sums above 10 in this vertical slice.
