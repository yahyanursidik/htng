import { useCallback, useEffect, useRef, useState } from "preact/hooks";
import {
  createInitialNumberLineState,
  reduceNumberLineState,
  toNumberLineAttemptEvidence,
} from "../../../learning/addition/number-line-evaluator";
import { saveNumberLineAttempt } from "../../../lib/storage/attempt-evidence";
import type { NumberLineIntent, NumberLineProblem } from "../../../types/number-line";
import { NumberLine } from "./NumberLine";

export interface NumberLineActivityProps {
  problem: NumberLineProblem;
}

export function NumberLineActivity({ problem }: NumberLineActivityProps) {
  const [state, setState] = useState(createInitialNumberLineState);
  const startedAt = useRef<number | null>(null);
  const savedActivityId = useRef<string | null>(null);

  useEffect(() => {
    startedAt.current = performance.now();
  }, []);

  const dispatch = useCallback((intent: NumberLineIntent) => {
    setState((current) => reduceNumberLineState(problem, current, intent));
  }, [problem]);

  useEffect(() => {
    if (!state.complete || savedActivityId.current === problem.id) return;
    const elapsed = startedAt.current === null ? undefined : Math.round(performance.now() - startedAt.current);
    saveNumberLineAttempt(toNumberLineAttemptEvidence(problem, state, elapsed));
    savedActivityId.current = problem.id;
  }, [problem, state]);

  const repeatInstruction = useCallback(() => {
    if (!("speechSynthesis" in window) || !("SpeechSynthesisUtterance" in window)) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(problem.prompt);
    utterance.lang = "id-ID";
    window.speechSynthesis.speak(utterance);
  }, [problem.prompt]);

  return <NumberLine problem={problem} state={state} dispatch={dispatch} onRepeatInstruction={repeatInstruction} />;
}
