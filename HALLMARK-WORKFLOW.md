# HALLMARK WORKFLOW
## Anti-AI-Slop Design Layer

Source:
- https://github.com/nutlope/hallmark
- https://www.usehallmark.com/

Hallmark adalah design skill untuk Claude Code, Cursor, dan Codex yang berfokus pada pencegahan desain generik/AI-generated.

---

## 1. Install

```bash
npx skills add nutlope/hallmark
```

Update dengan menjalankan kembali perintah yang sama.

---

## 2. Peran Hallmark di Project

Hallmark dipakai untuk:

1. membantu memilih macrostructure;
2. menghindari pola UI generik hasil LLM;
3. mengaudit slop patterns;
4. membuat fingerprint halaman lebih spesifik;
5. membantu redesign jika struktur terlalu generik;
6. mempelajari DNA desain referensi tanpa pixel cloning.

Hallmark bukan pengganti:

- pedagogical design;
- child usability;
- accessibility;
- math representation rules;
- project design tokens;
- Islamic visual boundaries.

---

## 3. Priority Contract

Jika Hallmark menghasilkan desain yang bertentangan dengan:

`UI-UX-CHILD-ANTI-SLOP.md`

maka aturan project menang.

Urutan:

```text
Child Safety
↓
Pedagogy
↓
Accessibility
↓
Cognitive Load
↓
Project UI Rules
↓
Hallmark
↓
Aesthetic novelty
```

---

## 4. Hallmark Verbs

Menurut dokumentasi Hallmark:

### default
Membangun UI baru dengan macrostructure dan slop checks.

### audit
```text
hallmark audit <target>
```

Dipakai untuk menilai implementasi tanpa mengedit.

### redesign
```text
hallmark redesign <target>
```

Gunakan jika halaman secara struktur sudah terlanjur generik.

### study
```text
hallmark study <screenshot | URL>
```

Gunakan untuk mengekstrak design DNA dari referensi.

Jangan meminta pixel clone.

---

## 5. Workflow per Screen

### Step 1 — Pedagogical brief

Sebelum meminta desain, tulis:

```text
Learning objective:
User:
Primary mathematical object:
Required interaction:
Expected misconception:
Allowed support:
Elements that must NOT appear:
```

### Step 2 — Project constraints

Tambahkan:

```text
Read:
- UI-UX-CHILD-ANTI-SLOP.md
- LEARNING-ARCHITECTURE.md
- PHASE-A-B-C-SKILL-MAP.md

Do not override these files.
```

### Step 3 — Hallmark design

Minta Hallmark menentukan macrostructure berdasarkan tugas.

Bukan:
> “buat desain yang keren”

Tetapi:
> “Design a learning workspace where the ten-frame is the visual protagonist.”

### Step 4 — Implement

Gunakan Astro + Preact.

### Step 5 — Hallmark audit

Jalankan audit setelah implementasi.

### Step 6 — Project anti-slop audit

Gunakan checklist pada `UI-UX-CHILD-ANTI-SLOP.md`.

### Step 7 — Screenshot review

Review breakpoint.

### Step 8 — Child usability review

Yang paling penting tetap:
- apakah anak mengerti;
- apakah anak tahu apa yang harus dilakukan;
- apakah desain membantu berpikir.

---

## 6. Prompt Pattern — New Screen

```text
Use Hallmark.

Read these project constraints first:
- LEARNING-ARCHITECTURE.md
- UI-UX-CHILD-ANTI-SLOP.md

Create the UI for:
[ACTIVITY]

Learning objective:
[OBJECTIVE]

Primary mathematical object:
[OBJECT]

Interaction:
[INTERACTION]

Design constraints:
- mathematical object must dominate;
- no SaaS dashboard visual language;
- no generic kids-game tropes;
- no decorative mascot;
- no gradient unless materially justified;
- no excessive cards;
- no gamification noise;
- no human/animal illustration;
- no decorative Islamic symbols;
- one screen = one cognitive task;
- accessible touch interaction;
- reduced-motion compatible.

Use Hallmark to select a fitting macrostructure, but project pedagogical rules override Hallmark.
```

---

## 7. Prompt Pattern — Audit

```text
hallmark audit [target]

Then additionally audit against:
UI-UX-CHILD-ANTI-SLOP.md

Return:
1. Hallmark slop issues
2. Child cognitive-load issues
3. accessibility issues
4. mathematical-representation issues
5. elements to remove before elements to add
```

---

## 8. Prompt Pattern — Redesign

```text
hallmark redesign [target]

Keep:
- learning objective;
- copy;
- mathematical interaction;
- accessibility requirements.

Throw away:
- generic card grid;
- decorative hero structure;
- unnecessary gradient;
- SaaS patterns;
- game reward clutter.

The new fingerprint must make the mathematical manipulative the visual protagonist.
```

---

## 9. Prompt Pattern — Study

```text
hallmark study [URL or screenshot]

Extract only:
- macrostructure;
- spacing rhythm;
- typography relationship;
- interaction hierarchy;
- visual anchor;
- useful craft techniques.

Do not:
- clone pixels;
- copy proprietary assets;
- inherit patterns that hurt child usability.

Translate the useful DNA into this mathematics-learning context.
```

---

## 10. Hallmark Acceptance Test

Hallmark output is accepted only when:

- page does not look like default LLM UI;
- macrostructure follows activity, not template;
- mathematical object dominates;
- decoration is restrained;
- child can identify next action;
- accessibility remains intact;
- page still passes project anti-slop score.

A visually distinctive page that worsens learning is a failed page.
