# TECH ARCHITECTURE
## Astro 7.2+ · Preact · Vercel

---

## 1. Technical Principles

- static/server-first;
- interactive only where needed;
- local-first MVP;
- typed domain model;
- learning logic separated from UI;
- progressive enhancement;
- accessible by default;
- performance budget;
- no premature backend complexity.

---

## 2. Recommended Stack

```text
Astro 7.2+
TypeScript
Preact
CSS variables / project design tokens
Astro Content Collections
Vitest
Playwright
Vercel
```

Optional later:

```text
Neon PostgreSQL
Drizzle ORM
Astro Actions
Authentication
Teacher Dashboard
```

---

## 3. Why Astro

Gunakan Astro pages untuk:
- landing;
- parent guide;
- concept information;
- activity shells;
- progress summary.

Gunakan Preact islands hanya untuk:
- drag/drop manipulatives;
- ten-frame;
- number line;
- equation builder;
- interactive reasoning;
- local progress state.

Jangan hydrate seluruh halaman jika satu komponen saja membutuhkan JS.

---

## 4. Proposed Structure

```text
src/
├── components/
│   ├── common/
│   └── math/
│       ├── CounterBoard/
│       ├── FiveFrame/
│       ├── TenFrame/
│       ├── NumberLine/
│       ├── PartWhole/
│       ├── BaseTenBlocks/
│       ├── PlaceValueChart/
│       ├── EquationBuilder/
│       ├── HintPanel/
│       └── StrategyPicker/
│
├── content/
│   ├── activities/
│   ├── concepts/
│   └── parent-guides/
│
├── learning/
│   ├── addition/
│   │   ├── generator.ts
│   │   ├── evaluator.ts
│   │   ├── hints.ts
│   │   ├── strategies.ts
│   │   ├── misconceptions.ts
│   │   └── constraints.ts
│   └── mastery/
│       ├── progress.ts
│       └── rules.ts
│
├── lib/
│   ├── storage/
│   └── a11y/
│
├── pages/
│   ├── belajar/
│   ├── lab/
│   ├── latihan/
│   ├── tantangan/
│   ├── sekitar-kita/
│   └── progres/
│
├── styles/
│   ├── tokens.css
│   ├── base.css
│   └── math.css
│
└── types/
```

---

## 5. Component Principle

Math components are domain components.

Contoh:

```tsx
<TenFrame
  value={7}
  target={10}
  interactive
/>
```

Lebih baik daripada generic:

```tsx
<Card>
  ...
</Card>
```

Gunakan komponen yang berbicara dalam bahasa domain matematika.

---

## 6. State

MVP:
- component state;
- lightweight shared store jika benar-benar dibutuhkan;
- localStorage untuk preferensi kecil;
- IndexedDB untuk attempt/progress jika volume mulai besar.

Jangan memasang state-management library besar sebelum kebutuhan terbukti.

---

## 7. Content Collections

Gunakan collection untuk:
- activity metadata;
- concept explanation;
- parent prompts;
- offline challenge.

Schema harus tervalidasi.

---

## 8. Persistence MVP

Anak dapat belajar tanpa akun.

Gunakan anonymous local profile:

```ts
{
  profileId: crypto.randomUUID(),
  createdAt: "...",
  phasePreference: "A"
}
```

Hindari mengumpulkan nama lengkap/PII jika tidak diperlukan.

---

## 9. Backend Phase 2

Backend baru diperlukan untuk:
- multi-device sync;
- teacher class;
- assignment;
- centralized analytics;
- parent account;
- progress portability.

Suggested:

```text
Astro
↓
Astro Actions
↓
Drizzle
↓
Neon PostgreSQL
```

---

## 10. Testing

### Unit
- generators;
- evaluator;
- mastery;
- hints;
- constraint logic.

### Component
- keyboard;
- touch interaction;
- state.

### E2E
- complete one activity;
- hint flow;
- wrong-answer recovery;
- persistence;
- responsive.

---

## 11. Accessibility Tests

Automated test tidak cukup.

Tambahkan manual:
- keyboard only;
- screen zoom;
- reduced motion;
- high contrast inspection;
- touch device;
- child usability observation.

---

## 12. Performance Budget

Target:
- initial page minimal JS;
- lazy hydrate manipulatives;
- no unnecessary client framework;
- optimized assets;
- no autoplay media;
- fonts minimal;
- avoid huge icon packages.

---

## 13. Security & Privacy

Karena target pengguna anak:

- collect minimum data;
- no advertising;
- no third-party tracking by default;
- no public profile;
- no social leaderboard;
- sanitize user-generated text;
- parent/teacher features separated;
- document retention before cloud storage is introduced.

Lakukan review regulasi privasi yang berlaku sebelum menyimpan data anak secara online.

---

## 14. Vercel

Untuk MVP static/local-first:
- deploy Astro to Vercel;
- gunakan server features hanya jika diperlukan.

Jangan menambahkan database semata-mata karena deployment mendukungnya.

---

## 15. Definition of Done

Fitur dianggap selesai bila:

- domain test lolos;
- UI responsive;
- keyboard usable;
- reduced motion respected;
- anti-slop score lolos;
- screenshot reviewed;
- pedagogical objective jelas;
- tidak ada JS hydration yang tidak perlu.
