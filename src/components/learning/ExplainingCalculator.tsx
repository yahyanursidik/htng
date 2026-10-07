import {useEffect, useRef, useState} from "preact/hooks";
import {calculate, numberError, operations, type Operation, type Calculation} from "../../learning/calculator/engine";
import {calculateColumn,columnNumberError,columnExamples,type ColumnCalculation} from "../../learning/calculator/column-engine";
import ColumnSolution from './ColumnSolution';
import "../../styles/calculator.css";

// Objective: connect the result to place value, decomposition and inverse checks.
// Evidence: none. Reading a worked solution is not independent mastery.
// Support: a complete worked example on request; cleared when operands change.
// Transfer: return to the corresponding existing concept/CPA lesson.
const examples: {label: string; first: string; operation: Operation; second: string}[] = [
  {label: "28 + 17", first: "28", operation: "add", second: "17"},
  {label: "52 − 28", first: "52", operation: "subtract", second: "28"},
  {label: "12 × 4", first: "12", operation: "multiply", second: "4"},
  {label: "17 ÷ 4", first: "17", operation: "divide", second: "4"},
  {label: "1,25 + 0,75", first: "1,25", operation: "add", second: "0,75"},
];
type Field = "first" | "second" | "operation";
export default function ExplainingCalculator() {
  const [first, setFirst] = useState(""), [second, setSecond] = useState(""), [operation, setOperation] = useState<Operation>("add");
  const [ready, setReady] = useState(false), [result, setResult] = useState<Calculation | null>(null);
  const [method,setMethod]=useState<'ordinary'|'column'>('ordinary'),[column,setColumn]=useState<ColumnCalculation|null>(null);
  const [errors, setErrors] = useState<Partial<Record<Field, string>>>({}), [notice, setNotice] = useState("");
  const touched = useRef({first: false, second: false});
  const firstInput = useRef<HTMLInputElement>(null), secondInput = useRef<HTMLInputElement>(null), operationInput = useRef<HTMLSelectElement>(null), resultTitle = useRef<HTMLHeadingElement>(null);
  useEffect(() => {setReady(true);if(new URLSearchParams(window.location.search).get('cara')==='bersusun')setMethod('column');}, []);
  useEffect(() => {if (result) resultTitle.current?.focus();}, [result]);
  function edit(field: "first" | "second", value: string) {
    (field === "first" ? setFirst : setSecond)(value);
    setResult(null);setColumn(null);setNotice("");
    setErrors(previous => ({...previous, [field]: touched.current[field] ? (method==='column'?columnNumberError(value,operation,field):numberError(value)) ?? undefined : undefined}));
  }
  function blur(field: "first" | "second", value: string) {
    touched.current[field] = true;
    setErrors(previous => ({...previous, [field]: (method==='column'?columnNumberError(value,operation,field):numberError(value)) ?? undefined}));
  }
  function submit(event: SubmitEvent) {
    event.preventDefault();
    if (!ready) return;
    const response = method==='column'?calculateColumn(first, operation, second):(() => {
      const ordinary=calculate(first, operation, second);
      return ordinary.ok?{...ordinary,column:null}:ordinary;
    })();
    if (!response.ok) {
      setResult(null);setColumn(null);setNotice("");setErrors({[response.field]: response.message});
      if (response.field !== "operation") touched.current[response.field] = true;
      ({first: firstInput, second: secondInput, operation: operationInput}[response.field]).current?.focus();
      return;
    }
    const nextColumn=response.column;
    setErrors({});setResult(response.calculation);setColumn(nextColumn);
    setNotice(nextColumn?.operation==='divide'?`Hasil bagi ${nextColumn.result}, sisa ${nextColumn.remainder}. Langkah bersusun tersedia.`:`Hasil ${response.calculation.exact}${response.calculation.approximation ? `, mendekati ${response.calculation.approximation}` : ""}. Langkah penyelesaian tersedia.`);
  }
  function reset() {
    setFirst("");setSecond("");setOperation("add");setResult(null);setColumn(null);setErrors({});setNotice("Bilangan dikosongkan. Coba perhitungan baru.");
    touched.current = {first: false, second: false}; firstInput.current?.focus();
  }
  return <section class="calculator" aria-label="Kalkulator penjelas">
    <div class="calculator-method" role="group" aria-label="Pilih cara menghitung">{(['ordinary','column'] as const).map(value=><button type="button" class="quiet" key={value} disabled={!ready} aria-pressed={method===value} onClick={()=>{setMethod(value);setResult(null);setColumn(null);setErrors({});setNotice('');touched.current={first:false,second:false};}}>{value==='ordinary'?'Cara biasa':'Bersusun'}</button>)}</div>
    <form class="calculator__form" onSubmit={submit} noValidate aria-busy={!ready}>
      <fieldset disabled={!ready}>
        <legend class="calculator__legend">Apa yang ingin kamu hitung?</legend>
        <div class="calculator__inputs">
          <div class="field"><label for="calc-first">Bilangan pertama</label><input id="calc-first" ref={firstInput} value={first} inputMode={method==='column'?'numeric':'decimal'} autoComplete="off" spellcheck={false} maxLength={16} aria-required="true" aria-invalid={!!errors.first} aria-describedby="calc-first-help" onInput={event => edit("first", event.currentTarget.value)} onBlur={() => blur("first", first)} />
            <p id="calc-first-help" class={errors.first ? "calculator__helper error" : "calculator__helper muted"}>{errors.first ?? (method==='column'?'Bilangan bulat 0–9999, misalnya 368.':"Contoh: 28 atau 1,25.")}</p></div>
          <div class="field"><label for="calc-operation">Operasi</label><select id="calc-operation" ref={operationInput} value={operation} aria-invalid={!!errors.operation} aria-describedby={errors.operation ? "calc-operation-error" : undefined} onChange={event => {setOperation(event.currentTarget.value as Operation);setResult(null);setColumn(null);setErrors({});setNotice("");}}>{Object.entries(operations).map(([key, op]) => <option value={key} key={key}>{op.label}</option>)}</select>{errors.operation && <p id="calc-operation-error" class="error">{errors.operation}</p>}</div>
          <div class="field"><label for="calc-second">Bilangan kedua</label><input id="calc-second" ref={secondInput} value={second} inputMode={method==='column'?'numeric':'decimal'} autoComplete="off" spellcheck={false} maxLength={16} aria-required="true" aria-invalid={!!errors.second} aria-describedby="calc-second-help" onInput={event => edit("second", event.currentTarget.value)} onBlur={() => blur("second", second)} />
            <p id="calc-second-help" class={errors.second ? "calculator__helper error" : "calculator__helper muted"}>{errors.second ?? (method==='column'?operation==='divide'?'Pembagi 1–99.':operation==='multiply'?'Pengali 0–999.':'Bilangan bulat 0–9999.':"Contoh: 17 atau 0,75.")}</p></div>
        </div>
        <p class="muted">{method==='column'?'Bersusun: bilangan bulat tidak negatif, maksimal 4 digit. Pengali hingga 3 digit; pembagi hingga 2 digit. Pengurangan memakai bilangan awal yang lebih besar atau sama. Pembagian menampilkan hasil bagi dan sisa.':'Koma atau titik boleh dipakai untuk desimal, bukan pemisah ribuan. Maksimal 6 digit sebelum koma dan 3 sesudahnya. Bilangan negatif memakai tanda minus.'}</p>
        <div class="actions"><button type="submit">Hitung</button><button type="button" class="quiet" onClick={reset}>Kosongkan</button></div>
      </fieldset>
      <p role="alert" class="calculator__alert">{Object.values(errors).filter(Boolean).join(" ") || undefined}</p>
      <p role="status" class="calculator__status muted">{!ready ? "Memuat kalkulator…" : notice}</p>
    </form>
    {result ? <section class="calculator__result" aria-labelledby="calc-result-title">
      <h2 id="calc-result-title" ref={resultTitle} tabIndex={-1}>Hasil dan cara menghitung</h2>
      <p class="calculator__equation" data-testid="calculator-result">{result.expression}{column?.operation==='divide'?<>: <strong>hasil bagi {column.result}, sisa {column.remainder}</strong></>:<> = <strong>{result.exact}</strong></>}</p>
      {!column&&result.approximation && <p class="calculator__precision">≈ {result.approximation}. Pecahan di atas adalah hasil tepat; desimal ini dibulatkan hingga 6 angka di belakang koma.</p>}
      <h3>Langkah penyelesaian</h3>{column?<ColumnSolution key={result.expression} column={column}/>:<ol class="calculator__steps">{result.steps.map((step, index) => <li key={index}><h4>{step.title}</h4><p class="calculator__step-equation">{step.equation}</p><p>{step.explanation}</p></li>)}</ol>}
      <h3>Periksa dengan cara lain</h3><p class="calculator__check">{column?.check??result.check}</p>
      <p>Coba ceritakan kembali: mengapa langkah tadi bekerja?</p><a class="calculator__lesson" href={`/belajar/${result.lesson}`}>Latih konsep ini →</a>
    </section> : <p class="calculator__empty">Coba perkirakan hasilnya dahulu. Setelah menekan “Hitung”, lihat hasil, langkah, dan cara memeriksanya di sini.</p>}
    <section class="calculator__examples" aria-labelledby="calc-examples-title"><h2 id="calc-examples-title">Mulai dari contoh</h2><p>Contoh mengisi bilangan; tekan “Hitung” ketika siap.</p><div class="actions">{(method==='column'?columnExamples.map(([first,operation,second])=>({first,operation,second,label:`${first} ${operations[operation].symbol} ${second}`})):examples).map(example => <button key={example.label} type="button" class="quiet" disabled={!ready} onClick={() => {setFirst(example.first);setSecond(example.second);setOperation(example.operation);setResult(null);setColumn(null);setErrors({});touched.current = {first: false, second: false};setNotice(`Contoh ${example.label} siap dihitung.`);firstInput.current?.focus();}}>{example.label}</button>)}</div></section>
    <p class="muted">Alat bantu ini tidak menambah catatan belajar atau menilai penguasaan. Bilangan dan hasil tidak disimpan atau dikirim ke server.</p>
  </section>;
}
