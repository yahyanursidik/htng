import { useCallback, useEffect, useRef, useState } from "preact/hooks";
import {
  createInitialSymbolicAdditionState,
  reduceSymbolicAdditionState,
  toSymbolicAdditionAttemptEvidence,
} from "../../../learning/addition/symbolic-addition-evaluator";
import { saveSymbolicAdditionAttempt } from "../../../lib/storage/attempt-evidence";
import type { SymbolicAdditionIntent, SymbolicAdditionProblem } from "../../../types/symbolic-addition";
import { SymbolicAddition } from "./SymbolicAddition";

export interface SymbolicAdditionActivityProps {
  problem: SymbolicAdditionProblem;
  priorCorrectBridgeKeys?: readonly string[];
}

export function SymbolicAdditionActivity({ problem, priorCorrectBridgeKeys = [] }: SymbolicAdditionActivityProps) {
  const [state, setState] = useState(createInitialSymbolicAdditionState);
  const startedAt = useRef<number | null>(null);
  const savedActivityId = useRef<string | null>(null);

  useEffect(() => { startedAt.current = performance.now(); }, []);

  const dispatch = useCallback((intent: SymbolicAdditionIntent) => {
    setState((current) => reduceSymbolicAdditionState(problem, current, intent, { priorCorrectBridgeKeys }));
  }, [problem, priorCorrectBridgeKeys]);

  useEffect(() => {
    if (!state.complete || savedActivityId.current === problem.id) return;
    const elapsed = startedAt.current === null ? undefined : Math.round(performance.now() - startedAt.current);
    saveSymbolicAdditionAttempt(toSymbolicAdditionAttemptEvidence(problem, state, elapsed));
    savedActivityId.current = problem.id;
  }, [problem, state]);

  const repeatInstruction = useCallback(() => {
    if (!("speechSynthesis" in window) || !("SpeechSynthesisUtterance" in window)) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(problem.prompt);
    utterance.lang = "id-ID";
    window.speechSynthesis.speak(utterance);
  }, [problem.prompt]);

  return <SymbolicAddition problem={problem} state={state} dispatch={dispatch} onRepeatInstruction={repeatInstruction} />;
}
