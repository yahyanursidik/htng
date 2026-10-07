import {useEffect,useRef,useState} from 'preact/hooks';
import {places,type ColumnCalculation} from '../../learning/calculator/column-engine';
import ColumnDiagram from './ColumnDiagram';
export default function ColumnSolution({column}:{column:ColumnCalculation}) {
  const [index,setIndex]=useState(0);const heading=useRef<HTMLHeadingElement>(null),focusRequested=useRef(false);
  useEffect(()=>{if(focusRequested.current){heading.current?.focus();focusRequested.current=false;}},[index]);
  const step=column.steps[index]!;
  const go=(next:number)=>{focusRequested.current=true;setIndex(next);};
  return <section class="column-solution" aria-label="Langkah hitung bersusun">
    <p class="column-step-count" role="status">Langkah {index+1} dari {column.steps.length}{step.activeColumn!==undefined?`. Kolom ${places[column.width-1-step.activeColumn]!.name}.`:'.'}</p>
    <h4 ref={heading} tabIndex={-1} data-testid="column-step-title">{step.title}</h4>
    <ColumnDiagram column={column} step={step}/>
    <p class="column-step-equation">{step.equation}</p><p data-testid="column-explanation">{step.explanation}</p>
    <div class="actions column-controls"><button type="button" class="quiet" disabled={index===0} onClick={()=>go(index-1)}>Langkah sebelumnya</button><button type="button" disabled={index===column.steps.length-1} onClick={()=>go(index+1)}>Langkah berikut</button></div>
    <details class="column-all-steps"><summary>Baca semua langkah ({column.steps.length})</summary><ol>{column.steps.map((s,i)=><li key={i}><h4>{s.title}</h4><p class="column-step-equation">{s.equation}</p><p>{s.explanation}</p></li>)}</ol></details>
  </section>;
}
