# A12 Explain Strategy — Implementation Contract

> Scope: Phase A addition within 10. This activity asks a child to identify a strategy that truthfully explains a solved addition event. It does not grade fluency, demand an oral explanation, or declare one valid strategy morally better than another.

## 1. Learning objective

The child connects a correct total to a mathematical action or structure:

- **count all**: count both groups from one;
- **count on**: begin at the first/larger addend and make the second addend’s steps;
- **make ten**: recognize a completed ten-frame when the total is 10.

The target is “I know what I did and why it fits this representation,” not “I can recite the teacher’s preferred words.” A child may reach the correct total by count-all even when count-on would be more efficient; record that as an observed strategy, not a wrong answer.

Initial A12 does not require typed reasoning, voice recording, free-form natural-language scoring, or comparison of efficiency beyond one gentle reflection.

## 2. Entry and task family

A12 follows A11. Introduce it after at least:

- two correct A11 story problems using different templates;
- one correct result with no H3–H5 hint; and
- one independent or developing response from either NumberLine or Symbolic Addition.

The activity reuses one generated, solved addition event and deliberately separates two questions:

1. **What is the total?** The event is shown as already solved; no new arithmetic answer is collected.
2. **How could we know?** The child chooses a representation-grounded strategy card.

The first slice has three strategy-specific families:

| Family | Valid primary strategy | Representation |
| --- | --- | --- |
| `count-all` | count every counter in both groups | two object groups / ten-frame |
| `count-on` | start at `a`, then make `b` jumps | number line |
| `make-ten` | see that `a + b` fills all ten spaces | ten-frame |

Each family has one clear intended answer. A valid alternative is never silently marked incorrect: if a child selects count-all on a count-on family, feedback says it can find the total but points out the visible start/jumps; evidence records `alternative-valid` rather than a misconception.

## 3. Representation and interaction

1. Present a solved event with an accessible sentence and equation, e.g. `6 + 3 = 9`.
2. Show one dominant representation matching the target family. Do not put all three representations on screen.
3. Ask **“Cara mana yang cocok dengan gambar ini?”**
4. Show 2–3 native-radio strategy choices with short action copy, not labels alone:
   - “Hitung semua benda dari satu.”
   - “Mulai dari 6, lalu maju 3 langkah.”
   - “Lihat bingkai penuh sampai 10.”
5. Child selects one and presses **Cek cara**.
6. Correct feedback names the relation between selected strategy and visible representation. Alternative-valid feedback preserves dignity and offers an optional reflection, not a retry requirement.

The total is locked and visible. Do not ask the child to recompute it, drag strategy cards, rank strategies, or select an answer before selecting a strategy.

## 4. Domain contracts

```ts
export type ExplainStrategyFamily = "count-all" | "count-on" | "make-ten";
export type StrategyChoice = "count-all" | "count-on" | "make-ten";
export type ExplainStrategyInputMethod = "pointer" | "keyboard" | "switch";
export type ExplainStrategyOutcome = "target" | "alternative-valid" | "not-yet";

export interface StrategyRepresentation {
  kind: "counters" | "number-line" | "ten-frame";
  addends: readonly [number, number];
  total: number;
  // The required shape depends on kind: counter groups, unit jumps, or canonical ten-frame slots.
}

export interface ExplainStrategyProblem {
  id: string;
  phase: "A";
  concept: "explain-strategy";
  seed: number;
  family: ExplainStrategyFamily;
  addends: readonly [number, number];
  total: number;
  equation: { left: number; operator: "+"; right: number; equals: "="; result: number };
  representation: StrategyRepresentation;
  choices: readonly {
    id: StrategyChoice;
    label: string;
    explanation: string;
  }[];
  targetStrategy: StrategyChoice;
}

export type ExplainStrategyIntent =
  | { type: "select-strategy"; value: StrategyChoice; input: ExplainStrategyInputMethod }
  | { type: "submit" }
  | { type: "request-hint" };

export interface ExplainStrategyViewState {
  selectedStrategy?: StrategyChoice;
  attempts: number;
  revealedHintLevels: Array<1 | 2 | 3 | 4 | 5>;
  activeHint?: ExplainStrategyHint;
  feedback?: { tone: "neutral" | "correct"; message: string };
  outcome?: ExplainStrategyOutcome;
  complete: boolean;
  inputMethods: ExplainStrategyInputMethod[];
  observations: Array<{ selected: StrategyChoice; outcome: ExplainStrategyOutcome }>;
  announcement: string;
}
```

The generator, evaluator, hints, and evidence converter are pure. `ExplainStrategyActivity` owns instruction replay, response time, and exactly one local evidence write at completion.

## 5. Generator constraints

`generateExplainStrategyProblem({ seed, family, recentKeys? })` is seeded and deterministic.

- `count-all`: non-zero addends, total 2–8, with a visible unstructured pair of object groups. Do not use a full ten-frame because its structure would make “count all” needlessly inefficient.
- `count-on`: `a >= b`, `3 <= a <= 9`, `1 <= b <= 4`, `a + b <= 10`; representation has start `a`, exactly `b` continuous unit jumps, and landing total.
- `make-ten`: total exactly 10; `a` and `b` are non-zero; representation contains all ten canonical slots.
- Equation, representation quantities, and total are invariants.
- Choices are stable in fixed semantic order `count-all`, `count-on`, `make-ten`, but only include strategies relevant enough to contrast. For count-all/count-on use two choices; make-ten may use three.
- Target phrasing is generated from local strings; no runtime LLM copy.
- Avoid recent `family:a+b` keys when alternatives exist. Range expansion or new strategy families require separate contracts.

## 6. Evaluation and evidence

- `target`: selected strategy equals target strategy; complete with `independent` if first attempt and no hints.
- `alternative-valid`: selected `count-all` on a count-on/make-ten family. Complete, preserve correctness, and record it as a less-structured observed route; mastery is `developing`, never not-yet.
- `not-yet`: a strategy that cannot explain the shown representation, for example `make-ten` when the total is 8. It increments attempts and enables hints.
- A missing strategy does not increment attempts.
- No psychological or language diagnosis is emitted. The only evidence is selected strategy, representation family, hints, attempts, and whether the selection fit that representation.

Local evidence includes problem/family, addends/total, target and selected strategy, outcome, attempts, hints, representation kind, input methods, response time, and mastery. Repeated-pattern promotion may group `not-yet` selections by family, never by child trait.

## 7. Hint progression

| Level | Kind | Behavior |
| --- | --- | --- |
| H1 | attention | Point to the defining feature: groups, starting number, or full ten-frame. |
| H2 | question | Ask what action the representation shows: count all, start then move, or see a full ten. |
| H3 | representation | Emphasize the relevant groups/jumps/five-and-ten structure. |
| H4 | partial-step | State one first action, e.g. “Mulai dari 6, lalu lihat lompatan pertama.” |
| H5 | worked reasoning | Read the event, name the strategy, and connect it to the equation. |

Hints are unavailable before a meaningful non-target selection. An alternative-valid answer completes instead of being pushed through hints.

## 8. Accessibility and responsive architecture

- Use a semantic `fieldset`/`legend` for strategy choices; each choice includes its action sentence in the accessible name.
- The solved equation exposes one concise accessible sentence; visual tokens are hidden from the accessibility tree.
- The representation is one labelled `role="img"` summary with internal markers hidden, unless native semantics improve it.
- Strategy choices use text, positional relation, and relevant visual pattern—not colour alone.
- Native radio behavior supports keyboard, switch, arrows, Space, and Enter; no drag-only sorting.
- Live region announces selection, feedback, and hints without repeating the full visual on every focus change.
- Motion may only reveal the relevant counters/jumps/slots. Reduced motion makes the emphasis immediate.
- At 320/375/414/768px, strategy labels remain one-line controls where possible; cards may stack, but no viewport overflow or multi-line clickable affordance.

## 9. Scaffold fading

1. **Labelled representation**: feature labels plus short choice explanations, used on entry.
2. **Compact representation**: remove labels but keep visual structure, after two target/alternative-valid selections across different families.
3. **Representation-first prompt**: show the representation before the equation and ask the strategy, after three independent target selections across two families.

Two `not-yet` outcomes in the same family return the next task to labelled representation. Fading is based on a pattern, never one correct click.

## 10. Deterministic tests

- Same seed/family yields the same valid problem.
- Each family obeys its numerical and representation invariants.
- Choice list contains its target and no impossible target can be generated.
- Reducer handles missing selection, target, alternative-valid, not-yet, hints, and immutable completion.
- Evidence distinguishes outcome from arithmetic correctness without inventing misconception diagnoses.
- H3 changes representation emphasis; H5 contains full representation → strategy → equation reasoning.
- Component tests cover native keyboard radio selection, accessible equation/representation, alternative-valid completion, hint recovery, instruction replay, and local storage.
- Playwright covers each family’s happy path plus 320/375/414/768px reduced-motion layout.

## 11. Explicit non-goals

Do not add audio recording, NLP scoring, timed explanations, ranking/leaderboards, correctness badges, forced “best strategy” labels, arbitrary story contexts, new addition ranges, or B/C-phase strategy families.
