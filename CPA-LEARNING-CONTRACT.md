# CPA learning expansion — implemented contract

Scope: concept-focused general SD mathematics, grades 1–6. Additive to the 30 lessons, account API and seven addition labs; no existing generator seed interpretation, evaluation semantics, authentication or account schema changes.

## Learning decisions

- Concrete means physical objects used with a companion, not draggable objects on a screen. Instructions use safe household materials; smaller objects require supervision or replacement by larger objects. The optional checkbox is a self-report, never confirmation by the application.
- Pictorial means a representation of the same quantity, grouping, unit or relationship. Screens explicitly connect physical objects to circles, equal units, rods, layers or positions. The game picture renders the learner's current construction, including incorrect arrangements; it never silently replaces it with the target.
- Abstract connects the representation to numbers, an expression with a missing result, and a mathematical reason. Numeric answers and reasons are checked independently. An accurate abstract answer is permitted even if the learner did not build the digital target: understanding is not gated on using a particular tool.
- CPA is not a one-way or age-based ladder. Three native navigation buttons stay available, preserve construction within an example, and move focus to the new phase heading. Abstract initially hides the picture; reopening it is recorded separately from hint level. Navigation to P is also in the visited-phase evidence. No mandatory unlock, timer, lives, reward or automatic mastery declaration.
- Three hints: relationship reminder → guided strategy → worked reasoning. Child can request them immediately when needed; no timed gate. Worked reasoning is last. New example resets construction, reports, inputs, hints and phase observations; saved history remains.

Sources informing the adaptation: [NCETM representation and structure](https://www.ncetm.org.uk/features/the-five-big-ideas-at-primary-representation-and-structure/), [EEF manipulatives and representations](https://educationendowmentfoundation.org.uk/early-years/maths/use-manipulatives-and-representations-to-develop-understanding). These are pedagogical references, not claims of verified learning outcomes for this product.

## Coverage and access

- `/cpa`: explanation, six direct class anchors, fourteen live games, and links to all thirty worked examples.
- `/cpa/<game-id>`: one concept workspace, C/P/A navigation and device-local evidence. Home, global public navigation, class catalogue and worked examples link to CPA.
- All `/belajar/<lesson-id>` pages contain a collapsed `#contoh-cpa` disclosure before practice: a deterministic worked example, physical instructions matching its numbers, pictorial representation, symbolic explanation and separate everyday transfer task. Its seed is 17; it is deliberately labelled as an example rather than an assessed attempt.
- Grades 1/2/4/6 have two games each; grades 3/5 have three each. Games: joining, taking away, exchanging tens, measuring length, equal groups, sharing, fractions, equivalent fractions, area, decimals, layered volume, mean redistribution, proportional recipe, crossing zero.
- Coverage is not the entire SD syllabus. No school-curriculum certification is added.

## Engine and API

`src/learning/cpa/engine.ts` is a pure, deterministic, version-1 engine. `generateChallenge(gameId, seed)` accepts a known ID and integer seed 0..2147483647, otherwise throws. It produces explicit `mode`, initial/target integer vectors, limits, labels, column count, physical instruction, pictorial bridge, expected numeric value, expression, three reason choices and three hints. No network, randomness, account import or AI dependency.

`transition(question, state, action)` returns a new valid vector only for an allowed action; out-of-bound, empty-source or unsupported operations return the original vector. Invalid incoming states throw. Every mutation uses this function, including keyboard buttons.

| Mode | Mathematical invariant |
| --- | --- |
| build | Bounded nonnegative counts per labelled group. |
| transfer | Removal/shared objects move from source to destination; total is conserved. |
| redistribute | Any selected donor can give to another pile; total is conserved. |
| exchange | `10 × tens + ones` is constant; canonical target has fewer than ten ones. |
| select | Each equal unit is 0/1. Fraction/decimal success depends on number selected, not location. Area/length require every unit. |
| layers | 0..4 whole layers; each contains `columns × 2` equal cubes. |
| line | One action changes signed position by one within −5..5. Starting position is not a step. |

`evaluateChallenge` returns separate construction, answer and reason booleans plus gentle actionable feedback. Parsing reuses the existing numeric parser; it accepts comma decimals and signed numbers, rejects blank, expressions and scientific notation. Invalid/missing abstract inputs produce a labelled error and no evaluated attempt.

`CPAGame({gameId})` owns phase, construction, hints, observation counts and inputs. `CPAPicture({question,state})` is a read-only visual with textual quantities; digital construction controls are native buttons/selects, not drag-only. `CPAWorkedPicture({question})` supplements existing models for two-digit operations, turn fractions, unit changes, recipe scaling and sorted median cards without changing the curriculum engine.

## Evidence and privacy

`src/lib/storage/cpa-evidence.ts`, key `mathyahya.cpa.evidence.v1`, at most 500 valid latest records. Each construction/abstract check snapshots: version, UUID, game ID, seed, checked phase, unique visited phases, self-reported physical trial, abstract picture reopening, construction vector, successful digital changes, check ordinal, highest hint index, numeric input, selected reason, three result flags and timestamp. No child identifiers or account credentials.

Read validates structure, known seeds, integer bounds and mathematical invariants; outcomes are regenerated and compared. Malformed entries are ignored; corrupt/disabled storage does not crash. Writes are bounded and deduplicated by ID. Quota failure is announced while interaction remains available. This is local convenience validation, not tamper-proof evidence. The UI displays five recent records for the current game and the local record count.

Records do not assert strategy, intelligence, physical participation or mastery. Digital changes are action counts, not proof of the mental strategy. Physical reports, hints and navigation are learner-reported/browser observations, unsuitable for high-stakes assessment. CPA evidence remains separate even when logged in; no silent upload, reassignment or mixing with family/guest/lab evidence. Privacy copy explicitly explains local retention and that account deletion does not clear independent browser data.

## Accessibility and visual behavior

Reuse `design.md` and existing named tokens/fonts: white/green/blue flat controls, no new design system or decorative assets. Selected areas also have slash marks/dashed outlines and accessible pressed state; bins have labels and alternate borders. Physical instructions can be repeated, and each picture supplies a figcaption/accessible description of quantities and relationships. Signed line stays spatially ordered on narrow screens. Equal strips share the same full width for fraction equivalence.

Every mutation has a native keyboard/touch control. No required drag, hover-only instructions or spatial animation. Focus is immediate; phase/example changes focus the active heading. Status and error messages are announced separately. Touch selection cells are at least 44px; narrow-screen control cells wrap but still form one labelled whole. Static P strips stay equal-width; controller layout is not itself a new mathematical whole. Reduced motion disables transitions/animations in the workspace. Public guidance and worked examples remain readable without JavaScript; interaction requires JavaScript.

## Verification contract

- Unit tests: fourteen generators × 100 seeds, real grade/lesson links, bounds and invalid inputs, conservation, reversibility, unsupported operations, location-independent equal parts, signed movement and independent answer/reason checks.
- Evidence tests: exact snapshots, no mastery flags, malformed/forged outcomes, cap/deduplication, corrupt/disabled/quota storage and isolated legacy keys.
- Component tests: C/P/A state continuity, physical self-report, reason retry, invalid inputs, exchange, pressed selection, three hints, next-example reset, storage failure, fourteen render paths and all thirty worked pictures.
- Playwright: keyboard happy path and focus, local evidence surviving reload, public navigation discovery, all thirty examples, all fourteen games through C/P/A at 320/375/414/768/1024/1440, touch bounds, no overflow and reduced motion.
- Run the complete existing suite with `npm run test:all`; API and E2E use isolated databases, not family data. Compile/build plus browser screenshot review are required before handoff. Do not treat automated checks as a real-child or assistive-technology usability study.
