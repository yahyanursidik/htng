import type { Challenge } from "../../learning/cpa/engine";

export default function CPAPicture({question:q,state}: {question:Challenge;state:number[]}){
  const selected=state.reduce((s,n)=>s+n,0);
  const dots=(n:number)=><div class="cpa-dots" aria-hidden="true">{Array.from({length:n},(_,i)=><span key={i} class="cpa-dot"/>)}</div>;
  const strip=(values:number[],columns:number)=><div class="cpa-strip" style={{gridTemplateColumns:`repeat(${columns},minmax(0,1fr))`}} aria-hidden="true">{values.map((n,i)=><span key={i} class={n?"cpa-cell cpa-cell--selected":"cpa-cell"}>{n?"/":""}</span>)}</div>;
  return <figure class="cpa-picture"><figcaption>{q.mode==="line"?`Posisi awal ${q.initial[0]}, posisi sekarang ${state[0]}. Satu ruas bernilai satu langkah.`:q.mode==="select"?`${selected} dari ${state.length} unit ditandai. ${q.gameId==="ubin"?"Setiap unit adalah satu persegi satuan.":"Semua unit sama besar."}`:state.map((n,i)=>`${q.labels[i]}: ${n}`).join("; ")}</figcaption>
    {q.mode==="line"?<div class="cpa-line" role="img" aria-label={`Garis bilangan −5 sampai 5. Mulai ${q.initial[0]}, sekarang ${state[0]}.`}>{Array.from({length:11},(_,i)=><span key={i} class={i-5===state[0]?"cpa-tick cpa-tick--selected":"cpa-tick"}>{i-5}<small>{i-5===state[0]?"●":""}</small></span>)}</div>:
    q.mode==="select"?<>{q.gameId==="senilai"&&<div><p>Pita acuan: {q.expected/2}/4, dengan panjang utuh yang sama.</p>{strip(Array.from({length:4},(_,i)=>i<q.expected/2?1:0),4)}</div>}{strip(state,q.columns)}</>:
    q.mode==="exchange"?<div class="cpa-bins"><div><p>{state[0]} puluhan, tiap batang 10 satuan</p><div class="cpa-rods" aria-hidden="true">{Array.from({length:state[0]!},(_,i)=><div key={i} class="cpa-rod">{Array.from({length:10},(_,j)=><span key={j}/>)}</div>)}</div></div><div><p>{state[1]} satuan lepas</p>{dots(state[1]!)}</div></div>:
    q.mode==="layers"?<div class="cpa-layers">{Array.from({length:state[0]!},(_,i)=><div key={i}><p>Lapisan {i+1}: {q.columns*2} kubus</p>{strip(Array(q.columns*2).fill(1),q.columns)}</div>)}<p>Setiap gambar adalah satu lapisan dilihat dari atas. Lapisan ditumpuk, bukan diletakkan berdampingan.</p></div>:
    <div class="cpa-bins">{state.map((n,i)=><div key={i} class="cpa-bin"><p>{q.labels[i]}: {n}</p>{dots(n)}</div>)}</div>}
    <p class="muted">Gambar menunjukkan susunanmu saat ini. Kembali ke Benda untuk mengubahnya.</p>
  </figure>;
}
