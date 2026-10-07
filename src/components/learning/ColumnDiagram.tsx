import {places,type ColumnCalculation,type ColumnStep} from '../../learning/calculator/column-engine';
import '../../styles/column-calculation.css';
export default function ColumnDiagram({column,step}:{column:ColumnCalculation;step:ColumnStep}) {
  return <figure class="column-diagram"><div class="column-stack">
    <table class={`column-table${column.operation==='divide'?' column-table--divide':''}`}><caption class="sr-only">Hitungan bersusun {column.first} {column.operation==='add'?'tambah':column.operation==='subtract'?'kurang':column.operation==='multiply'?'kali':'dibagi'} {column.second}. {step.title}.</caption>
      <thead><tr><th scope="col"><span class="sr-only">Baris</span></th>{Array.from({length:column.width},(_,i)=><th scope="col" key={i} data-active={step.activeColumn===i||undefined}><abbr title={places[column.width-1-i]!.name}>{places[column.width-1-i]!.short}</abbr></th>)}</tr></thead>
      <tbody>{step.rows.map((row,i)=><tr key={i} class={`column-row column-row--${row.kind}${row.rule?' column-row--rule':''}`}>
        <th scope="row"><span class="sr-only">{row.label}{column.operation==='divide'&&row.kind==='operand'?`; pembagi ${column.second}`:''}</span><span aria-hidden="true">{column.operation==='divide'&&row.kind==='operand'?<>{column.second}⟌</>:row.sign??''}</span></th>
        {row.cells.map((cell,j)=><td key={j} data-active={step.activeColumn===j||undefined}>{row.crossed?.includes(j)?<s aria-label={`${cell}, diganti pada baris pertukaran`}>{cell}</s>:cell.trim()?cell:<span aria-hidden="true">&nbsp;</span>}</td>)}
      </tr>)}</tbody>
    </table>
  </div><figcaption>{Array.from({length:column.width},(_,i)=>`${places[column.width-1-i]!.short} = ${places[column.width-1-i]!.name}`).join(' · ')}. {column.legend}</figcaption></figure>;
}
