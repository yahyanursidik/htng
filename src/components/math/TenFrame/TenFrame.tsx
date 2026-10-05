import { useRef } from "preact/hooks";
import type {
  InputMethod,
  TenFrameIntent,
  TenFrameProblem,
  TenFrameViewState,
} from "../../../types/ten-frame";
import "./TenFrame.css";

export interface TenFrameProps {
  problem: TenFrameProblem;
  state: TenFrameViewState;
  dispatch(intent: TenFrameIntent): void;
  onRepeatInstruction?(): void;
}

function eventInputMethod(event: MouseEvent): InputMethod {
  return event.detail === 0 ? "keyboard" : "pointer";
}

export function TenFrame({
  problem,
  state,
  dispatch,
  onRepeatInstruction,
}: TenFrameProps) {
  const [a, b] = problem.addends;
  const remainingCounters = b - state.placedBCount;
  const visibleTotal = a + state.placedBCount;
  const draggedCounter = useRef<string | null>(null);
  const answerReady = state.status !== "building";
  const showFiveStructure = (state.activeHint?.level ?? 0) >= 3;
  const showCountingStep = state.activeHint?.level === 4;

  function addCounter(counterId: string, input: InputMethod) {
    dispatch({ type: "add-counter", counterId, input });
  }

  function handleDrop(event: DragEvent) {
    event.preventDefault();
    const counterId = event.dataTransfer?.getData("text/plain") || draggedCounter.current;
    if (counterId) addCounter(counterId, "pointer");
    draggedCounter.current = null;
  }

  return (
    <section class="ten-frame-activity" aria-labelledby="ten-frame-prompt">
      <header class="ten-frame-activity__header">
        <h1 id="ten-frame-prompt">{problem.prompt}</h1>
        <button
          type="button"
          class="text-action"
          onClick={onRepeatInstruction}
          aria-label="Ulangi instruksi dengan suara"
        >
          Ulangi instruksi
        </button>
      </header>

      <div class="ten-frame-workspace">
        <div
          class="ten-frame"
          data-five-structure={showFiveStructure ? "visible" : undefined}
          data-counting-step={showCountingStep ? "visible" : undefined}
          role="img"
          aria-label={`Bingkai sepuluh: ${visibleTotal} dari 10 kotak terisi. ${a} keping biru dan ${state.placedBCount} keping kuning.`}
          onDragOver={(event) => {
            if (remainingCounters > 0) event.preventDefault();
          }}
          onDrop={handleDrop}
        >
          {Array.from({ length: 10 }, (_, slot) => {
            const isGroupA = slot < a;
            const isGroupB = slot >= a && slot < visibleTotal;
            return (
              <span class="ten-frame__cell" aria-hidden="true" key={slot}>
                {(isGroupA || isGroupB) && (
                  <span
                    class={`ten-frame__counter ten-frame__counter--${isGroupA ? "a" : "b"}`}
                  />
                )}
              </span>
            );
          })}
        </div>

        {remainingCounters > 0 && (
          <div class="counter-source" role="group" aria-label={`${remainingCounters} keping kuning untuk ditambahkan`}>
            <p>Tambahkan ke bingkai</p>
            <div class="counter-source__items">
              {Array.from({ length: remainingCounters }, (_, index) => {
                const counterId = `b-${state.placedBCount + index + 1}`;
                return (
                  <button
                    type="button"
                    class="source-counter"
                    key={counterId}
                    draggable
                    aria-label={`Tambahkan keping kuning ${index + 1} dari ${remainingCounters}`}
                    onDragStart={(event) => {
                      draggedCounter.current = counterId;
                      event.dataTransfer?.setData("text/plain", counterId);
                    }}
                    onClick={(event) => addCounter(counterId, eventInputMethod(event))}
                  >
                    <span aria-hidden="true" />
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {answerReady && !state.complete && (
        <div class="answer-area">
          <fieldset class="answer-choices" role="radiogroup">
            <legend>Berapa jumlah semuanya?</legend>
            <div class="answer-choices__grid">
              {problem.answerOptions.map((value) => (
                <label class="answer-choice" key={value}>
                  <input
                    type="radio"
                    name="ten-frame-total"
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
            class="primary-action"
            data-state={state.status === "incorrect" ? "error" : "default"}
            onClick={() => dispatch({ type: "submit-answer" })}
          >
            Cek jawaban
          </button>
        </div>
      )}

      {state.feedback && (
        <p
          class="learning-feedback"
          data-tone={state.feedback.tone}
          role={state.feedback.tone === "correct" ? "status" : undefined}
        >
          {state.feedback.message}
        </p>
      )}

      {state.attempts > 0 && !state.complete && (
        <div class="hint-area">
          {state.activeHint && (
            <aside class="hint-panel" aria-labelledby="hint-title">
              <h2 id="hint-title">Petunjuk {state.activeHint.level}</h2>
              <p>{state.activeHint.content}</p>
            </aside>
          )}
          {state.revealedHintLevels.length < 5 && (
            <button
              type="button"
              class="text-action"
              onClick={() => dispatch({ type: "request-hint" })}
            >
              {state.revealedHintLevels.length === 0 ? "Petunjuk" : "Petunjuk berikutnya"}
            </button>
          )}
        </div>
      )}

      <p class="sr-only" aria-live="polite" aria-atomic="true">
        {state.announcement}
      </p>
    </section>
  );
}
