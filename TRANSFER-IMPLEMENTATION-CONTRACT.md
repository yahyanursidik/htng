# A13 Transfer — Implementation Contract

> Scope: Phase A addition within 10. Transfer asks whether a child can recognize the same add-to structure when its surface context changes. It is not a second Story Problem drill, an open-ended language assessment, or a real-world decoration layer.

## 1. Learning objective

The child recognizes that an addition equation can describe a new, ordinary situation and chooses a context that preserves:

```text
initial quantity + quantity added = total after the change
```

The initial transfer direction is **equation → context**. Given a solved equation such as `6 + 3 = 9`, the child chooses the short everyday situation that has six objects first, three added, and nine afterward. The child therefore cannot succeed by repeating the prior story’s wording alone.

This differs from A11:

- A11 starts with one story and asks what happens / how many now.
- A13 starts with an equation and asks whether the add-to structure survives a changed context.

## 2. Readiness

Introduce A13 after:

- three correct A11 results across at least two story templates;
- one A12 target-strategy response without hints; and
- no repeated `word-problem-interpretation` or `operation-confusion` pattern in the three latest relevant attempts.

If transfer is not yet established, return to the particular representation or story family that exposes the observed gap. Do not automatically increase the numerical range.

## 3. Context rules

Contexts are a reviewed local data library, never runtime-generated prose. Every prompt has:

- an initial state, explicit addition event, and final-state question;
- one familiar discrete object (`pensil`, `buku`, `balok`, `kancing`, `daun`);
- two short sentences plus a question, with no irrelevant facts;
- a context different from the immediately preceding A11 template;
- no money, time, measurement, comparison, sharing, cultures-as-decoration, people/character lore, or inferred background knowledge.

The visual treatment is labelled counters/object strips, not generated scenes or clip art. Context means the relationship between quantities, not a cartoon wrapper.

## 4. Interaction model

The first slice uses one family only: `equation-to-add-to-context`.

1. Present one solved, accessible equation, e.g. `6 + 3 = 9`.
2. Present two short context choices as native radios.
3. One choice correctly describes the same add-to event.
4. The distractor is mathematically contrastive but respectful: same object category or total range, with one changed structural feature (take-away event, wrong initial/addend, or mismatched total).
5. Child selects the matching context and presses **Cek pilihan**.
6. Correct feedback links all three parts of the chosen context back to the equation.

The distractor cannot be ambiguous, linguistically more complex, silly, or emotionally loaded. The task asks only one cognitive question: “Which situation matches this equation?”

## 5. Domain contract

```ts
export type TransferFamily = "equation-to-add-to-context";
export type TransferInputMethod = "pointer" | "keyboard" | "switch";
export type TransferContextKind = "match" | "take-away" | "wrong-addend" | "wrong-total";

export interface TransferContext {
  id: string;
  kind: TransferContextKind;
  item: "pensil" | "buku" | "balok" | "kancing" | "daun";
  lines: readonly [string, string, string];
  initial: number;
  change: number;
  statedTotal: number;
  event: "add-to" | "take-away";
}

export interface TransferProblem {
  id: string;
  phase: "A";
  concept: "transfer";
  seed: number;
  family: "equation-to-add-to-context";
  addends: readonly [number, number];
  total: number;
  equation: { left: number; operator: "+"; right: number; equals: "="; result: number };
  contexts: readonly [TransferContext, TransferContext];
  matchingContextId: string;
}

export type TransferIntent =
  | { type: "select-context"; value: string; input: TransferInputMethod }
  | { type: "submit" }
  | { type: "request-hint" };

export interface TransferViewState {
  selectedContextId?: string;
  attempts: number;
  revealedHintLevels: Array<1 | 2 | 3 | 4 | 5>;
  activeHint?: TransferHint;
  feedback?: { tone: "neutral" | "correct"; message: string };
  complete: boolean;
  inputMethods: TransferInputMethod[];
  observations: Array<{ selectedContextId: string; kind: TransferContextKind }>;
  announcement: string;
}
```

Generator, evaluator, hints, and evidence serializer are pure. `TransferActivity` owns speech replay, response timing, and one local write on completion.

## 6. Generator constraints

`generateTransferProblem({ seed, recentKeys? })` is deterministic.

- Base addends follow the supported A10/A11 range: non-zero, `a >= b`, `3 <= a <= 9`, `1 <= b <= 4`, total `<= 10`.
- Matching context has `initial === a`, `change === b`, `statedTotal === total`, and `event === "add-to"`.
- Exactly one distractor differs in one structural attribute. It must not accidentally satisfy all matching invariants.
- Context strings are constructed from approved templates with fixed noun agreement; the generator never invents prose.
- Matching-context position is seeded and alternated naturally; it is not always first.
- Avoid recent ordered-pair + template keys when alternatives exist.
- Do not mix multiple transfer families or add a text-composition task in this slice.

## 7. Evaluation and evidence

- Correct selection completes with `independent` only on first attempt without hints.
- An incorrect selection increments attempts and records the selected structural contrast (`take-away`, `wrong-addend`, or `wrong-total`). This is evidence of what did not transfer, not a diagnosis.
- Missing selection does not increment attempts.
- Hints appear only after a meaningful incorrect choice.
- Correct after hints is `supported`; correct after a wrong choice without hints is `developing`.

Local evidence contains problem id/seed, addends/total, matching context id, selected context id, selected contrast kind if incorrect, attempts, hints, input methods, response time, and mastery. Repeated patterns are scoped to transfer activities.

## 8. Hint progression

| Level | Kind | Behavior |
| --- | --- | --- |
| H1 | attention | Re-read the equation as “mulai, ditambah, menjadi.” |
| H2 | question | Ask which context begins with `a` and adds `b`. |
| H3 | representation | Reveal a compact labelled object strip for the equation. |
| H4 | partial-step | Match only the first fact: “Cari cerita yang mulai dari `a`.” |
| H5 | worked reasoning | Name the matching context’s initial/change/total and restate the equation. |

Hints do not read both options as a verbal test. They direct the child to structural facts.

## 9. Accessibility and responsive requirements

- Equation has one accessible sentence; visual equation tokens are hidden from the accessibility tree.
- Contexts are native radio choices with each three-line story in the accessible name. The label remains the entire click target.
- An optional replay control reads the equation and selected/focused context only when activated; there is no autoplay.
- H3 object strip uses a concise labelled `role="img"`; counters are hidden from assistive technology.
- Choice cards differ by text and structural content, never colour alone; no drag, timed reading, or image-only clue.
- Focus rings, 44px targets, keyboard/switch behavior, polite feedback announcements, and reduced-motion support are mandatory.
- At 320/375/414/768px, contexts stack in a single column; no card or equation causes horizontal overflow.

## 10. Scaffold fading

1. **Equation + object strip**: H3-level representation visible at entry for learners who need a concrete bridge.
2. **Equation only**: object strip is available only as H3 after two independent/developing transfer successes.
3. **Context first, equation on request**: a later separate family, not part of this implementation.

Two incorrect transfer choices with the same contrast kind return the next task to equation + object strip and surface the contrast through hints.

## 11. Deterministic tests

- Same seed yields same equation, contexts, matching id, and option position.
- Matching context satisfies every addition invariant; distractor violates exactly one required structural invariant.
- Reducer handles missing selection, error recovery, H3 representation reveal, and immutable completion.
- Evidence faithfully records selected contrast kinds without psychological labels.
- Component tests cover semantic equation, full radio labels, keyboard completion, replay control, feedback, hint recovery, and local storage.
- Playwright covers the happy path, responsive widths 320/375/414/768, and reduced motion.

## 12. Explicit non-goals

Do not add generated illustrations, open-answer story authoring, NLP scoring, money/time/measurement contexts, multiple operations, reward systems, expanding ranges, or Phase B/C transfer tasks.
