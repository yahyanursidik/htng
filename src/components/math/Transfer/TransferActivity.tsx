import { useCallback, useState } from "preact/hooks";
import { createInitialTransferState, reduceTransferState } from "../../../learning/addition/transfer-evaluator";
import type { TransferIntent, TransferProblem } from "../../../types/transfer";
import { Transfer } from "./Transfer";
export function TransferActivity({ problem }: { problem: TransferProblem }) { const [state, setState] = useState(createInitialTransferState); const dispatch = useCallback((intent: TransferIntent) => setState((current) => reduceTransferState(problem, current, intent)), [problem]); return <Transfer problem={problem} state={state} dispatch={dispatch} />; }
