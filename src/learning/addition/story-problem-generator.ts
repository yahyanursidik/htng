import type { StoryObjectStrip, StoryProblem, StoryProblemScaffold, StoryTemplate, StoryTemplateId } from "../../types/story-problem";

export interface StoryProblemGeneratorConfig { seed: number; scaffold: StoryProblemScaffold; recentProblemKeys?: readonly string[]; templateIds?: readonly StoryTemplateId[]; }
interface TemplateDefinition { id: StoryTemplateId; item: StoryTemplate["item"]; cue: StoryTemplate["additionCue"]; make(a: number, b: number): StoryTemplate; }
const answerOptions = Object.freeze(Array.from({ length: 11 }, (_, value) => value));
const templates: readonly TemplateDefinition[] = [
  { id: "in-box-added", item: "pensil", cue: "ditambah", make: (a, b) => ({ id: "in-box-added", item: "pensil", additionCue: "ditambah", initialSentence: `Di kotak ada ${a} pensil.`, changeSentence: `Ditambah ${b} pensil lagi.`, question: "Berapa pensil sekarang?" }) },
  { id: "on-table-arrived", item: "buku", cue: "datang lagi", make: (a, b) => ({ id: "on-table-arrived", item: "buku", additionCue: "datang lagi", initialSentence: `Di meja ada ${a} buku.`, changeSentence: `${b} buku datang lagi.`, question: "Berapa buku sekarang?" }) },
  { id: "in-jar-inserted", item: "kancing", cue: "masuk lagi", make: (a, b) => ({ id: "in-jar-inserted", item: "kancing", additionCue: "masuk lagi", initialSentence: `Di toples ada ${a} kancing.`, changeSentence: `${b} kancing masuk lagi.`, question: "Berapa kancing sekarang?" }) },
];
function mulberry32(seed: number) { let state = seed >>> 0; return () => { state += 0x6d2b79f5; let value = state; value = Math.imul(value ^ (value >>> 15), value | 1); value ^= value + Math.imul(value ^ (value >>> 7), value | 61); return ((value ^ (value >>> 14)) >>> 0) / 4_294_967_296; }; }
export function storyProblemKey(templateId: StoryTemplateId, a: number, b: number) { return `${templateId}:${a}+${b}`; }
export function storyObjectStripKey(problem: Pick<StoryProblem, "story" | "addends">) { return `${problem.story.item}:${problem.addends[0]}+${problem.addends[1]}`; }
export function createStoryObjectStrip(a: number, b: number, itemLabel: StoryTemplate["item"]): StoryObjectStrip { return { representation: "counters", itemLabel, initialCount: a, addedCount: b, total: a + b }; }
export function generateStoryProblem(config: StoryProblemGeneratorConfig): StoryProblem {
  if (!Number.isSafeInteger(config.seed)) throw new Error("StoryProblem seed must be a safe integer.");
  const allowedTemplates = templates.filter((template) => !config.templateIds || config.templateIds.includes(template.id));
  if (allowedTemplates.length === 0) throw new Error("StoryProblem needs at least one approved template.");
  const candidates: Array<{ a: number; b: number; template: TemplateDefinition; key: string }> = [];
  for (const template of allowedTemplates) for (let a = 3; a <= 9; a += 1) for (let b = 1; b <= 4; b += 1) if (a >= b && a + b <= 10) candidates.push({ a, b, template, key: storyProblemKey(template.id, a, b) });
  const recent = new Set(config.recentProblemKeys ?? []); const pool = candidates.filter((candidate) => !recent.has(candidate.key));
  const candidatePool = pool.length > 0 ? pool : candidates; const candidate = candidatePool[Math.floor(mulberry32(config.seed)() * candidatePool.length)];
  if (!candidate) throw new Error("StoryProblem generator produced no candidate.");
  const total = candidate.a + candidate.b; const story = candidate.template.make(candidate.a, candidate.b);
  return { id: `story-problem-${config.scaffold}-${candidate.key}-${config.seed}`, phase: "A", concept: "story-add-to", seed: config.seed, addends: [candidate.a, candidate.b], total, story, equation: { left: candidate.a, operator: "+", right: candidate.b, equals: "=" }, scaffold: config.scaffold, objectStrip: config.scaffold === "story-symbolic" ? undefined : createStoryObjectStrip(candidate.a, candidate.b, story.item), answerOptions };
}
