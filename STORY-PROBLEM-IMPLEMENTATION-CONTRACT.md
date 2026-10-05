# A11 Story Problem — Implementation Contract

> Scope: Phase A addition, one-step `join/add-to` stories with discrete objects and sums within 10. The activity measures whether a child can model an addition event in context; it is not a reading-comprehension exam, a general word-problem engine, or a mixed-operation quiz.

## 1. Learning objective

The child identifies an everyday **add-to** event, preserves the quantities in the story, and connects it to a total:

```text
initial amount + amount added = amount now
```

Example:

> Di kotak ada 6 pensil. Ditambah 3 pensil lagi. Berapa pensil sekarang?

The mathematical idea is temporal: there is an amount at the beginning, something is added, and the question asks for the amount afterward. `+` is meaningful because the context grows, not because the user has learned to hunt for a word.

Initial A11 does not cover take-away, comparison, missing parts, money, time, measurements, multi-step stories, or stories with irrelevant information.

## 2. Readiness and sequence

A11 follows A10. A child enters the initial story scaffold after:

- two correct Symbolic Addition activities using two different ordered pairs;
- at least one result with no H3–H5 hint; and
- no repeated `operation-confusion` pattern in the two most recent symbolic attempts.

The first story scaffold keeps objects and the equation visible. An incorrect story response returns to the representation that makes the event visible; it does not return to a generic drill.

## 3. Story-language rules

The generator draws only from reviewed, short Indonesian templates. Each problem uses:

- one familiar, discrete noun (`pensil`, `buku`, `kancing`, `balok`, `daun`);
- the same noun in every sentence;
- two declarative sentences plus one question;
- one explicit addition cue, selected from `ditambah`, `datang lagi`, or `masuk lagi`;
- one target quantity question using `sekarang` or `semuanya`;
- no pronoun ambiguity, idiom, negation, comparison, multi-clause sentence, or culturally specific knowledge.

The item noun is a label for countable objects, not decorative illustration. Render it as repeated tactile markers with a text label; do not generate stock scenes, mascots, people, or reward imagery.

## 4. Representation and interaction

The vertical slice has three deliberately bounded scaffolds:

1. `objects-visible` — story text, two labelled object groups, and locked equation `a + b = [ ]` are visible.
2. `objects-compact` — story and equation are primary; a smaller unlabeled object strip remains available.
3. `story-symbolic` — story and equation appear first; H3 reveals the compact object strip.

For every scaffold, the interaction sequence is:

1. Read the story or activate **Ulangi cerita**.
2. Select the event meaning with native radios: **Bertambah** or **Berkurang**.
3. Select the final amount from stable native radio choices 0–10.
4. Press **Cek jawaban**.

The event choice is a visible evidence source, not a trap. The `Berkurang` choice is present solely to distinguish operation meaning; it never changes this addition problem into a subtraction calculation. The result can be submitted only after an event choice and total have both been selected. A wrong response retains story, choices, object strip, and equation.

The equation is read as one relation—“enam ditambah tiga sama dengan sembilan”—with visual tokens hidden from the accessibility tree to avoid duplicated speech.

## 5. Domain contracts

```ts
export type StoryProblemScaffold = "objects-visible" | "objects-compact" | "story-symbolic";
export type StoryEventMeaning = "add-to" | "take-away";
export type StoryProblemInputMethod = "pointer" | "keyboard" | "switch";
export type StoryProblemMisconceptionTag =
  | "operation-confusion"
  | "word-problem-interpretation"
  | "counting-error"
  | "quantity-symbol-disconnect"
  | "number-magnitude";

export interface StoryTemplate {
  id: "in-box-added" | "on-table-arrived" | "in-jar-inserted";
  item: "pensil" | "buku" | "kancing" | "balok" | "daun";
  initialSentence: string;
  changeSentence: string;
  question: string;
  additionCue: "ditambah" | "datang lagi" | "masuk lagi";
}

export interface StoryObjectStrip {
  representation: "counters";
  itemLabel: string;
  initialCount: number;
  addedCount: number;
  total: number;
}

export interface StoryProblem {
  id: string;
  phase: "A";
  concept: "story-add-to";
  seed: number;
  addends: readonly [number, number];
  total: number;
  story: StoryTemplate;
  equation: { left: number; operator: "+"; right: number; equals: "=" };
  scaffold: StoryProblemScaffold;
  objectStrip?: StoryObjectStrip;
  answerOptions: readonly number[];
}

export type StoryProblemIntent =
  | { type: "select-event"; value: StoryEventMeaning; input: StoryProblemInputMethod }
  | { type: "select-result"; value: number; input: StoryProblemInputMethod }
  | { type: "submit" }
  | { type: "request-hint" };

export interface StoryProblemViewState {
  selectedEvent?: StoryEventMeaning;
  selectedResult?: number;
  attempts: number;
  objectStripRevealed: boolean;
  revealedHintLevels: Array<1 | 2 | 3 | 4 | 5>;
  activeHint?: StoryProblemHint;
  feedback?: { tone: "neutral" | "correct"; message: string };
  announcement: string;
  status: "answering" | "incorrect" | "complete";
  complete: boolean;
  inputMethods: StoryProblemInputMethod[];
  observations: Array<{ tag: StoryProblemMisconceptionTag; event?: StoryEventMeaning; answer?: number }>;
}
```

`StoryProblemActivity` owns instruction speech, response time, and one local write after completion. Generator, hint engine, evaluator, evidence converter, and scaffold selection remain pure modules outside Preact.

## 6. Generator constraints

`generateStoryProblem({ seed, scaffold, recentProblemKeys?, templateIds? })` is seeded and deterministic.

- Generate only non-zero addends: `3 <= a <= 9`, `1 <= b <= 4`, `a >= b`, and `a + b <= 10`.
- `total === a + b`; equation tokens exactly match the ordered addends and total.
- The template pool is an explicit local data list, not LLM-generated prose at runtime.
- Each template accepts the same count in initial, added, and question noun slots. The selected cue must describe add-to unambiguously.
- `objects-visible` and `objects-compact` always include an object strip. `story-symbolic` omits it until H3 derives the same strip from the problem’s addends and story item.
- Avoid a recent ordered pair and template id together when another valid candidate exists. The key is `templateId:a+b`, not just the numbers.
- Answer options are the stable ascending `0..10` set; their layout is not randomized.
- Do not add arbitrary numerical range parameters. New story forms require their own generator family and tests.

## 7. Evaluator and evidence behavior

Correctness requires both `selectedEvent === "add-to"` and `selectedResult === total`.

- Missing event or result: no attempt is counted; feedback identifies the missing decision.
- `operation-confusion`: child selects `take-away` but the total is correct. The quantity may be known while the event meaning is not.
- `word-problem-interpretation`: child selects `take-away` and an incorrect result. This is only an observed response pattern to the explicit story cue, not a language diagnosis.
- `number-magnitude`: child selects a total below `max(a, b)` or above `total + 2` while selecting `add-to`.
- `quantity-symbol-disconnect`: eligible only when the child selected `add-to`, previously solved the identical object strip correctly in the current session, and now chooses a wrong total. It cannot be inferred from one answer.
- `counting-error`: another incorrect final amount when the object strip is visible or was revealed.
- Correct with any hint is `supported`; a correct answer after a wrong attempt is `developing`; first-pass `objects-visible` is `developing`; first-pass `objects-compact` or `story-symbolic` with no hints is `independent`.

Store `activityId`, seed, template id, item, addends, total, scaffold, object-strip visibility, selected event, selected result, correctness, attempts, hint levels, input methods, response time, observed patterns, and mastery. Repeated-pattern promotion is scoped to prior A11 entries only.

## 8. Hint progression

Hints are offered after a submitted incorrect answer. They preserve the child’s choices.

| Level | Kind | Behavior |
| --- | --- | --- |
| H1 | attention | Repeat the change sentence and visually emphasize the add-to cue. |
| H2 | question | Ask: “Jumlah benda sekarang bertambah atau berkurang?” |
| H3 | representation | Reveal or expand the two labelled object groups: “sudah ada” and “ditambah”. |
| H4 | partial-step | Map only the story parts: `a` is the amount awal; `b` is the amount yang ditambah. |
| H5 | worked reasoning | State the complete story, object relation, and equation, then name the total. |

H5 teaches why the event is addition; it never returns only a bare answer.

## 9. Accessibility and responsive requirements

- Story appears in semantic paragraphs inside an `article`; the repeat button uses native speech synthesis only as an optional aid.
- Event and total selection use separate fieldsets with explicit legends. Radio controls work with arrows, Space, and Enter by default.
- Object strip has a concise `role="img"` summary—for example “6 pensil sudah ada dan 3 pensil ditambah”—while repeated markers are `aria-hidden`.
- The object groups differ by label, left-to-right stage, solid versus dashed border/pattern, and colour; never by colour alone.
- Equation is one accessible sentence; no canvas, pointer-only grouping, draggable items, or timed reading task.
- Feedback, hint level, and selection changes use one polite live region. Error feedback is informational and does not use sound, shake, loss, or a red screen.
- All actionable controls have a 44px floor and an instant visible focus ring. Reduced motion makes any object-addition transition immediate.
- At 320, 375, 414, and 768px, story remains above the mathematical representation; each fieldset can wrap internally but buttons/labels do not become multi-line or introduce page overflow.

## 10. Scaffold fading and escalation

1. `objects-visible` is the entry and recovery scaffold.
2. `objects-compact` follows two correct `objects-visible` responses across different templates, including one without H3–H5.
3. `story-symbolic` follows three correct A11 responses across at least two templates, with one independent `objects-compact` result and no repeated observed pattern.

Two meaningful errors with the same tag select a more concrete scaffold for the next story. A successful answer never immediately suppresses the representation. This is a local rule-based decision, not an AI-adaptive claim.

## 11. Deterministic implementation tests

- Same seed/config produces the same template, language, quantities, and object strip.
- Every generated sentence is from the approved template pool and contains one item noun consistently.
- Range, total, equation, and object-strip invariants always hold.
- Recent `templateId:a+b` avoidance is deterministic and safe after candidate exhaustion.
- Reducer requires both event and total, retains selections after error, and is immutable after completion.
- Evaluator distinguishes operation-confusion, magnitude, visible-strip counting error, and session-conditioned quantity-symbol disconnect without inventing diagnoses.
- H3 reveals the object strip only for `story-symbolic`; H5 supplies full context → equation reasoning.
- Component tests cover semantic story, replay instruction, both radio groups, keyboard completion, error recovery, hints, and local evidence persistence.
- Playwright covers supported happy path, compact/story-symbolic configuration, reduced motion, and no horizontal overflow at 320/375/414/768px.

## 12. Explicit non-goals

Do not add illustrations, mascot characters, rewards, narrative branching, voice recognition, automated reading assessment, subtraction computation, money/time contexts, unrelated facts, or sums above 10 in this slice.
