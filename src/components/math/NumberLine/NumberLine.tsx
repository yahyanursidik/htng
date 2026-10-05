import type {
  NumberLineInputMethod,
  NumberLineIntent,
  NumberLineProblem,
  NumberLineViewState,
} from "../../../types/number-line";
import "./NumberLine.css";

export interface NumberLineProps {
  problem: NumberLineProblem;
  state: NumberLineViewState;
  dispatch(intent: NumberLineIntent): void;
  onRepeatInstruction?(): void;
}

function eventInputMethod(event: MouseEvent): NumberLineInputMethod {
  return event.detail === 0 ? "keyboard" : "pointer";
}

function makeWorkedJumps(problem: NumberLineProblem) {
  return Array.from({ length: problem.expectedJumpCount }, (_, index) => ({
    from: problem.startValue + index,
    to: problem.startValue + index + 1,
  }));
}

export function NumberLine({ problem, state, dispatch, onRepeatInstruction }: NumberLineProps) {
  const [a, b] = problem.addends;
  const hintLevel = state.activeHint?.level ?? 0;
  const shownJumps = hintLevel === 5 ? makeWorkedJumps(problem) : state.jumps;
  const jumpReady = state.status === "jumping";
  const answerReady = state.status === "answering" || state.status === "incorrect";
  const lineSummary = state.start === undefined
    ? `Garis bilangan dari 0 sampai 10. Mulai dari ${a} untuk menghitung lanjut, atau 0 untuk menghitung semua.`
    : `Garis bilangan dari 0 sampai 10. Mulai dari ${state.start}. ${state.jumps.length} lompatan maju dibuat. Saat ini di ${state.currentValue}.`;

  return (
    <section class="number-line-activity" aria-labelledby="number-line-prompt">
      <header class="number-line-activity__header">
        <h1 id="number-line-prompt">{problem.prompt}</h1>
        <button
          type="button"
          class="number-line__text-action"
          onClick={onRepeatInstruction}
          aria-label="Ulangi instruksi dengan suara"
        >
          Ulangi instruksi
        </button>
      </header>

      <fieldset class="number-line__start-choice" disabled={state.complete}>
        <legend>Pilih tempat mulai</legend>
        <div class="number-line__start-options">
          <label class="number-line__start-option">
            <input
              type="radio"
              name="number-line-start"
              checked={state.start === a}
              onClick={(event) => dispatch({ type: "select-start", value: a, input: eventInputMethod(event) })}
            />
            <span>Mulai dari {a}</span>
          </label>
          <label class="number-line__start-option">
            <input
              type="radio"
              name="number-line-start"
              checked={state.start === 0}
              onClick={(event) => dispatch({ type: "select-start", value: 0, input: eventInputMethod(event) })}
            />
            <span>Hitung dari 0</span>
          </label>
        </div>
      </fieldset>

      <div
        class="number-line"
        data-hint-step={hintLevel >= 4 ? "visible" : undefined}
        data-worked={hintLevel === 5 ? "visible" : undefined}
        role="img"
        aria-label={lineSummary}
      >
        <div class="number-line__track" aria-hidden="true" />
        <ol class="number-line__ticks" aria-hidden="true">
          {Array.from({ length: 11 }, (_, value) => {
            const isLandmark = value === 0 || value === 5 || value === 10;
            const isStart = state.start === value;
            const isCurrent = state.currentValue === value;
            return (
              <li class={`number-line__tick ${isLandmark ? "number-line__tick--landmark" : ""}`} key={value}>
                {isStart && <span class="number-line__marker number-line__marker--start">mulai</span>}
                {isCurrent && !state.complete && <span class="number-line__marker number-line__marker--current">di sini</span>}
                <span class="number-line__tick-mark" />
                <span class="number-line__number">{value}</span>
              </li>
            );
          })}
        </ol>
        <div class="number-line__jumps" aria-hidden="true">
          {shownJumps.map((jump, index) => (
            <span
              class={`number-line__jump ${hintLevel === 5 || (hintLevel === 4 && index === 0) ? "number-line__jump--hint" : ""}`}
              style={{
                "--jump-left": `${jump.from * 10}%`,
                "--jump-width": `${(jump.to - jump.from) * 10}%`,
              }}
              key={`${jump.from}-${jump.to}-${index}`}
            >
              <span>1</span>
            </span>
          ))}
        </div>
      </div>

      {jumpReady && (
        <div class="number-line__jump-control">
          <p>Setiap lompatan maju satu angka.</p>
          <button
            type="button"
            class="number-line__primary-action"
            onClick={(event) => dispatch({ type: "add-unit-jump", input: eventInputMethod(event) })}
          >
            Lompat maju satu
          </button>
        </div>
      )}

      {answerReady && !state.complete && (
        <div class="number-line__answer-area">
          <fieldset class="number-line__answer-choices" role="radiogroup">
            <legend>Kamu tiba di angka berapa?</legend>
            <div class="number-line__answer-grid">
              {problem.answerOptions.map((value) => (
                <label class="number-line__answer-choice" key={value}>
                  <input
                    type="radio"
                    name="number-line-total"
                    value={value}
                    checked={state.selectedAnswer === value}
                    onChange={() => dispatch({ type: "select-answer", value })}
                  />
                  <span>{value}</span>
                </label>
              ))}
            </div>
          </fieldset>
          <button
            type="button"
            class="number-line__primary-action"
            data-state={state.status === "incorrect" ? "error" : "default"}
            onClick={() => dispatch({ type: "submit-answer" })}
          >
            Cek jawaban
          </button>
        </div>
      )}

      {state.feedback && (
        <p class="number-line__feedback" data-tone={state.feedback.tone} role={state.feedback.tone === "correct" ? "status" : undefined}>
          {state.feedback.message}
        </p>
      )}

      {state.attempts > 0 && !state.complete && (
        <div class="number-line__hint-area">
          {state.activeHint && (
            <aside class="number-line__hint-panel" aria-labelledby="number-line-hint-title">
              <h2 id="number-line-hint-title">Petunjuk {state.activeHint.level}</h2>
              <p>{state.activeHint.content}</p>
            </aside>
          )}
          {state.revealedHintLevels.length < 5 && (
            <button type="button" class="number-line__text-action" onClick={() => dispatch({ type: "request-hint" })}>
              {state.revealedHintLevels.length === 0 ? "Petunjuk" : "Petunjuk berikutnya"}
            </button>
          )}
        </div>
      )}

      <p class="sr-only" aria-live="polite" aria-atomic="true">{state.announcement}</p>
      <p class="sr-only">Strategi tujuan: mulai dari {a}, lalu lompat maju {b} kali.</p>
    </section>
  );
}
