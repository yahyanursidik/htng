// Non-production Hallmark control-state preview. Render with the app's styles.
import ExplainingCalculator from "../../src/components/learning/ExplainingCalculator";
export default function CalculatorPreview() {
  const states = ["default", "hover", "focus", "active", "disabled", "loading", "error", "success"];
  return <><ExplainingCalculator /><section class="calculator" aria-label="Control state preview">{states.map(state => <div key={state}><p>{state}</p><button class={`quiet is-${state}`} data-state={state} disabled={state === "disabled" || state === "loading"} aria-busy={state === "loading"}>{state === "loading" ? "Memuat kalkulator…" : state === "error" ? "Periksa bilangan" : state === "success" ? "Hasil tersedia" : "Hitung"}</button></div>)}</section></>;
}
