# SD concepts and companion accounts — implementation contract

Scope approved: materi umum SD kelas 1–6, fokus pemahaman konsep; parent/companion-owned accounts and child profiles. This expansion adds a reusable concept-learning lane without replacing earlier addition contracts or routes. It is a working self-hosted foundation, not a claim of complete syllabus coverage.

## Product boundaries

- Thirty functioning core lessons, five per grade, in Indonesian. Every catalogue link resolves to a working generator, model, evaluator, three hints and five-question session.
- Guest practice remains open. Logged-in companions create up to six nickname/grade profiles. No child emails, birthdays, schools, photos, or leaderboard.
- Existing `/lab/*` modules remain anonymous device-local activities. They are linked from home and `/lab`; back-navigation connects them to the grade catalogue. Historical lab evidence is not silently reassigned to a child.
- No school curriculum certification, automatic mastery diagnosis, high-stakes grades, rewards, timers, or AI-generated explanations.

## Routes and ownership

`src/layouts/AppLayout.astro` owns the new public shell. `src/styles/app.css` consumes the existing warm-paper tokens/fonts and is not imported into old labs. `LabNavigation.astro` adds back links without changing their math interaction.

- `/`: grade-first landing and old lab links.
- `/belajar`, `/belajar/kelas-1` through `kelas-6`: catalogue and ordered learning path.
- `/belajar/<lesson-id>`: concept, prerequisite link, practice, offline application.
- `/daftar`, `/masuk`: adult account forms.
- `/keluarga`: profiles, selection/editing, logout, password change, family export, permanent account deletion.
- `/progres`: guest or owned-profile attempts and conservative next-step suggestions.
- `/panduan`, `/privasi`: family instructions, accessibility and data limitations.

## Learning engine

`catalog.ts` holds stable IDs, grade, domain, objective, concept explanation, prerequisite and offline application. `engine.ts` is deterministic pure logic imported by both browser and Node backend. Node 24+ supports the erasable TypeScript used here; do not introduce runtime TypeScript features or client-only imports into these shared files.

Generator inputs are stable lesson ID and integer seed in 0..2147483647. The bounded PRNG constructs numbers, prompt, unit, expected answer, model specification, explanation, three reason choices and correct index. No network/AI dependence. All grade lessons have implementations; unknown IDs and invalid seeds fail closed.

Model kinds: counters, equal groups, base-ten rods, equal fraction strips, unit grids, polygons, unit bars, number lines and labelled numerical values. Quantity is bounded; large two-digit operations use place-value explanation rather than hundreds of individual dots. Subtraction marks removed members of the original group, not an extra group to count. Negative-number lines remain a single spatial line at mobile widths. Fraction partitions are equal; selection is marked by slash as well as colour. Volume explicitly shows one layer and states how many equal layers compose the box.

Five-question session: see model → enter numeric answer → choose mathematical reason → check → informative feedback → retry or advance. Skipping is allowed and not treated as a wrong submission. The model is initially shown in rounds 1–2, hidden at first in rounds 3–5; children can always restore it. Counter buttons mark/unmark one object without changing quantity. Model interaction is supportive; it is not a claim of demonstrated strategy.

Answer parsing accepts signed integers and decimals with comma or dot. Scientific notation, expressions, thousands separators, blank/non-finite inputs are rejected. Inputs explicitly explain this, including Rupiah answers. Evaluator checks answer and reason independently. Correct arithmetic with incorrect reason asks the child to review their explanation. Hints: concept reminder → guided approach → worked explanation. Help can be repeated through the model/visible hint, no time limit.

An attempt is “independent” only when answer and reason are correct, no hint was used, and it was the first submitted answer for the question. This means **first check without hints**, not proof of learning without a model. Server determines whether there were earlier records for this profile/lesson/seed. Guest UI counts earlier checks within the session. Progress counts distinct seeds, not retries, and never assigns mastery. At three independently answered seeds it suggests trying without a model; this remains a suggestion, not unlocking or certification.

## API and account security

`server/app.mjs` exports `createApp`; `server/start.mjs` binds the local service. A single server serves built Astro files and same-origin `/api`. Defaults: 127.0.0.1:4322, database `data/mathyahya.sqlite`; configure `PORT`, `HOST`, `APP_ORIGIN`, `DATABASE_PATH`, `NODE_ENV`. The backend does not load `.env` automatically. Never commit real data or credentials.

Account passwords are 15–128 characters, including spaces, hashed asynchronously with scrypt N=131072/r=8/p=1, random salt, 64-byte output. At most two password derivations run simultaneously. Unknown-account login performs a dummy derivation. SQL uses bound parameters. Session tokens are random 32-byte values, only SHA-256 hashes are persisted; cookies are HttpOnly/SameSite=Strict, seven-day expiration, Secure under production. Login rotates the current session. Password change requires the current password and revokes every old session. Logout revokes this session server-side.

Mutations require JSON and an exact configured Origin; cross-site fetch metadata is rejected. Authenticated mutations additionally require session CSRF token. Body limit 16KB. IP-based auth limits: 20 attempts/10 minutes; password mutations 10; evidence writes 300. In-process rate limiters are suitable for the local single-instance foundation, not a replacement for production abuse controls. The server intentionally does not trust forwarded headers.

| Endpoint | Contract |
| --- | --- |
| GET `/api/session` | Anonymous or authenticated account, owned profiles, active profile, CSRF token. No password/hash/token. |
| POST `/api/auth/register` | name, email, password, adult consent boolean; creates account and session. |
| POST `/api/auth/login` | email, password; authenticates and rotates session. |
| POST `/api/auth/logout` | Empty JSON body plus CSRF. |
| POST `/api/profiles` | nickname, grade 1..6; creates owned profile and selects it. |
| PATCH `/api/profiles` | profileId, nickname, grade; only owned profiles. |
| POST `/api/profiles/active` | Owned profileId; stored server-side, shared by account sessions. Practice binds the selected profile at session start. |
| POST `/api/attempts` | id, profileId, lessonId, seed, answer, reason 0..2, hints 0..3. Server regenerates/evaluates; client outcome flags are ignored. Same ID is idempotent for the same profile. |
| GET `/api/progress?profileId=…` | Owned profile and its latest 1,000 evidence records. Other-account IDs return 404. |
| GET `/api/export` | Account names/email, owned profiles and attempts; no auth secrets. |
| POST `/api/account/password` | currentPassword and password; authenticated reauthorization. |
| DELETE `/api/account` | password and confirmation exactly matching account email; cascades profiles/attempts/sessions. UI requires explicit typed confirmation. |

All API responses use no-store. Static paths are constrained to dist; body, origin, profile, seed and reason constraints apply at the server. Headers add nosniff, same-origin referrer policy and frame denial. Production refuses HTTP APP_ORIGIN and adds HSTS. There is **no email verification or email password recovery**, deliberately stated on forms. Do not add fake reset links or accept child emails in later implementation.

Security choices draw on [OWASP password storage](https://cheatsheetseries.owasp.org/cheatsheets/Password_Storage_Cheat_Sheet.html), [session management](https://cheatsheetseries.owasp.org/cheatsheets/Session_Management_Cheat_Sheet.html) and [CSRF prevention](https://cheatsheetseries.owasp.org/cheatsheets/Cross-Site_Request_Forgery_Prevention_Cheat_Sheet.html). SQLite runtime: [Node documentation](https://nodejs.org/api/sqlite.html).

## Persistence and failure behavior

SQLite contains accounts, profiles, sessions, attempts; foreign-key cascades remove family evidence with the account. WAL mode and durable file storage survive server restart. Keep persistent storage outside public dist. Back up with a SQLite-safe procedure or stop the server before copying its database; protect exports/backups as child data. Account deletion does not erase independently retained backups or downloads.

Guest evidence has its own versioned browser key `mathyahya.guest.curriculum.v1`, limited to 1,000 validated records. Auth credentials/session values never enter localStorage. Guest history is not uploaded or assigned to an account on login. Local quota failure is shown honestly without preventing continued learning. Server save failure preserves visible feedback and offers idempotent retry or explicit continue without saving. No silent fallback into a different child's profile.

Retention protects basic storage bounds, not an archival promise. Evidence stores generated seed, answer, selected reason, hint count, result flags and server time. Hints and model use reported by the client are not tamper-proof observations; unsuitable for high-stakes assessment. Engine changes that alter seed interpretation require an explicit version/migration decision before rollout; current version has no retrospective regeneration UI.

## Accessibility and design

Existing Bricolage/Atkinson pair, warm paper, calm Catalogue layout. No mascot, photos, gradients, streaks, coins or fabricated learning metrics. Stable 48px main controls; 44px counters. Keyboard-native buttons, radios/selects, labels/fieldset legends, skip link, visible instantaneous focus, polite feedback and explicit errors. Text descriptions provide access to quantities and relationships; colour is never the only selection signal. Reduced motion removes button displacement without delaying state. Grade numbers label actual class choices, not decorative badges. New CSS does not alter older lab component styles.

## Checks

- `npm run check`: Astro/TypeScript, including tests.
- `npm test`: old modules plus 30 generators × 100 seeds; invariant checks, independent vs assisted attempts, numeric parser, progress deduplication; component answer/reason, hints/fading, guest quota behavior, native counter semantics and auth mismatch.
- `npm run test:server`: actual HTTP accounts, cookie flags, CSRF/origin refusal, IDOR isolation, forged outcomes rejected/recomputed, retry idempotency, session/password rotation, account cascade, expiry, HTTPS requirement.
- `npm run build`: full static route generation, backend serves dist.
- `npm run test:e2e`: isolated in-memory API service on 4407 plus Chromium registration/profile/practice/progress/relogin, five-question keyboard guest flow, all grade paths, responsive checks 320/375/414/768/1024/1440 and previous labs.

## Before public deployment

Self-host the Node server with persistent SQLite volume, backup/recovery, process supervision, HTTPS reverse proxy and exact APP_ORIGIN, production environment and controlled access. Default bind is loopback; exposing HOST requires an intentional deployment decision. Original static/Vercel foundation does **not** supply a runtime for this account backend. For multiple instances choose a suitable shared persistence/session/rate-limit service rather than pretending local SQLite is shared. Configure a verified email provider/recovery design, review child-data/privacy obligations and accessibility with real assistive technology, and validate pedagogy with children/teachers before claiming production or full curricular coverage.
