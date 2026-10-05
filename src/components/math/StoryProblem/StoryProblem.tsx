import { createStoryObjectStrip } from "../../../learning/addition/story-problem-generator";
import type { StoryProblemInputMethod, StoryProblemIntent, StoryProblem as StoryProblemData, StoryProblemViewState } from "../../../types/story-problem";
import "./StoryProblem.css";
export interface StoryProblemProps { problem: StoryProblemData; state: StoryProblemViewState; dispatch(intent: StoryProblemIntent): void; onRepeatInstruction?(): void; }
function input(event: MouseEvent): StoryProblemInputMethod { return event.detail === 0 ? "keyboard" : "pointer"; }
export function StoryProblem({ problem, state, dispatch, onRepeatInstruction }: StoryProblemProps) {
  const [a, b] = problem.addends; const showStrip = problem.scaffold !== "story-symbolic" || state.objectStripRevealed; const strip = problem.objectStrip ?? createStoryObjectStrip(a, b, problem.story.item); const compact = problem.scaffold !== "objects-visible";
  return <section class="story-problem-activity" aria-labelledby="story-prompt">
    <header class="story-problem-activity__header"><h1 id="story-prompt">Cerita penjumlahan</h1><button type="button" class="story-problem__text-action" onClick={onRepeatInstruction} aria-label="Ulangi cerita dengan suara">Ulangi cerita</button></header>
    <article class="story-problem__story" aria-label="Cerita soal"><p>{problem.story.initialSentence}</p><p data-cue={state.activeHint?.level === 1 ? "visible" : undefined}>{problem.story.changeSentence}</p><p>{problem.story.question}</p></article>
    {showStrip && <div class={`story-problem__strip ${compact ? "story-problem__strip--compact" : ""}`} role="img" aria-label={`${a} ${strip.itemLabel} sudah ada dan ${b} ${strip.itemLabel} ditambah, jadi ${strip.total} ${strip.itemLabel}.`}>
      <div class="story-problem__group"><p>{compact ? "Sudah ada" : `${a} ${strip.itemLabel} sudah ada`}</p><div aria-hidden="true">{Array.from({ length: a }, (_, index) => <span class="story-problem__counter story-problem__counter--initial" key={index} />)}</div></div>
      <span class="story-problem__join" aria-hidden="true">+</span>
      <div class="story-problem__group"><p>{compact ? "Ditambah" : `${b} ${strip.itemLabel} ditambah`}</p><div aria-hidden="true">{Array.from({ length: b }, (_, index) => <span class="story-problem__counter story-problem__counter--added" key={index} />)}</div></div>
    </div>}
    <div class="story-problem__equation" role="img" aria-label={`${a} ditambah ${b} sama dengan ${state.selectedResult ?? "kosong"}`}><span aria-hidden="true">{a}</span><span aria-hidden="true">+</span><span aria-hidden="true">{b}</span><span aria-hidden="true">=</span><span aria-hidden="true">{state.selectedResult ?? "?"}</span></div>
    {!state.complete && <div class="story-problem__answers">
      <fieldset class="story-problem__fieldset" role="radiogroup"><legend>Apa yang terjadi?</legend><div class="story-problem__event-grid"><label><input type="radio" name="story-event" checked={state.selectedEvent === "add-to"} onClick={(event) => dispatch({ type: "select-event", value: "add-to", input: input(event) })} /><span>Bertambah</span></label><label><input type="radio" name="story-event" checked={state.selectedEvent === "take-away"} onClick={(event) => dispatch({ type: "select-event", value: "take-away", input: input(event) })} /><span>Berkurang</span></label></div></fieldset>
      <fieldset class="story-problem__fieldset" role="radiogroup"><legend>Berapa jumlahnya sekarang?</legend><div class="story-problem__number-grid">{problem.answerOptions.map((value) => <label key={value}><input type="radio" name="story-total" value={value} checked={state.selectedResult === value} onClick={(event) => dispatch({ type: "select-result", value, input: input(event) })} /><span>{value}</span></label>)}</div></fieldset>
      <button type="button" class="story-problem__primary-action" data-state={state.status === "incorrect" ? "error" : "default"} onClick={() => dispatch({ type: "submit" })}>Cek jawaban</button>
    </div>}
    {state.feedback && <p class="story-problem__feedback" data-tone={state.feedback.tone} role={state.feedback.tone === "correct" ? "status" : undefined}>{state.feedback.message}</p>}
    {state.attempts > 0 && !state.complete && <div class="story-problem__hint-area">{state.activeHint && <aside class="story-problem__hint" aria-labelledby="story-hint"><h2 id="story-hint">Petunjuk {state.activeHint.level}</h2><p>{state.activeHint.content}</p></aside>}{state.revealedHintLevels.length < 5 && <button type="button" class="story-problem__text-action" onClick={() => dispatch({ type: "request-hint" })}>{state.revealedHintLevels.length ? "Petunjuk berikutnya" : "Petunjuk"}</button>}</div>}
    <p class="sr-only" aria-live="polite" aria-atomic="true">{state.announcement}</p>
  </section>;
}
