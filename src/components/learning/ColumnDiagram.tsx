import {places,type ColumnCalculation,type ColumnStep,type ColumnCue} from '../../learning/calculator/column-engine';
import '../../styles/column-calculation.css';
const symbols={left:'←',right:'→',down:'↓',up:'↑',check:'✓'};
const roles={read:'Baca',write:'Tulis',exchange:'Tukar / teruskan'};
// Coordinates use the same equal-width columns / fixed row tracks as the table.
// SVG is presentational; the visible cue list and cell labels carry its meaning.
// No DOM measurement, animation, color-only instruction, or hydration is needed.
function arrow(cue:ColumnCue) {
  const from=cue.from[0],to=cue.to[0];if(!from||!to)return null;
  const x=from.column+.86,y=from.row+.5,tx=to.column+.86,ty=to.row+.5;
  let path:string,tipX:number,tipY:number,up=false;
  if(from.row===to.row){
    tipX=to.column+.5;tipY=to.row+.26;
    path=`M ${from.column+.5} ${from.row+.26} C ${from.column+.5} ${from.row+.02}, ${tipX} ${from.row+.02}, ${tipX} ${tipY}`;
  }else{
    up=to.row<from.row;tipX=tx;tipY=ty;
    const bend=up?to.row+.88:to.row+.12;
    path=`M ${x} ${y} L ${x} ${bend} L ${tx} ${bend} L ${tipX} ${tipY}`;
    // Same-column upward cues must approach from below, not above.
    if(up&&from.column===to.column)path=`M ${x} ${y} L ${tipX} ${tipY}`;
  }
  const base=tipY+(up?.13:-.13);
  return <g class={`column-arrow column-arrow--${cue.kind}`}><path d={path}/><path d={`M ${tipX-.065} ${base} L ${tipX} ${tipY} L ${tipX+.065} ${base}`}/></g>;
}
export default function ColumnDiagram({column,step}:{column:ColumnCalculation;step:ColumnStep}) {
  return <figure class="column-diagram">
    <p class="column-direction"><span aria-hidden="true">{symbols[step.guidance.direction]}</span> {step.guidance.instruction}</p>
    <div class={`column-stack${column.operation==='divide'?' column-stack--divide':''}`}>
    <table class={`column-table${column.operation==='divide'?' column-table--divide':''}`}><caption class="sr-only">Hitungan bersusun {column.first} {column.operation==='add'?'tambah':column.operation==='subtract'?'kurang':column.operation==='multiply'?'kali':'dibagi'} {column.second}. {step.title}.</caption>
      <thead><tr><th scope="col"><span class="sr-only">Baris</span></th>{Array.from({length:column.width},(_,i)=><th scope="col" key={i} data-active={step.activeColumn===i||undefined}><abbr title={places[column.width-1-i]!.name}>{places[column.width-1-i]!.short}</abbr></th>)}</tr></thead>
      <tbody>{step.rows.map((row,i)=><tr key={i} class={`column-row column-row--${row.kind}${row.rule?' column-row--rule':''}`}>
        <th scope="row"><span class="sr-only">{row.label}{column.operation==='divide'&&row.kind==='operand'?`; pembagi ${column.second}`:''}</span><span aria-hidden="true">{column.operation==='divide'&&row.kind==='operand'?column.second:row.sign??''}</span></th>
        {row.cells.map((cell,j)=>{
          const target=step.guidance.cues.find(c=>c.to.some(p=>p.row===i&&p.column===j));
          const source=step.guidance.cues.some(c=>c.from.some(p=>p.row===i&&p.column===j));
          const role=target?.kind??(source?'read':undefined);
          return <td key={j} data-active={step.activeColumn===j||undefined} data-cue={role} data-empty={!cell.trim()||undefined}>
            <span class="column-digit">{row.crossed?.includes(j)?<s aria-label={`${cell}, diganti pada baris pertukaran`}>{cell}</s>:cell.trim()?cell:<span aria-hidden="true">&nbsp;</span>}</span>
            {role&&<span class="sr-only">; {roles[role]}: kolom {places[column.width-1-j]!.name}</span>}
          </td>;
        })}
      </tr>)}</tbody>
    </table>
    <svg class="column-arrows" viewBox={`0 0 ${column.width} ${step.rows.length}`} preserveAspectRatio="none" aria-hidden="true" focusable="false">{step.guidance.cues.map((c,i)=><g key={i}>{arrow(c)}</g>)}</svg>
  </div>
    <figcaption>
      <ul class="column-key" aria-label="Arti penanda"><li data-cue="read">Baca digit</li><li data-cue="exchange">Tukar / teruskan</li><li data-cue="write">Tulis hasil</li></ul>
      {step.guidance.cues.length>0&&<ol class="column-cues" aria-label="Bantuan langkah ini">{step.guidance.cues.map((c,i)=><li key={i} data-cue={c.kind}><strong>{roles[c.kind]}.</strong> {c.label}</li>)}</ol>}
      <p>{Array.from({length:column.width},(_,i)=>`${places[column.width-1-i]!.short} = ${places[column.width-1-i]!.name}`).join(' · ')}. {column.legend}</p>
    </figcaption></figure>;
}
