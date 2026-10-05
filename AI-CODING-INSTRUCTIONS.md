# AI CODING INSTRUCTIONS
## Codex / ChatGPT / Claude Code / Cursor

---

## 1. Mandatory Read Order

Before coding, read:

1. `PROJECT-BRIEF.md`
2. `LEARNING-ARCHITECTURE.md`
3. `PHASE-A-B-C-SKILL-MAP.md`
4. `ADDITION-LEARNING-ENGINE.md`
5. `UI-UX-CHILD-ANTI-SLOP.md`
6. `TECH-ARCHITECTURE.md`
7. `HALLMARK-WORKFLOW.md`

Do not repeatedly reinterpret the product from scratch.

These files are the project source of truth unless explicitly updated.

---

## 2. Product Rule

Do not turn this project into:

- quiz app;
- gamified worksheet;
- SaaS dashboard;
- generic children's learning template.

This is a mathematics understanding environment.

---

## 3. Before Every Feature

Write internally:

```text
Objective:
Evidence of learning:
Representation:
Interaction:
Likely misconception:
Scaffold:
Fade condition:
Transfer opportunity:
```

If those are unclear, do not add UI complexity.

---

## 4. Code Rule

Keep:

```text
learning domain logic
≠
UI component logic
```

Never place the full generator/evaluator/mastery logic inside a visual component.

---

## 5. Astro Rule

Default to `.astro`.

Use Preact only when component requires real client interaction.

Prefer smallest possible hydration boundary.

---

## 6. Component Rule

Prefer domain components:

```text
TenFrame
NumberLine
BaseTenBlocks
PartWhole
EquationBuilder
```

over abstraction-heavy UI primitives that erase mathematical meaning.

Shared primitives are still allowed when useful.

---

## 7. No Premature Architecture

Do not add:
- backend;
- auth;
- database;
- global state framework;
- analytics SDK;
- AI API;

unless the current milestone explicitly needs it.

---

## 8. Design Rule

Hallmark is installed as anti-slop design support.

For new major screens:
1. use project brief;
2. use Hallmark;
3. implement;
4. run Hallmark audit;
5. run project-specific anti-slop audit.

Never allow Hallmark output to override child usability.

---

## 9. Visual Rule

Do not default to:

- gradients;
- glass cards;
- large hero;
- floating blobs;
- card grids;
- decorative icons;
- SaaS layout;
- gamification;
- mascot;
- random illustration.

Start from mathematical interaction.

---

## 10. Copy Rule

Bahasa anak:
- singkat;
- konkret;
- ramah;
- tidak merendahkan;
- tidak terlalu bayi.

Contoh baik:
> “Buat kelompok 10.”

Contoh buruk:
> “Ayo Sobat Matematika Super Hebat, waktunya petualangan angka yang seru!”

---

## 11. Error Copy

Use:
> “Belum tepat. Coba lihat lagi kelompok kedua.”

Not:
> “Wrong!”
> “Oops!”
> “Kamu gagal.”

---

## 12. Success Copy

Use evidence-oriented wording:

> “Ya. Kamu membuat 10 lebih dulu.”

Not:
> “AMAZING!”
> “SUPER STAR!”
> “+100 XP!”

---

## 13. Islamic Wording

Use naturally and sparingly.

Do not add:
- mosque motifs;
- crescent/star;
- lantern;
- arch;
- tasbih;
- decorative Arabic;
- religious gamification.

Islamic worldview is primarily expressed through values and learning behavior.

---

## 14. Testing Rule

Every meaningful learning function needs tests.

Test:
- mathematical correctness;
- pedagogical constraints;
- edge cases;
- interaction;
- accessibility;
- responsive layout.

---

## 15. Commit Scope

One commit should ideally represent one clear unit:

```text
feat(ten-frame): add interactive make-ten activity
test(generator): cover regrouping constraints
fix(a11y): support keyboard counter placement
refactor(learning): separate evaluator from UI
```

---

## 16. Definition of Done

Before declaring complete:

- [ ] objective is explicit;
- [ ] learning evidence is captured;
- [ ] domain logic tested;
- [ ] keyboard works where applicable;
- [ ] touch works;
- [ ] reduced motion respected;
- [ ] responsive screenshots reviewed;
- [ ] Hallmark audit performed for major UI;
- [ ] project anti-slop checklist passes;
- [ ] unnecessary elements removed;
- [ ] no premature backend complexity.

---

## 17. First Development Milestone

Build only:

```text
Fase A
→ quantity
→ joining
→ number bond
→ make-ten
→ ten-frame
→ number line
→ explanation
→ everyday transfer
```

Validate the interaction model before expanding the curriculum.

---

## 18. First Coding Prompt

```text
Read all project .md foundation files.

We are starting MVP Fase A.

Do not build the whole application yet.

First:
1. inspect the repository;
2. propose the minimum folder structure consistent with TECH-ARCHITECTURE.md;
3. install/configure only dependencies actually required;
4. establish tokens/base styles;
5. build a single accessible TenFrame component;
6. add unit/component tests;
7. create one make-ten learning activity;
8. run Hallmark review against the screen;
9. audit against UI-UX-CHILD-ANTI-SLOP.md;
10. report what was intentionally NOT built.

The ten-frame must be the visual protagonist.
No generic dashboard, mascot, gradients, gamification, or unnecessary cards.
```
