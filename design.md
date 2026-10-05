# Design — PahamHitung

## Reference and scope

Use the user-supplied Duolingo design reference (4 October 2026): white paper,
eager green, blue interactions, rounded heavy titles and flat, thick-bordered
controls. This is PahamHitung, not Duolingo: retain its name, learning models,
routes, factual copy and account behavior. No owl, proprietary logo, streak,
hearts, XP, leaderboard, confetti or decorative characters.

The supplied style request overrides the earlier warm-paper palette and generic
Hallmark restrictions against white, saturated green and Nunito. Child-learning
guardrails still govern attention, representation and feedback.

Brand update (5 October 2026): use the user's supplied PahamHitung PNG unchanged
through `src/components/Brand.astro`. Its blue/gold ten-frame and wordmark are
the brand, not additional exercise counters. CSS clips only surrounding blank
space; do not distort or redraw the mark. A compact SVG ten-frame accompanies
it as the favicon. Keep the established page palette, lesson representations
and account/storage identifiers unchanged. The accessible home link is
"PahamHitung — Beranda"; every page title ends with PahamHitung.

## Genre and page families

- Genre: playful, precise, calm during practice.
- Catalogue pages: existing class/material catalogue, with direct links.
- Homepage: text + mathematical part/whole preview, then class catalogue.
- App/learning: existing single-task workspace; mathematical objects dominate.
- Content: continuous readable document, no card around every section.
- Navigation: solid slab with two-row mobile links, never a hidden required action.
- Footer: green mast-headed band; learning pages use a quieter white variant.

Consistency overrides macrostructure diversification across this app. No new
route hierarchy, lesson logic or account features are part of this restyle.

## Palette and contrast

Canonical named tokens: `src/styles/tokens.css`; portable entry: `tokens.css`.
The final :root block is the active reference theme; the earlier block keeps the
established spacing and legacy token contract.

- Paper: white, oklch(100% 0 0).
- Primary fill: eager green, oklch(74.782% 0.22894 137.629), reference #58cc02.
- Primary text: night ink, oklch(16.288% 0.09831 264.135). Never white on bright green.
- Headings: darker green, oklch(54.901% 0.16333 136.017).
- Links: readable blue, oklch(50.207% 0.10982 238.735).
- Body: charcoal; helper text darker than reference #777777 for readable small text.
- Focus: night ink, immediate 3px ring with offset.
- A/B manipulatives: blue/yellow with solid/dashed boundaries and labels.
- Hint/success/error: distinct text and semantic state, never color alone.

Bright blue and green are surface colors. Do not reuse them for small text on
white. Foreground/background pairs must meet 4.5:1 (text), 3:1 (UI/focus).

## Typography, spacing and controls

Self-hosted Nunito Variable 800–900 for display, Atkinson Hyperlegible Next for
body and unambiguous instructional text. No third font. Headings upright,
tracking -.02em. Hero max 48px; practice heading sizes preserve the existing
scale. Body 17px, line height 1.55; text remains resizable.

Reuse the established named 4px spacing scale. Max width ~1200px. Input/button
minimum height 48px, counters retain their 44px geometry. Controls have 12px
radius, 2px border with a 3px bottom edge where appropriate. No box shadows,
gradients, glass, floating chrome or spatial ornament.

## Motion and states

No page reveals, timers or decorative loops. Only existing mathematical motion
and a subtle button press remain. Reduced motion disables spatial press.
Hover, focus, active, disabled, pending, error and success remain distinguishable;
pending labels and errors remain real state, not new UI-only placeholders.
No animated outline, resizing border on focus or reliance on hover alone.

## Exports

CSS source: import `tokens.css`; framework adapters consume the same canonical
values rather than inventing per-page palettes.

Tailwind v4 mapping: `@theme inline { --color-background: var(--color-paper);
--color-foreground: var(--color-ink); --color-primary: var(--color-accent);
--font-heading: var(--font-display); }`.

DTCG mapping: colors map to color tokens, font families to fontFamily tokens,
spacing/radii to dimension tokens; resolve the final active CSS declarations
when exporting, not the earlier warm-paper declarations.

shadcn mapping: background → paper; foreground → ink; primary → accent;
primary-foreground → accent-ink; border → rule; ring → focus;
muted → surface-raised; muted-foreground → muted. No shadcn runtime is introduced.
