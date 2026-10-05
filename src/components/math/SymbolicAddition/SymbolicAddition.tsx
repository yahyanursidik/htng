import { createSymbolicAdditionBridge } from "../../../learning/addition/symbolic-addition-generator";
import type {
  SymbolicAdditionInputMethod,
  SymbolicAdditionIntent,
  SymbolicAdditionProblem,
  SymbolicAdditionViewState,
} from "../../../types/symbolic-addition";
import "./SymbolicAddition.css";

export interface SymbolicAdditionProps {
  problem: SymbolicAdditionProblem;
  state: SymbolicAdditionViewState;
  dispatch(intent: SymbolicAdditionIntent): void;
  onRepeatInstruction?(): void;
}

const numberWords = ["nol", "satu", "dua", "tiga", "empat", "lima", "enam", "tujuh", "delapan", "sembilan", "sepuluh"];

function inputMethod(event: MouseEvent): SymbolicAdditionInputMethod {
  return event.detail === 0 ? "keyboard" : "pointer";
}

export function SymbolicAddition({ problem, state, dispatch, onRepeatInstruction }: SymbolicAdditionProps) {
  const [a, b] = problem.addends;
  const showBridge = problem.scaffold !== "symbolic-first" || state.bridgeRevealed;
  const bridge = problem.bridge ?? createSymbolicAdditionBridge(a, b);
  const resultWord = state.selectedResult === undefined ? "kosong" : numberWords[state.selectedResult];
  const equationLabel = `${numberWords[a]} ditambah ${numberWords[b]} sama dengan ${resultWord}`;
  const compact = problem.scaffold === "bridge-compact" || (problem.scaffold === "symbolic-first" && showBridge);

  return (
    <section class="symbolic-addition-activity" aria-labelledby="symbolic-addition-prompt">
      <header class="symbolic-addition-activity__header">
        <h1 id="symbolic-addition-prompt">{problem.prompt}</h1>
        <button
          type="button"
          class="symbolic-addition__text-action"
          onClick={onRepeatInstruction}
          aria-label="Ulangi instruksi dengan suara"
        >
          Ulangi instruksi
        </button>
      </header>

      <div class="symbolic-addition__equation" role="img" aria-label={equationLabel}>
        <span aria-hidden="true">{a}</span>
        <span aria-hidden="true" class="symbolic-addition__operator">+</span>
        <span aria-hidden="true">{b}</span>
        <span aria-hidden="true" class="symbolic-addition__operator">=</span>
        <span aria-hidden="true" class={`symbolic-addition__result ${state.selectedResult === undefined ? "symbolic-addition__result--empty" : ""}`}>
          {state.selectedResult ?? "?"}
        </span>
      </div>

      {showBridge && (
        <div class={`symbolic-addition__bridge ${compact ? "symbolic-addition__bridge--compact" : ""}`} role="img" aria-label={`Garis bilangan: mulai dari ${bridge.start}, maju ${bridge.jumps.length} kali, berhenti di ${bridge.landing}.`}>
          {!compact && <p class="symbolic-addition__bridge-title">Baca garisnya: mulai, maju, lalu berhenti.</p>}
          <div class="symbolic-addition__bridge-track" aria-hidden="true" />
          <ol class="symbolic-addition__bridge-ticks" aria-hidden="true">
            {Array.from({ length: 11 }, (_, value) => (
              <li class={`symbolic-addition__bridge-tick ${value === 0 || value === 5 || value === 10 ? "symbolic-addition__bridge-tick--landmark" : ""}`} key={value}>
                {value === bridge.start && !compact && <span class="symbolic-addition__bridge-marker">mulai</span>}
                {value === bridge.landing && !compact && <span class="symbolic-addition__bridge-marker symbolic-addition__bridge-marker--landing">berhenti</span>}
                <span class="symbolic-addition__bridge-mark" />
                <span>{value}</span>
              </li>
            ))}
          </ol>
          <div class="symbolic-addition__bridge-jumps" aria-hidden="true">
            {bridge.jumps.map((jump) => (
              <span
                class="symbolic-addition__bridge-jump"
                style={{ "--jump-left": `${jump.from * 10}%`, "--jump-width": `${(jump.to - jump.from) * 10}%` }}
                key={`${jump.from}-${jump.to}`}
              >
                <span>1</span>
              </span>
            ))}
          </div>
        </div>
      )}

      {!state.complete && (
        <div class="symbolic-addition__answer-area">
          <fieldset class="symbolic-addition__answer-choices" role="radiogroup">
            <legend>Lengkapi hasilnya</legend>
            <div class="symbolic-addition__answer-grid">
              {problem.answerOptions.map((value) => (
                <label class="symbolic-addition__answer-choice" key={value}>
                  <input
                    type="radio"
                    name="symbolic-addition-result"
                    value={value}
                    checked={state.selectedResult === value}
                    onClick={(event) => dispatch({ type: "select-result", value, input: inputMethod(event) })}
                  />
                  <span>{value}</span>
                </label>
              ))}
            </div>
          </fieldset>
          <button
            type="button"
            class="symbolic-addition__primary-action"
            data-state={state.status === "incorrect" ? "error" : "default"}
            onClick={() => dispatch({ type: "submit-result" })}
          >
            Cek jawaban
          </button>
        </div>
      )}

      {state.feedback && (
        <p class="symbolic-addition__feedback" data-tone={state.feedback.tone} role={state.feedback.tone === "correct" ? "status" : undefined}>
          {state.feedback.message}
        </p>
      )}

      {state.attempts > 0 && !state.complete && (
        <div class="symbolic-addition__hint-area">
          {state.activeHint && (
            <aside class="symbolic-addition__hint-panel" aria-labelledby="symbolic-addition-hint-title">
              <h2 id="symbolic-addition-hint-title">Petunjuk {state.activeHint.level}</h2>
              <p>{state.activeHint.content}</p>
            </aside>
          )}
          {state.revealedHintLevels.length < 5 && (
            <button type="button" class="symbolic-addition__text-action" onClick={() => dispatch({ type: "request-hint" })}>
              {state.revealedHintLevels.length === 0 ? "Petunjuk" : "Petunjuk berikutnya"}
            </button>
          )}
        </div>
      )}

      <p class="sr-only" aria-live="polite" aria-atomic="true">{state.announcement}</p>
    </section>
  );
}
