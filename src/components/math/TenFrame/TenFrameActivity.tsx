import { useCallback, useEffect, useRef, useState } from "preact/hooks";
import {
  createInitialTenFrameState,
  reduceTenFrameState,
  toTenFrameAttemptEvidence,
} from "../../../learning/addition/ten-frame-evaluator";
import { saveTenFrameAttempt } from "../../../lib/storage/attempt-evidence";
import type { TenFrameIntent, TenFrameProblem } from "../../../types/ten-frame";
import { TenFrame } from "./TenFrame";

export interface TenFrameActivityProps {
  problem: TenFrameProblem;
}

export function TenFrameActivity({ problem }: TenFrameActivityProps) {
  const [state, setState] = useState(createInitialTenFrameState);
  const startedAt = useRef<number | null>(null);
  const savedActivityId = useRef<string | null>(null);

  useEffect(() => {
    startedAt.current = performance.now();
  }, []);

  const dispatch = useCallback(
    (intent: TenFrameIntent) => {
      setState((current) => reduceTenFrameState(problem, current, intent));
    },
    [problem],
  );

  useEffect(() => {
    if (!state.complete || savedActivityId.current === problem.id) return;
    const elapsed = startedAt.current === null ? undefined : Math.round(performance.now() - startedAt.current);
    saveTenFrameAttempt(toTenFrameAttemptEvidence(problem, state, elapsed));
    savedActivityId.current = problem.id;
  }, [problem, state]);

  const repeatInstruction = useCallback(() => {
    if (!("speechSynthesis" in window) || !("SpeechSynthesisUtterance" in window)) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(problem.prompt);
    utterance.lang = "id-ID";
    window.speechSynthesis.speak(utterance);
  }, [problem.prompt]);

  return (
    <TenFrame
      problem={problem}
      state={state}
      dispatch={dispatch}
      onRepeatInstruction={repeatInstruction}
    />
  );
}
